# Revisión de arquitectura — mari-puntos-app

_Alcance: exclusivamente `/Users/kevinarias/Projects/mari-puntos/mari-puntos-app` (React Native 0.86 + Expo 57, expo-router, ~122 archivos, ~17.4k LOC). Análisis de solo lectura._

## Resumen ejecutivo

La base de código está **sana en sus cimientos**: hay una capa de servicios limpia (clase `ApiService` con interceptores centralizados + servicios de dominio por singleton), tokens de tema centralizados, validadores zod bien organizados y una migración a buenas prácticas de React claramente en marcha (Pressable, `useWatch`, derivar estado en render). El problema estructural dominante es un **doble sistema de datos**: `@tanstack/react-query` está instalado y configurado (queryClient, `queryKeys`, provider) pero prácticamente no se usa —solo `useAchievements`—, mientras que la capa real de datos son stores de zustand que **reimplementan a mano** lo que react-query ya resuelve (cache, flags de loading, invalidación). Esto genera ~150 LOC de boilerplate casi idéntico por store, invalidación de cache manual y duplicada dentro de las pantallas, y un fuerte acoplamiento en el que una pantalla de UI orquesta 5-6 stores de dominio. En segundo plano, las 3 pantallas más grandes y complejas (formularios de permisos) **no siguen el estándar rhf+zod** del propio proyecto y concentran UI + fetching + lógica de negocio sin descomponer. Nada de esto es un incendio: son deudas de consistencia y de altitud que, ordenadas por fases, dejan el proyecto mucho más entendible y barato de evolucionar.

---

## Lo que ya está bien (no romper)

- **Capa de servicios sólida.** `services/api.ts` encapsula axios en una clase con interceptores (auth token, `Accept-Language`, manejo de 401 con corte tras 2 consecutivos, logging por severidad) y expone `get/post/put/patch/delete` tipados. Los servicios de dominio (`permissionsService`, `userService`, etc.) son singletons finos y coherentes. Ninguna pantalla llama a axios directamente.
- **Tokens de tema centralizados.** `theme/` (colors, typography, spacing) + `useThemedColors`. **0 hex hardcodeados** en `app/` y `components/` (verificado con grep `-E`). El anti-patrón de hex sueltos que menciona el MASTER ya está esencialmente resuelto.
- **Migración a Pressable casi completa:** solo quedan 2 archivos con `TouchableOpacity` (el MASTER hablaba de 30).
- **rhf+zod bien aplicado donde se aplicó:** las 7 pantallas de auth y los 4 modales usan `useForm` + `zodResolver` + `ControlledInput`/`ControlledCodeInput`. `ResponseModal.tsx` es un buen ejemplo de modal limpio.
- **Infra de soporte correcta:** `lib/queryKeys.ts` (bien estructurado, aunque infrautilizado), `utils/logger.ts`, `utils/errorMessage.ts`, `validators/` por dominio, Sentry + ErrorBoundary + OTA updates en `_layout.tsx`.
- **`design-system/MASTER.md`** es una especificación de rediseño v2 madura y autoconsciente que ya cataloga varios de estos problemas. Excelente base para la fase de UI.

---

## Hallazgos priorizados

### ALTO

**A1 — Doble capa de datos: react-query configurado pero sin usar; los stores de zustand son un cache de servidor hecho a mano.**
`lib/queryClient.ts`, `lib/queryKeys.ts` y `<QueryClientProvider>` en `app/_layout.tsx:232` están montados, pero el único consumidor de `useQuery` es `hooks/useAchievements.ts:15`. Todo lo demás (permisos, acciones, puntos, streak, usuario) se obtiene vía stores zustand a través de hooks que los envuelven: `hooks/usePermissions.ts:7`, `hooks/useActions.ts:7`, `hooks/usePoints.ts:8`, `hooks/useUser.ts:6`. Las `queryKeys` para permissions/actions/points **están definidas pero nunca se usan** (`lib/queryKeys.ts:20-34`).
_Por qué es problema (SOLID/complejidad):_ dos modelos mentales para lo mismo; infraestructura muerta; cada store reimplementa cache + estados de carga + invalidación (server state tratado como client state). Aumenta la superficie de bugs y la curva de entrada.
_Refactor:_ decidir una sola fuente para **server state** → recomendado react-query. Migrar los hooks de dominio a `useQuery`/`useMutation` con las `queryKeys` ya existentes; dejar zustand solo para **client state** real (idioma, UI de notificaciones). **Esfuerzo: L.**

