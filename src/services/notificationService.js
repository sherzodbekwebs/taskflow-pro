import { supabase } from '../supabaseClient';

const NotificationService = {
  // Yangi bildirishnoma yaratish va barcha userlarga tarqatish
  add: async (notifData, allUserIds) => {
    // 1. Asosiy bildirishnoma
    const { data: newNotif, error: notifError } = await supabase
      .from('notifications')
      .insert([{
        title: notifData.title,
        message: notifData.message,
        type: notifData.type,
        icon: notifData.icon
      }])
      .select().single();

    if (notifError) throw notifError;

    // 2. Barcha userlarga "unread" qilib bog'lab chiqish
    const relations = allUserIds.map(uid => ({
      user_id: uid,
      notification_id: newNotif.id,
      is_read: false
    }));

    const { error: relError } = await supabase.from('user_notifications').insert(relations);
    if (relError) throw relError;
    return newNotif;
  },

  // Foydalanuvchi uchun bildirishnomalarni olish (TEPADA CHIQISHI UCHUN TARTIBLANDI)
  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('user_notifications')
      .select(`
        is_read,
        notification_id,
        notifications (*)
      `)
      .eq('user_id', userId)
      // created_at bo'yicha teskari tartibda (DESC) saralash:
      .order('created_at', { foreignTable: 'notifications', ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      ...item.notifications,
      read: item.is_read,
      createdAt: item.notifications.created_at
    }));
  },

  markRead: async (userId, notifId) => {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('notification_id', notifId);
    if (error) throw error;
  },

  markAllRead: async (userId) => {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
  }
};

export default NotificationService;