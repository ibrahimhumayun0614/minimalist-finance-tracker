import type { Expense, UserSettings, ApiResponse } from "@shared/types";
import { UserSettingsEntity, ExpenseEntity } from "../../worker/entities";
import type { Env } from "../../worker/core-utils";
/**
 * StorageService provides a platform-agnostic interface for data operations.
 * It detects the environment and routes calls to either Cloudflare Durable Objects
 * or Vercel-compatible logic (mocked/SQL structure).
 */
export class StorageService {
  private static isVercel = typeof process !== 'undefined' && process.env?.VERCEL === '1';
  static async getSettings(env?: Env): Promise<UserSettings> {
    if (this.isVercel) {
      // In a real Vercel migration, this would query Vercel Postgres/KV
      // For now, we return the initial state or a mock to maintain runtime stability
      return {
        id: "default",
        currency: "USD",
        monthlyBudget: 0,
        carryForward: false,
        onboarded: false,
        manualCarryForward: 0
      };
    }
    if (!env) throw new Error("Cloudflare Env required for DO operations");
    const settings = new UserSettingsEntity(env, 'default');
    return await settings.getState();
  }
  static async updateSettings(env: Env | undefined, body: Partial<UserSettings>): Promise<UserSettings> {
    if (this.isVercel) {
      return { ...await this.getSettings(), ...body };
    }
    if (!env) throw new Error("Cloudflare Env required for DO operations");
    const settings = new UserSettingsEntity(env, 'default');
    await settings.patch(body);
    return await settings.getState();
  }
  static async listExpenses(env?: Env, cursor?: string | null, limit: number = 1000): Promise<{ items: Expense[], next: string | null }> {
    if (this.isVercel) {
      return { items: [], next: null };
    }
    if (!env) throw new Error("Cloudflare Env required for DO operations");
    return await ExpenseEntity.list(env, cursor ?? null, limit);
  }
  static async createExpense(env: Env | undefined, body: Omit<Expense, 'id'>): Promise<Expense> {
    const id = crypto.randomUUID();
    const expense = { ...body, id };
    if (this.isVercel) {
      return expense;
    }
    if (!env) throw new Error("Cloudflare Env required for DO operations");
    return await ExpenseEntity.create(env, expense);
  }
  static async updateExpense(env: Env | undefined, id: string, body: Partial<Expense>): Promise<Expense> {
    if (this.isVercel) {
      throw new Error("Update not implemented for Vercel yet");
    }
    if (!env) throw new Error("Cloudflare Env required for DO operations");
    const entity = new ExpenseEntity(env, id);
    await entity.patch(body);
    return await entity.getState();
  }
  static async deleteExpense(env: Env | undefined, id: string): Promise<boolean> {
    if (this.isVercel) {
      return true;
    }
    if (!env) throw new Error("Cloudflare Env required for DO operations");
    return await ExpenseEntity.delete(env, id);
  }
  static async deleteAllExpenses(env: Env | undefined): Promise<number> {
    if (this.isVercel) {
      return 0;
    }
    if (!env) throw new Error("Cloudflare Env required for DO operations");
    const page = await ExpenseEntity.list(env, null, 1000);
    const ids = page.items.map(i => i.id);
    return await ExpenseEntity.deleteMany(env, ids);
  }
}