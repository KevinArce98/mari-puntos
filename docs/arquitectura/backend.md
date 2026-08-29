# Revisión de arquitectura — mari-puntos-backend

Fecha: 2026-08-29 · Alcance: `/Users/kevinarias/Projects/mari-puntos/mari-puntos-backend` (Express 5 + TypeScript + TypeORM + PostgreSQL + Clerk + Zod)

---

## 1. Resumen ejecutivo

El backend está **mejor estructurado que el promedio de un proyecto de este tamaño**: hay una separación de carpetas por capas real (controllers / services / routes / entities / middlewares / validators / utils / shared), una capa de mapeo entidad→DTO que evita filtrar entidades de TypeORM a la API (`utils/mappers.ts`), un sobre de respuesta consistente (`utils/response.ts`), un middleware de errores centralizado con i18n (`middlewares/errorMiddleware.ts`) y —lo más valioso— **transacciones con bloqueos pesimistas en los caminos críticos de puntos** (`approveAction`, `respondToPermission`, alta/unión de pareja). Los servicios NO conocen `req`/`res` (0 fugas de la capa web hacia servicios). `StreakService` es un ejemplo modelo de servicio pequeño, cohesivo y con helpers privados.

El problema central **no es la corrección, sino la mantenibilidad y la complejidad acumulada**. Cuatro servicios de 400+ LOC concentran, cada uno, cinco responsabilidades distintas (acceso a datos + reglas de negocio + escritura de logs de auditoría + notificaciones push + verificación de logros + i18n + orquestación de transacciones). No existe capa de repositorio: hay **34 llamadas `getRepository` dispersas** y **19 instanciaciones `new XxxService()`** hechas a mano como inicializadores de campo, lo que hace el grafo de dependencias implícito y **el código prácticamente no testeable en unidad**. Existen dos sistemas de errores en paralelo, pero el "bueno" (la fábrica tipada `createError`) se usa **una sola vez** en todo el proyecto. La validación Zod está definida centralmente pero se ejecuta **dentro de cada controlador** (no hay middleware `validate`), y hay ~36 bloques `try/catch` que solo hacen log-and-rethrow y son puro ruido porque ya existe `asyncHandler` + `errorMiddleware`.

En síntesis: la arquitectura es sólida en sus cimientos (capas, DTOs, transacciones, i18n) pero está **erosionada por duplicación, servicios "gordos" y falta de dos o tres abstracciones baratas** (repositorio/consulta de pareja, servicio de logros separado, middleware de validación, DI). Ninguno de los hallazgos exige reescribir; casi todos son refactors incrementales de riesgo bajo/medio que reducirían el tamaño de los servicios grandes entre un 30 % y un 50 % y harían el código testeable.

**Impacto arquitectónico global: MEDIO.** No hay violaciones que rompan el sistema, pero sí varias que "hacen más difícil el cambio futuro" — el criterio que importa.

---

## 2. Lo que ya está bien (conservar)

- **Separación de capas real y sin fugas hacia servicios.** Ningún servicio importa `Request`/`Response` ni toca `req`/`res` (verificado por grep). Los controladores traducen HTTP↔servicio y los servicios devuelven entidades/estructuras planas.
- **Capa de DTO/mapeo explícita** (`utils/mappers.ts`, `shared/dtos.ts`): las entidades de TypeORM nunca se serializan directamente; siempre pasan por `toXxxDTO`. Esto protege el contrato de la API frente a cambios de esquema.
- **Transacciones con bloqueo pesimista en los caminos que mutan puntos:** `actions.service.ts:213-296` (approve), `actions.service.ts:351-415` (reject), `permissions.service.ts:261-332` (respond), `partner.service.ts:20-82` y `85-210` (crear/unir pareja). Es lo correcto para un sistema de puntos concurrente pareja-pareja.
- **Manejo de errores centralizado** (`errorMiddleware.ts`): traduce `ZodError`, `AppError`, `QueryFailedError`, `EntityNotFoundError`, errores JWT; distingue 4xx (warn) de 5xx (error); oculta detalles en producción.
- **`asyncHandler`** ya existe (`errorMiddleware.ts:118-124`) y las rutas lo usan, así que la infraestructura para eliminar los try/catch de los controladores ya está.
- **i18n consistente** para texto orientado al usuario, con locale por usuario y por header (`i18n/index.ts`).
- **`StreakService` (110 LOC):** cohesivo, con helpers privados (`applyWeekTransition`, `getActiveLink`, `resolveUserFlags`), sin efectos secundarios ocultos. **Es el patrón a replicar en los servicios grandes.**
- **Seguridad de base:** helmet, CORS por entorno, límites de tamaño de body (con excepción de 10 MB solo para subida de avatar), body crudo para webhooks, `statement_timeout`, pool configurado, SQL siempre parametrizado (sin inyección), Zod validando entrada.
- **Push notifications aisladas** en su propio servicio y tratadas como no-críticas (fire-and-forget con `catch` + log), de modo que un fallo de Expo no rompe la operación principal.
- **Auth con caché LRU + aprovisionamiento JIT** del usuario (`authMiddleware.ts`).

