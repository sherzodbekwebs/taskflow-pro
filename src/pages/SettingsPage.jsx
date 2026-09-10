import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Plus, Trash2, Sun, Moon, Users, FolderOpen, Shield, 
  MoreVertical, ShieldCheck, X, ShieldAlert, ShieldOff, UserCheck, Loader2 
} from 'lucide-react';

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
          {t.noPermissionDesc || "Ushbu ma'muriy amalni bajarish uchun faqat asosiy tizim ma'murlarida ruxsat mavjud."}
        </p>
        <button onClick={onClose} className="btn-primary w-full py-2.5 text-xs font-bold">{t.understand || "Tushunarli"}</button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { 
    departments, addDepartment, deleteDepartment, 
    users, addUser, deleteUser, updateUser, 
    darkMode, toggleDarkMode, language, changeLanguage, 
    t, currentUser, isSuperAdmin, isActionLoading 
  } = useApp();

  const [newDept, setNewDept] = useState('');
  const [deleteDeptConfirm, setDeleteDeptConfirm] = useState(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showNoPerm, setShowNoPerm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [userForm, setUserForm] = useState({ fullName: '', username: '', password: '', role: 'worker', department: '' });

  const menuRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const handleAddDept = (e) => {
    e.preventDefault();
    if (newDept.trim()) { addDepartment(newDept.trim()); setNewDept(''); }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return setShowNoPerm(true);
    addUser(userForm);
    setUserForm({ fullName: '', username: '', password: '', role: 'worker', department: '' });
    setShowAddUser(false);
  };

  const toggleAdminAccess = async (user) => {
    if (!isSuperAdmin) return setShowNoPerm(true);
    const currentAccess = user.has_admin_access === true;
    await updateUser(user.id, { has_admin_access: !currentAccess });
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t.settings}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tizim parametrlari, tashkiliy tuzilma va huquqlarni boshqarish</p>
        </div>
        {isActionLoading && <Loader2 className="animate-spin text-primary-600" size={20} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* CHAP USTUN */}
        <div className="space-y-6">
          {/* Ko'rinish sozlamalari */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield size={16} className="text-primary-600" /> 
              <span>{t.appearanceSettings || "Ko'rinish sozlamalari"}</span>
            </h2>
            
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.systemLanguage || "Tizim tili"}</p>
                <p className="text-[11px] text-slate-400">Interfeys uchun asosiy til</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/60">
                {['uz', 'ru'].map(lang => (
                 <button 
                  key={lang} 
                  onClick={() => changeLanguage(lang)} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    language === lang 
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-2xs' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <img 
                    src={`https://flagcdn.com/w40/${lang === 'uz' ? 'uz' : 'ru'}.png`} 
                    alt={lang} 
                    className="w-4 h-auto rounded-xs shadow-2xs object-cover"
                  />
                  <span>{lang === 'uz' ? "O'zbekcha" : "Русский"}</span>
                </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.theme || "Mavzu"}</p>
                <p className="text-[11px] text-slate-400">Yorug' yoki qorong'i dizayn rejimi</p>
              </div>
              <button 
                onClick={toggleDarkMode} 
                className="btn-secondary py-2 px-3 text-xs font-bold"
              >
                {darkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-indigo-500" />} 
                <span>{darkMode ? (t.lightMode || "Yorug' rejim") : (t.darkMode || "Tungi rejim")}</span>
              </button>
            </div>
          </div>

          {/* Bo'limlar boshqaruvi */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderOpen size={16} className="text-primary-600" /> 
              <span>{t.manageDepartments || "Bo'limlarni boshqarish"}</span>
            </h2>
            
            <form onSubmit={handleAddDept} className="flex gap-2">
              <input 
                className="input flex-1 h-9.5 text-xs font-medium" 
                value={newDept} 
                onChange={e => setNewDept(e.target.value)} 
                placeholder={t.departmentNamePlaceholder || "Yangi bo'lim nomi..."} 
              />
              <button type="submit" className="btn-primary flex-shrink-0 h-9.5 px-4 text-xs font-bold">
                <Plus size={15} /> <span>{t.add || "Qo'shish"}</span>
              </button>
            </form>

            <div className="space-y-1.5 pt-2">
              {departments.map(dept => (
                <div key={dept} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 transition-all">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{dept}</span>
                  <button 
                    onClick={() => setDeleteDeptConfirm(dept)} 
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                    title="O'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* O'NG USTUN - Foydalanuvchilarni boshqarish */}
        <div className="card p-5 flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={16} className="text-primary-600" /> 
              <span>{t.manageUsers || "Foydalanuvchilar va huquqlar"}</span>
            </h2>
            <button 
              onClick={() => isSuperAdmin ? setShowAddUser(!showAddUser) : setShowNoPerm(true)} 
              className="btn-primary py-1.5 px-3 text-xs font-bold"
            >
              <Plus size={15} /> <span>{t.add || "Qo'shish"}</span>
            </button>
          </div>

          {showAddUser && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
              <form onSubmit={handleAddUser} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input className="input h-9.5 text-xs" placeholder={t.fullName || "F.I.SH."} required value={userForm.fullName} onChange={e => setUserForm(f => ({ ...f, fullName: e.target.value }))} />
                  <input className="input h-9.5 text-xs" placeholder={t.username || "Login"} required value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))} />
                  <input className="input h-9.5 text-xs" type="password" placeholder={t.password || "Parol"} required value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} />
                  <select className="input h-9.5 text-xs" value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="worker">{t.worker || "Xodim"}</option>
                    <option value="boss">{t.boss || "Boshqaruvchi"}</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddUser(false)} className="btn-secondary flex-1 py-2 text-xs font-semibold">{t.cancel || "Bekor qilish"}</button>
                  <button type="submit" className="btn-primary flex-1 py-2 text-xs font-bold">{t.save || "Saqlash"}</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-2">
            {sortedUsers.map((user, index) => {
              const isMe = user.id === currentUser?.id;
              const name = user.fullName || user.fullname || user.username;
              const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const hasAccess = user.has_admin_access === true;
              const isPermanentAdmin = user.username === 'admin' || user.username === 'sherzod';
              const isLastItems = index >= sortedUsers.length - 2 && sortedUsers.length > 3;

              return (
                <div key={user.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  hasAccess 
                    ? 'bg-primary-50/40 border-primary-200/70 dark:bg-primary-950/20 dark:border-primary-900/40' 
                    : 'bg-white dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800'
                }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{name}</p>
                        {isMe && (
                          <span className="text-[9px] bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 px-1.5 py-0.2 rounded font-bold">
                            {t.you || "Siz"}
                          </span>
                        )}
                        {(hasAccess || isPermanentAdmin) && user.username !== 'sherzod' && (
                          <ShieldCheck size={13} className="text-primary-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        @{user.username} · {user.role === 'boss' ? (t.boss || 'Boss') : (t.worker || 'Xodim')}
                      </p>
                    </div>
                  </div>

                  {!isMe && (
                    <div className="relative shrink-0">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {openMenuId === user.id && (
                        <div ref={menuRef} className={`absolute right-0 ${isLastItems ? 'bottom-full mb-2' : 'top-full mt-2'} w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-[100] overflow-hidden animate-in fade-in zoom-in duration-150`}>
                           <div className="p-1.5 flex flex-col gap-1">
                              {isSuperAdmin && !isPermanentAdmin ? (
                                <>
                                  <button onClick={() => toggleAdminAccess(user)} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${hasAccess ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30' : 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30'}`}>
                                    {hasAccess ? <><ShieldOff size={15}/> <span>{t.revokeAdmin || "Huquqni bekor qilish"}</span></> : <><UserCheck size={15}/> <span>{t.promoteToAdmin || "Boshqaruv huquqi berish"}</span></>}
                                  </button>
                                  <button onClick={() => { setDeleteUserConfirm(user); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all text-left">
                                    <Trash2 size={15} /> <span>{t.deleteUser || "Foydalanuvchini o'chirish"}</span>
                                  </button>
                                </>
                              ) : (
                                <div className="p-3 text-[11px] font-semibold text-slate-400 text-center">
                                  {isPermanentAdmin ? (t.permanentAdminUntouchable || "Asosiy ma'mur daxlsiz") : (t.noActionPermission || "Amalga ruxsat yo'q")}
                                </div>
                              )}
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showNoPerm && <NoPermissionModal onClose={() => setShowNoPerm(false)} />}
      
      {deleteDeptConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteDeptConfirm(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">{t.deleteDepartment || "Bo'limni o'chirish"}</h3>
            <p className="text-xs text-slate-500 mb-6">"{deleteDeptConfirm}" bo'limini o'chirishni tasdiqlaysizmi?</p>
            <div className="flex gap-2.5">
              <button onClick={() => setDeleteDeptConfirm(null)} className="btn-secondary flex-1 py-2 text-xs font-semibold">{t.cancel || "Bekor qilish"}</button>
              <button onClick={() => { deleteDepartment(deleteDeptConfirm); setDeleteDeptConfirm(null); }} className="btn-danger flex-1 py-2 text-xs font-bold">{t.delete || "O'chirish"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteUserConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteUserConfirm(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">{t.deleteUser || "Foydalanuvchini o'chirish"}</h3>
            <p className="text-xs text-slate-500 mb-6">"{deleteUserConfirm.fullName || deleteUserConfirm.fullname}" ni o'chirishni tasdiqlaysizmi?</p>
            <div className="flex gap-2.5">
              <button onClick={() => setDeleteUserConfirm(null)} className="btn-secondary flex-1 py-2 text-xs font-semibold">{t.cancel || "Bekor qilish"}</button>
              <button onClick={() => { deleteUser(deleteUserConfirm.id); setDeleteUserConfirm(null); }} className="btn-danger flex-1 py-2 text-xs font-bold">{t.delete || "O'chirish"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}