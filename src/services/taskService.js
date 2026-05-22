import api from '../api';

const TaskService = {
  // 1. Barcha vazifalarni olish
  getAll: async () => {
    try {
      const response = await api.get('/tasks');
      return response.data || [];
    } catch (error) {
      console.error("Vazifalarni yuklashda xato:", error);
      throw error;
    }
  },

  // 2. Bitta vazifani ID bo'yicha olish (Sahifaga kirganda kerak bo'ladi)
  getById: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error("Vazifani yuklashda xato:", error);
      throw error;
    }
  },

  // 3. Fayl yuklash (Backend-dagi /tasks/upload endpointiga yuboradi)
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/tasks/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data; // { id, name, url, type, size } qaytadi
    } catch (error) {
      console.error("Fayl yuklashda xato:", error);
      throw error;
    }
  },

  // 4. Yangi vazifa qo'shish
  add: async (task) => {
    try {
      // assignedUser-ni raqam formatiga o'tkazamiz
      const payload = {
        ...task,
        assignedUser: task.assignedUser ? Number(task.assignedUser) : null
      };
      const response = await api.post('/tasks', payload);
      return response.data;
    } catch (error) {
      console.error("Vazifa qo'shishda xato:", error);
      throw error;
    }
  },

  // 5. Vazifani tahrirlash
  update: async (id, updates) => {
    try {
      const response = await api.patch(`/tasks/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Vazifani yangilashda xato:", error);
      throw error;
    }
  },

  // 6. Vazifani o'chirish
  delete: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      return true;
    } catch (error) {
      console.error("Vazifani o'chirishda xato:", error);
      throw error;
    }
  },

  // 7. Subtask holatini o'zgartirish (Check-box uchun)
  toggleSubtask: async (taskId, subtaskId) => {
    try {
      // URL: /tasks/2/subtask/1/toggle
      const response = await api.post(`/tasks/${taskId}/subtask/${subtaskId}/toggle`);
      return response.data;
    } catch (error) {
      console.error("Subtaskni o'zgartirishda xato:", error);
      throw error;
    }
  },

  // 8. Statistika ma'lumotlarini olish
  getStats: async () => {
    try {
      const response = await api.get('/tasks/stats');
      return response.data;
    } catch (error) {
      console.error("Statistika yuklashda xato:", error);
      return { total: 0, completed: 0, inProgress: 0, newTasks: 0 };
    }
  }
};

export default TaskService;