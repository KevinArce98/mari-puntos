# Revisión de rendimiento y plataforma — mari-puntos-app

Alcance: solo `mari-puntos-app` (RN 0.86 / Expo 57 / React 19). Enfoque complementario al del
arquitecto: **rendimiento en runtime y temas específicos de RN/Expo**. No se repiten hallazgos ya
cubiertos (doble capa de datos react-query vs zustand, SOLID/capas, god-screens, inconsistencia
rhf+zod, código muerto de plantilla).

---

## Resumen ejecutivo

La app está bien construida en lo esencial: **React Compiler está habilitado**
(`app.json:95`, `experiments.reactCompiler: true`), por lo que la mayoría de las micro-optimizaciones
clásicas (memoizar callbacks/estilos/objetos inline, `React.memo`, `useMemo`) **ya las resuelve el
compilador automáticamente**. Por eso este informe se centra deliberadamente en lo que el compilador
NO puede arreglar: la **granularidad de las suscripciones a los stores**, la **duplicación de
peticiones de red**, la **falta de virtualización de listas** y la **configuración de arranque/telemetría**.

Los tres focos de mayor impacto:

1. **Los hooks de datos se suscriben al store COMPLETO de zustand sin selectores**
   (`useUser`, `usePoints`, `useActions`, `useStreak`, `usePermissions`). Como los stores además
   alternan `isLoading` en cada fetch, cualquier operación en un store re-renderiza a todos los
   consumidores. React Compiler abarata cada re-render pero no cambia que el componente se re-ejecute
   en cada `set`. Es el problema de runtime número uno y su fix es barato.
2. **Peticiones de red redundantes**: los mismos datos (partnerActions, partnerPermissions, streak)
   se piden 2–3 veces al abrir Home, porque conviven fetch en montaje del hook + `useFocusEffect` +
   prefetch en `TabLayout`. Impacta batería, datos y provoca tormentas de writes/re-renders.
3. **Listas sin virtualizar**: `achievements`, `permissions` (recibidos y enviados) e `inbox`
   renderizan todos los ítems con `.map()` dentro de un `ScrollView`. `@legendapp/list` ya es
   dependencia y se usa en `history`/`actions`; conviene usarlo también aquí.

Con estos tres cambios se reduce de forma notable el trabajo en el hilo JS al enfocar pantallas y el
consumo de red/batería, sin tocar la arquitectura de capas que revisa el arquitecto.

---

## Lo que ya está bien

- **React Compiler activado** (`app.json:95`): auto-memoiza componentes y valores; hace innecesarias
  la mayoría de `useCallback`/`useMemo`/`React.memo` manuales.
- **Selectores correctos donde más importa**: `NotificationBell.tsx:25-30` y `app/(tabs)/_layout.tsx:26-33`
  usan selectores que devuelven un número (`.filter(...).length`), así que solo re-renderizan cuando
  cambia el conteo. Es el patrón a replicar en los hooks.
- **Listas grandes ya virtualizadas** en `history` y `actions` con `LegendList` y `estimatedItemSize`
  definido (`app/history/index.tsx:146`, `app/(tabs)/actions.tsx:234`).
- **Limpieza de listeners correcta**: `useNotifications.ts:194-201` (2 listeners), `useStreak.ts:37`
  (AppState), `permissions/request.tsx:88-91` y `EditProfileModal.tsx:71-74` (teclado),
  `link-partner/index.tsx:241` (interval). No se detectan fugas por listeners sin `remove`.
- **Reanimated bien usado**: `PressableScale.tsx` y `Skeleton.tsx` corren en hilo UI con worklets,
  respetan `useReducedMotion()` y `Skeleton` cancela la animación en cleanup (`Skeleton.tsx:44`).
- **Imágenes pre-redimensionadas antes de subir**: `EditProfileModal.tsx:113-117` reduce a 512×512,
  `compress: 0.7`, JPEG. Evita subir originales de cámara enormes.
- **`useThemedColors()` devuelve una referencia estable** (`theme/colors.ts` es un objeto constante de
  módulo), por lo que pasar `colors` a hijos no rompe memoización.
- **Fuentes embebidas nativamente en teoría** vía plugin `expo-font` (sin carga JS en arranque →
  buen cold start), aunque hay que verificar la configuración (ver M2).
- **expo-updates** con prompt de recarga y sampling de Sentry diferenciado dev/prod.

---

## Hallazgos priorizados

### ALTO

**A1 — Hooks de datos suscritos al store completo de zustand (sin selectores). Esfuerzo: M**

