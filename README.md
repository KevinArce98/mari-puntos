# MariPuntos

Gamifica los permisos en tu relación de pareja. Gana puntos por acciones, solicita permisos, mantén rachas semanales y desbloquea logros junto a tu pareja.

## Estructura del proyecto

```
mari-puntos/
├── mari-puntos-app/        # App móvil (Expo / React Native)
├── mari-puntos-backend/    # API REST (Express / TypeORM / PostgreSQL)
└── mari-puntos-website/    # Landing page (Next.js)
```

## Tech Stack

| Proyecto | Tecnologías |
|---|---|
| **App** | Expo SDK 55, React Native, TypeScript, Zustand, Clerk, Sentry |
| **Backend** | Express 5, TypeORM, PostgreSQL, Clerk, Zod, Pino |
| **Website** | Next.js 16, React 19, Tailwind CSS 4 |

## Requisitos

- **Node.js** >= 20
- **pnpm** >= 11
- **EAS CLI** (para builds de la app)

## Desarrollo local

Este es un monorepo pnpm — corré `pnpm install` una sola vez desde la raíz para instalar las dependencias de los tres proyectos.

### App móvil

```bash
cd mari-puntos-app
pnpm start
```

### Backend

```bash
cd mari-puntos-backend
pnpm dev
```

### Website

```bash
cd mari-puntos-website
pnpm run dev
```

## Variables de entorno

Cada proyecto tiene su propio `.env`. Consultá los archivos `.env.example` de cada subproyecto (si existen) o revisá la configuración en el código.

## Builds y despliegue

La app se compila y publica manualmente con **EAS**:

```bash
cd mari-puntos-app
eas build --platform ios      # build de producción iOS
eas build --platform android  # build de producción Android
eas update                    # OTA update (JS) sobre un build existente
```

## Conventional Commits

El proyecto usa [Conventional Commits](https://www.conventionalcommits.org/) validados con **commitlint** + **husky**.

```
feat(app): agregar pantalla de estadísticas
fix(backend): corregir cálculo de puntos
```

**Scopes válidos:** `app`, `backend`, `website`, `repo`

## Seguridad

¿Encontraste una vulnerabilidad? No abras un issue público — seguí [SECURITY.md](SECURITY.md).

## Licencia

[MIT](LICENSE) © Kevin Arias

## Links

- **App Store:** https://apps.apple.com/app/id6758923865
