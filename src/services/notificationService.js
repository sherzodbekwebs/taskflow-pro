import api from '../api';

const NotificationService = {
  add: async (notifData, allUserIds) => {
    const response = await api.post('/notifications', { notifData, allUserIds });
    return response.data;
  },

  getByUser: async (userId) => {
    const response = await api.get(`/notifications/user/${userId}`);
    return response.data;
  },

  markRead: async (userId, notifId) => {
    await api.patch(`/notifications/read/${userId}/${notifId}`);
  },

  markAllRead: async (userId) => {
    await api.patch(`/notifications/read-all/${userId}`);
  }
};

export default NotificationService;