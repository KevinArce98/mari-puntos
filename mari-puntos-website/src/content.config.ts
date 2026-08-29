import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';

const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
});

export const collections = { legal };