---

## 3. Hallazgos priorizados

### ALTO

---

**H1 — Servicios "gordos" que violan SRP (mezclan 5 responsabilidades).** · Esfuerzo: **L**

`actions.service.ts` (456), `points.service.ts` (435), `partner.service.ts` (425), `permissions.service.ts` (415). Cada método de negocio orquesta a mano: acceso a datos (repos), reglas de negocio, escritura de logs de auditoría, notificaciones push, verificación de logros, i18n y transacciones.

Ejemplo concreto — `ActionsService.approveAction` (`actions.service.ts:191-327`, ~136 líneas en un método) hace: buscar aprobador, resolver pareja, abrir transacción con lock, cambiar estado, recalcular puntos/nivel del usuario, crear **3** entradas de log traducidas, y tras el commit: actualizar racha, verificar logros y enviar push. Son cinco preocupaciones en una sola función.

Ejemplo concreto — `PointsService.checkAchievements` (`points.service.ts:192-325`, ~133 líneas): un solo método con cuatro tablas de hitos (`pointsMilestones`, `actionsMilestones`, `permissionsMilestones`, `streakMilestones`) codificadas inline y bucles que hacen `findOne`+`save` por iteración.

**Por qué importa:** un método de 130 líneas con 5 responsabilidades no se puede leer, probar ni cambiar sin miedo. Es la causa raíz de la mayoría de los demás hallazgos.

**Refactor concreto:**
- Extraer un `AuditLogService.record(userId, type, {...})` (o `LogWriter`) que encapsule el patrón `logRepo.create({ userId, type, message: translate(...), ... })` repetido decenas de veces.
- Separar el **motor de logros** de `PointsService` en `AchievementsService` (ver H2).
- Dejar cada método de servicio como orquestador delgado: validar → mutar en transacción → delegar side-effects a un `notifyAfterCommit(...)` común.
- Tomar `StreakService` como plantilla de tamaño/estilo.

---

**H2 — `PointsService` son en realidad dos servicios: ledger de puntos + motor de logros.** · Esfuerzo: **M**

De sus 435 líneas, ~250 son el motor de logros (`checkAchievements` 192-325, `updateProgress` 327-357, `checkLevelAchievements` 359-389, `unlockAchievement` 391-434, `handleLevelUp` 152-166, `achievementCopy` 184-190). El resto es el ledger (`addPoints`, `deductPoints`, `getPointsHistory`, `getLeaderboard`).

**Por qué importa:** dos ejes de cambio independientes (política de puntos vs. catálogo de logros) viven en la misma clase; cambiar hitos obliga a tocar el mismo archivo que la lógica de leaderboard. Además crea el ciclo lógico actions→points→(logros) y points→streak.

**Refactor:** mover el motor a `services/achievements.service.ts` con interfaz `checkForUser(userId)`. `PointsService` queda ~180 LOC. Los llamadores (`actions.service.ts:305`, `permissions.service.ts:352`) invocan `achievementsService.checkForUser(...)` en vez de `pointsService.checkAchievementsForUser(...)`.

---

**H3 — Sin capa de repositorio: 34 `getRepository` dispersos + acoplamiento total a TypeORM.** · Esfuerzo: **L**

