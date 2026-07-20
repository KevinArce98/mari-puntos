# MariPuntos v2 — Design System (Master)

Fuente de verdad para el rediseño v2. Estilo: **minimalismo refinado** — superficies planas, un solo acento, jerarquía por espacio y peso tipográfico, motion sutil. El tono lúdico (pareja, gamificación) se expresa con color y micro-animaciones, no con gradientes ni emojis.

## 1. Color

### Light
| Token | Valor | Uso |
|---|---|---|
| `primary` | `#0F766E` (teal-700) | CTAs, tab activo, links. Contraste con blanco 5.7:1 ✓ |
| `primaryTint` | `#F0FDFA` (teal-50) | Fondos tonales (botón secundario, chips activos) |
| `love` | `#FB7185` (rose-400) | Momentos de pareja: racha, duelo, romance. Uso escaso |
| `accent` | `#D97706` (amber-600) | SOLO logros, trofeos y niveles. Nunca botones |
| `background` | `#FAFAF9` (stone-50) | Fondo de pantalla |
| `surface` | `#FFFFFF` | Cards. Siempre más claras que el fondo |
| `border` | `#E7E5E4` (stone-200) | Separación de cards (reemplaza sombras) |
| `text.primary` | `#1C1917` | |
| `text.secondary` | `#57534E` (stone-600, 7.3:1) | Reemplaza `#6B7280` |
| `text.tertiary` | `#78716C` (stone-500, 4.5:1) | Mínimo permitido. Eliminar `text.light #9CA3AF` |

### Dark (diseñado, no invertido)
| Token | Valor |
|---|---|
| `primary` | `#2DD4BF` (teal-400, desaturado sobre oscuro) |
| `primaryTint` | `#134E4A` (teal-900) |
| `accent` | `#F59E0B` (amber-500, más luminoso sobre oscuro) |
| `background` | `#0C0A09` |
| `surface` | `#1C1917` |
| `border` | `#292524` |
| `text.primary` | `#FAFAF9` · `text.secondary` `#A8A29E` |

### Reglas
- **Un solo sistema de categorías** (fusionar `category` + `actionCategory`): 5 tonos apagados de la misma saturación — chores `#0EA5E9`, romance `#FB7185`, gifts `#A78BFA`, activities `#F59E0B`, naughty `#F43F5E`.
- Cero hex hardcodeados en componentes (StreakCard `#FF6B35`/`#FFB347` → tokens `streak.active` / `streak.warm`).
- **Sin gradientes.** PointsCard y Duel pasan a superficie plana con acento tipográfico.
- Estados semánticos se mantienen (success/error/warning/info) pero siempre con icono + texto, nunca solo color.

## 2. Tipografía

Se mantiene **Plus Jakarta Sans**. Escala corregida:

| Estilo | Tamaño/Línea | Peso | Uso |
|---|---|---|---|
| `display` | 34/40 | Bold | Números de puntos (con `fontVariant: ['tabular-nums']`) |
| `h1` | 28/34 | Bold | Título de pantalla |
| `h2` | 22/28 | Bold | Sección grande |
| `h3` | 17/24 | SemiBold | Título de card (elimina el duplicado h3/h4 de 16px) |
| `body` | **16/24** | Regular | Texto base (antes 14 — bajo mínimo móvil) |
| `bodySm` | 14/20 | Regular | Texto secundario |
| `caption` | 12/16 | Medium | Metadatos. **Eliminar `small` 10px** |
| `button` | 16/24 | SemiBold | |

- Números de puntos/rachas: `tabular-nums` para evitar saltos de layout.
- Soportar Dynamic Type: no fijar alturas de contenedores de texto.

## 3. Espaciado, radios, elevación

- Spacing 4/8 se mantiene (`4 8 16 24 32 40 48 64`).
- Radius (escala del theme actual): `sm 4 · md 8 · lg 12 · xl 16 · 2xl 20 · full`. Cards siempre `xl (16)`. Botones `lg (12)` — no pill salvo chips.
- Elevación: **borde 1px por defecto**, `shadow.sm` solo para elementos flotantes (modales, FAB). Eliminar `md/lg/xl` del uso cotidiano.
- Tab bar: fondo `surface` + borde superior 1px `border`, sin sombra.

## 4. Iconografía

- Familia única: Ionicons. **Outline por defecto, filled solo para estado activo** (tabs).
- Tamaños token: `icon.sm 16 · icon.md 20 · icon.lg 24`.
- **Cero emojis como iconos estructurales** (🏆/🔒 en logros → `trophy`/`lock-closed` con contenedor tonal). Emojis solo en copy celebratorio, idealmente reemplazados por micro-animación.

## 5. Motion (Reanimated, ya instalado)

- Press: scale `0.97` + 150ms, spring al soltar. Todo tappable via `Pressable` (migrar los 30 `TouchableOpacity`).
- Entrada de listas: stagger 40ms por ítem, fade + translateY 8px.
- Carga: **skeletons con shimmer** en vez de `ActivityIndicator` (home, historial, duelo).
- Duración: micro 150–250ms, transiciones ≤400ms, exit ~70% del enter.
- Respetar `Reduce Motion` del sistema.

## 6. Componentes core (cambios v2)

| Componente | Cambio |
|---|---|
| `Button` | `secondary` deja el dorado → tonal (`primaryTint` bg + `primary` texto). Press scale. |
| `Card` | Default: blanco + borde 1px. `elevated` solo modales/sheets. |
| `PointsCard` | Sin gradiente: superficie blanca, número `display` en `text.primary`, chip pequeño "MariPuntos" en `primaryTint`, trofeo `gold` discreto. |
| `StreakCard` | Tokens de color, llama animada (Reanimated) en vez de 🔥 en texto. |
| `Duel` | Sin gradiente; barra de progreso bicolor `primary` vs `accent`, avatares grandes, fondo neutro. |
| `Input` | Validación en blur, error bajo el campo, altura ≥48. |

## 7. UX — conservar y mejorar

**Conservar (funciona bien):** tabs bloqueados con candado que redirigen a vincular pareja · pull-to-refresh · badges de pendientes · empty states con CTA · haptics en tabs · toasts (sonner).

**Mejorar:**
- Cobertura `accessibilityLabel`: hoy ~12 usos en 30+ tappables. Todo icono-botón lo necesita.
- Confirmación antes de acciones destructivas + toast con "Deshacer" al restar puntos.
- Preservar scroll/estado al volver atrás en historial y permisos.
- Saludo "Hola, {nombre}! 👋" → copy sin emoji, jerarquía con peso tipográfico.

## 8. Anti-patrones (no volver)

- Gradientes decorativos · dorado como color de acción · texto 10px · body 14px · emojis como iconos · dos sistemas de color de categorías · hex sueltos en componentes · sombras como separador por defecto · card más oscura que el fondo · dark mode por inversión de grises.
