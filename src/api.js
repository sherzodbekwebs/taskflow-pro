import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// So'rov yuborishdan oldin har doim tokenni tekshiramiz
// Bu Supabase'ning "persistSession" funksiyasini o'rnini bosadi
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('taskflow_token'); // Keyinchalik tokenni shu nom bilan saqlaymiz
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;