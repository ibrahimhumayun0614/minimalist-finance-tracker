import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserSettingsEntity, ExpenseEntity } from "./entities";
import { ok, bad, isStr } from './core-utils';
import type { Expense, UserSettings } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // SETTINGS
  app.get('/api/settings', async (c) => {
    const settings = new UserSettingsEntity(c.env, 'default');
    return ok(c, await settings.getState());
  });
  app.post('/api/settings', async (c) => {
    const body = (await c.req.json()) as Partial<UserSettings>;
    const settings = new UserSettingsEntity(c.env, 'default');
    await settings.patch(body);
    return ok(c, await settings.getState());
  });
  // EXPENSES
  app.get('/api/expenses', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ExpenseEntity.list(
      c.env,
      cq ?? null,
      lq ? Math.max(1, (Number(lq) | 0)) : 100
    );
    return ok(c, page);
  });
  app.post('/api/expenses', async (c) => {
    const body = (await c.req.json()) as Omit<Expense, 'id'>;
    if (!body.amount || !body.category) return bad(c, 'Invalid expense data');
    const expense = await ExpenseEntity.create(c.env, {
      ...body,
      id: crypto.randomUUID()
    });
    return ok(c, expense);
  });
  app.put('/api/expenses/:id', async (c) => {
    const id = c.req.param('id');
    const body = (await c.req.json()) as Partial<Expense>;
    const entity = new ExpenseEntity(c.env, id);
    if (!(await entity.exists())) return bad(c, 'Expense not found');
    await entity.patch(body);
    const updated = await entity.getState();
    return ok(c, updated);
  });
  app.delete('/api/expenses/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await ExpenseEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
}