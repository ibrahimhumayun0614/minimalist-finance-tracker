import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserSettingsEntity, ExpenseEntity } from "./entities";
import { ok, bad } from './core-utils';
import type { Expense, UserSettings } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // SETTINGS
  app.get('/api/settings', async (c) => {
    try {
      const settings = new UserSettingsEntity(c.env, 'default');
      const state = await settings.getState();
      return ok(c, state);
    } catch (e) {
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
      return bad(c, 'Failed to update settings');
    }
  });
  // EXPENSES
  app.get('/api/expenses', async (c) => {
    try {
      const cq = c.req.query('cursor');
      const lq = c.req.query('limit');
      const page = await ExpenseEntity.list(
        c.env,
        cq ?? null,
        lq ? Math.max(1, (Number(lq) | 0)) : 100
      );
      return ok(c, page);
    } catch (e) {
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
      return bad(c, 'Failed to update expense');
    }
  });
  app.delete('/api/expenses/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const deleted = await ExpenseEntity.delete(c.env, id);
      return ok(c, { id, deleted });
    } catch (e) {
      return bad(c, 'Failed to delete expense');
    }
  });
}