import adapterVercel from '@sveltejs/adapter-vercel';
import adapterNode   from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Use Vercel adapter on Vercel, Node adapter locally
const adapter = process.env.VERCEL
  ? adapterVercel({ runtime: 'nodejs22.x' })
  : adapterNode();

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter,
    alias: { $lib: 'src/lib' }
  }
};

export default config;
