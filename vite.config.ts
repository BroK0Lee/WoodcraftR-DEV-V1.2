import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, Plugin } from 'vite';

/* ---------------------------------------------------------------------------
 * Mini-plugin : transforme UNIQUEMENT l’import du fichier
 * `opencascade.full.wasm` en « …wasm?url » pour que Vite le traite
 * comme un asset et expose un export *default* (string URL).
 * ------------------------------------------------------------------------- */
function ocWasmToUrl(): Plugin {
  return {
    name: 'opencascade-wasm-to-url',
    enforce: 'pre',
    resolveId(source) {
      // Cible le WASM d’OpenCascade et évite toute double transformation.
      if (source.endsWith('opencascade.full.wasm') && !source.includes('?url')) {
        return `${source}?url`;
      }
    },
  };
}

// ---------------------------------------------------------------------------
//  Config Vite
// ---------------------------------------------------------------------------
export default defineConfig({
  plugins: [
    ocWasmToUrl(), // 👈 doit précéder react()
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  /* -----------------------------------------------------------------------
   *  Les deux règles 'external: ["a"]' suppriment l’avertissement initial
   *  (« Could not resolve "a" ») provoqué par les imports internes du WASM.
   * --------------------------------------------------------------------- */
  build: {
    target: 'es2022',
    rollupOptions: { external: ['a'] },
  },
  optimizeDeps: {
    esbuildOptions: { external: ['a'] },
  },

  worker: { format: 'es' },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
