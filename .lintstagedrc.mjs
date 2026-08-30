const app = 'mari-puntos-app';
const backend = 'mari-puntos-backend';
const website = 'mari-puntos-website';

const eslintFix = (dir) => (files) =>
  `pnpm -C ${dir} exec eslint --fix ${files.join(' ')}`;
const prettierWrite = (dir) => (files) =>
  `pnpm -C ${dir} exec prettier --write ${files.join(' ')}`;

export default {
  [`${app}/**/*.{js,jsx,ts,tsx}`]: (files) => [
    eslintFix(app)(files),
    prettierWrite(app)(files),
  ],
  [`${app}/**/*.{json,md}`]: prettierWrite(app),

  [`${backend}/src/**/*.ts`]: (files) => [
    eslintFix(backend)(files),
    prettierWrite(backend)(files),
  ],
  [`${backend}/**/*.{json,md}`]: prettierWrite(backend),

  [`${website}/**/*.{ts,tsx,js,jsx,astro,css,json,md,mdx}`]: prettierWrite(website),
};
