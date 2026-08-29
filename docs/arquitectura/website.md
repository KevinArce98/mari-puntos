# Revisión de arquitectura — mari-puntos-website

Alcance: solo `/Users/kevinarias/Projects/mari-puntos/mari-puntos-website`. Sitio de marketing + páginas legales (Astro 7 SSR + islas React 19 + Tailwind 4). ~2.512 LOC de código fuente.

---

## 1. Resumen ejecutivo

El sitio está **notablemente bien construido para su tamaño**. La base es sólida: i18n tipado y centralizado, patrón de islas usado con disciplina (solo 2 componentes React, ambos justificados), capas limpias sin dependencias circulares, y un endpoint de beta con validación, honeypot, rate limiting y escape de HTML — mejor de lo que se ve en la mayoría de landings.

Los problemas son de **mantenibilidad, no de corrección**, y se concentran en dos focos:

1. **`LandingPage.astro` (588 LOC)** es un monolito que mezcla estructura de 10 secciones, datos (paths SVG, tarjetas) y markup repetido (botones de tienda, marco de teléfono). Es legible pero difícil de navegar y de modificar sección por sección.
2. **Duplicación ES/EN en las páginas legales**: el cuerpo de `privacidad`/`terminos` está escrito dos veces en HTML (una por idioma), ~823 LOC de los cuales la mitad es contenido duplicado que hay que sincronizar a mano. Es el mayor riesgo de mantenimiento del sitio: cambiar una cláusula obliga a editar dos archivos sin garantía de que queden iguales.

Además hay un patrón transversal de **valores mágicos**: el color de marca `#0F766E` está repetido a mano ~40 veces en vez de existir como token de Tailwind, y las URLs de las tiendas están hardcodeadas en dos sitios.

Nada de esto es urgente ni bloquea. Con ~2-3 días de trabajo enfocado el sitio quedaría considerablemente más fácil de mantener sin reescribir nada.

**Impacto arquitectónico global: Bajo-Medio.** No hay deuda estructural grave; hay deuda de organización y de duplicación.

---

## 2. Lo que ya está bien (no tocar)

- **Patrón de islas correcto.** Solo `FaqAccordion.tsx` y `BetaSignupForm.tsx` se hidratan (`client:load`, `LandingPage.astro:489,503`). Ambos necesitan interactividad real. El resto es Astro estático. Cero sobre-uso de React.
- **i18n tipado y centralizado** (`i18n/ui.ts`). Diccionario `as const`, `useTranslations` devuelve un `t` con claves tipadas (`keyof`), fallback a `defaultLang`. Helpers `getLangFromUrl` y `localizePath` limpios. Para el tamaño del sitio es el enfoque correcto.
- **Capas y dependencias limpias.** Pages → Layout/componentes → i18n. `i18n/ui.ts` no depende de nada. Sin ciclos. La API importa i18n solo para mensajes localizados.
- **`beta-signup.ts` es el archivo más maduro del repo**: validación de email (regex + tope 254), honeypot anti-bot (`company`), rate limiting con limpieza de memoria, escape de HTML del email en el cuerpo, credenciales SMTP desde `env`, errores logueados en servidor y respuesta genérica al cliente (no filtra internals).
- **`LanguageSwitcher.astro` es accesible de referencia**: `role="group"`, `aria-label`, `aria-current="page"`, `hreflang`, `focus-visible` con outline.
- **SEO/i18n en `Layout.astro`**: `hreflang` alternates (es/en/x-default), Open Graph, Twitter card, `og:locale` por idioma. Bien resuelto.
- **`PhoneMockup.astro` ya existe** como componente reutilizable (aunque no se reutiliza en todos lados — ver hallazgos).

---

## 3. Hallazgos priorizados

### 🔴 ALTO

#### A1. Duplicación total del contenido legal ES/EN
**Archivos:** `pages/privacidad.astro` (193), `pages/en/privacidad.astro` (195), `pages/terminos.astro` (217), `pages/en/terminos.astro` (218).

