import { IndexedEntity, Entity } from "./core-utils";
import type { User, Chat, ChatMessage, Expense, UserSettings } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
export class UserSettingsEntity extends Entity<UserSettings> {
  static readonly entityName = "user-settings";
  static readonly initialState: UserSettings = {
    id: "default",
    currency: "USD",
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
    category: "Others",
    description: "",
    date: "",
    currency: "USD"
  };
  protected override async ensureState(): Promise<Expense> {
    const s = await super.ensureState();
    if (!s.date) {
      s.date = new Date().toISOString();
    }
    return s;
  }
}
export type ChatBoardState = Chat & { messages: ChatMessage[] };
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static get seedData() {
    return MOCK_CHATS.map(c => ({
      ...c,
      messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
    }));
  }
  async listMessages(): Promise<ChatMessage[]> {
    const state = await this.getState();
    return state.messages || [];
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      chatId: this.id,
      userId,
      text,
      ts: Date.now()
    };
    await this.mutate(s => ({ ...s, messages: [...(s.messages || []), msg] }));
    return msg;
  }
}