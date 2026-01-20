import { Hono } from "hono";
import type { Env } from './core-utils';
import { StorageService } from '../src/lib/storage-service';
import { ok, bad } from './core-utils';
import type { Expense, UserSettings } from "../shared/types";
let initialized = false;
export const userRoutes = (app: Hono<{ Bindings: Env }>) => {
  if (initialized) {
    return;
  }
  // SETTINGS API
  app.get('/api/settings', async (c) => {
    try {
      const state = await StorageService.getSettings(c.env);
      return ok(c, state);
    } catch (e) {
      return bad(c, 'Failed to fetch settings');
    }
  });
  app.post('/api/settings', async (c) => {
    try {
      const body = (await c.req.json()) as Partial<UserSettings>;
      const updated = await StorageService.updateSettings(c.env, body);
      return ok(c, updated);
    } catch (e) {
      return bad(c, 'Failed to update settings');
    }
  });
  // EXPENSES API
  app.get('/api/expenses', async (c) => {
    try {
      const cursor = c.req.query('cursor');
      const limit = Number(c.req.query('limit')) || 1000;
      const page = await StorageService.listExpenses(c.env, cursor, limit);
      return ok(c, page);
    } catch (e) {
      return bad(c, 'Failed to list expenses');
    }
  });
  app.post('/api/expenses', async (c) => {
    try {
      const body = (await c.req.json()) as Omit<Expense, 'id'>;
      const expense = await StorageService.createExpense(c.env, body);
      return ok(c, expense);
    } catch (e) {
      return bad(c, 'Failed to create expense record');
    }
  });
  app.put('/api/expenses/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = (await c.req.json()) as Partial<Expense>;
      const updated = await StorageService.updateExpense(c.env, id, body);
      return ok(c, updated);
    } catch (e) {
      return bad(c, 'Failed to update record');
    }
  });
  app.delete('/api/expenses/all', async (c) => {
    try {
      const deletedCount = await StorageService.deleteAllExpenses(c.env);
      return ok(c, { deletedCount });
    } catch (e) {
      return bad(c, 'Failed to wipe transaction history');
    }
  });
  app.delete('/api/expenses/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const deleted = await StorageService.deleteExpense(c.env, id);
      return ok(c, { id, deleted });
    } catch (e) {
      return bad(c, 'Failed to delete expense record');
    }
  });
  initialized = true;
};