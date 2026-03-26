import { supabase } from '../supabaseClient';

const UserService = {
  getAll: async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data.map(u => ({
      ...u,
      fullName: u.fullname || u.fullName || '', 
    }));
  },

  getByCredentials: async (username, password) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password);
    
    if (error || data.length === 0) return null;
    const user = data[0];
    return { ...user, fullName: user.fullname || user.fullName || '' };
  },

  add: async (user) => {
    const payload = {
      username: user.username,
      password: user.password,
      fullname: user.fullName || user.fullname, 
      role: user.role,
      department: user.department || null
    };

    const { data, error } = await supabase.from('users').insert([payload]).select();
    if (error) throw error;
    return { ...data[0], fullName: data[0].fullname };
  },

  update: async (id, updates) => {
    const payload = { ...updates };
    
    // 1. 'fullname' nomini to'g'irlaymiz
    if (payload.fullName || payload.fullname) {
      payload.fullname = payload.fullName || payload.fullname;
      delete payload.fullName;
    }

    // 2. MUHIM HIMOYA: Agar parol bo'sh bo'lsa, uni updates'dan o'chirib tashlaymiz
    // Shunda Supabase eski parolni saqlab qoladi
    if (payload.hasOwnProperty('password') && (!payload.password || payload.password.trim() === "")) {
      delete payload.password;
    }

    const { data, error } = await supabase.from('users').update(payload).eq('id', id).select();
    if (error) throw error;
    return { ...data[0], fullName: data[0].fullname };
  },

  delete: async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  getDepartments: async () => {
    const { data, error } = await supabase.from('departments').select('name');
    if (error) return [];
    return data?.map(d => d.name) || [];
  },

  addDepartment: async (name) => {
    await supabase.from('departments').insert([{ name }]);
  },

  deleteDepartment: async (name) => {
    await supabase.from('departments').delete().eq('name', name);
  }
};

export default UserService;