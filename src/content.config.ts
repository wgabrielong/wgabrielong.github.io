import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const publications = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    // Optional plain-text version of `title`, for titles that contain inline
    // LaTeX math ($…$). `title` is rendered with KaTeX; `titlePlain` is the
    // markup-free fallback (metadata, tooltips, accessibility).
    titlePlain: z.string().optional(),
    // Optional: preprints / in-prep work may not have a venue yet.
    venue: z.string().optional(),
    // Not rendered on the page (status pills were removed); optional so
    // software / unpublished entries can omit it rather than assert a
    // misleading "published".
    status: z.enum(['published', 'preprint', 'in prep']).optional(),
    // Author credit line for coauthored work (e.g. "with A, B, and C").
    // Omit for solo work — no byline line is rendered at all.
    byline: z.string().optional(),
    // Short, always-visible blurb (1–2 sentences). Used for software entries;
    // shown inline, unlike `abstract` which sits behind a dropdown.
    description: z.string().optional(),
    abstract: z.string().optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        }),
      )
      .default([]),
    // Link to the typeset PDF on the academic-writing site; renders as a
    // "PDF" link on the Research page.
    pdf: z.string().url().optional(),
  }),
});

const activities = defineCollection({
  // One YAML file holding an array of terms; each item carries its own `id`.
  loader: file('src/content/activities/activities.yaml'),
  schema: z.object({
    // e.g. "Fall 2026"
    term: z.string(),
    entries: z.array(
      z.object({
        dateRange: z.string(),
        title: z.string(),
        // Hosting institution or venue. Optional: some entries are virtual
        // events with no host institution.
        institution: z.string().optional(),
        // "City, ST, USA" for the US, "City, Country" otherwise, "(Virtual)"
        // for remote attendance. Optional where unconfirmed.
        location: z.string().optional(),
      }),
    ),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    // Groups notes into subsections on the page. Anything other than
    // "course" is shown under "Miscellany".
    section: z.enum(['course', 'miscellany']).optional(),
    // Optional 1–2 sentence blurb shown inline (mainly for miscellany notes),
    // like the software entry's description on the Research page.
    description: z.string().optional(),
    // Course metadata is optional so standalone primers (no course) also fit.
    courseCode: z.string().optional(),
    instructor: z.string().optional(),
    institution: z.string().optional(),
    term: z.string().optional(), // e.g. "Winter 2025/26"
    status: z.enum(['complete', 'incomplete']).optional(),
    // Full URL to the compiled PDF on the academic-writing site.
    pdf: z.string(),
  }),
});

const talks = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/talks' }),
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    date: z.string(),
    type: z.enum(['slides', 'poster', 'talk']),
    // Relative placeholder paths are allowed, so this is a plain string
    // (unlike publications `links`, which are external URLs).
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .default([]),
  }),
});

export const collections = { publications, activities, notes, talks };
