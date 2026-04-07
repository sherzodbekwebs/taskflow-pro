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

      const sid = window.sessionStorage.getItem('taskflow_session');
      if (sid) { const n = await NotificationService.getByUser(sid); setNotifications(n); }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const sid = window.sessionStorage.getItem('taskflow_session');

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
        const { eventType, new: newRecord, old: oldRecord } = p;
        if (eventType === 'INSERT') {
          setTasks(prev => {
            if (prev.some(t => t.id === newRecord.id)) return prev;
            return [newRecord, ...prev];
          });
        }
        else if (eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === newRecord.id ? { ...t, ...newRecord } : t));
        }
        else if (eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== oldRecord.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        refreshData();
      })
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, [refreshData]);

  const isSuperAdmin = currentUser?.username === 'admin' || currentUser?.username === 'sherzod' || currentUser?.username === 'Badriddin';
  const hasAccess = isSuperAdmin || currentUser?.has_admin_access === true;

  const notifyAll = (title, msg, type, icon) => {
    const ids = users.map(u => u.id);
    NotificationService.add({ title, message: msg, type, icon }, ids).catch(console.error);
  };

  const addTask = async (taskData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      ...taskData,
      id: tempId,
      created_at: taskData.created_at || new Date().toISOString(),
      subtasks: taskData.subtasks || [],
      comments: []
    };
    setTasks(prev => [optimisticTask, ...prev]);
    showToast("Вазифа яратилди");
    try {
      const real = await TaskService.add(taskData);
      setTasks(prev => prev.map(t => t.id === tempId ? real : t));
      const assigned = users.find(u => u.id === taskData.assignedUser);
      if (assigned) TelegramService.sendNotification(real, assigned, 'create').catch(console.error);
      notifyAll("Янги вазифа", `"${taskData.title}" қўшилди`, 'task_added', 'plus');
    } catch (err) { setTasks(prev => prev.filter(t => t.id !== tempId)); }
  };

  const updateTask = async (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    showToast("Ўзгаришлар сақланди");
    try { await TaskService.update(id, updates); } catch (err) { console.error(err); refreshData(); }
  };

  // --- MOVETASK: Tuzatildi (Ishchi 'done'ga o'tkazolmaydi) ---
  const moveTask = async (tid, ns) => {
    let targetStatus = ns;

    // Agar foydalanuvchi admin bo'lmasa va vazifani 'done'ga sursa, uni 'review'ga qaytaramiz
    if (targetStatus === 'done' && !hasAccess) {
      targetStatus = 'review';
      showToast("Вазифа текширувга юборилди");
    }

    const isDone = targetStatus === 'done';
    const updates = {
      status: targetStatus,
      completed: isDone,
      updated_at: new Date().toISOString()
    };

    setTasks(prev => prev.map(t => t.id === tid ? { ...t, ...updates } : t));

    try {
      await TaskService.update(tid, updates);
      const updatedTask = tasks.find(t => t.id === tid);
      const assigned = users.find(u => u.id === updatedTask?.assignedUser);
      if (assigned) TelegramService.sendNotification({ ...updatedTask, ...updates }, assigned, 'update').catch(console.error);
    } catch (err) { console.error(err); refreshData(); }
  };

  const deleteTask = async (id) => {
    const old = [...tasks];
    const target = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast("Вазифа тизимдан ўчирилди");
    try {
      if (target?.files?.length > 0) TaskService.deleteStorageFiles(target.files.map(f => f.url));
      await TaskService.delete(id);
      notifyAll("Вазифа ўчирилди", `"${target?.title}" олиб ташланди`, 'task_deleted', 'trash');
    } catch (err) { setTasks(old); }
  };

  // --- TOGGLESUBTASK: Tuzatildi (100% bo'lsa 'review'ga o'tadi) ---
  const toggleSubtask = async (tid, sid) => {
    setTasks(prev => prev.map(t => {
      if (t.id === tid) {
        const ns = (t.subtasks || []).map(s => s.id === sid ? { ...s, done: !s.done } : s);
        const allDone = ns.length > 0 && ns.every(x => x.done);

        // Hamma sub-tasklar bajarilganda status avtomatik 'review' bo'ladi
        const newStatus = allDone ? 'review' : 'progress';

        return { ...t, subtasks: ns, status: newStatus, completed: false };
      }
      return t;
    }));
    try { await TaskService.toggleSubtask(tid, sid); } catch (err) { refreshData(); }
  };

  const approveTask = async (tid) => {
    setTasks(prev => prev.map(t => t.id === tid ? { ...t, status: 'done', completed: true } : t));
    showToast("Вазифа тасдиқланди");
    try { await TaskService.update(tid, { status: 'done', completed: true }); } catch (err) { refreshData(); }
  };

  const rejectTask = async (tid) => {
    setTasks(prev => prev.map(t => t.id === tid ? { ...t, status: 'progress', completed: false } : t));
    showToast("Вазифа рад этилди");
    try { await TaskService.update(tid, { status: 'progress', completed: false }); } catch (err) { refreshData(); }
  };

  const addComment = async (tid, txt) => {
    const target = tasks.find(t => t.id === tid);
    const nc = { id: Date.now(), text: txt, userName: currentUser?.fullName, createdAt: new Date().toISOString() };
    const uc = [...(target.comments || []), nc];
    setTasks(prev => prev.map(t => t.id === tid ? { ...t, comments: uc } : t));
    try { await TaskService.update(tid, { comments: uc }); showToast("Изоҳ қўшилди"); } catch (err) { console.error(err); }
  };

  const login = async (u, p) => {
    setIsActionLoading(true);
    try {
      const res = await UserService.getByCredentials(u, p);
      if (res) {
        setCurrentUser(res);
        window.sessionStorage.setItem('taskflow_session', res.id);
        await refreshData();
      }
      return res;
    } finally { setIsActionLoading(false); }
  };

  return (
    <AppContext.Provider value={{
      currentUser, isAuthLoading, isActionLoading, isSuperAdmin, hasAccess, toast,
      tasks, users, departments, notifications, unreadCount: notifications.filter(n => !n.read).length,
      language, darkMode, t,
      login,
      logout: () => {
        setCurrentUser(null);
        window.sessionStorage.removeItem('taskflow_session');
      },
      addTask, updateTask, deleteTask, toggleSubtask, addComment, moveTask, approveTask, rejectTask,
      addUser: async (d) => { setIsActionLoading(true); try { await UserService.add(d); await refreshData(); } finally { setIsActionLoading(false); } },
      updateUser: async (id, data) => { setIsActionLoading(true); try { await UserService.update(id, data); await refreshData(); } finally { setIsActionLoading(false); } },
      deleteUser: async (id) => { setIsActionLoading(true); try { await UserService.delete(id); await refreshData(); } finally { setIsActionLoading(false); } },
      addDepartment: async (n) => { setIsActionLoading(true); try { await UserService.addDepartment(n); await refreshData(); } finally { setIsActionLoading(false); } },
      deleteDepartment: async (n) => { setIsActionLoading(true); try { await UserService.deleteDepartment(n); await refreshData(); } finally { setIsActionLoading(false); } },
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