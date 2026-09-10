import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList
} from 'recharts';
import {
  Star, ListTodo, Crown, Medal, CheckCircle, X
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

export default function StatisticsPage() {
  const { tasks, users, t, language } = useApp();
  const [zoomImage, setZoomImage] = useState(null); // Rasmni kattalashtirish uchun state

  // 1. Reyting bo'yicha Leaderboard
  const ratingLeaderboard = useMemo(() => {
    return users
      .map(u => {
        const ratedTasks = tasks.filter(
          task => String(task.assignedUser) === String(u.id) && task.status === 'done' && Number(task.rating) > 0
        );
        if (ratedTasks.length === 0) return null;
        const avg = ratedTasks.reduce((sum, task) => sum + Number(task.rating), 0) / ratedTasks.length;
        return {
          id: u.id,
          name: u.fullName || u.fullname || u.username || (language === 'uz' ? 'Xodim' : 'Сотрудник'),
          avg: parseFloat(avg.toFixed(1)),
          count: ratedTasks.length,
          avatar: u.avatar,
          username: u.username
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.avg - a.avg);
  }, [tasks, users, language]);

  // 2. Vazifalar soni bo'yicha ma'lumot (HAMMA vazifalar)
  const userData = useMemo(() => {
    return users.map(u => {
      const allUserTasks = tasks.filter(task => String(task.assignedUser) === String(u.id));
      return {
        name: u.fullName || u.fullname || u.username || 'Staff',
        value: allUserTasks.length
      };
    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [tasks, users]);

  const overallAvgRating = useMemo(() => {
    const rated = tasks.filter(task => task.status === 'done' && Number(task.rating) > 0);
    if (rated.length === 0) return 0;
    return (rated.reduce((sum, task) => sum + Number(task.rating), 0) / rated.length).toFixed(1);
  }, [tasks]);

  if (!t) return null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto text-slate-800 dark:text-slate-200">

      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'uz' ? "O'rtacha baho" : "Средняя оценка"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Star fill="currentColor" size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{overallAvgRating}</span>
            <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{language === 'uz' ? "Bajarilgan vazifalar bo'yicha" : "По выполненным задачам"}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'uz' ? "Tugallangan" : "Завершено"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {tasks.filter(t => t.status === 'done').length}
            </span>
            <span className="text-xs font-semibold text-emerald-600">vazifa</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{language === 'uz' ? "Muvaffaqiyatli topshirilgan" : "Успешно сдано"}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'uz' ? "Faol xodimlar" : "Активные сотрудники"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center">
              <ListTodo size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{users.length}</span>
            <span className="text-xs font-semibold text-slate-400">nafar</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{language === 'uz' ? "Tizim foydalanuvchilari" : "Пользователи системы"}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'uz' ? "Yetakchi xodim" : "Лидер"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Crown size={16} />
            </div>
          </div>
          <div className="mt-2 truncate">
            <span className="text-base font-extrabold text-slate-900 dark:text-white truncate block">
              {ratingLeaderboard[0]?.name || "—"}
            </span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            {ratingLeaderboard[0]?.avg ? `★ ${ratingLeaderboard[0].avg} ball bilan yetakchi` : "Reyting hisoblanmoqda"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* REYTING BLOKI (CHAP) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="card p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl flex items-center justify-center">
                  <Star fill="currentColor" size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {language === 'uz' ? "Baholash reytingi" : "Рейтинг сотрудников"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'uz' ? "Bajarilgan vazifalar bo'yicha baholar" : "Оценки по завершенным задачам"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {ratingLeaderboard.length > 0 ? (
                ratingLeaderboard.map((u, idx) => (
                  <div 
                    key={u.id} 
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* RANK RAQAMI */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        idx === 0 ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800' :
                        idx === 1 ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' :
                        idx === 2 ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>

                      {/* USER AVATAR */}
                      <div 
                        className={`w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 ${u.avatar ? 'cursor-zoom-in' : ''}`}
                        onClick={() => u.avatar && setZoomImage(u.avatar)}
                      >
                         {u.avatar ? (
                           <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-xs font-bold">
                             {u.name.charAt(0).toUpperCase()}
                           </div>
                         )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm truncate text-slate-900 dark:text-slate-100">
                          {u.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {u.count} {language === 'uz' ? "ta baholangan vazifa" : "оцененных задач"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star 
                            key={s} 
                            size={13} 
                            fill={u.avg >= s ? "#f59e0b" : "none"} 
                            className={u.avg >= s ? "text-amber-500" : "text-slate-300 dark:text-slate-600"} 
                          />
                        ))}
                      </div>
                      <span className="text-base font-extrabold text-amber-500 w-10 text-right">{u.avg}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 text-slate-400 text-xs">
                  <Star size={36} className="mb-2 opacity-30 text-slate-400" />
                  <p>{language === 'uz' ? "Hozircha baholangan vazifalar mavjud emas" : "Нет данных"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VAZIFALAR SONI BLOKI (O'NG) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="card p-6 flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-6 shrink-0">
              <div className="w-9 h-9 bg-primary-50 dark:bg-primary-950/40 text-primary-600 rounded-xl flex items-center justify-center">
                <CheckCircle size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {language === 'uz' ? "Vazifalar soni bo'yicha yuklama" : "Количество задач по сотрудникам"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'uz' ? "Eng ko'p vazifa berilgan xodimlar" : "Нагрузка на сотрудников"}
                </p>
              </div>
            </div>

            <div className="flex-1 w-full min-h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userData} layout="vertical" margin={{ left: 10, right: 40, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={120}
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                    {userData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    <LabelList
                      dataKey="value"
                      position="right"
                      offset={12}
                      style={{ fontSize: '13px', fontWeight: '800', fill: '#0ea5e9' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* --- OXIRGI NATIJALAR --- */}
      <div className="card p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center">
            <ListTodo size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {language === 'uz' ? "Oxirgi topshirilgan natijalar" : "Последние результаты"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'uz' ? "Muvaffaqiyatli yakunlangan so'nggi vazifalar" : "Недавно завершенные задачи"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tasks.filter(t => t.status === 'done').slice(0, 4).map((task, i) => {
            const assigned = users.find(u => String(u.id) === String(task.assignedUser));
            return (
              <div key={i} className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-bold uppercase rounded-md tracking-wider">
                      Done
                    </span>
                    {task.rating > 0 && (
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40">
                        <span className="text-xs font-extrabold">{task.rating}</span>
                        <Star size={10} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug mb-4">{task.title}</h4>
                </div>
                <div className="flex items-center gap-2.5 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-[10px] text-primary-600 dark:text-primary-400 font-bold">
                    {assigned?.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{assigned?.fullName || 'Xodim'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IMAGE ZOOM MODAL */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-slate-950/90 z-[300] flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setZoomImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 transition-colors"
            onClick={() => setZoomImage(null)}
          >
            <X size={28} />
          </button>
          <img 
            src={zoomImage} 
            alt="Zoomed Avatar" 
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
}