**Qué pasa:** el cuerpo completo de cada documento legal está escrito como HTML literal, una vez en español y otra en inglés. Comparando `privacidad.astro:24-193` con `en/privacidad.astro:24-195`, la **estructura es idéntica** (mismas 12 secciones, mismas clases Tailwind, mismos `<ul>`); solo cambia el texto. Es la definición de "dos copias del mismo contenido".

**Por qué importa:** cualquier cambio legal (una cláusula de retención, un proveedor nuevo, una fecha) exige editar dos archivos y mantenerlos sincronizados manualmente. La probabilidad de que ES e EN se desincronicen crece con el tiempo. Viola DRY en el activo más sensible a errores del sitio (texto legal). Además es **inconsistente**: el `metaTitle`/`title`/`updated` sí vienen de i18n (`i18n/ui.ts:173-182`), pero el cuerpo no — dos fuentes de verdad para el mismo documento.

**Refactor concreto:** mover el contenido a **Astro Content Collections** con MDX, una entrada por documento e idioma (`src/content/legal/privacy.es.mdx`, `privacy.en.mdx`, `terms.es.mdx`, `terms.en.mdx`), y renderizar con una sola página dinámica (`pages/[...slug].astro` o `pages/privacidad.astro` + `en/privacidad.astro` que solo hacen `getEntry(locale)` y pasan `<Content />` a `LegalLayout`). El contenido queda separado de la plantilla; se sigue teniendo un archivo por idioma pero ahora es **solo prosa**, no markup, y el layout es único. Elimina ~400 LOC de HTML repetido.
**Esfuerzo: M.**

---

### 🟡 MEDIO

#### A2. `LandingPage.astro` monolítico (588 LOC)
**Archivo:** `components/LandingPage.astro`.

**Qué pasa:** un solo componente contiene nav, hero, "diferente", "acciones", "permisos", "cómo funciona", CTA de descarga, FAQ, newsletter y footer. Además define inline 6 arrays de datos con **paths SVG hardcodeados** (`LandingPage.astro:21-128`) mezclados con el frontmatter.

**Por qué importa:** viola Responsabilidad Única a nivel de archivo. Para tocar el Hero hay que hacer scroll entre 10 secciones. Los iconos SVG (datos de presentación) están incrustados en la lógica del componente. No hay bug, pero cada cambio es más caro de lo necesario y el diff de git es ruidoso.

**Refactor concreto:** trocear en componentes de sección bajo `components/sections/`: `Navbar.astro`, `Hero.astro`, `WhyDifferent.astro`, `ActionsSection.astro`, `PermissionsSection.astro`, `HowItWorks.astro`, `DownloadCta.astro`, `FaqSection.astro`, `NewsletterSection.astro`, `SiteFooter.astro`. `LandingPage.astro` queda como composición de ~15 líneas. Los paths SVG que se repiten pueden vivir en un `components/icons/` o en un `lib/icons.ts`. **Nota de proporción:** no hace falta un design system; basta con extraer secciones para que cada archivo quepa en una pantalla.
**Esfuerzo: M.**

#### A3. Color de marca como valor mágico (~40 repeticiones)
**Archivos:** `#0F766E` aparece 23× en `LandingPage.astro`, 9× en `AppShowcase.astro`, y en 8 archivos más; `#115E59` acompaña. `global.css:6-7` define `--primary`/`--primary-dark` pero **no están conectados al sistema de tokens de Tailwind**: `@theme inline` (`global.css:10-13`) solo expone `--color-background` y `--color-foreground`, no `--color-primary`.

**Por qué importa:** cambiar el color de marca hoy es un find-replace en 10 archivos y arbitrario `text-[#0F766E]` por todos lados. No hay una única fuente de verdad para el token más usado del sitio.

**Refactor concreto:** añadir a `@theme` en `global.css`:
```css
@theme inline {
  --color-primary: #0F766E;
  --color-primary-dark: #115E59;
}
```
y reemplazar `text-[#0F766E]` → `text-primary`, `bg-[#0F766E]` → `bg-primary`, `hover:bg-[#115E59]` → `hover:bg-primary-dark`. Es el refactor de mayor apalancamiento sobre estilos: convierte 40 valores mágicos en un token. Se puede hacer con find-replace guiado.
**Esfuerzo: S.**

