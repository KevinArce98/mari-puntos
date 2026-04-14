# MariPuntos

Gamifica los permisos en tu relación de pareja. Gana puntos por acciones, solicita permisos, canjea recompensas y desbloquea logros junto a tu pareja.

## Estructura del proyecto

```
mari-puntos/
├── mari-puntos-app/        # App móvil (Expo / React Native)
├── mari-puntos-backend/    # API REST (Express / TypeORM / PostgreSQL)
├── mari-puntos-website/    # Landing page (Next.js)
└── .github/workflows/      # CI/CD pipelines
```

## Tech Stack

| Proyecto | Tecnologías |
|---|---|
| **App** | Expo SDK 55, React Native, TypeScript, Zustand, Clerk, Sentry |
| **Backend** | Express 5, TypeORM, PostgreSQL, Clerk, Zod, Pino |
| **Website** | Next.js 16, React 19, Tailwind CSS 4 |

## Requisitos

- **Node.js** >= 20
- **npm** (app)
- **pnpm** >= 10 (backend)
- **EAS CLI** (para builds de la app)

## Desarrollo local

### App móvil

```bash
cd mari-puntos-app
npm install
npm start
```

### Backend

```bash
cd mari-puntos-backend
pnpm install
pnpm dev
```

### Website

```bash
cd mari-puntos-website
pnpm install
pnpm run dev
```

## Variables de entorno

Cada proyecto tiene su propio `.env`. Consultá los archivos `.env.example` de cada subproyecto (si existen) o revisá la configuración en el código.

## CI/CD

El proyecto usa **GitHub Actions** con los siguientes workflows:

| Workflow | Trigger | Descripción |
|---|---|---|
| `ci-app.yml` | PR que toca `mari-puntos-app/` | Lint + TypeCheck |
| `ci-backend.yml` | PR que toca `mari-puntos-backend/` | Lint + TypeCheck + Build |
| `cd-app-update.yml` | Push a `main` (cambios en app) | OTA update via `eas update` |
| `cd-app-build.yml` | Tag `mari-puntos-app@*` | EAS Build iOS/Android + Submit |
| `release.yml` | Push a `main` | Changesets: version bump + tags |

### Secrets requeridos en GitHub

| Secret | Descripción |
|---|---|
| `EXPO_TOKEN` | Token de acceso de Expo (EAS) |

## Conventional Commits

El proyecto usa [Conventional Commits](https://www.conventionalcommits.org/) validados con **commitlint** + **husky**.

```
feat(app): agregar pantalla de estadísticas
fix(backend): corregir cálculo de puntos
chore(ci): actualizar workflow de build
```

**Scopes válidos:** `app`, `backend`, `website`, `ci`, `repo`

## Semantic Versioning

Se usa [Changesets](https://github.com/changesets/changesets) para manejar versiones. Al desarrollar una feature:

```bash
# 1. Crear un changeset describiendo el cambio
npx changeset

# 2. Seleccionar el paquete afectado y tipo de bump (patch/minor/major)
# 3. Committear el changeset junto con tu código
# 4. Al hacer merge a main, se abre un PR automático de versión
# 5. Al hacer merge de ese PR, se crea un tag y se dispara el build
```

## Links

- **App Store:** https://apps.apple.com/app/id6758923865
