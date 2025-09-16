// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src', // يمكنك استخدام import '@/components/Button'
    },
  },
  server: {
    port: parseInt(process.env.PORT || '3000'), // يستخدم PORT من Railway، وإلا 3000
    // open: false, // اختياري: تعطيل الفتح التلقائي للمتصفح
  },
  build: {
    outDir: 'dist', // مكان حفظ الملفات بعد البناء
    sourcemap: false, // تقليل الحجم في الإنتاج
  },
});
