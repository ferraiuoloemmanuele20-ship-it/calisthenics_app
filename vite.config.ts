import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/calisthenics_app/',
  plugins: [react()],
});
