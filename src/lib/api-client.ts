import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(path, { 
      headers: { 'Content-Type': 'application/json' }, 
      ...init 
    });
    let json: ApiResponse<T>;
    try {
      json = (await res.json()) as ApiResponse<T>;
    } catch (parseError) {
      console.error(`[API] Failed to parse JSON response from ${path}`, parseError);
      throw new Error(`Invalid response format from server at ${path}`);
    }
    if (!res.ok || !json.success) {
      const errorMessage = json.error || `Request to ${path} failed with status ${res.status}`;
      console.warn(`[API] ${res.status} ${path}:`, errorMessage);
      throw new Error(errorMessage);
    }
    if (json.data === undefined) {
      console.error(`[API] Missing data in successful response from ${path}`);
      throw new Error('Server returned success but no data was provided');
    }
    return json.data;
  } catch (error) {
    console.error(`[API] Request error for ${path}:`, error);
    throw error;
  }
}