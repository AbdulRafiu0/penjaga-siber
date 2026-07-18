import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

const app = new Hono<{ Bindings: { aegis_db: D1Database } }>();

app.get('/', async (c) => {
  try {
    const { results } = await c.env.aegis_db
      .prepare("SELECT * FROM contact_messages ORDER BY created_at DESC")
      .all();
    return c.json({ success: true, messages: results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export const onRequest = handle(app);