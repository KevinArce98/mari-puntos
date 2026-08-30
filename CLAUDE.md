# CLAUDE.md

Guía para cualquier IA (y colaborador) que trabaje en este repositorio. Estas reglas tienen prioridad sobre defaults del asistente.

## Reglas obligatorias

- **Sin código muerto.** Nunca dejar variables, imports, funciones, tipos, textos ni traducciones sin usar. Si algo deja de usarse, se borra en el mismo cambio.
- **Sin comentarios.** No agregar comentarios; el código se explica con nombres claros y funciones pequeñas. Solo se permiten los comentarios que una herramienta exige (p. ej. directivas de lint o `@ts-expect-error` con motivo).
- **Clean code + SOLID.** Aplica a app, backend y website: responsabilidad única, funciones cortas, dependencias hacia abstracciones, sin duplicación, sin abstracción prematura.
- **Buenas prácticas siempre.** Tipado estricto (todo corre en TS `strict`), manejo explícito de errores, nombres descriptivos, y consistencia con el estilo del archivo que se edita.
- **Sin `any`.** Preferir tipos concretos o `unknown` + narrowing. Validar datos externos con Zod, no castear.
- **i18n, nunca strings hardcodeados.** Los tres proyectos usan i18n; todo texto visible al usuario va como clave en `es` **y** `en`.
- **Editar sobre reescribir.** Leer el archivo antes de modificarlo y hacer cambios acotados; no reescribir archivos completos sin necesidad.
- **Seguir la convención de la carpeta.** Nombres de archivo, estilo de import y patrones se copian del código vecino, no se inventan.
- **Nada de secretos en el código.** Credenciales y llaves van en `.env` por proyecto, nunca hardcodeadas ni commiteadas. Ojo: las variables `EXPO_PUBLIC_*` de la app se empaquetan en el cliente y son **públicas** — jamás poner secretos ahí.
- **Sin commits automáticos.** No crear commits salvo pedido explícito.

## Estructura

```
mari-puntos/
├── mari-puntos-app/        # App móvil (Expo / React Native)
├── mari-puntos-backend/    # API REST (Express / TypeORM / PostgreSQL)
├── mari-puntos-website/    # Landing (Astro)
├── DESIGN.md               # Design system (fuente de verdad de UI de la app)
└── README.md · SECURITY.md · LICENSE
```

Monorepo pnpm: `pnpm install` una sola vez desde la raíz.

## Por proyecto

No hay runner de tests configurado: la verificación de un cambio es **typecheck + lint + build** según el proyecto.

### App — `mari-puntos-app/`

Expo SDK 57, React Native, TypeScript (`strict`), Expo Router, TanStack Query, Zustand, Clerk, Sentry.

- **Imports:** usar el alias `@/…` (definido en `tsconfig`), no rutas relativas profundas (`../../…`).
- **Datos (server state):** TanStack Query. Flujo: `services/*Service.ts` (llamadas HTTP vía el cliente axios de `services/api.ts`) → hook en `hooks/useX.ts` (`useQuery`/`useMutation`) → componente. Nunca `fetch`/axios directo en un componente. Query keys centralizadas en `lib/queryKeys.ts`.
- **Estado cliente:** Zustand (`stores/`) solo para estado local/UI; no duplicar ahí datos de servidor.
- **UI:** seguir [DESIGN.md](DESIGN.md). Cero hex hardcodeados; color/espaciado/tipografía desde `theme/`. Sin gradientes, sin emojis como iconos estructurales, Ionicons outline por defecto.
- **i18n:** claves en `i18n/locales/es` y `en`.
- **Logs y errores:** usar `utils/logger`, nunca `console.log`; mensajes de error vía `utils/errorMessage`.
- **Verificar:** `pnpm lint` · `pnpm format`.

### Backend — `mari-puntos-backend/`

Express 5, TypeORM, PostgreSQL, Clerk, Zod, Pino. TS `strict` + `noUnusedLocals/Parameters`.

- **Capas:** `routes → controllers → services → entities`. La lógica de negocio vive en `services/`; los controllers son delgados (parsean, delegan, responden).
- **Validación:** Zod en `validators/` sobre la entrada, en el borde.
- **Errores:** centralizados en `middlewares/errorMiddleware.ts`; lanzar errores tipados, no responder ad-hoc en cada handler.
- **Logs:** Pino, nunca `console.log`.
- **Esquema:** solo vía migraciones TypeORM (`pnpm migration:generate` / `migration:run`), nunca editar la DB a mano.
- **i18n:** mensajes al cliente vía `src/i18n`.
- **Verificar:** `pnpm typecheck` · `pnpm lint`.

### Website — `mari-puntos-website/`

Astro 7, React 19 (islands), Tailwind CSS 4.

- Islands solo donde haga falta interactividad; el resto estático. Estilos con utilidades Tailwind.
- **i18n:** ES/EN vía `src/i18n` y `src/pages/en`; contenido legal en `src/content/legal/{es,en}`.
- **Verificar:** `pnpm lint` (Prettier) · `pnpm build`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) validados con commitlint + husky.

- Scopes válidos: `app`, `backend`, `website`, `repo`.
- Ejemplo: `feat(app): agregar pantalla de estadísticas`.
