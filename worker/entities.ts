import { IndexedEntity, Entity } from "./core-utils";
import type { Expense, UserSettings } from "@shared/types";
export class UserSettingsEntity extends Entity<UserSettings> {
  static readonly entityName = "user-settings";
  static readonly initialState: UserSettings = {
    id: "default",
    currency: "INR",
    monthlyBudget: 0,
    carryForward: false,
    onboarded: false
  };
}
export class ExpenseEntity extends IndexedEntity<Expense> {
  static readonly entityName = "expense";
  static readonly indexName = "expenses";
  static readonly initialState: Expense = {
    id: "",
    amount: 0,
    category: "Food",
    description: "",
    date: "",
    currency: "INR"
  };
  protected override async ensureState(): Promise<Expense> {
    const s = await super.ensureState();
    if (!s.date) {
      s.date = new Date().toISOString();
    }
    return s;
  }
}