Cada servicio declara sus repos como inicializadores de campo (`actions.service.ts:20-22`, `points.service.ts:18-20`, etc.) y además hay SQL crudo mezclado con el ORM: `points.service.ts:203-210`, `users.service.ts:239-321`. La consulta "¿quién es la pareja / link activo?" (`findOne({ where: [{ user1Id }, { user2Id }] })`) está **reimplementada ~8 veces** con variaciones sutiles de filtro de estado — grep encontró el patrón en `partner.service.ts` (múltiples), `streak.service.ts:89-94`, `permission-templates.service.ts:39-41,108-113,131-133`, `users.service.ts`, `authMiddleware.ts:173-178`. Algunas filtran `status = ACTIVE` y otras no, lo que es un foco de bugs latente.

**Por qué importa:** toda la lógica de dominio depende directamente de la API de TypeORM; no se puede sustituir el acceso a datos ni mockearlo; las inconsistencias de la consulta de pareja pueden producir comportamientos distintos según el servicio.

**Refactor:** crear al menos un `PartnerLinkRepository` (o métodos en `PartnerService`) con `findActiveLink(userId)` / `getPartnerId(userId)` **como única fuente de verdad**, y reemplazar las ~8 copias. Opcionalmente introducir repositorios personalizados de TypeORM por entidad. No hace falta un patrón repositorio purista; basta centralizar las consultas repetidas.

---

**H4 — Instanciación directa con `new` en vez de inyección de dependencias (no testeable).** · Esfuerzo: **M**

19 `new XxxService()` (grep). Los servicios crean sus dependencias como campos: `permissions.service.ts:36-38` crea 3 servicios, `actions.service.ts:23-26` crea 4, `points.service.ts:21` crea `StreakService`. Los controladores y `authMiddleware.ts:19` hacen lo mismo.

**Por qué importa:** (a) **imposible mockear** dependencias en tests unitarios; (b) **instancias duplicadas** — cada `ActionsService` crea su propio `PartnerService`, `PointsService`, `PushNotificationService`, `StreakService`, y `PointsService` a su vez crea otro `StreakService`; (c) el grafo de dependencias es implícito y se construye ansiosamente al importar.

**Refactor:** inyectar dependencias por constructor con valores por defecto (`constructor(private partner = new PartnerService(), ...)`) como paso mínimo no invasivo, o introducir un contenedor/composición ligera en un `container.ts`. Con esto los tests pueden pasar dobles. No se necesita un framework de DI pesado.

---

### MEDIO

---

**H5 — Dos sistemas de errores en paralelo; el tipado (`createError`) está prácticamente muerto.** · Esfuerzo: **M**

Existe una fábrica tipada y semántica `createError.*` (`errorMiddleware.ts:126-232`) con `ErrorCode` y mapeo `ErrorCodeToHttpStatus` (`constants.ts:104-132`). Pero grep muestra que se usa **exactamente una vez** (`streak.service.ts:96`). Las otras ~70 excepciones usan la forma posicional confusa `new AppError(404, 'Usuario no encontrado', 'errors.user.notFound')` — que mezcla **tres** formas de expresar lo mismo: status numérico + mensaje en español hardcodeado + clave i18n. El constructor de `AppError` (`errorMiddleware.ts:16-42`) está sobrecargado (`codeOrStatus: ErrorCode | number`, `i18nKeyOrStatusCode: string | number`) para soportar ambos estilos, lo que lo hace difícil de leer.

**Por qué importa:** inconsistencia; el `ErrorCode` tipado no llega al cliente en casi ningún error (los clientes no pueden discriminar por código); el mensaje español hardcodeado es redundante con la clave i18n y puede desincronizarse.

**Refactor:** estandarizar en `createError.*` (o en un único `AppError(code, i18nKey, params)`), eliminar los mensajes español hardcodeados donde ya hay clave i18n, y así el `code` viaja siempre al cliente. Simplificar el constructor de `AppError` a una sola firma.

---

**H6 — Validación dentro de los controladores; middleware `validate` inexistente y 4 schemas de query sin uso.** · Esfuerzo: **M**

