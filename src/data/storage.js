import { STORAGE_KEY, DEFAULT_DATA, DATA_VERSION } from './defaults.js';

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? migrateData(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  } catch (e) {
    console.error('[Wedding Planner] Failed to save:', e);
  }
}

// Data from before version 2 (the old venue shortlist, task lists and budget) is replaced with a fresh plan.
// The gist is overwritten with the new shape on the next sync.
export function migrateData(data) {
  if (!data) return null;
  if (data.version !== DATA_VERSION) return getInitialData();
  const fresh = getInitialData();
  for (const key of Object.keys(fresh)) {
    if (data[key] === undefined) data[key] = fresh[key];
  }
  return data;
}

export function getInitialData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}
