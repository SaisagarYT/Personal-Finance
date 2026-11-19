import { httpServerHandler } from 'cloudflare:node';
import app from './app.js';

const WORKER_PORT = 3000;
app.listen(WORKER_PORT);

const workerBridge = httpServerHandler({ port: WORKER_PORT });

export default {
  async fetch(request, env, ctx) {
    // Populate process.env with Worker secrets & env bindings
    if (env) {
      if (env.SUPABASE_URL) process.env.SUPABASE_URL = env.SUPABASE_URL;
      if (env.SUPABASE_ANON_KEY) process.env.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
      if (env.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
    }

    if (typeof workerBridge === 'function') {
      return workerBridge(request, env, ctx);
    }
    if (workerBridge && typeof workerBridge.fetch === 'function') {
      return workerBridge.fetch(request, env, ctx);
    }
    return new Response('Worker Bridge Misconfigured', { status: 500 });
  },
};
