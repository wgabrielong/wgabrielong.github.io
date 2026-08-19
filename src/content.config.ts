import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { publicationSchema, activitiesSchema, noteSchema, talkSchema } from './content/schemas.mjs';

const publications = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/publications' }),
  schema: publicationSchema,
});

const activities = defineCollection({
  // One YAML file holding an array of terms; each item carries its own `id`.
  loader: file('src/content/activities/activities.yaml'),
  schema: activitiesSchema,
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/notes' }),
  schema: noteSchema,
});

const talks = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/talks' }),
  schema: talkSchema,
});

export const collections = { publications, activities, notes, talks };
