# CLAUDE.md

Guía para cualquier IA (y colaborador) que trabaje en este repositorio. Estas reglas tienen prioridad sobre defaults del asistente.

## Reglas obligatorias

- **Sin código muerto.** Nunca dejar variables, imports, funciones, tipos, textos ni traducciones sin usar. Si algo deja de usarse, se borra en el mismo cambio.
- **Sin comentarios.** No agregar comentarios; el código se explica con nombres claros y funciones pequeñas. Solo se permiten los comentarios que una herramienta exige (p. ej. directivas de lint o `@ts-expect-error` con motivo).
- **Clean code + SOLID.** Aplica a app, backend y website: responsabilidad única, funciones cortas, dependencias hacia abstracciones, sin duplicación, sin abstracción prematura.
- **Buenas prácticas siempre.** Tipado estricto (nada de `any` implícito), manejo explícito de errores, nombres descriptivos, y consistencia con el estilo del archivo que se edita.
- **Editar sobre reescribir.** Leer el archivo antes de modificarlo y hacer cambios acotados; no reescribir archivos completos sin necesidad.
- **Nada de secretos en el código.** Credenciales y llaves van en `.env` por proyecto, nunca hardcodeadas ni commiteadas.
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

### App — `mari-puntos-app/`

Expo SDK 57, React Native, TypeScript, TanStack Query, Zustand, Clerk, Sentry.

- **UI:** seguir [DESIGN.md](DESIGN.md). Cero hex hardcodeados, colores/espaciado/tipografía vía tokens del theme. Sin gradientes, sin emojis como iconos estructurales, Ionicons outline por defecto.
- **i18n:** todo texto visible pasa por i18n (`i18n/locales/es` y `en`). Nunca strings hardcodeados en pantallas; agregar la clave en **ambos** idiomas.
- **Verificar:** `pnpm lint` · `pnpm format`.

### Backend — `mari-puntos-backend/`

Express 5, TypeORM, PostgreSQL, Clerk, Zod, Pino.

- Validar entrada con Zod en el borde; capas separadas (routes → services → data). Logs con Pino, nunca `console.log`.
- Cambios de esquema vía migraciones TypeORM (`pnpm migration:generate` / `migration:run`), nunca a mano en la DB.
- **Verificar:** `pnpm typecheck` · `pnpm lint`.

### Website — `mari-puntos-website/`

Astro 7, React 19 (islands), Tailwind CSS 4.

- Islands solo donde haga falta interactividad; el resto estático. Estilos con utilidades Tailwind.
- Contenido legal bilingüe en `src/content/legal/{es,en}`.
- **Verificar:** `pnpm lint` (Prettier) · `pnpm build`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) validados con commitlint + husky.

- Scopes válidos: `app`, `backend`, `website`, `repo`.
- Ejemplo: `feat(app): agregar pantalla de estadísticas`.
