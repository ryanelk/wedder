export const STORAGE_KEY = 'wedding-planner-data';

// Bump when the saved data shape changes in a way old data can't be carried over.
// Version 2 is the To do / Vendors / Venue rebuild; older data is replaced, not migrated.
export const DATA_VERSION = 2;

export const DEFAULT_VISIONS = [
  { id: 'vis1', name: 'Nature', moodboards: [], pinterest: [], inspo: [], keywords: [], notes: '' },
  { id: 'vis2', name: 'Abstract', moodboards: [], pinterest: [], inspo: [], keywords: [], notes: '' },
];

export const DEFAULT_DATA = {
  version: DATA_VERSION,
  weddingDate: '2027-05-23',
  taskState: {},   // per task: done, steps, notes, and any edits made in the app
  customTasks: {}, // tasks added in the app
  vendorState: {}, // per vendor: status, amount, contact, notes, insured, estimate and counted overrides
  shortlist: {},   // vendor candidates
  floorPlans: {},  // floor plan links on the Venue tab
  visions: DEFAULT_VISIONS,
  activeVisionId: 'vis1',
};

export function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