Archivos:
- `hooks/useUser.ts:7-20` → `const { ... } = useUserStore();`
- `hooks/usePoints.ts:9-10` → `useUser()` + `usePointsStore()` (doble suscripción a userStore por pantalla)
- `hooks/useActions.ts:8-21` → `useActionsStore()` + `useUserStore()`
- `hooks/useStreak.ts:10-11` → `useStreakStore()` + `useUserStore()`
- `hooks/usePermissions.ts:8-19` → `usePermissionsStore()` + `useUserStore()`

Por qué impacta: llamar `useXStore()` sin selector suscribe al snapshot completo; zustand notifica en
**cada** `set`, así que el componente se re-ejecuta ante cualquier cambio del store, aunque no use ese
campo. Se agrava porque los stores alternan `isLoading` en cada fetch
(`actionsStore.ts:55-66` y `82-93` hacen `set isLoading:true` y luego `false`; `pointsStore.ts:41-51`
igual). La pantalla Home usa 5 de estos hooks a la vez (`app/(tabs)/index.tsx:58-63`): un solo refetch
en segundo plano dispara varios ciclos de re-render de toda la pantalla. **React Compiler abarata cada
render (salta subárboles memoizados) pero NO evita la re-ejecución del componente**, porque la
suscripción a store externo la fuerza `useSyncExternalStore`. La granularidad de la suscripción es
responsabilidad del selector, no del compilador.

Fix concreto: exponer selectores. Para varios campos usar `useShallow`:
```ts
import { useShallow } from 'zustand/react/shallow';
const { user, partnerInfo, isLoading } = useUserStore(
  useShallow((s) => ({ user: s.user, partnerInfo: s.partnerInfo, isLoading: s.isLoading }))
);
```
Las funciones (`fetchProfile`, etc.) son estables en zustand: selecciónarlas individualmente
(`useUserStore((s) => s.fetchProfile)`) o leerlas con `getState()` en handlers para no incluirlas en la
suscripción. Además, separar los flags de carga por dominio (ya existen `isLoadingMyActions` /
`isLoadingPartnerActions`) y evitar el `isLoading` "derivado" global reduce el churn.

---

**A2 — Peticiones de red duplicadas: montaje + focus + prefetch de TabLayout. Esfuerzo: M**

Archivos:
- `app/(tabs)/_layout.tsx:35-51` prefetch de `fetchPartnerPermissions` + `fetchPartnerActions`.
- `hooks/useActions.ts:23-38` fetch en montaje (se ejecuta en cada pantalla que use el hook: home, inbox, actions).
- `hooks/usePermissions.ts:21-36` fetch en montaje (idéntico patrón).
- `hooks/useStreak.ts:15-20` fetch en montaje.
- `app/(tabs)/index.tsx:86-95` `useFocusEffect` que vuelve a pedir history/streak/partnerActions/permissions.
- `app/(tabs)/permissions.tsx:50-56` y `app/(tabs)/actions.tsx:61-71` vuelven a refetch en cada focus.

Por qué impacta: al abrir Home por primera vez, `partnerActions` se pide hasta 3 veces (TabLayout +
montaje de `useActions` + refetch de focus) y `partnerPermissions` 2–3 veces. Cada respuesta hace 2
`set` en el store (loading on/off + datos), y por A1 cada `set` re-renderiza. Es gasto de red y batería
real y multiplica los re-renders. El refetch "en cada focus" además vuelve a pedir aunque los datos
sean recientes.

Fix concreto: elegir **una** fuente de disparo por dominio. Opciones:
- Dejar el prefetch en `TabLayout` como único punto de arranque y quitar el fetch-en-montaje de los
  hooks (que los hooks solo lean estado); o
- Mantener el fetch de hook y quitar los `useFocusEffect` que duplican; y
- Añadir una guarda de frescura (p. ej. timestamp `lastFetchedAt` en el store, o migrar estos dominios
  a react-query con `staleTime` como ya se hace en `useAchievements`) para que el focus no re-pida si
  los datos son recientes. (Coordinar con el arquitecto por el solapamiento con la capa de datos.)

---

**A3 — Listas no virtualizadas (ScrollView + .map). Esfuerzo: S/M**

Archivos:
- `app/(tabs)/achievements.tsx:246-288` (`ScrollView` en 176) → `unlocked.map(...)` + `locked.map(...)`;
  cada ítem es un `Card` con `ProgressBar`, `Badge` e `Ionicons` (`renderAchievement`, línea 67).
- `app/(tabs)/permissions.tsx:180-209` → `visiblePermissions.map(...)`; cada `PermissionCard` monta
  además un `ResponseModal` (ver M4).
