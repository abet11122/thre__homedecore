import config from './astro.config.mjs';
export default { ...config, vite: { ...config.vite, cacheDir: './.audit-vite-cache' } };
