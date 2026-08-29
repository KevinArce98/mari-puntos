# Fonts

The app's typography (`theme/typography.ts`) references four Plus Jakarta Sans
weights by family name. These are embedded at build time via the `expo-font`
config plugin declared in `app.json`.

## Required files (drop them in this folder, exact names)

| File                           | Weight | Family name used in theme  |
| ------------------------------ | ------ | -------------------------- |
| `PlusJakartaSans-Regular.ttf`  | 400    | `PlusJakartaSans-Regular`  |
| `PlusJakartaSans-Medium.ttf`   | 500    | `PlusJakartaSans-Medium`   |
| `PlusJakartaSans-SemiBold.ttf` | 600    | `PlusJakartaSans-SemiBold` |
| `PlusJakartaSans-Bold.ttf`     | 700    | `PlusJakartaSans-Bold`     |

The `expo-font` config plugin derives the font family name from the file name
(without extension), so the names above must match exactly.

## Where to get them

Plus Jakarta Sans is licensed under the SIL Open Font License. Download the
static weights from:

- Google Fonts: https://fonts.google.com/specimen/Plus+Jakarta+Sans
  (Download family → use the static `.ttf` files under `static/`)
- or fontsource: https://www.npmjs.com/package/@fontsource/plus-jakarta-sans

Only the four weights above are needed. Do not commit the variable font here;
the config plugin expects the four static files.

## After adding the files

No code changes are needed — the config plugin embeds the fonts natively at
launch, so `useFonts` / splash gating is not required. Rebuild the native app
(`npx expo prebuild` then a dev client / EAS build; a JS-only reload is not
enough because fonts are embedded at the native layer).