- `app/inbox/index.tsx:138-197` → `pendingActions.map(...)` + `pendingPermissions.map(...)`.

Por qué impacta: `achievements` puede tener decenas de logros; se instancian todos a la vez (sin
reciclaje), lo que aumenta el tiempo de montaje y el pico de memoria al enfocar la pestaña. `permissions`
e `inbox` crecen con el uso. React Compiler no virtualiza; solo `LegendList`/`FlatList` lo hacen.

Fix concreto: reemplazar por `LegendList` (ya es dependencia) con `keyExtractor`, `estimatedItemSize`
y `renderItem`. Para `achievements`, se puede aplanar unlocked+locked en un solo array con secciones o
usar dos listas; para `permissions`/`inbox` es directo. Mantener `ScrollView` solo para cabeceras/stats.

---

### MEDIO

**M1 — Sentry Session Replay + profiling activos en producción. Esfuerzo: S**

Archivo: `app/_layout.tsx:77-98`. En prod: `profilesSampleRate: 0.2` (86), `replaysSessionSampleRate: 0.1`
(88), `replaysOnErrorSampleRate: 1.0` (89) y `mobileReplayIntegration()` (91).

Por qué impacta: Mobile Session Replay captura periódicamente la jerarquía de vistas → overhead de CPU
y batería en runtime, sobre todo con listas y animaciones. Sumado al profiling de Hermes, añade coste en
una app de pareja donde no suele hacer falta grabar sesiones. Además `Sentry.init` se ejecuta síncrono
al cargar el módulo, antes del primer render → suma a cold start.

Fix concreto: en producción bajar/eliminar `mobileReplayIntegration` (o `replaysSessionSampleRate: 0`,
dejando solo `replaysOnErrorSampleRate`), y reducir `profilesSampleRate` (p. ej. 0.05). Medir el impacto
en TTID antes/después.

---

**M2 — Verificar que las fuentes PlusJakartaSans realmente se embeben. Esfuerzo: S**

Contexto: los estilos referencian `fontFamily: 'PlusJakartaSans-SemiBold' / '-Bold' / '-Medium'`
(p. ej. `HistoryItem.tsx:144`, `Avatar.tsx:106`, `ActionItemCard.tsx:202`), pero en el repo **no hay
carpeta `assets/fonts`, ni archivos `.ttf/.otf`, ni `useFonts`, ni `Font.loadAsync`**, y el plugin en
`app.json:87` es solo `"expo-font"` **sin array de `fonts`**. Un plugin `expo-font` sin config no embebe
nada.

Por qué impacta: si las fuentes no están embebidas ni se cargan en runtime, todo el texto cae
silenciosamente a la fuente del sistema (inconsistencia visual con el diseño). Si se cargaran en runtime
sin `useFonts`, habría flash de fuente. Es más un tema de correctitud/UX que de perf puro, pero conviene
resolverlo.

Fix concreto: confirmar de dónde vienen las fuentes. Si se quieren embebidas, declarar el array en el
plugin `expo-font` con los `.ttf` incluidos en el repo; si no, aceptar el fallback y limpiar las
referencias. Verificar en dispositivo qué fuente se está pintando.

---

**M3 — Polling cada 5 s en link-partner (y verify-email). Esfuerzo: S**

Archivos: `app/link-partner/index.tsx:236-242` (`setInterval` cada 5000 ms mientras `linkMode==='share'`
y hay código generado), `app/(auth)/verify-email.tsx:98` (otro interval).

Por qué impacta: mientras la pantalla de compartir código está abierta esperando al partner, se hace una
petición de red cada 5 s indefinidamente → batería y datos. Está bien acotado por dependencias y limpiado
en unmount, pero 5 s fijos es agresivo si el usuario deja la pantalla abierta.

Fix concreto: backoff progresivo (5 s → 10 s → 30 s), pausar el polling cuando `AppState` no está
`active`, y/o tope de intentos. Ideal: sustituir por push (el backend ya envía `partner_linked`, ver
`useNotifications.ts:163-168`) y usar el polling solo como respaldo.

---

**M4 — `useAchievements` devuelve arrays nuevos por render; `PermissionCard` monta un modal por tarjeta. Esfuerzo: S**

Archivos:
- `hooks/useAchievements.ts:31-33`: `unlockedAchievements`/`lockedAchievements` se recalculan con
  `.filter()` en cada render → nuevas referencias. En `app/(tabs)/achievements.tsx:56-65` el `useMemo`
  que depende de ellas se invalida siempre (no memoiza nada). Con React Compiler el `useMemo` es
  redundante, pero devolver referencias estables desde el hook evita recomputar filtros aguas abajo.
