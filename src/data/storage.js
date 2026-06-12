import { STORAGE_KEY, DEFAULT_DATA } from './defaults.js';

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return migrateData(data);
    }
    return null;
  } catch {
    return null;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      savedAt: new Date().toISOString(),
    }));
  } catch (e) {
    console.error('[Wedding Planner] Failed to save:', e);
  }
}

export function migrateData(data) {
  if (!data) return null;

  // Ensure all required fields exist (deep clone to avoid reference issues)
  if (!data.venues) data.venues = JSON.parse(JSON.stringify(DEFAULT_DATA.venues));
  if (!data.tasks) data.tasks = JSON.parse(JSON.stringify(DEFAULT_DATA.tasks));
  if (!data.budget) data.budget = JSON.parse(JSON.stringify(DEFAULT_DATA.budget));
  if (!data.visions) data.visions = JSON.parse(JSON.stringify(DEFAULT_DATA.visions));
  if (!data.activeVisionId) data.activeVisionId = data.visions[0]?.id || 'vis1';
  if (data.venueNotes === undefined) data.venueNotes = '';

  // Migrate venues to include all fields if missing
  data.venues = data.venues.map((v, index) => ({
    ...v,
    id: v.id || `v${index + 1}_${Date.now()}`,
    userNotes: v.userNotes || '',
    deprioritized: v.deprioritized || false,
    features: v.features || '',
  }));

  return data;
}

export function getInitialData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}
