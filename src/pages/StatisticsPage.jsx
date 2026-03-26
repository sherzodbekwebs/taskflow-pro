import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  CheckCircle2, Clock, Briefcase, TrendingUp,
  Calendar as CalendarIcon, User as UserIcon, ListTodo
} from 'lucide-react';
import { startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { format } from 'date-fns';

const COLORS = ['#f97316', '#8b5cf6', '#22c55e', '#ef4444'];

export default function StatisticsPage() {
  const { tasks, users, t } = useApp(); // t ob'ektini qabul qilamiz

  const activityData = useMemo(() => {
    const days = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];

    // Haftaning boshlanish sanasini olamiz (Dushanba)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

    return days.map((day, index) => {
      // Har bir kunning aniq sanasini hisoblaymiz
      const currentDate = addDays(weekStart, index);

      // Shu kunda yaratilgan vazifalar soni
      const dailyTasks = tasks.filter(task =>
        isSameDay(parseISO(task.created_at || task.createdAt), currentDate)
      ).length;

      // Shu kunda bajarilgan (status: done) vazifalar soni
      const dailyCompleted = tasks.filter(task =>
        task.status === 'done' &&
        isSameDay(parseISO(task.updated_at || task.createdAt), currentDate)
      ).length;

      return {
        name: day,
        tasks: dailyTasks,
        completed: dailyCompleted
      };
    });
  }, [tasks, t]); // tasks o'zgarganda grafik yangilanadi

  const userData = users.map(u => {
    const userTasks = tasks.filter(task => task.assignedUser === u.id);
    return {
      name: u.fullName ? u.fullName.split(' ')[0] : (u.username || t.staffMember),
      value: userTasks.length
    };
  }).filter(d => d.value > 0).slice(0, 5);

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    prog: tasks.filter(t => t.status === 'progress').length,
  };

  return (
    <div className="space-y-6 pb-10 font-sans">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 font-bold text-sm mb-1">
            <CalendarIcon size={16} />
            <span>{format(new Date(), 'MMMM dd, yyyy')}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            {t.statistics} <TrendingUp className="text-orange-500" size={28} />
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold shadow-sm border border-slate-100 dark:border-slate-700">{t.tasks}</button>
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-bold text-slate-500">{t.staff}</button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t.totalTasks, value: stats.total, icon: Briefcase, color: '#f97316', trend: '+12%' },
          { label: t.inProgressTasks, value: stats.prog, icon: Clock, color: '#8b5cf6', trend: '-5%' },
          { label: t.completedTasks, value: stats.done, icon: CheckCircle2, color: '#22c55e', trend: '+18%' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm flex items-center justify-between group hover:shadow-md transition-all border border-slate-50 dark:border-slate-700">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                <item.icon size={28} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</p>
              </div>
            </div>
            <div className={`text-xs font-black ${item.trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
              {item.trend}
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-8 rounded-[1.5rem] shadow-sm border border-slate-50 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              {t.activityFlow} <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-lg">+5.4%</span>
            </h3>
            <select className="bg-slate-50 dark:bg-slate-900 border-none text-[10px] font-bold p-2 rounded-lg outline-none dark:text-white">
              <option>{t.thisWeek}</option>
              <option>{t.thisMonth}</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="tasks" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorTasks)" />
                <Area type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={4} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-8 rounded-[1.5rem] shadow-sm border border-slate-50 dark:border-slate-700 flex flex-col">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">{t.staff} <span className="text-blue-500 text-xs font-bold">[+18%]</span></h3>
          <p className="text-xs text-slate-400 font-bold mb-8">{t.taskDistribution}</p>
          <div className="flex-1 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={15}>
                  {userData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[1.5rem] shadow-sm border border-slate-50 dark:border-slate-700">
        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">{t.recentActivities}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tasks.slice(0, 5).map((task, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-primary-500 uppercase tracking-widest">
                <ListTodo size={12} /> {task.department || t.task}
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{task.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold">
                <UserIcon size={12} /> {users.find(u => u.id === task.assignedUser)?.fullName || '—'}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-green-500' : 'bg-orange-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{task.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}