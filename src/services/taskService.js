import { supabase } from '../supabaseClient';

const TaskService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  uploadFile: async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { data, error } = await supabase.storage
        .from('task-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('task-files')
        .getPublicUrl(filePath);

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size
      };
    } catch (error) {
      console.error("Fayl yuklashda xato:", error.message);
      throw error;
    }
  },

  deleteStorageFiles: async (fileUrls) => {
    try {
      if (!fileUrls || fileUrls.length === 0) return;
      const filePaths = fileUrls.map(url => url.split('/').pop());
      const { error } = await supabase.storage
        .from('task-files')
        .remove(filePaths);
      if (error) throw error;
    } catch (error) {
      console.error("Storage o'chirish xatosi:", error.message);
    }
  },

  add: async (task) => {
    const { id, created_at, ...taskData } = task;
    if (!taskData.assignedUser || taskData.assignedUser === "" || taskData.assignedUser === "undefined") {
      taskData.assignedUser = null;
    }
    const { data, error } = await supabase.from('tasks').insert([taskData]).select();
    if (error) throw error;
    return data[0];
  },

  update: async (id, updates) => {
    if (!id || id === 'undefined') return null;
    const { id: _, created_at: __, ...cleanUpdates } = updates;
    if (cleanUpdates.assignedUser === "" || cleanUpdates.assignedUser === "undefined") {
      cleanUpdates.assignedUser = null;
    }
    const { data, error } = await supabase.from('tasks').update(cleanUpdates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  delete: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // SHU YERDA O'ZGARIŞ QILINDI:
  toggleSubtask: async (taskId, subtaskId) => {
    const { data: task } = await supabase.from('tasks').select('subtasks, status').eq('id', taskId).single();
    if (!task) return null;
    
    const newSubtasks = task.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s);
    const allDone = newSubtasks.length > 0 && newSubtasks.every(s => s.done);
    
    // Yangi mantiq: 
    // 1. Agar hamma subtask bitgan bo'lsa -> status 'review' bo'ladi.
    // 2. Agar bittasi ochilsa (not done) -> status 'progress'ga qaytadi.
    // 3. 'completed' faqat admin tasdiqlagandagina (approve) true bo'lishi kerak, shuning uchun bu yerda false yoki statusga qarab o'zgaradi.
    
    const updates = { 
        subtasks: newSubtasks, 
        completed: false, // Review holatida hali bitgan emas
        status: allDone ? 'review' : 'progress'
    };

    // Agar vazifa allaqachon 'done' bo'lsa va biron subtaskni 'not done' qilsak:
    if (!allDone && task.status === 'done') {
      updates.status = 'progress';
      updates.completed = false;
    }

    return await TaskService.update(taskId, updates);
  },

  getStats: async () => {
    const tasks = await TaskService.getAll();
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'progress').length;
    const newTasks = tasks.filter(t => t.status === 'new').length;
    return { total, completed, inProgress, newTasks };
  }
};

export default TaskService;