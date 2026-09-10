import { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Camera, Save, CheckSquare, Clock, User, Building2, X, Maximize2, Trash2, Check, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateUser, tasks, t } = useApp();
  const fileRef = useRef();

  const [form, setForm] = useState({
    fullName: currentUser?.fullName || currentUser?.fullname || '',
    bio: currentUser?.bio || '',
    department: currentUser?.department || '',
    tg_username: currentUser?.tg_username || '',
  });
  const [saved, setSaved] = useState(false);
  const [showImageFull, setShowImageFull] = useState(false); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const myTasks = tasks.filter(t => String(t.assignedUser) === String(currentUser?.id));
  const done = myTasks.filter(t => t.status === 'done').length;
  const inProgress = myTasks.filter(t => t.status === 'progress').length;
  const rate = myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : 0;

  const handleSave = () => {
    updateUser(currentUser.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateUser(currentUser.id, { avatar: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const confirmDeleteAvatar = () => {
    updateUser(currentUser.id, { avatar: null });
    setShowDeleteConfirm(false);
  };

  const initials = (currentUser?.fullName || currentUser?.fullname || currentUser?.username || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto animate-fade-in pb-12"> 
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t.profileTitle || "Foydalanuvchi Profili"}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Shaxsiy ma'lumotlar va shaxsiy statistika ko'rsatkichlari</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CHAP TOMON: Profil va Statistika */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative flex-shrink-0 group mx-auto sm:mx-0">
                <div 
                  className="cursor-zoom-in relative overflow-hidden rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 w-28 h-28"
                  onClick={() => setShowImageFull(true)}
                >
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-3xl font-extrabold">
                      {initials}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 size={20} />
                  </div>
                </div>
                
                {currentUser?.avatar && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center justify-center text-white shadow-sm border-2 border-white dark:border-slate-900 transition-colors z-10"
                    title="Rasmni o'chirish"
                  >
                    <Trash2 size={13} />
                  </button>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center justify-center text-white shadow-sm border-2 border-white dark:border-slate-900 transition-colors z-10"
                  title={t.uploadPhoto || "Rasm yuklash"}
                >
                  <Camera size={14} />
                </button>
                <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
              </div>

              <div className="flex-1 w-full space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">To'liq ism (F.I.O)</label>
                  <input
                    className="input h-9.5 text-xs font-medium w-full"
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    placeholder="Ism familiya"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Telegram @username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">@</span>
                    <input
                      className="input pl-7.5 h-9.5 text-xs font-medium w-full"
                      value={form.tg_username}
                      placeholder="username"
                      onChange={e => setForm(f => ({ ...f, tg_username: e.target.value.replace('@', '') }))}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Yangi vazifalar bo'yicha bildirishnomalar ushbu profilga yo'naltiriladi.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">{t.bio || "O'zingiz haqingizda"}</label>
                  <textarea
                    className="input w-full resize-none text-xs font-medium py-2"
                    rows={2}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Mutaxassislik yoki qisqacha ma'lumot..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                currentUser?.role === 'boss'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                <User size={13} />
                <span>{currentUser?.role === 'boss' ? (t.boss || 'Boshqaruvchi') : (t.worker || 'Xodim')}</span>
              </span>
              {currentUser?.department && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                  <Building2 size={13} className="text-slate-400" />
                  <span>{currentUser.department}</span>
                </span>
              )}
              <span className="text-xs text-slate-400 ml-auto font-medium">@{currentUser?.username}</span>
            </div>

            <button
              onClick={handleSave}
              className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'btn-primary'
              }`}
            >
              {saved ? <Check size={15} /> : <Save size={15} />}
              <span>{saved ? "Saqlandi!" : (t.save || "O'zgarishlarni saqlash")}</span>
            </button>
          </div>

          {/* Stats Card */}
          <div className="card p-6">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Shaxsiy natijadorlik</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{myTasks.length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{t.totalTasks || "Jami vazifalar"}</p>
              </div>
              <div className="text-center p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{done}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{t.completedTasks || "Bajarildi"}</p>
              </div>
              <div className="text-center p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{inProgress}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{t.inProgressTasks || "Jarayonda"}</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-600 dark:text-slate-400">{t.completionRate || "Bajarilish foizi"}</span>
                <span className="text-primary-600 dark:text-primary-400">{rate}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* O'NG TOMON: So'nggi vazifalar */}
        <div className="lg:col-span-5 h-full">
          <div className="card p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">So'nggi vazifalarim</h2>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400 font-bold">{myTasks.length} ta</span>
              </div>
              
              <div className="space-y-2">
                {myTasks.length > 0 ? (
                  myTasks.slice(0, 8).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all bg-slate-50/40 dark:bg-slate-900/30">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        task.status === 'done' ? 'bg-emerald-500' :
                        task.status === 'progress' ? 'bg-amber-500' : 'bg-primary-500'
                      }`} />
                      <span className={`text-xs font-semibold flex-1 truncate ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        task.priority === 'high' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                        task.priority === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {task.priority === 'high' ? 'Yuqori' : task.priority === 'medium' ? "O'rta" : 'Oddiy'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <CheckSquare size={36} className="opacity-30 mb-2" />
                    <p className="text-xs">Hozircha vazifalar biriktirilmagan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rasm o'chirish tasdiqlash */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">Rasmni o'chirish</h3>
            <p className="text-xs text-slate-500 mb-6">Profil rasmingizni butunlay olib tashlamoqchimisiz?</p>
            <div className="flex gap-2.5">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 py-2 text-xs font-semibold">Bekor qilish</button>
              <button onClick={confirmDeleteAvatar} className="btn-danger flex-1 py-2 text-xs font-bold">O'chirish</button>
            </div>
          </div>
        </div>
      )}

      {/* Rasm fullscreen preview */}
      {showImageFull && (
        <div 
          className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setShowImageFull(false)}
        >
          <button className="absolute top-6 right-6 text-white/80 hover:text-white p-2 transition-colors"><X size={28} /></button>
          <div className="max-w-xl w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Full profile" className="max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
            ) : (
              <div className="w-52 h-52 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-7xl font-black shadow-2xl">
                {initials}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}