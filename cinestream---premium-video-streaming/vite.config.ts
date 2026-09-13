import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    /**
     * base '/' rakha gaya hai kyunki site InfinityFree ke htdocs/ ROOT par
     * deploy hogi aur BrowserRouter deep routes (/watch/abc) use karta hai.
     * Agar kabhi subfolder me daalna ho (example.com/cinestream/), to yaha
     * '/cinestream/' karo AUR .htaccess me RewriteBase bhi wahi karo.
     */
    base: '/',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    build: {
      outDir: 'dist',
      // InfinityFree par har file upload karni padti hai — sourcemaps bhaari
      // hote hain aur production me chahiye bhi nahi.
      sourcemap: false,
      target: 'es2020',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          /**
           * Vendor code alag chunks me — inka hash tab tak nahi badalta jab tak
           * library update na ho, isliye repeat visits par mobile users ko
           * sirf app code dobara download karna padta hai.
           */
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'motion-vendor': ['motion'],
            'icons-vendor': ['lucide-react'],
          },
        },
      },
    },

    server: {
      port: 3000,
      host: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },

    preview: {
      port: 4173,
      host: true,
    },
  };
});
