import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Plus, Trash2, Sun, Moon, Users, FolderOpen, Shield, 
  MoreVertical, ShieldCheck, X, ShieldAlert, ShieldOff, UserCheck, Loader2 
} from 'lucide-react';

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
          {t.noPermissionDesc || "Ushbu ma'muriy amalni bajarish uchun faqat asosiy tizim ma'murlarida ruxsat mavjud."}
        </p>
        <button onClick={onClose} className="btn-primary w-full py-3 font-bold uppercase text-xs">{t.understand || "Tushunarli"}</button>
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
    <div className="space-y-6 max-w-full relative animate-fade-in pb-10">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.settings}</h1>
        {isActionLoading && <Loader2 className="animate-spin text-primary-500" size={20} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* CHAP USTUN */}
        <div className="space-y-6">
          <div className="card p-6 space-y-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-none">
            <h2 className="text-base font-semibold dark:text-white flex items-center gap-2"><Shield size={18} className="text-primary-500" /> {t.appearanceSettings || "Ko'rinish sozlamalari"}</h2>
            <div className="flex items-center justify-between py-2">
              <div><p className="font-medium dark:text-slate-200">{t.systemLanguage || "Tizim tili"}</p></div>
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 border border-slate-200 dark:border-slate-600">
                {['uz', 'ru'].map(lang => (
                 <button 
                  key={lang} 
                  onClick={() => changeLanguage(lang)} 
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    language === lang 
                      ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-500'
                  }`}
                >
                  <img 
                    src={`https://flagcdn.com/w40/${lang === 'uz' ? 'uz' : 'ru'}.png`} 
                    alt={lang} 
                    className="w-5 h-auto rounded-sm shadow-sm object-cover"
                  />
                  <span>{lang === 'uz' ? 'УЗ' : 'RU'}</span>
                </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-t dark:border-slate-700">
              <div><p className="font-medium dark:text-slate-200">{t.theme}</p></div>
              <button onClick={toggleDarkMode} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-all">
                {darkMode ? <Sun size={16} /> : <Moon size={16} />} {darkMode ? t.lightMode : t.darkMode}
              </button>
            </div>
          </div>

          <div className="card p-6 border-slate-200 dark:border-slate-700 rounded-[0.7rem] bg-white dark:bg-slate-800 shadow-none">
            <h2 className="text-base font-semibold dark:text-white flex items-center gap-2 mb-4"><FolderOpen size={18} className="text-primary-500" /> {t.manageDepartments}</h2>
            <form onSubmit={handleAddDept} className="flex gap-3 mb-4">
              <input className="input flex-1 h-11 rounded-xl" value={newDept} onChange={e => setNewDept(e.target.value)} placeholder={t.departmentNamePlaceholder || "Yangi bo'lim nomi..."} />
              <button type="submit" className="btn-primary flex-shrink-0 px-6 font-bold">{t.add}</button>
            </form>
            <div className="space-y-2">
              {departments.map(dept => (
                <div key={dept} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 group border border-transparent hover:border-slate-200 transition-all">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{dept}</span>
                  <button onClick={() => setDeleteDeptConfirm(dept)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* O'NG USTUN - Foydalanuvchilarni boshqarish */}
        <div className="card p-6 border-slate-200 dark:border-slate-700 rounded-[0.7rem] bg-white dark:bg-slate-800 flex flex-col h-full shadow-none">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h2 className="text-base font-semibold dark:text-white flex items-center gap-2">
              <Users size={18} className="text-primary-500" /> {t.manageUsers}
            </h2>
            <button onClick={() => isSuperAdmin ? setShowAddUser(!showAddUser) : setShowNoPerm(true)} className="btn-primary h-10 px-4 rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary-500/20">
              <Plus size={16} /> {t.add}
            </button>
          </div>

          {showAddUser && (
            <div className="flex-shrink-0 mb-6 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 animate-slide-up">
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input className="input h-11 text-sm rounded-2xl bg-white dark:bg-slate-800" placeholder={t.fullName} required value={userForm.fullName} onChange={e => setUserForm(f => ({ ...f, fullName: e.target.value }))} />
                  <input className="input h-11 text-sm rounded-2xl bg-white dark:bg-slate-800" placeholder={t.username} required value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))} />
                  <input className="input h-11 text-sm rounded-2xl bg-white dark:bg-slate-800" type="password" placeholder={t.password} required value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} />
                  <select className="input h-11 text-sm rounded-2xl bg-white dark:bg-slate-800" value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="worker">{t.worker}</option><option value="boss">{t.boss}</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAddUser(false)} className="btn-secondary flex-1 py-3 rounded-2xl">{t.cancel}</button>
                  <button type="submit" className="btn-primary flex-1 py-3 rounded-2xl font-bold">{t.save}</button>
                </div>
              </form>
            </div>
          )}

          {/* Ichki scroll olib tashlandi, kontent bilan birga o'sadi */}
          <div className="space-y-3">
            {sortedUsers.map((user, index) => {
              const isMe = user.id === currentUser?.id;
              const name = user.fullName || user.fullname || user.username;
              const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const hasAccess = user.has_admin_access === true;
              const isPermanentAdmin = user.username === 'admin' || user.username === 'sherzod';
              const isLastItems = index >= sortedUsers.length - 2 && sortedUsers.length > 3;

              return (
                <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${hasAccess ? 'bg-primary-50/30 border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex items-center gap-4 truncate">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0">{initials}</div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold dark:text-white truncate">{name}</p>
                        {isMe && <span className="text-[9px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded uppercase font-black">{t.you || "Siz"}</span>}
                        {(hasAccess || isPermanentAdmin) && user.username !== 'sherzod' && <ShieldCheck size={14} className="text-primary-500" />}
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">@{user.username} · {user.role === 'boss' ? t.boss : t.worker}</p>
                    </div>
                  </div>

                  {!isMe && (
                    <div className="relative">
                      <button onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"><MoreVertical size={18} /></button>
                      
                      {openMenuId === user.id && (
                        <div ref={menuRef} className={`absolute right-0 ${isLastItems ? 'bottom-full mb-2' : 'top-full mt-2'} w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-[100] overflow-hidden animate-in fade-in zoom-in duration-200`}>
                           <div className="p-1.5 flex flex-col gap-1">
                              {isSuperAdmin && !isPermanentAdmin ? (
                                <>
                                  <button onClick={() => toggleAdminAccess(user)} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-left ${hasAccess ? 'text-red-500 hover:bg-red-50' : 'text-primary-600 hover:bg-primary-50'}`}>
                                    {hasAccess ? <><ShieldOff size={16}/> {t.revokeAdmin || "Huquqni bekor qilish"}</> : <><UserCheck size={16}/> {t.promoteToAdmin || "Boshqaruv huquqi berish"}</>}
                                  </button>
                                  <button onClick={() => { setDeleteUserConfirm(user); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all text-left">
                                    <Trash2 size={16} /> {t.deleteUser || "Foydalanuvchini o'chirish"}
                                  </button>
                                </>
                              ) : (
                                <div className="p-4 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed italic">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-slate-100">
            <Trash2 size={32} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold dark:text-white mb-2">{t.deleteDepartment}</h3>
            <p className="text-sm text-slate-500 mb-8 italic">{t.areYouSure || "Ishonchingiz komilmi?"}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteDeptConfirm(null)} className="btn-secondary flex-1 py-3">{t.cancel}</button>
              <button onClick={() => { deleteDepartment(deleteDeptConfirm); setDeleteDeptConfirm(null); }} className="btn-danger flex-1 py-3 font-bold">{t.delete}</button>
            </div>
          </div>
        </div>
      )}

      {deleteUserConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100">
            <Trash2 size={32} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold dark:text-white mb-2">{t.deleteUser}</h3>
            <p className="text-sm text-slate-500 mb-8 italic">"{deleteUserConfirm.fullName || deleteUserConfirm.fullname}" {t.areYouSure || "ni o'chirishni tasdiqlaysizmi?"}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteUserConfirm(null)} className="btn-secondary flex-1 py-3">{t.cancel}</button>
              <button onClick={() => { deleteUser(deleteUserConfirm.id); setDeleteUserConfirm(null); }} className="btn-danger flex-1 py-3 font-bold">{t.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}