#### A4. Accesibilidad del acordeón y del formulario
**Archivos:** `FaqAccordion.tsx`, `BetaSignupForm.tsx`.

**Qué pasa:**
- `FaqAccordion.tsx:24-35`: el `<button>` que abre/cierra no expone `aria-expanded` ni `aria-controls`, y el panel (`:36-40`) no tiene `id`. Un lector de pantalla no anuncia si la pregunta está expandida.
- `BetaSignupForm.tsx:45-52`: el `<input type="email">` solo tiene `placeholder`, sin `<label>` visible ni `aria-label`. Los bloques de éxito/error (`:62-72`) no tienen `aria-live`/`role="status"`, así que el resultado del envío no se anuncia.

**Por qué importa:** accesibilidad básica incompleta; afecta a usuarios de teclado/lector. Es barato de arreglar.

**Refactor concreto:** en el acordeón, añadir `aria-expanded={open === i}`, `aria-controls={`faq-panel-${i}`}` en el botón e `id` en el panel. En el formulario, añadir `aria-label={dict['form.emailPlaceholder']}` (o una `<label>` sr-only) al input y `role="status" aria-live="polite"` al contenedor de mensajes.
**Esfuerzo: S.**

#### A5. Markup repetido: botones de tienda y marco de teléfono
**Archivos:** `LandingPage.astro`, `AppShowcase.astro`, `PhoneMockup.astro`.

**Qué pasa:**
- El bloque de botón App Store / Google Play está copiado ~7 veces (nav, hero, CTA descarga, footer, AppShowcase), cada uno con su markup completo.
- El marco de teléfono (capas `rounded-[3rem]` anidadas) existe como `PhoneMockup.astro`, pero **el hero lo reimplementa inline** (`LandingPage.astro:224-237`) y `AppShowcase.astro` lo reimplementa 3 veces (`:82-90, 102-110, 135-143`) en vez de reutilizar el componente.

**Por qué importa:** DRY. Un cambio de estilo en los botones o en el marco obliga a editar muchos sitios. El componente reutilizable ya existe pero se ignora.

**Refactor concreto:** crear `StoreButtons.astro` (con variantes `size`/`theme` vía props) y usarlo en los ~7 puntos. Reutilizar `PhoneMockup.astro` en hero y en las 3 instancias de AppShowcase (parametrizando ancho/rotación por props). 
**Esfuerzo: M.**

---

### 🟢 BAJO

#### A6. Rate limiting en memoria no es fiable en serverless
**Archivo:** `pages/api/beta-signup.ts:14-37`.

**Qué pasa:** `requestLog` es un `Map` en memoria del proceso. En Vercel (adapter `@astrojs/vercel`, `output: 'server'`) cada instancia de lambda tiene su propio `Map` y los cold starts lo reinician, así que el límite de 3/10min es **best-effort** y se evade con facilidad.

**Por qué importa:** la protección anti-abuso es más débil de lo que el código sugiere. Para un beta de bajo tráfico es aceptable (el honeypot ya filtra bots básicos), pero conviene documentarlo y no confiar en ello.

**Refactor concreto:** si el spam llega a ser un problema, mover el contador a un store compartido (Vercel KV / Upstash Redis) o añadir Cloudflare Turnstile. Por ahora: dejar un comentario/nota de que el límite es por-instancia. No urgente.
**Esfuerzo: M** (solo si se decide endurecer; S para documentarlo).

#### A7. `keywords` hardcodeados fuera de i18n
**Archivos:** `pages/index.astro:15-24`, `pages/en/index.astro:15-24`.

**Qué pasa:** los arrays de `keywords` SEO están escritos en cada página (español en una, inglés en otra) en vez de en `i18n/ui.ts`. Inconsistente con el resto de metadatos, que sí vienen de i18n.

**Refactor concreto:** mover a claves `meta.keywords` en `ui.ts` (o aceptarlo como excepción menor). 
**Esfuerzo: S.**

#### A8. Estructura interna del handler de la API
**Archivo:** `pages/api/beta-signup.ts:61-147`.

