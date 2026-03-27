import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Plus, Trash2, Edit, User, Building2, Eye, EyeOff, X, ShieldAlert } from 'lucide-react';

// Vakolat yetarli emas modali
function NoPermissionModal({ onClose }) {
  const { t } = useApp();
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100 dark:border-slate-700">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-xl font-bold dark:text-white mb-2">{t.noPermissionTitle || "Vakolat yetarli emas"}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          {t.noPermissionDesc || "Kechirasiz, ushbu amalni bajarish uchun sizda yetarli ruxsat mavjud emas. Faqat boshqaruvchilar ushbu amalni bajara olishi mumkin."}
        </p>
        <button onClick={onClose} className="btn-primary w-full py-3">{t.understand || "Tushunarli"}</button>
      </div>
    </div>
  );
}

function UserModal({ user, onClose }) {
  const { addUser, updateUser, departments, t } = useApp();
  const isEdit = !!user;
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || user?.fullname || '',
    username: user?.username || '',
    password: '', 
    role: user?.role || 'worker',
    department: user?.department || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form ma'lumotlarini nusxalaymiz
    const userData = { ...form };

    // MUHIM: Tahrirlash paytida parol bo'sh bo'lsa, uni o'chirib tashlaymiz
    // Shunda Supabase eski parolni saqlab qoladi (null yoki bo'sh qator yubormaymiz)
    if (isEdit && (!userData.password || userData.password.trim() === "")) {
      delete userData.password;
    }

    if (isEdit) {
      await updateUser(user.id, userData);
    } else {
      if (!userData.password) { 
        alert(t.passwordRequired || "Yangi xodim uchun parol kiriting!"); 
        return; 
      }
      await addUser(userData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b dark:border-slate-700">
          <h2 className="text-lg font-bold dark:text-white">{isEdit ? t.editUser : t.addUser}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="label">{t.fullName} *</label><input className="input" value={form.fullName} onChange={e => set('fullName', e.target.value)} required /></div>
          <div><label className="label">{t.username} *</label><input className="input" value={form.username} onChange={e => set('username', e.target.value)} required /></div>
          <div>
            <label className="label">{t.password} {isEdit && `(${t.leaveBlankToKeep})`}</label>
            <div className="relative">
              <input 
                className="input pr-10" 
                type={showPassword ? 'text' : 'password'} 
                value={form.password} 
                onChange={e => set('password', e.target.value)} 
                required={!isEdit} 
                placeholder={isEdit ? '••••••' : ''}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">{t.role}</label><select className="input" value={form.role} onChange={e => set('role', e.target.value)}><option value="boss">{t.boss}</option><option value="worker">{t.worker}</option></select></div>
            <div><label className="label">{t.department}</label><select className="input" value={form.department} onChange={e => set('department', e.target.value)}><option value="">—</option>{departments.map((d, i) => <option key={i} value={d}>{d}</option>)}</select></div>
          </div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="btn-secondary flex-1">{t.cancel}</button><button type="submit" className="btn-primary flex-1">{t.save}</button></div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { users, tasks, deleteUser, t, currentUser, isSuperAdmin } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showNoPerm, setShowNoPerm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const sortedUsers = useMemo(() => {
    const adminUser = users.find(u => u.username === 'admin');
    const me = users.find(u => u.id === currentUser?.id && u.username !== 'admin');
    const others = users.filter(u => u.username !== 'admin' && u.id !== currentUser?.id);

    const result = [];
    if (adminUser) result.push(adminUser);
    if (me) result.push(me);
    result.push(...others);

    return result;
  }, [users, currentUser]);

  const getUserStats = (userId) => {
    const userTasks = tasks.filter(t => t.assignedUser === userId);
    const completed = userTasks.filter(t => t.status === 'done').length;
    const pending = userTasks.filter(t => t.status !== 'done').length;
    return { total: userTasks.length, completed, pending };
  };

  const handleEdit = (user) => {
    if (isSuperAdmin || user.id === currentUser?.id) {
      setEditUser(user);
      setShowModal(true);
    } else {
      setShowNoPerm(true);
    }
  };

  const handleDeleteClick = (user) => {
    if (isSuperAdmin) {
      setDeleteConfirm(user);
    } else {
      setShowNoPerm(true);
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser?.id) return;
    await deleteUser(userId);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.users}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.totalUsersLabel || "Jami foydalanuvchilar"}: {users.length}</p>
        </div>
        <button 
          onClick={() => isSuperAdmin ? setShowModal(true) : setShowNoPerm(true)} 
          className="btn-primary"
        >
          <Plus size={18} /> {t.addUser}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {sortedUsers.map(user => {
          const stats = getUserStats(user.id);
          const name = user.fullName || user.fullname || user.username || 'Xodim';
          const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          const isMe = user.id === currentUser?.id;

          return (
            <div key={user.id} className="card p-6 border-transparent hover:border-primary-100 transition-all shadow-none border-slate-200">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-black text-xl shadow-md">{initials}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{name}</p>
                      {isMe && <span className="text-[10px] font-bold bg-primary-100 text-primary-600 dark:bg-primary-900/30 px-2 py-0.5 rounded-full uppercase">{t.you || "Siz"}</span>}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">@{user.username}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(user)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary-500"><Edit size={16} /></button>
                  {!isMe && (
                    <button onClick={() => handleDeleteClick(user)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  {user.role === 'boss' ? t.boss : t.worker}
                </span>
                {user.department && <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-slate-700">{user.department}</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-5 border-t border-slate-50 dark:border-slate-700">
                <div className="text-center"><p className="text-xl font-black dark:text-white">{stats.total}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{t.tasksCount}</p></div>
                <div className="text-center"><p className="text-xl font-black text-green-500">{stats.completed}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{t.completedCount}</p></div>
                <div className="text-center"><p className="text-xl font-black text-amber-500">{stats.pending}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{t.pendingCount}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && <UserModal user={editUser} onClose={() => { setShowModal(false); setEditUser(null); }} />}
      {showNoPerm && <NoPermissionModal onClose={() => setShowNoPerm(false)} />}
      
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-slate-100">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
            <h3 className="text-lg font-bold dark:text-white mb-2">{t.deleteConfirmTitle || "O'chirishni tasdiqlang"}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 italic">"{deleteConfirm.fullName || deleteConfirm.fullname}" {t.deleteConfirmDesc || "tizimdan butunlay o'chiriladi."}</p>
            <div className="flex gap-3"><button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">{t.cancel}</button><button onClick={() => { deleteUser(deleteConfirm.id); setDeleteConfirm(null); }} className="btn-danger flex-1">{t.delete}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}