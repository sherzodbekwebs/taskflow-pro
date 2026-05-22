import api from '../api';

const TelegramService = {
  sendNotification: async (task, assignedUser, type = 'create') => {
    try {
      // Backend'dagi xavfsiz endpointga so'rov yuboramiz
      await api.post('/telegram/notify', {
        task,
        assignedUser,
        type
      });
    } catch (error) {
      console.error("Telegram xabarnoma yuborishda xato:", error);
    }
  }
};

export default TelegramService;