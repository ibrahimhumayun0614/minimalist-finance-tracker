import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserSettingsEntity, ExpenseEntity } from "./entities";
import { ok, bad } from './core-utils';
import type { Expense, UserSettings } from "../shared/types";
/**
 * User routes module
 * Loaded dynamically by worker/index.ts
 */
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  console.log("[WORKER] Initializing user routes");
  // SETTINGS
  app.get('/api/settings', async (c) => {
    try {
      const settings = new UserSettingsEntity(c.env, 'default');
      const state = await settings.getState();
      return ok(c, state);
    } catch (e) {
      console.error("[WORKER] Error fetching settings:", e);
      return bad(c, 'Failed to fetch settings');
    }
  });
  app.post('/api/settings', async (c) => {
    try {
      const body = (await c.req.json()) as Partial<UserSettings>;
      const settings = new UserSettingsEntity(c.env, 'default');
      await settings.patch(body);
      const updated = await settings.getState();
      return ok(c, updated);
    } catch (e) {
      console.error("[WORKER] Error updating settings:", e);
      return bad(c, 'Failed to update settings');
    }
  });
  // EXPENSES
  app.get('/api/expenses', async (c) => {
    try {
      const cq = c.req.query('cursor');
      const lq = c.req.query('limit');
      const limit = lq ? Math.max(1, (Number(lq) | 0)) : 1000;
      const page = await ExpenseEntity.list(
        c.env,
        cq ?? null,
        limit
      );
      return ok(c, page);
    } catch (e) {
      console.error("[WORKER] Error listing expenses:", e);
      return bad(c, 'Failed to list expenses');
    }
  });
  app.post('/api/expenses', async (c) => {
    try {
      const body = (await c.req.json()) as Omit<Expense, 'id'>;
      if (typeof body.amount !== 'number' || isNaN(body.amount) || !body.category) {
        return bad(c, 'Invalid expense data: amount and category are required');
      }
      const expense = await ExpenseEntity.create(c.env, {
        ...body,
        id: crypto.randomUUID()
      });
      return ok(c, expense);
    } catch (e) {
      console.error("[WORKER] Error creating expense:", e);
      return bad(c, 'Failed to create expense');
    }
  });
  app.put('/api/expenses/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = (await c.req.json()) as Partial<Expense>;
      const entity = new ExpenseEntity(c.env, id);
      if (!(await entity.exists())) return bad(c, 'Expense not found');
      await entity.patch(body);
      const updated = await entity.getState();
      return ok(c, updated);
    } catch (e) {
      console.error("[WORKER] Error updating expense:", e);
      return bad(c, 'Failed to update expense');
    }
  });
  app.delete('/api/expenses/all', async (c) => {
    try {
      const page = await ExpenseEntity.list(c.env, null, 1000);
      const ids = page.items.map(i => i.id);
      const deletedCount = await ExpenseEntity.deleteMany(c.env, ids);
      return ok(c, { deletedCount });
    } catch (e) {
      console.error("[WORKER] Error clearing expenses:", e);
      return bad(c, 'Failed to clear expenses');
    }
  });
  app.delete('/api/expenses/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const deleted = await ExpenseEntity.delete(c.env, id);
      return ok(c, { id, deleted });
    } catch (e) {
      console.error("[WORKER] Error deleting expense:", e);
      return bad(c, 'Failed to delete expense');
    }
  });
}