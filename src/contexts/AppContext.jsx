import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const showToast = (msg) => { 
    setToast(msg); 
    setTimeout(() => setToast(null), 3000); 
  };

  // Ma'lumotlarni serverdan qayta yuklash
  const refreshData = useCallback(async () => {
    try {
      const [allTasks, allUsers, allDeps] = await Promise.all([
        TaskService.getAll(),
        UserService.getAll(),
        UserService.getDepartments()
      ]);
      setTasks(allTasks); 
      setUsers(allUsers); 
      setDepartments(allDeps);

      const sid = window.sessionStorage.getItem('taskflow_session');
      if (sid && sid !== 'undefined') { 
        const n = await NotificationService.getByUser(Number(sid)); 
        setNotifications(n); 
      }
    } catch (err) { 
      console.error("RefreshData error:", err); 
    }
  }, []);

  // Ilova ishga tushgandagi sozlamalar
  useEffect(() => {
    const init = async () => {
      try {
        setIsAuthLoading(true);
        const sl = StorageService.get('taskflow_lang') || 'uz';
        const sd = StorageService.get('taskflow_dark') || false;
        setLanguage(sl); 
        setDarkMode(sd); 
        if (sd) document.documentElement.classList.add('dark');

        const sid = window.sessionStorage.getItem('taskflow_session');
        if (sid && sid !== 'undefined') {
          const all = await UserService.getAll();
          const u = all.find(x => String(x.id) === String(sid));
          if (u) setCurrentUser(u);
        }
        await refreshData();
      } catch (err) {
        console.error("Init error:", err);
      } finally { 
        setIsAuthLoading(false); 
      }
    };
    init();
  }, [refreshData]);

  const isSuperAdmin = currentUser?.username === 'admin' || currentUser?.username === 'sherzod';
  const hasAccess = isSuperAdmin || currentUser?.has_admin_access === true;

  // --- FOYDALANUVCHILARNI BOSHQARISH (OPTIMISTIC UPDATE) ---

  const addUser = async (data) => {
    setIsActionLoading(true);
    try {
      const newUser = await UserService.add(data);
      const mappedUser = { ...newUser, fullName: newUser.fullname };
      setUsers(prev => [...prev, mappedUser]); // Listni darhol yangilash
      showToast("Xodim tizimga qo'shildi");
    } catch (err) {
      console.error(err);
      showToast("Xato yuz berdi");
    } finally {
      setIsActionLoading(false);
    }
  };

  const updateUser = async (id, data) => {
    setIsActionLoading(true);
    try {
      const updated = await UserService.update(id, data);
      const mappedUser = { ...updated, fullName: updated.fullname };
      
      // Listni darhol yangilash
      setUsers(prev => prev.map(u => String(u.id) === String(id) ? mappedUser : u));
      
      // Agar o'z profilini o'zgartirgan bo'lsa, uni ham yangilash
      if (String(currentUser?.id) === String(id)) {
        setCurrentUser(mappedUser);
      }
      
      showToast("Ma'lumotlar saqlandi");
    } catch (err) {
      console.error(err);
      showToast("Xato yuz berdi");
    } finally {
      setIsActionLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (String(id) === String(currentUser?.id)) return;
    setIsActionLoading(true);
    try {
      await UserService.delete(id);
      setUsers(prev => prev.filter(u => String(u.id) !== String(id))); // Listdan o'chirish
      showToast("Foydalanuvchi o'chirildi");
    } catch (err) {
      console.error(err);
      showToast("Xato yuz berdi");
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- BO'LIMLARNI BOSHQARISH ---

  const addDepartment = async (name) => {
    setIsActionLoading(true);
    try {
      await UserService.addDepartment(name);
      setDepartments(prev => [...prev, name]);
      showToast("Bo'lim qo'shildi");
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const deleteDepartment = async (name) => {
    setIsActionLoading(true);
    try {
      await UserService.deleteDepartment(name);
      setDepartments(prev => prev.filter(d => d !== name));
      showToast("Bo'lim o'chirildi");
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- VAZIFALAR BILAN ISHLASH ---

  const notifyAll = (title, msg, type, icon) => {
    const ids = users.map(u => u.id);
    NotificationService.add({ title, message: msg, type, icon }, ids).catch(console.error);
  };

  const addTask = async (taskData) => {
    setIsActionLoading(true);
    try {
      const real = await TaskService.add(taskData);
      await refreshData();
      const assigned = users.find(u => String(u.id) === String(taskData.assignedUser));
      if (assigned) TelegramService.sendNotification(real, assigned, 'create').catch(console.error);
      notifyAll("Янги вазифа", `"${taskData.title}" қўшилди`, 'task_added', 'plus');
      showToast("Вазифа яратилди");
    } catch (err) {
      console.error(err);
      showToast("Xato yuz berdi");
    } finally {
      setIsActionLoading(false);
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
      if (targetStatus === 'done' && !hasAccess) targetStatus = 'review';

      const updates = { status: targetStatus, completed: targetStatus === 'done' };
      const updatedRecord = await TaskService.update(tid, updates);
      await refreshData();

      showToast(targetStatus === 'review' ? "Вазифа текширувга юборилди" : "Ўзгаришлар сақланdi");

      const assigned = users.find(u => String(u.id) === String(updatedRecord.assignedUser));
      if (assigned) TelegramService.sendNotification(updatedRecord, assigned, 'update');
    } catch (err) { 
      console.error("MoveTask xatosi:", err); 
      showToast("Xato yuz berdi");
    } finally {
      setIsActionLoading(false);
    }
  };

  const deleteTask = async (id) => {
    const target = tasks.find(t => String(t.id) === String(id));
    setIsActionLoading(true);
    try {
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
      await TaskService.toggleSubtask(tid, sid);
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
      showToast("Вазифа рад этилdi");
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const addComment = async (tid, txt) => {
    const target = tasks.find(t => String(t.id) === String(tid));
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
        const mappedUser = { ...res, fullName: res.fullname };
        setCurrentUser(mappedUser);
        window.sessionStorage.setItem('taskflow_session', String(res.id));
        await refreshData();
      }
      return res;
    } catch (err) {
        showToast("Username yoki parol xato");
        return null;
    } finally { 
        setIsActionLoading(false); 
    }
  };

  const logout = () => {
    setCurrentUser(null);
    window.sessionStorage.removeItem('taskflow_session');
  };

  return (
    <AppContext.Provider value={{
      currentUser, isAuthLoading, isActionLoading, isSuperAdmin, hasAccess, toast,
      tasks, users, departments, notifications, unreadCount: notifications.filter(n => !n.read).length,
      language, darkMode, t,
      login, logout, refreshData,
      addTask, updateTask, deleteTask, toggleSubtask, addComment, moveTask, approveTask, rejectTask,
      addUser, updateUser, deleteUser, addDepartment, deleteDepartment,
      markNotifRead: (id) => { 
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); 
        NotificationService.markRead(currentUser.id, id); 
      },
      markAllNotifRead: () => { 
        setNotifications(prev => prev.map(n => ({ ...n, read: true }))); 
        NotificationService.markAllRead(currentUser.id); 
      },
      changeLanguage: (l) => { setLanguage(l); StorageService.set('taskflow_lang', l); },
      toggleDarkMode: () => { 
        const m = !darkMode; 
        setDarkMode(m); 
        StorageService.set('taskflow_dark', m); 
        if (m) document.documentElement.classList.add('dark'); 
        else document.documentElement.classList.remove('dark'); 
      },
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);