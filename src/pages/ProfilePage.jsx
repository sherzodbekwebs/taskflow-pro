import { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Camera, Save, CheckSquare, Clock, User, Building2, X, Maximize2, Trash2, AlertTriangle } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateUser, tasks, t } = useApp();
  const fileRef = useRef();

  const [form, setForm] = useState({
    fullName: currentUser?.fullName || currentUser?.fullname || '',
    bio: currentUser?.bio || '',
    department: currentUser?.department || '',
  });
  const [saved, setSaved] = useState(false);
  const [showImageFull, setShowImageFull] = useState(false); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // O'chirish modali uchun state

  const myTasks = tasks.filter(t => t.assignedUser === currentUser?.id);
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

  // Haqiqiy o'chirish funksiyasi
  const confirmDeleteAvatar = () => {
    updateUser(currentUser.id, { avatar: null });
    setShowDeleteConfirm(false);
  };

  const initials = (currentUser?.fullName || currentUser?.fullname || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="w-full space-y-6"> 
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.profileTitle}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CHAP TOMON: Profil va Statistika */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative flex-shrink-0 group mx-auto sm:mx-0">
                <div 
                  className="cursor-zoom-in relative overflow-hidden rounded-3xl shadow-lg"
                  onClick={() => setShowImageFull(true)}
                >
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="" className="w-32 h-32 object-cover transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold transition-transform duration-300 group-hover:scale-110">
                      {initials}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 size={24} />
                  </div>
                </div>
                
                {/* Rasm o'chirish tugmasi (faqat rasm bo'lsa chiqadi) */}
                {currentUser?.avatar && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-800 transition-colors z-10"
                    title="Rasmni o'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-500 hover:bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white dark:border-slate-800 transition-colors z-10"
                  title={t.uploadPhoto}
                >
                  <Camera size={16} />
                </button>
                <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="label">{t.fullName}</label>
                  <input
                    className="input w-full"
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">{t.bio}</label>
                  <textarea
                    className="input w-full resize-none"
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="O'zingiz haqingizda yozing..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${
                currentUser?.role === 'boss'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                <User size={14} />
                {currentUser?.role === 'boss' ? t.boss : t.worker}
              </span>
              {currentUser?.department && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                  <Building2 size={14} />
                  {currentUser.department}
                </span>
              )}
              <span className="text-xs text-slate-400 ml-auto">@{currentUser?.username}</span>
            </div>

            <button
              onClick={handleSave}
              className={`mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20'
              }`}
            >
              <Save size={16} />
              {saved ? '✓ Saqlandi!' : t.save}
            </button>
          </div>

          {/* Stats Card */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Mening statistikam</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{myTasks.length}</p>
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold">{t.totalTasks}</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl">
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{done}</p>
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold">{t.completedTasks}</p>
              </div>
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl">
                <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">{inProgress}</p>
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold">{t.inProgressTasks}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{t.completionRate}</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{rate}%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* O'NG TOMON: So'nggi vazifalar */}
        <div className="lg:col-span-5 h-full">
          <div className="card p-6 h-full min-h-[400px]">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
              <span>So'nggi vazifalarim</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-slate-500">{myTasks.length} ta</span>
            </h2>
            <div className="space-y-3">
              {myTasks.length > 0 ? (
                myTasks.slice(0, 8).map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      task.status === 'done' ? 'bg-green-500' :
                      task.status === 'progress' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'
                    }`} />
                    <span className={`text-sm font-medium flex-1 ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {task.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-tight ${
                      task.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {t[{ low: 'priorityLow', medium: 'priorityMedium', high: 'priorityHigh' }[task.priority]]}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <CheckSquare size={48} className="opacity-20 mb-2" />
                  <p className="text-sm italic">Hali vazifalar biriktirilmagan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1. RASM O'CHIRISHNI TASDIQLASH MODALI (Kichkina modal) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center border border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-800">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Rasmni o'chirish?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Profil rasmingizni butunlay olib tashlashni xohlaysizmi?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="btn-secondary flex-1 py-2 text-xs"
              >
                Bekor qilish
              </button>
              <button 
                onClick={confirmDeleteAvatar} 
                className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex-1 py-2 text-xs shadow-lg shadow-red-500/20 transition-all"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. IMAGE FULLSCREEN PREVIEW */}
      {showImageFull && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowImageFull(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-full transition-all"
            onClick={() => setShowImageFull(false)}
          >
            <X size={32} />
          </button>
          
          <div className="max-w-4xl w-full flex items-center justify-center animate-scale-in" onClick={e => e.stopPropagation()}>
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Full profile" className="max-h-[85vh] rounded-[40px] shadow-2xl border-4 border-white/10" />
            ) : (
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-[60px] bg-primary-600 flex items-center justify-center text-white text-9xl font-black shadow-2xl">
                {initials}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}