**Qué pasa:** el `POST` hace parsing + validación + rate-limit + construcción de una plantilla HTML de ~35 líneas inline (`:104-139`) + envío. El `transporter` se recrea en cada request (`:92-98`).

**Por qué importa:** Responsabilidad Única a nivel de función. A 147 LOC es tolerable, pero extraer la plantilla y el transporter mejora legibilidad y evita reconstruir el transporter por request.

**Refactor concreto:** extraer `buildSignupEmailHtml(email, date)` y crear el `transporter` una vez a nivel de módulo. Opcional para este tamaño.
**Esfuerzo: S.**

#### A9. Detalles menores
- **`AppShowcase.astro:131`**: `"María vs Kevin"` hardcodeado (nombres personales), único texto del showcase que no pasa por i18n. Mover a `ui.ts` o parametrizar.
- **`global.css:16-21`**: el `@media (prefers-color-scheme: dark)` asigna los mismos valores que el modo claro → efectivamente código muerto. Eliminar o implementar dark mode de verdad.
- **URLs de tienda duplicadas**: `APP_STORE_URL`/`PLAY_STORE_URL` como consts en `LandingPage.astro:17-19` pero inline en `AppShowcase.astro:163,177`. Centralizar en `src/consts.ts`.
- **`global.css:145-230`**: reimplementación manual de `.prose` (~85 líneas) que replica `@tailwindcss/typography`. Funciona y es ligero; se podría usar el plugin oficial, pero no es prioritario.
**Esfuerzo: S** (todos juntos).

---

## 4. Quick wins (alto valor / bajo esfuerzo, orden sugerido)

1. **Token de color primario** (A3) — conecta `--color-primary` en `@theme` y reemplaza; elimina el valor mágico más repetido. **S**
2. **Accesibilidad** (A4) — `aria-expanded`/`aria-controls` en FAQ, `aria-label` + `aria-live` en el formulario. **S**
3. **Centralizar constantes** (A9) — `src/consts.ts` con URLs de tienda y email de contacto; borrar el `@media` dark muerto. **S**
4. **`keywords` a i18n** (A7). **S**

Los cuatro juntos son ~medio día y limpian la mayoría de los valores mágicos y los huecos de a11y.

---

## 5. Plan de refactor por fases

**Fase 0 — Quick wins (½ día).** A3, A4, A7, A9. Sin cambios estructurales; ganancia inmediata en consistencia y accesibilidad.

**Fase 1 — De-duplicar contenido legal (1 día).** A1. Migrar `privacidad`/`terminos` (ES+EN) a Content Collections MDX + `LegalLayout` único. Es el cambio de mayor impacto en mantenibilidad; hacerlo aislado y probar ambas rutas.

**Fase 2 — Trocear la landing (1 día).** A2 + A5. Extraer secciones de `LandingPage.astro` a `components/sections/`, crear `StoreButtons.astro` y reutilizar `PhoneMockup.astro`. Se puede hacer sección por sección de forma incremental y segura.

**Fase 3 — Endurecer la API (opcional, según tráfico).** A6 (rate limit compartido / Turnstile) + A8 (extraer plantilla y transporter). Solo si aparece spam real.

**Coste total estimado: ~2,5-3 días.** Ninguna fase depende de reescrituras; todas son incrementales y verificables por separado. Proporción adecuada a un sitio pequeño: el objetivo es reducir duplicación y valores mágicos, no introducir abstracción de más.

---

## 6. Implicaciones a largo plazo

- **Con los cambios:** añadir un idioma nuevo pasa de "copiar 4 archivos HTML y traducir a mano" a "añadir entradas en `ui.ts` + colecciones legales". Cambiar la marca visual es editar un token. Modificar una sección de la landing es abrir un archivo de una pantalla.
- **Sin los cambios:** la duplicación legal ES/EN se desincronizará con el tiempo (riesgo de conflicto legal/regulatorio por textos divergentes), y `LandingPage.astro` seguirá creciendo hacia territorio inmanejable a medida que se añadan secciones.
- El **riesgo de mantener el status quo es bajo hoy** (sitio pequeño, un mantenedor) pero **crece de forma no lineal** con cada idioma y cada sección nueva. La Fase 1 es la que más conviene no posponer.