**A2 — Invalidación de cache manual, duplicada y acoplada dentro de las pantallas.**
El mismo bloque de "refrescar 6 stores" aparece **dos veces** en `app/link-partner/index.tsx` (líneas 131-154 y 185-208). `app/(tabs)/profile.tsx:80-83` limpia 4 stores al desvincular. Además hay stores que llaman a otros stores: `stores/permissionsStore.ts:154-161` (`respondToPermission` dispara `useUserStore.fetchStats()` + `fetchPartnerInfo()`), `stores/actionsStore.ts:136-139,164-167`. Hay 20 usos de `getState()` dentro de `app/`.
_Por qué es problema:_ viola SRP y DIP —una pantalla de UI conoce y orquesta 5-6 stores de dominio—; es exactamente lo que `invalidateQueries({ queryKey })` resuelve en una línea. Frágil: al añadir un dominio hay que acordarse de tocar cada llamada.
_Refactor:_ con A1, sustituir estos bloques por invalidaciones de query. Como paso puente inmediato, extraer `refreshPartnerScopedData()` / `resetPartnerScopedData()` a un único lugar y llamarlo desde link/unlink. **Esfuerzo: M** (o absorbido por A1).

**A3 — Boilerplate casi idéntico entre stores.**
`stores/permissionsStore.ts` (199 LOC) y `stores/actionsStore.ts` (187 LOC) comparten estructura: mismos flags `isLoadingMyX`/`isLoadingPartnerX`/`isMutating`/`isLoading` y el mismo malabar `isLoading: s.isLoadingPartnerX || s.isMutating` repetido en **cada** `set()`; mismo patrón try/catch → `logger.error` → `getErrorMessage` → `set` → `throw` en cada acción (ver `permissionsStore.ts:50-96` vs `actionsStore.ts:55-107`).
_Por qué es problema:_ duplicación estructural (~70% de la forma), difícil de mantener consistente, propenso a divergir.
_Refactor:_ si se conserva zustand para algún caso, extraer un factory `createAsyncSlice`/helper `runAsync(set, key, fn)`. Con A1, gran parte desaparece. **Esfuerzo: M.**

### MEDIO

**M1 — Formularios inconsistentes: las 3 pantallas más grandes NO usan el estándar rhf+zod.**
`app/permissions/request.tsx` (834 LOC, 13× `useState`), `app/permissions/create-template.tsx` (459 LOC, 11× `useState`) y `app/permissions/edit/[id].tsx` (567 LOC, 11× `useState`) manejan el formulario con `useState` crudo, mientras auth y modales usan rhf+zod. Son justamente las pantallas más complejas y reinventan validación, estado sucio y submit a mano.
_Por qué es problema:_ inconsistencia de patrón en el punto de mayor complejidad; los `validators/` ya existen y podrían reutilizarse.
_Refactor:_ migrar estas 3 a `useForm` + `zodResolver` con schemas en `validators/`. **Esfuerzo: M.**

**M2 — God-screens: UI + fetching + lógica de negocio sin descomponer, y bypass de la capa de hooks.**
`app/permissions/request.tsx` (834 LOC) mezcla en un solo componente: header, dropdown de plantillas custom (~150 LOC de JSX, `request.tsx:287-431`), date/time picker, control de duración, textarea de nota, más carga directa de plantillas vía `permissionsService.getTemplates()` (`request.tsx:36,94-111`) saltándose el hook `usePermissions`, offset de teclado manual y ~215 LOC de `StyleSheet`. El bypass a servicios se repite: `create-template.tsx:35`, `edit/[id].tsx:40` (permissionsService) y `link-partner/index.tsx:27` (userService) llaman al servicio directamente en vez de pasar por un hook. Nota: el dropdown custom reimplementa algo que ya existe como `components/ui/Select.tsx`.
_Por qué es problema:_ SRP; componentes que "saben demasiado"; acceso a datos incoherente (unas veces hook, otras servicio directo).
_Refactor:_ extraer subcomponentes (`TemplatePicker`, `DateTimeField`, `DurationStepper`) y un hook `useTemplates()` (react-query) para unificar el acceso. **Esfuerzo: L.**

**M3 — Shell de modal tipo bottom-sheet y manejo de teclado repetidos.**
Los 4 modales (`ResponseModal.tsx`, `ReviewActionModal.tsx`, `CreateActionModal.tsx`, `EditProfileModal.tsx`) reimplementan cada uno `Modal` + `KeyboardAvoidingView` + `overlay` + `header` + `closeButton`. El `useEffect` de offset de teclado Android está duplicado en 5 archivos (esos 3 modales + `request.tsx` + `create-template.tsx`); ver `ResponseModal.tsx:74-86`. El patrón "alerta de descartar si `isDirty`" también se repite (`ResponseModal.tsx:166-184`, `request.tsx:68-77` vía `usePreventRemove`).
_Refactor:_ componente base `BottomSheetModal`, hook `useKeyboardOffset()` y hook `useDiscardConfirm(isDirty)`. **Esfuerzo: M.**

