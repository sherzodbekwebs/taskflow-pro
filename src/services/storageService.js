/**
 * Storage Service - Data Layer Abstraction
 * 
 * This service abstracts storage operations.
 * To migrate to Firebase/Supabase, only replace the implementations below.
 * The API (get, set, remove, clear) remains the same.
 */

const StorageService = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

export default StorageService;

/**
 * FIREBASE MIGRATION GUIDE:
 * Replace StorageService methods with Firestore calls:
 * 
 * get: async (key) => {
 *   const doc = await getDoc(doc(db, 'taskflow', key));
 *   return doc.exists() ? doc.data() : null;
 * }
 * 
 * SUPABASE MIGRATION GUIDE:
 * get: async (key) => {
 *   const { data } = await supabase.from('taskflow').select('*').eq('key', key).single();
 *   return data?.value ?? null;
 * }
 */
