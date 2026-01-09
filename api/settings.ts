import type { VercelRequest, VercelResponse } from '@vercel/node';
import { StorageService } from '../src/lib/storage-service';
import type { ApiResponse, UserSettings } from '../shared/types';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const data = await StorageService.getSettings();
      return res.status(200).json({ success: true, data } as ApiResponse<UserSettings>);
    }
    if (req.method === 'POST') {
      const body = req.body as Partial<UserSettings>;
      const data = await StorageService.updateSettings(undefined, body);
      return res.status(200).json({ success: true, data } as ApiResponse<UserSettings>);
    }
    return res.status(405).json({ success: false, error: 'Method Not Allowed' } as ApiResponse);
  } catch (error) {
    console.error('[VERCEL API] Settings Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      detail: error instanceof Error ? error.message : String(error)
    } as ApiResponse);
  }
}