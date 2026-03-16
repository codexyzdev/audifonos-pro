import { InventoryState, ColorType } from '@/types';
import { DriveServiceResult } from '@/types/auth';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const FILE_NAME = 'audifonos-inventory.json';
const LS_KEY = 'audifonos-inventory-v1';

const COLORS: ColorType[] = ['azul', 'blanco', 'verde', 'rosa', 'negro'];

export const INITIAL_STATE: InventoryState = {
  products: { azul: 100, blanco: 100, verde: 100, rosa: 100, negro: 100 },
  transactions: [
    { id: 'initial-1', type: 'entrada', color: 'azul', quantity: 100, date: new Date().toISOString(), notes: 'Pedido inicial de China' },
    { id: 'initial-2', type: 'entrada', color: 'blanco', quantity: 100, date: new Date().toISOString(), notes: 'Pedido inicial de China' },
    { id: 'initial-3', type: 'entrada', color: 'verde', quantity: 100, date: new Date().toISOString(), notes: 'Pedido inicial de China' },
    { id: 'initial-4', type: 'entrada', color: 'rosa', quantity: 100, date: new Date().toISOString(), notes: 'Pedido inicial de China' },
    { id: 'initial-5', type: 'entrada', color: 'negro', quantity: 100, date: new Date().toISOString(), notes: 'Pedido inicial de China' },
  ],
};

// --- Helpers ---

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await delay(baseDelayMs * Math.pow(2, attempt - 1));
    }
  }
  // TypeScript requires a return; unreachable in practice
  throw new Error('withRetry: exhausted attempts');
}

function isValidInventoryState(obj: unknown): obj is InventoryState {
  if (!obj || typeof obj !== 'object') return false;
  const state = obj as Record<string, unknown>;
  if (!state.products || typeof state.products !== 'object') return false;
  const products = state.products as Record<string, unknown>;
  for (const color of COLORS) {
    if (typeof products[color] !== 'number') return false;
  }
  if (!Array.isArray(state.transactions)) return false;
  return true;
}

function getLocalStorageMigration(): InventoryState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isValidInventoryState(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

// --- Drive API helpers ---

async function searchFile(accessToken: string): Promise<string | null> {
  const url = `${DRIVE_API}/files?spaces=appDataFolder&q=name%3D'${FILE_NAME}'&fields=files(id)`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new Error('AUTH_ERROR');
  if (!res.ok) throw new Error(`Drive search failed: ${res.status}`);
  const json = await res.json() as { files: { id: string }[] };
  return json.files?.[0]?.id ?? null;
}

async function readFile(accessToken: string, fileId: string): Promise<string> {
  const url = `${DRIVE_API}/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new Error('AUTH_ERROR');
  if (!res.ok) throw new Error(`Drive read failed: ${res.status}`);
  return res.text();
}

async function createFile(accessToken: string, state: InventoryState): Promise<string> {
  const metadata = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] });
  const body = JSON.stringify(state);

  const form = new FormData();
  form.append('metadata', new Blob([metadata], { type: 'application/json' }));
  form.append('media', new Blob([body], { type: 'application/json' }));

  const url = `${UPLOAD_API}/files?uploadType=multipart&fields=id`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (res.status === 401) throw new Error('AUTH_ERROR');
  if (!res.ok) throw new Error(`Drive create failed: ${res.status}`);
  const json = await res.json() as { id: string };
  return json.id;
}

async function updateFile(accessToken: string, fileId: string, state: InventoryState): Promise<void> {
  const url = `${UPLOAD_API}/files/${fileId}?uploadType=media`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(state),
  });
  if (res.status === 401) throw new Error('AUTH_ERROR');
  if (!res.ok) throw new Error(`Drive update failed: ${res.status}`);
}

// --- Public API ---

export async function loadInventory(accessToken: string): Promise<DriveServiceResult<InventoryState>> {
  try {
    const fileId = await withRetry(() => searchFile(accessToken));

    if (fileId) {
      // File exists — read it
      const raw = await withRetry(() => readFile(accessToken, fileId));
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!isValidInventoryState(parsed)) {
          return { data: INITIAL_STATE, error: 'El archivo de inventario tiene un formato inválido. Se usó el estado inicial.' };
        }
        return { data: parsed, error: null };
      } catch {
        return { data: INITIAL_STATE, error: 'El archivo de inventario contiene JSON inválido. Se usó el estado inicial.' };
      }
    }

    // No file — check localStorage migration (Task 2.2)
    const migrated = getLocalStorageMigration();
    const initialData = migrated ?? INITIAL_STATE;

    await withRetry(() => createFile(accessToken, initialData));

    if (migrated) {
      localStorage.removeItem(LS_KEY);
    }

    return { data: initialData, error: null };
  } catch (err) {
    if (err instanceof Error && err.message === 'AUTH_ERROR') {
      return { data: null, error: 'AUTH_ERROR' };
    }
    const message = err instanceof Error ? err.message : 'Error desconocido al cargar el inventario';
    return { data: null, error: message };
  }
}

export async function saveInventory(accessToken: string, state: InventoryState): Promise<DriveServiceResult<void>> {
  try {
    const fileId = await withRetry(() => searchFile(accessToken));

    if (fileId) {
      await withRetry(() => updateFile(accessToken, fileId, state));
    } else {
      await withRetry(() => createFile(accessToken, state));
    }

    return { data: null, error: null };
  } catch (err) {
    if (err instanceof Error && err.message === 'AUTH_ERROR') {
      return { data: null, error: 'AUTH_ERROR' };
    }
    const message = err instanceof Error ? err.message : 'Error desconocido al guardar el inventario';
    return { data: null, error: message };
  }
}
