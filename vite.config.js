import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Injects <meta name="robots" content="noindex, nofollow"> into index.html
 * only when the build is a demo build. Because this runs at build time, the tag
 * is physically absent from production HTML — nothing to clean up on promotion.
 */
function demoNoindex(isDemo) {
  return {
    name: 'pp-demo-noindex',
    transformIndexHtml(html) {
      if (!isDemo) return html;
      return html.replace(
        '<!-- @robots -->',
        '<meta name="robots" content="noindex, nofollow" />'
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDemo = env.VITE_DEMO_MODE === 'true';

  return {
    plugins: [react(), demoNoindex(isDemo)],
    define: {
      __BUILD_SHA__: JSON.stringify(
        (process.env.VERCEL_GIT_COMMIT_SHA || 'dev').slice(0, 7)
      ),
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
});
