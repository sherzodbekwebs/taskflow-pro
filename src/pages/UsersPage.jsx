import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Plus, Edit, Building2, Eye, EyeOff, X, 
  ShieldAlert, Maximize2, Search, CheckCircle2, Clock
} from 'lucide-react';
import star from '../../public/star.png';

// Vakolat yetarli emas modali
function NoPermissionModal({ onClose }) {
  const { t } = useApp();
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 max-w-sm w-full shadow-2xl text-center border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-900/40">
          <ShieldAlert size={28} />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">{t.noPermissionTitle || "Vakolat yetarli emas"}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {t.noPermissionDesc || "Ushbu amalni faqat tizim ma'murlari bajarishi mumkin."}
        </p>
        <button onClick={onClose} className="btn-primary w-full py-2.5 text-xs font-bold">{t.understand || "Tushunarli"}</button>
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{isEdit ? (t.editUser || "Xodim ma'lumotlarini tahrirlash") : (t.addUser || "Yangi xodim qo'shish")}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">{t.fullName || "F.I.SH."} *</label>
            <input className="input h-10 text-xs font-medium" value={form.fullName} onChange={e => set('fullName', e.target.value)} required placeholder="Sherzodbek Mahmudov" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">{t.username || "Login"} *</label>
            <input className="input h-10 text-xs font-medium" value={form.username} onChange={e => set('username', e.target.value)} required placeholder="sherzod" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {t.password || "Parol"} {isEdit && <span className="text-slate-400 font-normal">({t.leaveBlankToKeep || "o'zgartirish shart emas"})</span>}
            </label>
            <div className="relative">
              <input
                className="input h-10 text-xs font-medium pr-10"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required={!isEdit}
                placeholder={isEdit ? '••••••' : 'Parol kiriting'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">{t.role || "Roli"}</label>
              <select className="input h-10 text-xs font-medium" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="boss">{t.boss || "Boshqaruvchi"}</option>
                <option value="worker">{t.worker || "Xodim"}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">{t.department || "Bo'lim"}</label>
              <select className="input h-10 text-xs font-medium" value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">—</option>
                {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2 text-xs font-semibold">{t.cancel || "Bekor qilish"}</button>
            <button type="submit" className="btn-primary flex-1 py-2 text-xs font-bold">{t.save || "Saqlash"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { users, tasks, t, currentUser, isSuperAdmin, departments } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showNoPerm, setShowNoPerm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

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

  const filteredUsers = useMemo(() => {
    return sortedUsers.filter(u => {
      const name = (u.fullName || u.fullname || u.username || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || name.includes(query) || username.includes(query);
      const matchesDept = departmentFilter === 'all' || u.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [sortedUsers, searchQuery, departmentFilter]);

  const getUserStats = (userId) => {
    const userTasks = tasks.filter(t => String(t.assignedUser) === String(userId));
    const completed = userTasks.filter(t => t.status === 'done').length;
    const pending = userTasks.filter(t => t.status !== 'done').length;
    const rate = userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0;
    return { total: userTasks.length, completed, pending, rate };
  };

  const handleEdit = (user) => {
    if (isSuperAdmin || user.id === currentUser?.id) {
      setEditUser(user);
      setShowModal(true);
    } else {
      setShowNoPerm(true);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.users || "Foydalanuvchilar"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.totalUsersLabel || "Jami xodimlar"}: <span className="font-bold text-slate-800 dark:text-slate-200">{users.length} nafar</span>
          </p>
        </div>
        <button
          onClick={() => isSuperAdmin ? setShowModal(true) : setShowNoPerm(true)}
          className="btn-primary"
        >
          <Plus size={16} /> <span>{t.addUser || "Xodim qo'shish"}</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="card p-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input pl-9 h-9.5 text-xs font-medium"
            placeholder={t.searchUser || "Ism yoki login bo'yicha izlash..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <select 
            className="input h-9.5 text-xs font-medium"
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
          >
            <option value="all">Barcha bo'limlar</option>
            {departments?.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => {
          const stats = getUserStats(user.id);
          const name = user.fullName || user.fullname || user.username || 'Xodim';
          const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          const isMe = user.id === currentUser?.id;
          const isSherzod = user.username === 'sherzod';

          return (
            <div key={user.id} className="card p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-2xs overflow-hidden relative shrink-0 border border-slate-200/60 dark:border-slate-700 ${user.avatar ? 'cursor-zoom-in' : ''}`}
                      onClick={() => user.avatar && setZoomImage(user.avatar)}
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center font-extrabold ${isSherzod ? 'bg-indigo-600' : 'bg-primary-600'}`}>
                          {initials}
                        </div>
                      )}
                      {user.avatar && (
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 size={16} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug truncate">{name}</p>
                        {isSherzod && (
                          <img style={{ height: '16px' }} src={star} alt="Star" title="Boshqaruvchi" />
                        )}
                        {isMe && (
                          <span className="text-[10px] font-bold bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 px-1.5 py-0.2 rounded border border-primary-200/60">
                            Siz
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium truncate">@{user.username}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleEdit(user)} 
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600 transition-colors shrink-0"
                    title={t.edit || "Tahrirlash"}
                  >
                    <Edit size={15} />
                  </button>
                </div>

                {/* Role and Department Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'boss' 
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {user.role === 'boss' ? (t.boss || 'BOSS') : (t.worker || 'XODIM')}
                  </span>
                  {user.department && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Building2 size={11} className="text-slate-400" />
                      <span>{user.department}</span>
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-[11px] font-semibold mb-1">
                    <span className="text-slate-500 dark:text-slate-400">Samaradorlik</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{stats.rate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${stats.rate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Task statistics */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
                <div className="p-1.5 rounded-lg bg-slate-50/80 dark:bg-slate-900/40">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{stats.total}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jami</p>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20">
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bajarildi</p>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                  <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Qoldi</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {zoomImage && (
        <div className="fixed inset-0 bg-slate-950/90 z-[200] flex items-center justify-center p-6 animate-fade-in" onClick={() => setZoomImage(null)}>
          <button className="absolute top-6 right-6 text-white/80 hover:text-white p-2 transition-colors"><X size={28} /></button>
          <img src={zoomImage} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" alt="zoom" />
        </div>
      )}

      {showModal && <UserModal user={editUser} onClose={() => { setShowModal(false); setEditUser(null); }} />}
      {showNoPerm && <NoPermissionModal onClose={() => setShowNoPerm(false)} />}
    </div>
  );
}