**M4 — Manejo de errores sin tipar que evita las utilidades existentes.**
`(error as any)?.error` aparece en 5 pantallas: `permissions.tsx:101`, `request.tsx:167`, `edit/[id].tsx:134`, `link-partner/index.tsx:96` y `:164`. Sin embargo `services/api.ts:95-102` ya produce un `ApiError` tipado y `utils/errorMessage.ts` (`getErrorMessage`) ya existe —pero solo se usa dentro de los stores, no en las pantallas.
_Por qué es problema:_ `any` puntual, pierde el tipo del error que la propia capa API garantiza; utilidad ya escrita sin adoptar.
_Refactor:_ exportar el tipo `ApiError` (con `status`) desde `@/types`/servicios y un helper `useErrorToast(error, fallback)` que use `getErrorMessage`. Reemplazar los 5 casts. **Esfuerzo: S.**

### BAJO

**B1 — Cluster de código muerto de la plantilla Expo (con tema contradictorio).**
`constants/theme.ts` define `Colors`/`Fonts` con una paleta totalmente distinta (`tint #0a7ea4`) que contradice `theme/`. Solo lo consume `components/ui/collapsible.tsx:8`, que **no se importa en ninguna pantalla**. `icon-symbol.tsx`/`icon-symbol.ios.tsx` solo los usa `collapsible`. `components/parallax-scroll-view.tsx` se exporta en `components/index.ts:5` pero **no se consume en ninguna pantalla**.
_Refactor:_ borrar `constants/theme.ts`, `collapsible.tsx`, `icon-symbol*.tsx`, `parallax-scroll-view.tsx` y sus exports en el barrel. **Esfuerzo: S.**

**B2 — Verbosidad de estilado: `{ color: themeColors.x }` inline en casi cada `<Text>`.**
Como `StyleSheet.create` no puede contener colores de tema, cada estilo temático se compone como array literal en runtime, presente en ~20 pantallas (p. ej. `profile.tsx`, `link-partner.tsx`). Además hay confusión de nombres `constants/theme.ts` vs `theme/`, y `design-system/` solo contiene un `.md`.
_Refactor (opcional):_ factory de estilos temáticos o wrappers `ThemedText`/`ThemedView` con variantes. **Esfuerzo: M.**

**B3 — Menores.** `hooks/useColorScheme.ts` es un re-export trivial (`export { useColorScheme } from 'react-native'`) con `useColorSchemeWeb` aparte; `types/index.ts` casi vacío; el barrel `hooks/index.ts` re-exporta todo (aceptable). Sin impacto real.

---

## Quick wins (bajo esfuerzo, alto valor)

1. **Borrar el cluster muerto** (B1): `constants/theme.ts`, `collapsible.tsx`, `icon-symbol*.tsx`, `parallax-scroll-view.tsx`. Elimina la segunda paleta contradictoria de un plumazo.
2. **Tipar el error + adoptar `getErrorMessage` en pantallas** (M4): exportar `ApiError` y crear `useErrorToast`; reemplazar los 5 `(e as any)?.error`.
3. **Extraer `useKeyboardOffset()`** y sustituir los 5 `useEffect` duplicados (M3, parte).
4. **Extraer `refreshPartnerScopedData()` / `resetPartnerScopedData()`** y usarlo en link/unlink para matar el bloque de 6 stores duplicado en `link-partner` y la limpieza en `profile` (A2, paso puente).

---

## Plan de refactor sugerido (por fases)

**Fase 0 — Limpieza (S, sin riesgo).** Quick wins 1-4. Deja el terreno consistente antes de tocar arquitectura.

**Fase 1 — Decisión de arquitectura de datos (L, la más importante).** Adoptar react-query como única fuente de server state. **Piloto con un dominio (permisos):** crear `useMyPermissions`/`usePartnerPermissions`/`useRespondPermission` con `queryKeys` + `invalidateQueries`, y **retirar `permissionsStore`**. Validar el patrón (loading/error/optimista) end-to-end en 1-2 pantallas.

**Fase 2 — Propagar el patrón (M-L).** Migrar acciones, puntos, streak y usuario igual que permisos. Eliminar las llamadas cruzadas entre stores (A2/A3). zustand queda solo para client state (idioma, notificaciones).

**Fase 3 — Formularios (M).** Migrar `request.tsx`, `create-template.tsx`, `edit/[id].tsx` a rhf+zod reutilizando `validators/` (M1).

**Fase 4 — Componentización (M).** `BottomSheetModal` base + `useDiscardConfirm` (M3). Extraer `TemplatePicker`/`DateTimeField`/`DurationStepper` de las pantallas de permisos (M2). Reutilizar `Select` en vez del dropdown custom.

**Fase 5 — Design System v2 (según MASTER.md).** Ejecutar `design-system/MASTER.md` (tokens de categoría unificados, tipografía corregida, motion). Opcionalmente resolver la verbosidad de estilado (B2).

_Orden por qué: cada fase reduce el tamaño del problema de la siguiente (Fase 0 limpia; Fase 1-2 eliminan el grueso del boilerplate y el acoplamiento; Fase 3-4 se apoyan en un acceso a datos ya unificado; Fase 5 es puramente visual y ya está especificada)._
