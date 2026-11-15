import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['Selling', 'Buying']),
    date: z.coerce.date(),
    minutes: z.number(),
    takeaways: z.array(z.string()).default([]),
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
  }),
});

export const collections = { blog };
