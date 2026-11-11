import { API_CONFIG } from "../config";

const STORAGE_KEY = API_CONFIG.SESSION_DATA.ACTIVE_ONTOLOGY;

// The backend keeps no record of a user's active ontology, so it is stored next to the login
// settings and lives as long as they do. It is tagged with the group that chose it, so a
// different login on the same browser never inherits it. Member terms are left out: they change
// whenever anyone edits the ontology, and are re-read when the selection is restored.
export const readStoredActiveOntology = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored?.owner && stored?.ontology ? stored : null;
  } catch {
    return null;
  }
};

export const storeActiveOntology = (owner, ontology) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const { terms, ...withoutTerms } = ontology;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ owner, ontology: withoutTerms }));
  } catch {
    // Storage full or blocked: the selection still holds for this page's lifetime.
  }
};

export const clearStoredActiveOntology = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Blocked storage has nothing to clear.
  }
};
