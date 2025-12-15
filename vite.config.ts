import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: parseInt(env.VITE_APP_PORT || '3000', 10),
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      minify: true,
      sourcemap: false,
      rollupOptions: {
        external: [
          '@googlemaps/js-api-loader',
          'react',
          'react-dom',
          'react-router-dom'
        ],
        output: {
          globals: {
            '@googlemaps/js-api-loader': 'GoogleMapsLoader',
            'react': 'React',
            'react-dom': 'ReactDOM',
            'react-router-dom': 'ReactRouterDOM'
          }
        }
      }
    }
  };
});