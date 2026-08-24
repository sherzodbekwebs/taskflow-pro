import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Plus, Trash2, Edit, User, Building2, Eye, EyeOff, X, ShieldAlert, Maximize2 } from 'lucide-react';
import star from '../../public/star.png';

// Vakolat yetarli emas modali
function NoPermissionModal({ onClose }) {
  const { t } = useApp();
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in">
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
    const userData = { ...form };
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
  const [zoomImage, setZoomImage] = useState(null);

  const sortedUsers = useMemo(() => {
    const sherzod = users.find(u => u.username === 'sherzod');
    const adminUser = users.find(u => u.username === 'admin' && u.username !== 'sherzod');
    const me = users.find(u => u.id === currentUser?.id && u.username !== 'admin' && u.username !== 'sherzod');
    const others = users.filter(u => u.username !== 'sherzod' && u.username !== 'admin' && u.id !== currentUser?.id);

    const result = [];
    if (sherzod) result.push(sherzod);
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
    if (isSuperAdmin) setDeleteConfirm(user);
    else setShowNoPerm(true);
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
          const isSherzod = user.username === 'sherzod';

          return (
            <div key={user.id} className={`p-6 transition-all bg-white dark:bg-slate-800 rounded-[1.2rem] shadow-sm hover:shadow-md border-none relative group`}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">

                  <div
                    className={`w-20 h-20 rounded-[1.2rem] flex items-center justify-center text-white font-black text-2xl shadow-sm overflow-hidden relative group flex-shrink-0 ${user.avatar ? 'cursor-zoom-in' : ''}`}
                    onClick={() => user.avatar && setZoomImage(user.avatar)}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isSherzod ? 'bg-gradient-to-tr from-indigo-500 to-purple-500' : 'bg-gradient-to-br from-primary-400 to-primary-600'}`}>
                        {initials}
                      </div>
                    )}
                    {user.avatar && (
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 size={24} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight break-words">{name}</p>

                        {/* SHERZOD UCHUN GRADIENTLI MOVIY YULDUZCHA */}
                        {isSherzod && (
                          <div className="flex items-center justify-center w-5 h-5 rounded-md">
                            <img style={{ height: '18px' }} src={star} alt="" />
                          </div>
                        )}

                        {isMe && <span className="text-[9px] font-black bg-[#E8F5FF] text-[#3B82F6] px-2 py-0.5 rounded-md uppercase">ВЫ</span>}
                      </div>
                      <p className="text-sm text-slate-400 font-medium truncate">@{user.username}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(user)} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-300 hover:text-primary-500 transition-colors"><Edit size={16} /></button>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${isSherzod ? 'bg-[#EEF1FF] text-[#5865F2]' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300'}`}>
                  {user.role === 'boss' ? 'BOSS' : 'СОТРУДНИК'}
                </span>
                {user.department && <span className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-[10px] font-black uppercase tracking-tight text-slate-400">SAYT</span>}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-6 border-t border-slate-50 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-lg font-black text-slate-900 dark:text-white">{stats.total}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ЗАДАЧИ</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-green-500">{stats.completed}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ГОТОВО</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-orange-500">{stats.pending}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ОСТАЛОСЬ</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {zoomImage && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-10 animate-fade-in" onClick={() => setZoomImage(null)}>
          <button className="absolute top-8 right-8 text-white hover:rotate-90 transition-all"><X size={32} /></button>
          <img src={zoomImage} className="max-w-full max-h-full rounded-2xl shadow-2xl" alt="zoom" />
        </div>
      )}

      {showModal && <UserModal user={editUser} onClose={() => { setShowModal(false); setEditUser(null); }} />}
      {showNoPerm && <NoPermissionModal onClose={() => setShowNoPerm(false)} />}

      <style dangerouslySetInnerHTML={{
        __html: `
        .card:hover { border-color: transparent !important; }
      `}} />
    </div>
  );
}