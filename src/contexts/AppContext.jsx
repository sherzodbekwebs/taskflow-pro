import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import TaskService from '../services/taskService';
import UserService from '../services/userService';
import NotificationService from '../services/notificationService';
import StorageService from '../services/storageService';
import TelegramService from '../services/telegramService';
import { uz } from '../locales/uz';
import { ru } from '../locales/ru';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState('uz');
  const [darkMode, setDarkMode] = useState(false);

  const t = language === 'uz' ? uz : ru;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const refreshData = useCallback(async () => {
    try {
      const [allTasks, allUsers, allDeps] = await Promise.all([
        TaskService.getAll(),
        UserService.getAll(),
        UserService.getDepartments()
      ]);
      setTasks(allTasks); setUsers(allUsers); setDepartments(allDeps);
      const sid = StorageService.get('taskflow_session');
      if (sid) { const n = await NotificationService.getByUser(sid); setNotifications(n); }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const sid = StorageService.get('taskflow_session');

    const init = async () => {
      try {
        setIsAuthLoading(true);
        const sl = StorageService.get('taskflow_lang') || 'uz';
        const sd = StorageService.get('taskflow_dark') || false;
        setLanguage(sl); setDarkMode(sd); if (sd) document.documentElement.classList.add('dark');
        if (sid) {
          const all = await UserService.getAll();
          const u = all.find(x => x.id === sid);
          if (u) setCurrentUser(u);
        }
        await refreshData();
      } finally { setIsAuthLoading(false); }
    };
    init();

    const ch = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (p) => {
        if (p.eventType === 'INSERT') {
          setTasks(prev => {
            // TUZATISH: Agar vazifa allaqachon steytda bo'lsa (addTask tugagan bo'lsa), qayta qo'shmaymiz
            if (prev.some(t => t.id === p.new.id)) return prev;
            // Aks holda temp-ni o'chirib, yangisini qo'shamiz
            return [p.new, ...prev.filter(t => !String(t.id).startsWith('temp-'))];
          });
        }
        else if (p.eventType === 'UPDATE') setTasks(prev => prev.map(t => t.id === p.new.id ? { ...t, ...p.new } : t));
        else if (p.eventType === 'DELETE') setTasks(prev => prev.filter(t => t.id !== p.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => refreshData())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
        filter: sid ? `user_id=eq.${sid}` : undefined
      }, async () => {
        if (sid) {
          const n = await NotificationService.getByUser(sid);
          setNotifications(n);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, [refreshData]);

  const notifyAll = (title, msg, type, icon) => {
    const ids = users.map(u => u.id);
    NotificationService.add({ title, message: msg, type, icon }, ids).catch(console.error);
  };

  const addTask = async (taskData) => {
    const tempId = `temp-${Date.now()}`;
    setTasks(prev => [{ ...taskData, id: tempId, created_at: new Date().toISOString(), subtasks: [], comments: [] }, ...prev]);
    showToast("Vazifa yaratildi");
    try {
      const real = await TaskService.add(taskData);
      setTasks(prev => prev.map(t => t.id === tempId ? real : t));
      const assigned = users.find(u => u.id === taskData.assignedUser);
      TelegramService.sendNotification(real, assigned, 'create').catch(console.error);
      notifyAll("Yangi vazifa", `"${taskData.title}" qo'shildi`, 'task_added', 'plus');
    } catch (err) { setTasks(prev => prev.filter(t => t.id !== tempId)); }
  };

  const updateTask = async (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    showToast("O'zgarishlar saqlandi");
    try {
      const updated = await TaskService.update(id, updates);
      const assigned = users.find(u => u.id === (updates.assignedUser || updated.assignedUser));
      TelegramService.sendNotification(updated, assigned, 'update').catch(console.error);
      notifyAll("Vazifa yangilandi", `"${updated.title}" tahrirlandi`, 'task_updated', 'edit');
    } catch (err) { refreshData(); }
  };

  const deleteTask = async (id) => {
    const old = [...tasks];
    const target = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast("Vazifa tizimdan o'chirildi");
    try {
      if (target?.files?.length > 0) TaskService.deleteStorageFiles(target.files.map(f => f.url));
      const assigned = users.find(u => u.id === target.assignedUser);
      TelegramService.sendNotification(target, assigned, 'delete').catch(console.error);
      await TaskService.delete(id);
      notifyAll("Vazifa o'chirildi", `"${target?.title}" olib tashlandi`, 'task_deleted', 'trash');
    } catch (err) { setTasks(old); }
  };

  const moveTask = async (tid, ns) => {
    setTasks(prev => prev.map(t => t.id === tid ? { ...t, status: ns, completed: ns === 'done' } : t));
    try {
      const updated = await TaskService.update(tid, { status: ns, completed: ns === 'done' });
      const assigned = users.find(u => u.id === updated.assignedUser);
      TelegramService.sendNotification(updated, assigned, 'update').catch(console.error);
    } catch (err) { refreshData(); }
  };

  const toggleSubtask = async (tid, sid) => {
    setTasks(prev => prev.map(t => {
      if (t.id === tid) {
        const ns = (t.subtasks || []).map(s => s.id === sid ? { ...s, done: !s.done } : s);
        const all = ns.length > 0 && ns.every(x => x.done);
        return { ...t, subtasks: ns, status: all ? 'done' : t.status, completed: all };
      }
      return t;
    }));
    try { await TaskService.toggleSubtask(tid, sid); } catch (err) { refreshData(); }
  };

  const addComment = async (tid, txt) => {
    try {
      const target = tasks.find(t => t.id === tid);
      const nc = { id: Date.now(), text: txt, userName: currentUser?.fullName || currentUser?.fullname, createdAt: new Date().toISOString() };
      const uc = [...(target.comments || []), nc];
      setTasks(prev => prev.map(t => t.id === tid ? { ...t, comments: uc } : t));
      await TaskService.update(tid, { comments: uc });
      showToast("Izoh qo'shildi");
    } catch (err) { console.error(err); }
  };

  const login = async (u, p) => {
    setIsActionLoading(true);
    try {
      const res = await UserService.getByCredentials(u, p);
      if (res) { setCurrentUser(res); StorageService.set('taskflow_session', res.id); await refreshData(); }
      return res;
    } finally { setIsActionLoading(false); }
  };

  const isSuperAdmin = currentUser?.username === 'admin' || currentUser?.username === 'sherzod';
  const hasAccess = isSuperAdmin || currentUser?.has_admin_access === true;

  return (
    <AppContext.Provider value={{
      currentUser, isAuthLoading, isActionLoading, isSuperAdmin, hasAccess, toast,
      tasks, users, departments, notifications, unreadCount: notifications.filter(n => !n.read).length,
      language, darkMode, t,
      login, logout: () => { setCurrentUser(null); StorageService.remove('taskflow_session'); },
      addTask, updateTask, deleteTask, toggleSubtask, addComment, moveTask,
      addUser: async (d) => {
        setIsActionLoading(true);
        try {
          const res = await UserService.add(d);
          setUsers(prev => [...prev, res]);
          showToast("Xodim qo'shildi");
        } finally { setIsActionLoading(false); }
      },
      updateUser: async (id, data) => {
        setIsActionLoading(true);
        try {
          const res = await UserService.update(id, data);
          setUsers(prev => prev.map(u => u.id === id ? res : u));
          showToast("Ma'lumotlar yangilandi");
        } finally { setIsActionLoading(false); }
      },
      deleteUser: async (id) => {
        setIsActionLoading(true);
        try {
          await UserService.delete(id);
          setUsers(prev => prev.filter(u => u.id !== id));
          showToast("Xodim o'chirildi");
        } finally { setIsActionLoading(false); }
      },
      addDepartment: async (n) => {
        setIsActionLoading(true);
        try {
          await UserService.addDepartment(n);
          setDepartments(prev => [...prev, n]);
          showToast("Yo'nalish qo'shildi");
        } finally { setIsActionLoading(false); }
      },
      deleteDepartment: async (n) => {
        setIsActionLoading(true);
        try {
          await UserService.deleteDepartment(n);
          setDepartments(prev => prev.filter(d => d !== n));
          showToast("Yo'nalish olib tashlandi");
        } finally { setIsActionLoading(false); }
      },
      markNotifRead: (id) => { setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); NotificationService.markRead(currentUser.id, id); },
      markAllNotifRead: () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); NotificationService.markAllRead(currentUser.id); },
      changeLanguage: (l) => { setLanguage(l); StorageService.set('taskflow_lang', l); },
      toggleDarkMode: () => { const m = !darkMode; setDarkMode(m); StorageService.set('taskflow_dark', m); if (m) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); },
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);