No existe middleware `validate` (grep: NONE). Cada controlador hace `schema.parse(req.body)` en línea (`actions.controller.ts:28,134,156,183`, `permissions.controller.ts:27,156,201`, etc.). Peor: los query params se parsean **a mano y duplicado** — el bloque `parseInt(req.query.page) || DEFAULT` + `Math.min(parseInt(limit), MAX_LIMIT)` está copiado en `getMyActions`/`getPartnerActions`/`getMyPermissions`/`getPartnerPermissions` (`actions.controller.ts:50-55,81-86`, `permissions.controller.ts:56-61,91-96`). Mientras tanto `paginationSchema`, `actionsQuerySchema`, `permissionsQuerySchema`, `leaderboardQuerySchema` (`schemas.ts:110-144`) están **definidos pero sin usar** (grep confirma que solo se referencia el `type` de paginación).

**Por qué importa:** validación inconsistente (el body sí, el query no); lógica de coerción duplicada 4+ veces; schemas muertos que dan falsa sensación de cobertura.

**Refactor:** crear `middlewares/validate.ts` con `validate({ body?, query?, params? })` que parsee y coloque el resultado tipado en `req` (y deje el `ZodError` fluir a `errorMiddleware`, que ya lo maneja). Aplicarlo por ruta y borrar el parseo manual de los controladores. Conectar los 4 query-schemas ya existentes.

---

**H7 — ~36 `try/catch` de log-and-rethrow que solo añaden ruido y doble logging.** · Esfuerzo: **S**

Casi todos los métodos de controlador siguen el patrón `try { ... } catch (error) { logger.error(...); throw error; }` (`actions.controller.ts`: 8 de 8 métodos; `permissions.controller.ts`: 7; `partner.controller.ts`: 5; `users.controller.ts`: 5; `permission-templates.controller.ts`: 6). Como las rutas ya envuelven con `asyncHandler` y `errorMiddleware` **ya loguea** el error (`errorMiddleware.ts:56-60`), estos bloques (a) no aportan control de flujo, (b) **duplican el log** de cada error, y (c) son inconsistentes: `users.controller.ts` `getProfile`/`getStats`/`getAchievements`, `streak.controller.ts` y `webhooks.controller.ts` NO los tienen.

**Por qué importa:** ~200 líneas de puro boilerplate que oscurecen la lógica real y generan logs duplicados difíciles de leer en producción.

**Refactor:** eliminar los try/catch de los controladores; confiar en `asyncHandler` + `errorMiddleware`. Si se quiere contexto (userId) en el log, añadirlo una vez en `errorMiddleware` o en un `requestContext`, no en cada método.

---

**H8 — Duplicación de reglas de negocio en múltiples servicios.** · Esfuerzo: **M**

- **Triada de recálculo de nivel** `totalPoints += x; currentLevel = calculateLevel(...); pointsInCurrentLevel = calculatePointsInCurrentLevel(...)` repetida en `points.service.ts:35-37,83-85`, `actions.service.ts:257-261`, `permissions.service.ts:286-290`. Debe ser **un** método de dominio `applyPointsDelta(user, delta)`.
- **`generateUniquePartnerCode`** duplicado casi idéntico en `partner.service.ts:410-424` y `users.service.ts:276-290` (y `generateUniqueLinkCode` en `partner.service.ts:394-408` es la misma plantilla).
- **Consulta de link de pareja** duplicada ~8 veces (ver H3).
- **Patrón push fire-and-forget** (`try { ...send... } catch { logger.error }`) repetido ~6 veces (`actions.service.ts:64-81,298-324,417-430`, `permissions.service.ts:334-348`, `partner.service.ts:212-222,378-391`).

**Por qué importa:** cualquier cambio de regla (p. ej. puntos por nivel, longitud de código, filtro de estado del link) obliga a editar 3-8 sitios; alta probabilidad de que se desincronicen.

**Refactor:** un `PointsCalculator`/método de dominio para la triada; mover generación de códigos a un único `CodeGenerator`; centralizar la consulta de pareja (H3); un helper `dispatchAfterCommit(fn)` para los push.

---

**H9 — Inconsistencia transaccional: no todos los caminos que mutan puntos están protegidos.** · Esfuerzo: **M**

