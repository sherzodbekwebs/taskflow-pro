const PREFIX = 'taskflow_';

const StorageService = {
  // Umumiy metodlar
  get: (key) => {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(PREFIX + key);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Maxsus metod: Tokendan foydalanish uchun
  // Supabase'dan voz kechganimiz uchun JWT tokenni saqlash kerak bo'ladi
  setToken: (token) => {
    // Tokenni sessionStorage-da saqlash xavfsizroq (brauzer yopilganda o'chadi)
    sessionStorage.setItem(PREFIX + 'token', token);
  },

  getToken: () => {
    return sessionStorage.getItem(PREFIX + 'token');
  },

  removeToken: () => {
    sessionStorage.removeItem(PREFIX + 'token');
  },

  clear: () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

export default StorageService;