- `components/permission-card.tsx:100-109`: cada `PermissionCard` renderiza su propio `ResponseModal`
  aunque esté oculto. En la lista de permisos recibidos e inbox se montan N modales.

Por qué impacta: menor, pero en listas de permisos con varios ítems se instancian varios `Modal`
ocultos y se recalculan filtros. Con virtualización (A3) se mitiga en gran parte.

Fix concreto: en el hook, derivar `unlocked/locked` una sola vez (o devolver `achievements` y filtrar en
la pantalla ya memoizado por el compilador). Para el modal, elevar un único `ResponseModal` a nivel de
lista y pasarle el permiso seleccionado (patrón que ya usa `inbox` con `ReviewActionModal`,
`app/inbox/index.tsx:200-206`).

---

### BAJO

**B1 — Subida de avatar como base64 data-URI. Esfuerzo: M**
`EditProfileModal.tsx:113-121`: tras redimensionar (bien), se envía `data:image/jpeg;base64,...`. Base64
pesa ~33% más que binario y mantiene toda la imagen como string en memoria/JSON. Fix: subir binario
(multipart/form-data) o a storage con URL firmada. Impacto bajo porque ya va a 512² q0.7.

**B2 — expo-image sin `cachePolicy`/`placeholder`/`transition` explícitos. Esfuerzo: S**
`Avatar.tsx:53-54` y `EditProfileModal.tsx:210-214`. Los defaults de expo-image (cache memoria+disco)
son razonables, pero conviene fijar `cachePolicy="memory-disk"`, `transition` y, si algún día el Avatar
entra en una lista, `recyclingKey={imageUri}` para evitar parpadeos al reciclar.

**B3 — Recomputaciones menores por render (mitigadas por React Compiler). Esfuerzo: S**
`permissions/request.tsx:120-122` (`allTemplatesSorted` con `[...].sort()`),
`achievements.tsx:35-47` (`FILTERS` y `ACHIEVEMENT_TYPE_LABELS` reconstruidos con `t()` cada render),
`actions.tsx:39-44` (`STATUS_FILTERS`). El compilador las estabiliza; solo vigilar si en el futuro
alguna lista de plantillas crece mucho.

**B4 — Versión desincronizada. Esfuerzo: S (higiene de release, no perf)**
`app.json:5` marca `1.4.0` y `package.json` `1.5.0`. Con `runtimeVersion.policy: appVersion`
(`app.json:44-46`) esto afecta a la resolución de OTA updates. Alinear.

---

## Quick wins (orden recomendado)

1. **Selectores en los 5 hooks de datos** (`useUser/usePoints/useActions/useStreak/usePermissions`) con
   `useShallow`. Cambio localizado, alto impacto en re-renders. (A1)
2. **Deduplicar disparos de fetch**: elegir una sola fuente (prefetch de TabLayout **o** fetch de hook
   **o** focus) por dominio y añadir guarda de frescura. (A2)
3. **Virtualizar** `achievements`, `permissions` e `inbox` con `LegendList`. (A3)
4. **Sentry prod**: quitar `mobileReplayIntegration` y bajar `profilesSampleRate`. (M1)
5. **Verificar fuentes** en dispositivo y arreglar el plugin `expo-font` si procede. (M2)

---

## Plan por fases

**Fase 1 — Runtime barato, alto impacto (1–2 días)**
- A1 selectores + separación de flags de carga.
- A3 virtualización de las tres listas.
- M1 ajuste de Sentry.
- B4 alinear versión.

**Fase 2 — Estrategia de carga de datos (coordinar con arquitecto)**
- A2 unificar disparadores (montaje/focus/prefetch) y guarda de frescura o migración de estos dominios a
  react-query con `staleTime`, en línea con lo que ya hace `useAchievements`.
- M4 hook de achievements estable + `ResponseModal` único por lista.

**Fase 3 — Plataforma y pulido**
- M2 fuentes, M3 backoff/push en polling.
- B1 subida binaria de imagen, B2 props de expo-image.
- Medir cold start (TTID) y frames al enfocar Home antes/después con el perfilador.

---

### Notas de método
- React Compiler activo (`app.json:95`) cambia la priorización: se descartan deliberadamente hallazgos
  de "falta useCallback/memo/React.memo" salvo cuando el problema es de **suscripción externa** o **red**,
  que el compilador no toca.
- No se detectaron fugas de memoria por listeners/timers sin limpiar.
- Reanimated/worklets: uso correcto en hilo UI; sin trabajo pesado en JS thread ni shared values mal
  recreados.
