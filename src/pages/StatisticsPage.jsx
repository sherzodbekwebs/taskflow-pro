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

  if (!t) return null;

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

  const getRankStyles = (index) => {
    switch (index) {
      case 0: return "bg-amber-50 dark:bg-amber-900/20 border-amber-300 ring-2 ring-amber-400/30";
      case 1: return "bg-slate-50 dark:bg-slate-800/60 border-slate-300 ring-2 ring-slate-400/20";
      case 2: return "bg-orange-50 dark:bg-orange-900/20 border-orange-300 ring-2 ring-orange-400/20";
      default: return "bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800";
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto text-slate-800 dark:text-slate-200 px-4">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* REYTING BLOKI (CHAP) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 shadow-sm border border-slate-100 dark:border-slate-700 min-h-[500px] flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Star fill="currentColor" size={22} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">
                  {language === 'uz' ? "BAXOLASH REYTINGI" : "РЕЙТИНГ ОЦЕНОК"}
                </h3>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">{language === 'uz' ? "O'RTACHA" : "СРЕДНИЙ"}</p>
                <p className="text-2xl font-black text-amber-500">{overallAvgRating} <span className="text-xs text-slate-300">/ 5</span></p>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {ratingLeaderboard.length > 0 ? (
                ratingLeaderboard.map((u, idx) => (
                  <div key={u.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${getRankStyles(idx)}`}>
                    <div className="flex items-center gap-4">
                      {/* RANK RAQAMI */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base relative shadow-sm shrink-0 ${idx === 0 ? 'bg-amber-400 text-white ring-2 ring-white ring-offset-2 ring-offset-amber-400' :
                          idx === 1 ? 'bg-slate-400 text-white ring-2 ring-white ring-offset-2 ring-offset-slate-400' :
                            idx === 2 ? 'bg-orange-400 text-white ring-2 ring-white ring-offset-2 ring-offset-orange-400' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200'
                        }`}>
                        {idx + 1}
                        {idx < 3 && <div className="absolute -top-2.5 -right-2.5 drop-shadow-md">
                          {idx === 0 ? <Crown size={18} className="text-amber-500" /> : <Medal size={18} className={idx === 1 ? "text-slate-400" : "text-orange-500"} />}
                        </div>}
                      </div>

                      {/* USER AVATAR (Ustiga bosilganda zoom bo'ladi) */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className={`w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-white shrink-0 shadow-sm transition-transform active:scale-95 ${u.avatar ? 'cursor-zoom-in hover:border-primary-400' : ''}`}
                          onClick={() => u.avatar && setZoomImage(u.avatar)}
                        >
                           {u.avatar ? (
                             <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white text-xs font-bold">
                               {u.name.charAt(0).toUpperCase()}
                             </div>
                           )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-[16px] truncate text-slate-800 dark:text-slate-100">
                            {u.name}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.count} {language === 'uz' ? "VAZIFA" : "ЗАДАЧ"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={u.avg >= s ? "#f59e0b" : "none"} stroke={u.avg >= s ? "#f59e0b" : "#cbd5e1"} />)}
                      </div>
                      <span className={`text-2xl font-black w-12 text-right ${idx === 0 ? 'text-amber-500' : 'text-slate-700 dark:text-white'}`}>{u.avg}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600 italic">
                  <Star size={48} className="mb-4 opacity-10" />
                  <p className="text-sm font-bold uppercase tracking-widest opacity-40">{language === 'uz' ? "Ma'lumot mavjud emas" : "НЕТ ДАННЫХ"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VAZIFALAR SONI BLOKI (O'NG) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 shadow-sm border border-slate-100 dark:border-slate-700 min-h-[500px] flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10 shrink-0">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                <CheckCircle size={22} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">{language === 'uz' ? "VAZIFALAR SONI" : "КОЛ-ВО ЗАДАЧ"}</h3>
            </div>

            <div className="flex-1 w-full h-full min-h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userData} layout="vertical" margin={{ left: 10, right: 60, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={140}
                    tick={{ fontSize: 14, fontWeight: 700, fill: '#475569' }}
                  />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                    {userData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    <LabelList
                      dataKey="value"
                      position="right"
                      offset={15}
                      style={{ fontSize: '16px', fontWeight: '900', fill: '#4f46e5' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* --- OXIRGI NATIJALAR --- */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mt-2">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 text-slate-500 rounded-xl flex items-center justify-center shadow-sm">
            <ListTodo size={22} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight">{language === 'uz' ? "OXIRGI NATIJALAR" : "ПОСЛЕДНИЕ РЕЗУЛЬТАТЫ"}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tasks.filter(t => t.status === 'done').slice(0, 4).map((task, i) => {
            const assigned = users.find(u => String(u.id) === String(task.assignedUser));
            return (
              <div key={i} className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-none hover:shadow-md group">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 bg-green-500 text-white text-[9px] font-black uppercase rounded-lg tracking-widest shadow-sm">DONE</span>
                  {task.rating > 0 && (
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-xl border border-amber-100">
                      <span className="text-[12px] font-black">{task.rating}</span>
                      <Star size={10} fill="currentColor" />
                    </div>
                  )}
                </div>
                <h4 className="text-[14px] font-black mb-5 line-clamp-2 leading-tight dark:text-white min-h-[40px] group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] text-white font-black shadow-inner">
                    {assigned?.fullName?.[0] || 'U'}
                  </div>
                  <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 truncate">{assigned?.fullName || 'Staff'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RASMNI KATTA QILIB KO'RSATADIGAN MODAL (IMAGE ZOOM) */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setZoomImage(null)}
        >
          <button 
            className="absolute top-10 right-10 text-white p-3 hover:bg-white/10 rounded-full transition-all"
            onClick={() => setZoomImage(null)}
          >
            <X size={40} />
          </button>
          <img 
            src={zoomImage} 
            alt="Zoomed Avatar" 
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} // Rasm ustiga bosganda modal yopilmasligi uchun
          />
        </div>
      )}

    </div>
  );
}