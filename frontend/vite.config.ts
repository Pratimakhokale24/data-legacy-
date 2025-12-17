import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiPort = Number(env.VITE_API_PORT || '5001');
  return {
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.USE_AI': JSON.stringify(env.USE_AI ?? 'false')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        proxy: {
          '/api': {
            target: `http://localhost:${apiPort}`,
            changeOrigin: true,
            secure: false
          }
        }
      }
    };
});
