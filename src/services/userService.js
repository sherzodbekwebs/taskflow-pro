import api from '../api';

const UserService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data.map(u => ({
      ...u,
      fullName: u.fullname, // Backend 'fullname' -> Frontend 'fullName'
      tg_username: u.tg_username || '',
      bio: u.bio || ''
    }));
  },

  getByCredentials: async (username, password) => {
    try {
      const response = await api.post('/users/login', { username, password });
      const user = response.data;
      if (!user) return null;
      return { 
        ...user, 
        fullName: user.fullname,
        tg_username: user.tg_username || '',
        bio: user.bio || ''
      };
    } catch (e) {
      return null;
    }
  },

  add: async (user) => {
    const payload = {
      username: user.username,
      password: user.password,
      fullname: user.fullName || user.fullname,
      role: user.role,
      department: user.department || null,
      has_admin_access: false,
      tg_username: user.tg_username || '',
      bio: user.bio || ''
    };

    const response = await api.post('/users', payload);
    return { ...response.data, fullName: response.data.fullname };
  },

  update: async (id, updates) => {
    const payload = { ...updates };
    
    // 1. Nomlanishni backendga moslaymiz
    if (payload.fullName) {
      payload.fullname = payload.fullName;
      delete payload.fullName;
    }

    // 2. Parol bo'sh bo'lsa yubormaymiz
    if (payload.password === "" || !payload.password) {
      delete payload.password;
    }

    // 3. Telegram username-dan @ belgisini olib tashlash (ixtiyoriy, tartib uchun)
    if (payload.tg_username) {
      payload.tg_username = payload.tg_username.replace('@', '');
    }

    const response = await api.patch(`/users/${id}`, payload);
    
    return { 
      ...response.data, 
      fullName: response.data.fullname,
      tg_username: response.data.tg_username,
      bio: response.data.bio
    };
  },

  delete: async (id) => {
    await api.delete(`/users/${id}`);
    return true;
  },

  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data.map(d => d.name) || [];
  },

  addDepartment: async (name) => {
    await api.post('/departments', { name });
  },

  deleteDepartment: async (name) => {
    await api.delete(`/departments/${name}`);
  }
};

export default UserService;