import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://wgabrielong.github.io',
  // Astro 7 changed the default to 'jsx', which strips whitespace using JSX
  // rules: a line break between text and an inline element is dropped rather
  // than collapsed to a space. That silently glues words to the following
  // <strong> (e.g. "My full name isWern Juin Gabriel Ong" on the About page).
  // `true` keeps Astro 5's HTML-aware compression, so prose wraps in source
  // without needing {' '} guards. See the v7 upgrade guide, "Whitespace".
  compressHTML: true,
  integrations: [sitemap()],
  markdown: {
    // Astro 7 defaults to the Sätteri Markdown processor, which does not run
    // remark/rehype plugins. `unified()` opts back into the remark/rehype
    // pipeline so remark-math + rehype-katex keep working in `.md` files.
    // (Page-level math does not depend on this — it goes through
    // `src/utils/math.ts`, which calls KaTeX directly.)
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