`approveAction` y `respondToPermission` usan transacción + lock (bien), pero `PointsService.addPoints` (`points.service.ts:23-70`) **no es transaccional**: guarda usuario → guarda log → `handleLevelUp` (otro save) → `checkAchievements` (N saves), todo fuera de transacción. Un fallo a mitad deja estado parcial (puntos sumados sin log, o nivel sin logro). Igual `checkAchievementsForUser` (`points.service.ts:168-182`) muta nivel y guarda sin transacción.

**Por qué importa:** integridad de datos en un sistema de puntos; los dos caminos que suman puntos por la ruta de acción/permiso están seguros, pero la API genérica `addPoints`/`deductPoints` no, lo que es una inconsistencia peligrosa si se empieza a usar.

**Refactor:** envolver `addPoints`/`deductPoints` en `AppDataSource.transaction` con lock del usuario, igual que los otros caminos. Confirmar si `addPoints`/`deductPoints` se usan hoy (podrían ser código muerto; si lo son, ver H11).

---

**H10 — Motor de logros con N+1 de escrituras/lecturas por aprobación.** · Esfuerzo: **M**

`checkAchievements` (`points.service.ts:192-325`) recorre 4 arrays de hitos; cada iteración llama a `updateProgress` o `unlockAchievement`, y **cada uno vuelve a hacer su propio `findOne` + `save`** (`updateProgress` 334, `unlockAchievement` 399), a pesar de que al inicio ya se cargó el set de logros desbloqueados (197-199). Por cada acción aprobada puede haber decenas de round-trips a la BD.

**Por qué importa:** rendimiento y coste por operación; se agrava al crecer el catálogo de hitos.

**Refactor:** cargar todos los logros del usuario una vez, calcular en memoria el delta (nuevos desbloqueos + progresos a actualizar) y persistir en un `save([...])` batch dentro de una transacción.

---

### BAJO

---

**H11 — Código muerto / exports sin uso.** · Esfuerzo: **S**
- `PermissionType` (`constants.ts:29-38`): definido, **nunca importado** (grep).
- Helpers de respuesta sin uso: `sendBadRequest`, `sendForbidden`, `sendConflict`, `sendUnauthorized` (`response.ts`) → 0 usos.
- Query-schemas sin uso (H6).
- Conviene verificar `optionalAuthMiddleware`, `sanitizeInput`, `calculatePointsForNextLevel`, `calculateLevelProgress`, `deductPoints`/`addPoints`.
- `noUnusedLocals` está activo pero no detecta exports cruzados sin uso. Considerar `ts-prune`/`knip`.

**H12 — `req.user` poblado de forma inconsistente (bug latente).** · Esfuerzo: **S**

En `authMiddleware.ts:118`, `req.user` solo se asigna en el **cache miss** (dentro del `if (!cached)`). En un cache hit, `req.user` queda `undefined` aunque `req.userId` sí esté. Hoy nadie depende de `req.user` (solo se usa `req.userId`), pero cualquier handler futuro que lea `req.user` fallará de forma intermitente (según el estado del LRU). Corregir: no adjuntar la entidad completa, o adjuntarla siempre (recargándola) — decidir una política.

**H13 — Asimetría i18n: errores traducidos, mensajes de éxito hardcodeados en inglés.** · Esfuerzo: **S**

Los controladores pasan mensajes de éxito en inglés fijos (`'Permission requested successfully'`, `actions.controller.ts:40`; `'Action approved successfully'`, etc.), mientras que los errores sí pasan por i18n. Inconsistencia de idioma/localización en la misma respuesta. Mover los mensajes de éxito a claves i18n o documentar que el `message` es un código interno no destinado a UI.

**H14 — `purgeLocalUserData` reimplementa el borrado en cascada a mano.** · Esfuerzo: **M**

`users.service.ts:292-323` hace 8 `DELETE` crudos en orden manual (logs, achievements, permissions, actions, permissions-por-template, templates, partner_links, users). Es frágil: si se añade una entidad con FK al usuario, hay que recordar editar aquí. Debería delegarse en `ON DELETE CASCADE` a nivel de esquema/migración o en las cascadas de relaciones de TypeORM, dejando un único `DELETE FROM users`.

**H15 — Mapeadores reinventan utilidades existentes.** · Esfuerzo: **S**

