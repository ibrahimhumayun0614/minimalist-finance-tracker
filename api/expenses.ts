import type { VercelRequest, VercelResponse } from '@vercel/node';
import { StorageService } from '../src/lib/storage-service';
import type { ApiResponse, Expense } from '../shared/types';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    if (req.method === 'GET') {
      const cursor = req.query.cursor as string | undefined;
      const limit = Number(req.query.limit) || 1000;
      const data = await StorageService.listExpenses(undefined, cursor, limit);
      return res.status(200).json({ success: true, data } as ApiResponse);
    }
    if (req.method === 'POST') {
      const body = req.body as Omit<Expense, 'id'>;
      const data = await StorageService.createExpense(undefined, body);
      return res.status(200).json({ success: true, data } as ApiResponse<Expense>);
    }
    if (req.method === 'PUT' && id) {
      const body = req.body as Partial<Expense>;
      const data = await StorageService.updateExpense(undefined, String(id), body);
      return res.status(200).json({ success: true, data } as ApiResponse<Expense>);
    }
    if (req.method === 'DELETE') {
      if (id === 'all') {
        const count = await StorageService.deleteAllExpenses(undefined);
        return res.status(200).json({ success: true, data: { deletedCount: count } } as ApiResponse);
      }
      if (id) {
        const deleted = await StorageService.deleteExpense(undefined, String(id));
        return res.status(200).json({ success: true, data: { id, deleted } } as ApiResponse);
      }
    }
    return res.status(405).json({ success: false, error: 'Method Not Allowed' } as ApiResponse);
  } catch (error) {
    console.error('[VERCEL API] Expenses Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      detail: error instanceof Error ? error.message : String(error)
    } as ApiResponse);
  }
}