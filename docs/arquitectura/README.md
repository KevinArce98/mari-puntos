# Revisión de arquitectura — MariPuntos

Revisión de salud del código del monorepo (app, backend, website), consolidada a partir de tres análisis independientes del agente `architect-reviewer` (solo análisis, sin cambios de código). Todos los hallazgos citan `archivo:línea` reales.

**Vista consolidada:** `salud-codigo.html` (abrir en el navegador) — resumen ejecutivo, patrones transversales del monorepo, hallazgos por impacto y hoja de ruta de refactor por fases.

## Informes por proyecto

| Proyecto | Stack | Impacto global | Informe |
|---|---|---|---|
| App | React Native · Expo Router · TS | Sano · eje datos alto | [`app.md`](./app.md) |
| Backend | Express 5 · TypeORM · Postgres | Medio | [`backend.md`](./backend.md) |
| Website | Astro 7 · React islands · Tailwind 4 | Bajo-medio | [`website.md`](./website.md) |

## El hilo transversal

El mismo patrón aparece en los tres proyectos: **la herramienta correcta ya está instalada y casi no se usa** — react-query (app), `createError` tipado (backend), token `--primary` (web). Gran parte del refactor es *terminar de adoptar decisiones ya tomadas*, no introducir nada nuevo.

Veredicto: cimientos sanos, 0 bugs críticos de corrección. La deuda es de consistencia y de altitud.

## Hoja de ruta (resumen)

- **Fase 0 — Higiene:** borrar código muerto, tipar errores, conectar tokens de color.
- **Fase 1 — Riesgos latentes (backend):** unificar `findActiveLink`, transacción en `addPoints`, de-duplicar legal (web).
- **Fase 2 — Decisión de datos (app):** react-query como única fuente de estado de servidor; piloto en permisos.
- **Fase 3 — Descomponer god-files:** servicios (backend), pantallas (app), `LandingPage` (web).
- **Fase 4 — Consistencia:** middleware `validate` + un solo sistema de errores (backend), formularios rhf+zod (app).
