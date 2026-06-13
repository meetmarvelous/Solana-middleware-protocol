import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@repo/core': path.resolve(__dirname, '../../packages/core/src'),
        '@repo/types': path.resolve(__dirname, '../../packages/types/src'),
        '@repo/router': path.resolve(__dirname, '../../packages/router/src'),
        '@repo/simulator': path.resolve(__dirname, '../../packages/simulator/src'),
        '@repo/rpc-client': path.resolve(__dirname, '../../packages/rpc-client/src'),
        '@repo/tx-builder': path.resolve(__dirname, '../../packages/tx-builder/src'),
        '@repo/fee-optimizer': path.resolve(__dirname, '../../packages/fee-optimizer/src'),
        '@repo/logger': path.resolve(__dirname, '../../packages/logger/src'),
        '@repo/retry-engine': path.resolve(__dirname, '../../packages/retry-engine/src'),
        '@repo/config': path.resolve(__dirname, '../../packages/config/src'),
        '@repo/utils': path.resolve(__dirname, '../../packages/utils/src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
