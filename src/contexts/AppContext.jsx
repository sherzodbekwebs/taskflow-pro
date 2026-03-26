import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import TaskService from '../services/taskService';
import UserService from '../services/userService';
import NotificationService from '../services/notificationService';
import StorageService from '../services/storageService';
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

  const isSuperAdmin = currentUser?.username === 'admin' || currentUser?.username === 'sherzod';
  const hasAccess = isSuperAdmin || currentUser?.has_admin_access === true;

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
      const sessionUserId = StorageService.get('taskflow_session');
      if (sessionUserId) {
        const myNotifs = await NotificationService.getByUser(sessionUserId);
        setNotifications(myNotifs);
      }
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xato:", err);
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsAuthLoading(true);
        const savedLang = StorageService.get('taskflow_lang') || 'uz';
        const savedDark = StorageService.get('taskflow_dark') || false;
        const savedUserId = StorageService.get('taskflow_session');
        setLanguage(savedLang);
        setDarkMode(savedDark);
        if (savedDark) document.documentElement.classList.add('dark');
        if (savedUserId) {
          const allUsers = await UserService.getAll();
          const user = allUsers.find(u => u.id === savedUserId);
          if (user) setCurrentUser(user);
        }
        await refreshData();
      } catch (err) {
        console.error("Initsializatsiya xatosi:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    initApp();
  }, []);

  const notifyAll = async (title, message, type, icon) => {
    const allUsersList = await UserService.getAll();
    const allIds = allUsersList.map(u => u.id);
    await NotificationService.add({ title, message, type, icon }, allIds);
    await refreshData();
  };

  const login = async (username, password) => {
    setIsActionLoading(true);
    try {
      const user = await UserService.getByCredentials(username, password);
      if (user) {
        setCurrentUser(user);
        StorageService.set('taskflow_session', user.id);
        await refreshData();
        return user;
      }
      return null;
    } finally { setIsActionLoading(false); }
  };

  const logout = () => {
    setCurrentUser(null);
    StorageService.remove('taskflow_session');
  };

  const addTask = async (taskData) => {
    setIsActionLoading(true);
    try {
      const newTask = await TaskService.add(taskData);
      await notifyAll("Yangi vazifa", `"${newTask.title}" qo'shildi`, 'task_added', 'plus');
      showToast("Vazifa muvaffaqiyatli yaratildi");
      return newTask;
    } finally { setIsActionLoading(false); }
  };

  const updateTask = async (id, updates) => {
    setIsActionLoading(true);
    try {
      const updated = await TaskService.update(id, updates);
      await notifyAll("Vazifa yangilandi", `"${updated.title}" tahrirlandi`, 'task_updated', 'edit');
      showToast("O'zgarishlar muvaffaqiyatli saqlandi");
      return updated;
    } finally { setIsActionLoading(false); }
  };

  const deleteTask = async (id) => {
    setIsActionLoading(true);
    try {
      const taskToDelete = tasks.find(t => t.id === id);
      if (taskToDelete?.files?.length > 0) {
        await TaskService.deleteStorageFiles(taskToDelete.files.map(f => f.url));
      }
      await TaskService.delete(id);
      await notifyAll("Vazifa o'chirildi", `"${taskToDelete?.title}" o'chirildi`, 'task_deleted', 'trash');
      showToast("Vazifa va unga tegishli fayllar o'chirildi");
    } finally { setIsActionLoading(false); }
  };

  const moveTask = async (taskId, newStatus) => {
    setIsActionLoading(true);
    try {
      await TaskService.update(taskId, { status: newStatus, completed: newStatus === 'done' });
      await refreshData();
      showToast("Vazifa holati yangilandi");
    } finally { setIsActionLoading(false); }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    setIsActionLoading(true);
    try { await TaskService.toggleSubtask(taskId, subtaskId); await refreshData(); } finally { setIsActionLoading(false); }
  };

  const addComment = async (taskId, commentText) => {
    setIsActionLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      const newComment = { id: `c-${Date.now()}`, text: commentText, userId: currentUser?.id, userName: currentUser?.fullName || currentUser?.fullname, createdAt: new Date().toISOString() };
      const updatedComments = [...(task.comments || []), newComment];
      await TaskService.update(taskId, { comments: updatedComments });
      await refreshData();
      showToast("Izoh qo'shildi");
    } finally { setIsActionLoading(false); }
  };

  const addUser = async (userData) => {
    setIsActionLoading(true);
    try {
      const newUser = await UserService.add(userData);
      await notifyAll("Yangi xodim", `${newUser.fullName || newUser.fullname} qo'shildi`, 'user_added', 'user-plus');
      showToast("Yangi xodim qo'shildi");
      return newUser;
    } finally { setIsActionLoading(false); }
  };

  const updateUser = async (id, updates) => {
    setIsActionLoading(true);
    try {
      const updated = await UserService.update(id, updates);
      await refreshData();
      if (currentUser?.id === id) setCurrentUser(updated);
      showToast("Ma'lumotlar yangilandi");
      return updated;
    } finally { setIsActionLoading(false); }
  };

  const deleteUser = async (id) => {
    setIsActionLoading(true);
    try {
      const user = users.find(u => u.id === id);
      await UserService.delete(id);
      await notifyAll("Xodim o'chirildi", `${user?.fullName || user?.fullname} o'chirildi`, 'user_deleted', 'user-minus');
      showToast("Xodim tizimdan o'chirildi");
    } finally { setIsActionLoading(false); }
  };

  const addDepartment = async (name) => {
    setIsActionLoading(true);
    try { await UserService.addDepartment(name); await notifyAll("Yangi bo'lim", `"${name}" qo'shildi`, 'dept_added', 'folder-plus'); await refreshData(); showToast("Yo'nalish qo'shildi"); } finally { setIsActionLoading(false); }
  };

  const deleteDepartment = async (name) => {
    setIsActionLoading(true);
    try { await UserService.deleteDepartment(name); await notifyAll("Bo'lim o'chirildi", `"${name}" olib tashlandi`, 'dept_deleted', 'trash'); await refreshData(); showToast("Yo'nalish olib tashlandi"); } finally { setIsActionLoading(false); }
  };

  const markNotifRead = async (id) => { if (!currentUser) return; await NotificationService.markRead(currentUser.id, id); await refreshData(); };
  const markAllNotifRead = async () => { if (!currentUser) return; await NotificationService.markAllRead(currentUser.id); await refreshData(); };
  const changeLanguage = (lang) => { setLanguage(lang); StorageService.set('taskflow_lang', lang); };
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    StorageService.set('taskflow_dark', newMode);
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <AppContext.Provider value={{
      currentUser, isAuthLoading, isActionLoading, isSuperAdmin, hasAccess, toast,
      tasks, users, departments, notifications, unreadCount: notifications.filter(n => !n.read).length,
      language, darkMode, t,
      login, logout, addTask, updateTask, deleteTask, toggleSubtask, addComment, moveTask,
      addUser, updateUser, deleteUser, addDepartment, deleteDepartment, markNotifRead, markAllNotifRead,
      changeLanguage, toggleDarkMode, refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);