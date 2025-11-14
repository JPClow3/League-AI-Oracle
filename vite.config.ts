import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif,jpg,jpeg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/ddragon\.leagueoflegends\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'lol-images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-static',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 365 * 24 * 60 * 60,
                },
              },
            },
            // Cache API responses
            {
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 5 * 60, // 5 minutes
                },
                networkTimeoutSeconds: 10,
              },
            },
          ],
          // Increase maximum cache size
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        },
        manifest: {
          name: 'League AI Oracle',
          short_name: 'AI Oracle',
          description: 'Master League of Legends draft phase with AI-powered analysis',
          theme_color: '#1a1a2e',
          background_color: '#0f0f1e',
          display: 'standalone',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    // ✅ SECURITY: API keys should NEVER be in client-side code
    // API key is only accessible in backend /api functions via process.env.GEMINI_API_KEY
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // Ensure base path is root for Vercel deployment
    base: '/',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
            'framer-motion': ['framer-motion'],
            'ui-vendor': ['react-hot-toast', 'lucide-react'],

            // Feature chunks
            'draft-lab': [
              './components/DraftLab/DraftLab',
              './components/DraftLab/ChampionGrid',
              './components/DraftLab/TeamPanel',
              './components/DraftLab/AdvicePanel',
            ],
            arena: ['./components/Arena/LiveArena'],
            playbook: ['./components/Playbook/Playbook'],
            academy: ['./components/Academy/Academy'],

            // AI/Services (client-side only, no SDK)
            'ai-services': ['./services/geminiService'],

            // Data
            'champion-data': ['./contexts/ChampionContext', './data/championRoles'],
          },
        },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          dead_code: true,
          unused: true,
        },
        mangle: {
          safari10: true,
        },
      },
      // Optimize CSS
      cssCodeSplit: true,
      cssMinify: true,
      // Improve module preload
      modulePreload: {
        polyfill: false,
      },
      // Report compressed size
      reportCompressedSize: true,
      // Optimize chunks
      assetsInlineLimit: 4096, // Inline assets < 4kb
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime'],
      exclude: ['@google/genai'],
    },
  };
});
