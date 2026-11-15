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

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    builder: z.string(),
    city: z.string(),
    area: z.string().optional(), // neighbourhood or intersection
    homeTypes: z.array(z.enum(['Condo', 'Townhouse', 'Semi-detached', 'Detached'])),
    status: z.enum(['Coming soon', 'Now selling', 'Under construction']),
    priceFrom: z.string().optional(), // e.g. "$525,400"
    occupancy: z.string().optional(), // e.g. "2029" or "Select homes ready now"
    deposit: z.string().optional(),
    summary: z.string(),
    highlights: z.array(z.string()).default([]),
    image: z.string().optional(), // main picture: a web address or a file in /public
    photos: z.array(z.string()).default([]),
    sitePlan: z.string().optional(),
    models: z
      .array(
        z.object({
          name: z.string(),
          kind: z.enum(['Condo', 'Townhouse', 'Semi-detached', 'Detached']),
          beds: z.string().optional(),
          baths: z.string().optional(),
          size: z.string().optional(),
          price: z.string().optional(),
          note: z.string().optional(),
          image: z.string().optional(),
          plans: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    imageCredit: z.string().optional(),
    updated: z.coerce.date(),
    // true = hidden from the live site
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, projects };
