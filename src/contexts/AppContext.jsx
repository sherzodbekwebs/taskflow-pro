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
    const init = async () => {
      try {
        setIsAuthLoading(true);
        const sl = StorageService.get('taskflow_lang') || 'uz';
        const sd = StorageService.get('taskflow_dark') || false;
        setLanguage(sl); setDarkMode(sd); if (sd) document.documentElement.classList.add('dark');

        const sid = window.sessionStorage.getItem('taskflow_session');
        if (sid) {
          const all = await UserService.getAll();
          const u = all.find(x => x.id === sid);
          if (u) setCurrentUser(u);
        }
        await refreshData();
      } finally { setIsAuthLoading(false); }
    };
    init();
    // Real-time (supabase.channel) olib tashlandi
  }, [refreshData]);

  const isSuperAdmin = currentUser?.username === 'admin' || currentUser?.username === 'sherzod';
  const hasAccess = isSuperAdmin || currentUser?.has_admin_access === true;

  const notifyAll = (title, msg, type, icon) => {
    const ids = users.map(u => u.id);
    NotificationService.add({ title, message: msg, type, icon }, ids).catch(console.error);
  };

  const addTask = async (taskData) => {
    setIsActionLoading(true); // Loading boshlandi
    try {
      const real = await TaskService.add(taskData);
      await refreshData(); // Bazadan yangi ma'lumotni olish

      const assigned = users.find(u => u.id === taskData.assignedUser);
      if (assigned) TelegramService.sendNotification(real, assigned, 'create').catch(console.error);
      notifyAll("Янги вазифа", `"${taskData.title}" қўшилди`, 'task_added', 'plus');

      showToast("Вазифа яратилди"); // Faqat muvaffaqiyatli bo'lganda chiqadi
    } catch (err) {
      console.error(err);
      showToast("Xato yuz berdi");
    } finally {
      setIsActionLoading(false); // Loading tugadi
    }
  };

  const updateTask = async (id, updates) => {
    setIsActionLoading(true);
    try {
      await TaskService.update(id, updates);
      await refreshData();
      showToast("Ўзгаришлар сақланди");
    } catch (err) {
      console.error(err);
      showToast("Xato yuz berdi");
    } finally {
      setIsActionLoading(false);
    }
  };

const moveTask = async (tid, ns) => {
    setIsActionLoading(true);
    try {
      let targetStatus = ns;
      
      // Admin bo'lmaganlar uchun 'done'ni 'review'ga aylantirish
      if (targetStatus === 'done' && !hasAccess) {
        targetStatus = 'review';
      }

      // 'updated_at' qatori olib tashlandi, chunki bazada bunday ustun yo'q
      const updates = { 
          status: targetStatus, 
          completed: targetStatus === 'done'
      };

      // 1. Bazada yangilash
      const updatedRecord = await TaskService.update(tid, updates);
      
      if (!updatedRecord) {
        throw new Error("Вазифа топилмади");
      }

      // 2. UI-ni yangilash
      await refreshData();

      // 3. Xabarni ko'rsatish
      if (targetStatus === 'review') {
        showToast("Вазифа текширувга юборилди");
      } else {
        showToast("Ўзгаришлар сақланди");
      }

      // 4. Telegram xabarnomasi (ixtiyoriy)
      try {
        const assigned = users.find(u => u.id === updatedRecord.assignedUser);
        if (assigned) {
          await TelegramService.sendNotification(updatedRecord, assigned, 'update');
        }
      } catch (teleErr) {
        console.error("Telegram error:", teleErr);
      }

    } catch (err) { 
      console.error("MoveTask xatosi:", err); 
      showToast("Xato: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };
  const deleteTask = async (id) => {
    const target = tasks.find(t => t.id === id);
    setIsActionLoading(true);
    try {
      if (target?.files?.length > 0) TaskService.deleteStorageFiles(target.files.map(f => f.url));
      await TaskService.delete(id);
      await refreshData();
      notifyAll("Вазифа ўчирилди", `"${target?.title}" олиб ташланди`, 'task_deleted', 'trash');
      showToast("Вазифа тизимdan ўчирилди");
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const toggleSubtask = async (tid, sid) => {
    setIsActionLoading(true);
    try {
      // 1. Subtaskni o'zgartirish
      await TaskService.toggleSubtask(tid, sid);

      // 2. Yangi ma'lumotni olib statusni tekshirish
      const allTasks = await TaskService.getAll();
      const task = allTasks.find(t => t.id === tid);

      if (task && task.subtasks) {
        const allDone = task.subtasks.length > 0 && task.subtasks.every(s => s.done);
        // Agar hamma subtasklar bajarilgan bo'lsa va status hali 'review' yoki 'done' bo'lmasa
        if (allDone && task.status !== 'review' && task.status !== 'done') {
          await TaskService.update(tid, { status: 'review' });
        }
      }

      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const approveTask = async (tid) => {
    setIsActionLoading(true);
    try {
      await TaskService.update(tid, { status: 'done', completed: true });
      await refreshData();
      showToast("Вазифа тасдиқланди");
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const rejectTask = async (tid) => {
    setIsActionLoading(true);
    try {
      await TaskService.update(tid, { status: 'progress', completed: false });
      await refreshData();
      showToast("Вазифа рад этилди");
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const addComment = async (tid, txt) => {
    const target = tasks.find(t => t.id === tid);
    const nc = { id: Date.now(), text: txt, userName: currentUser?.fullName, createdAt: new Date().toISOString() };
    const uc = [...(target.comments || []), nc];
    setIsActionLoading(true);
    try {
      await TaskService.update(tid, { comments: uc });
      await refreshData();
      showToast("Изоҳ қўшилди");
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
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