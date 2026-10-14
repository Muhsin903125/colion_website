import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

const SITE = 'https://www.colioninternational.com';

/**
 * Server-rendered, ISR-cached — the LOPAZ model.
 *
 * Every page renders from the CMS store at request time and Vercel caches the
 * result at the edge. A visitor almost always gets a cached file, so the
 * served experience is as fast as static; Publish purges the cache for the
 * changed paths and the next request re-renders. Live in seconds, no rebuild.
 */
export default defineConfig({
  // Every canonical, OG image and sitemap URL is built from this.
  site: SITE,
  trailingSlash: 'ignore',

  integrations: [tailwind()],

  build: { inlineStylesheets: 'auto' },

  output: 'server',

  adapter: vercel({
    // Publish revalidates ~100 paths; give the function room.
    maxDuration: 60,
    isr: {
      expiration: false,
      bypassToken: process.env.CMS_REVALIDATE_TOKEN,
      /**
       * The CMS must never be cached. Both slash forms are listed because
       * `vercel.json` sets `trailingSlash: true`; `scripts/fix-isr-routes.mjs`
       * patches the generated route table after the build and verifies it.
       */
      exclude: [
        '/admin', '/admin/',
        '/preview', '/preview/',
        '/api/session', '/api/session/',
        '/api/content', '/api/content/',
        '/api/config', '/api/config/',
        '/api/media', '/api/media/',
        '/api/cloudinary', '/api/cloudinary/',
        '/api/publish', '/api/publish/',
      ],
    },
  }),
});