`mappers.ts:36` deriva el locale con un ternario `user.locale === 'en' ? 'en' : user.locale === 'es' ? 'es' : undefined` en vez de reutilizar `normalizeLocale` (`i18n/index.ts:21`). `toPartnerInfoDTO` (`mappers.ts:216-219`) recompara strings de estado en lugar de usar el enum. Menor, pero es duplicación de reglas de normalización.

---

## 4. Quick wins (alto valor / bajo esfuerzo)

1. **Eliminar los try/catch de log-and-rethrow de los controladores** (H7) — quita ~200 líneas de ruido y el doble logging. Riesgo casi nulo: `asyncHandler` + `errorMiddleware` ya cubren el flujo.
2. **Borrar código muerto** (H11): `PermissionType`, helpers `send*` sin uso, y conectar o borrar los query-schemas. Mecánico.
3. **Crear un método único de consulta de pareja** (`findActiveLink`/`getPartnerId`) y reemplazar las ~8 copias (parte de H3) — reduce riesgo de bugs por filtros de estado divergentes.
4. **Extraer `applyPointsDelta(user, delta)`** para la triada de recálculo de nivel (parte de H8) — 4 sitios → 1.
5. **Arreglar `req.user` inconsistente** (H12) — 1 línea de decisión, evita un bug futuro difícil de diagnosticar.
6. **Unificar `generateUniquePartnerCode`** (H8) — borrar la copia de `users.service.ts`.

---

## 5. Plan de refactor por fases

**Fase 0 — Limpieza sin riesgo (0.5–1 día).**
Quick wins 1, 2, 5, 6. Borra ruido y código muerto; deja el terreno legible antes de mover lógica. Sin cambios de comportamiento.

**Fase 1 — Middleware de validación + centralizar consultas repetidas (1–2 días).**
- `middlewares/validate.ts` y aplicarlo por ruta; retirar `schema.parse` y el parseo manual de query de los controladores (H6). Conectar los query-schemas existentes.
- Centralizar la consulta de link de pareja y la generación de códigos (H3 parcial, H8). 
Resultado: controladores realmente delgados; una sola fuente de verdad para "quién es la pareja".

**Fase 2 — Separar responsabilidades de los servicios grandes (3–5 días).**
- Extraer `AchievementsService` desde `PointsService` (H2) + batch para el N+1 (H10).
- Extraer `AuditLogService`/`LogWriter` y un helper `dispatchAfterCommit` para push (H1, H8).
- Reescribir los métodos-orquestador de `actions`/`permissions` para que deleguen (objetivo: ningún método > ~50 LOC, tomando `StreakService` como referencia).
Resultado esperado: los 4 servicios de 400+ LOC bajan a ~200–280 LOC.

**Fase 3 — Errores + integridad transaccional (2–3 días).**
- Estandarizar en `createError`/`AppError(code, i18nKey, params)`; simplificar el constructor; eliminar mensajes español hardcodeados redundantes (H5).
- Envolver `addPoints`/`deductPoints` en transacción con lock, o eliminarlos si son código muerto (H9).
- Migrar `purgeLocalUserData` a cascadas de esquema/ORM (H14).

**Fase 4 — Testabilidad (DI) (2–3 días, opcional pero recomendado).**
- Inyección por constructor con defaults (H4); introducir un `container.ts` de composición.
- Añadir tests unitarios de los servicios ahora mockeables (empezando por el nuevo `AchievementsService` y los caminos de puntos), y de contrato en los controladores.
Resultado: el backend pasa de "no testeable en unidad" a cubierto en su lógica de dominio crítica.

---

### Apéndice — evidencia cuantitativa (grep)

- `getRepository`: 34 ocurrencias · `new XxxService()`: 19 · Servicios que tocan `req/res`: **0**.
- `AppDataSource.transaction`: en `users`, `partner`, `actions`, `permissions` services.
- SQL crudo en servicios: `points.service.ts:203-210`, `users.service.ts:239-321`.
- `createError.*` usado: **1 vez** (`streak.service.ts:96`) frente a ~70 `new AppError(...)`.
- Middleware `validate`: **no existe**. Query-schemas definidos y sin uso: 3–4.
- Triada de nivel duplicada: `points` (x2), `actions`, `permissions`.
- Patrón link-de-pareja `where:[{user1Id},{user2Id}]`: 16 coincidencias en 3+ archivos (+ authMiddleware).
