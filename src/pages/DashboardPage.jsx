import { useApp } from '../contexts/AppContext';
import { CheckSquare, Clock, AlertCircle, TrendingUp, Calendar, User } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { uz } from 'date-fns/locale';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card p-5 flex items-center gap-4 shadow-none border-slate-200">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function DeadlineItem({ task, users, t }) {
  const user = users.find(u => u.id === task.assignedUser);
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadline && isPast(deadline) && task.status !== 'done';
  const isToday_ = deadline && isToday(deadline);
  const isTomorrow_ = deadline && isTomorrow(deadline);

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOverdue ? 'bg-red-500 animate-pulse' : isToday_ ? 'bg-amber-500' : 'bg-primary-500'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{task.title}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1 mt-0.5">
          <User size={10} />
          {user?.fullName || user?.fullname || '—'}
        </p>
      </div>
      <span className={`text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-lg flex-shrink-0 border ${
        isOverdue ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40' :
        isToday_ ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40' :
        'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
      }`}>
        {isOverdue ? t.overdue : isToday_ ? t.today : isTomorrow_ ? t.tomorrow : deadline ? format(deadline, 'dd MMM') : '—'}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { tasks, users, t, currentUser, language } = useApp();

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'progress').length;
  const newTasks = tasks.filter(t => t.status === 'new').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const d = new Date(task.deadline);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const upcomingDeadlines = tasks
    .filter(t => t.deadline && t.status !== 'done' && new Date(t.deadline) >= today)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 6);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // My tasks
  const myTasks = tasks.filter(t => t.assignedUser === currentUser?.id && t.status !== 'done').slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.welcomeBack}, {currentUser?.fullName?.split(' ')[0] || currentUser?.fullname?.split(' ')[0]} 👋
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
          {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: language === 'uz' ? uz : undefined })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label={t.totalTasks} value={total}
          color="text-primary-600 dark:text-primary-400" bg="bg-primary-50 dark:bg-primary-900/20" />
        <StatCard icon={TrendingUp} label={t.completedTasks} value={completed}
          color="text-green-600 dark:text-green-400" bg="bg-green-50 dark:bg-green-900/20" />
        <StatCard icon={Clock} label={t.inProgressTasks} value={inProgress}
          color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/20" />
        <StatCard icon={AlertCircle} label={t.newTasks} value={newTasks}
          color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" />
      </div>

      {/* Main Progress Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[0.7rem] border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.completionRate}</span>
          <span className="text-3xl font-black text-primary-600 dark:text-primary-400">{completionRate}%</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(76,110,245,0.3)]"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          <span>{completed} {t.completedSuffix}</span>
          <span>{total - completed} {t.remainingSuffix}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming deadlines */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[0.7rem] border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={18} className="text-primary-500" />
            <h2 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-wider">{t.upcomingDeadlines}</h2>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-10 opacity-30">
               <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
               <p className="text-[10px] font-bold uppercase tracking-widest">{t.noUpcomingDeadlines}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {upcomingDeadlines.map(task => (
                <DeadlineItem key={task.id} task={task} users={users} t={t} />
              ))}
            </div>
          )}
        </div>

        {/* My personal tasks */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[0.7rem] border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <CheckSquare size={18} className="text-primary-500" />
            <h2 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-wider">{t.myTasksTitle}</h2>
          </div>
          {myTasks.length === 0 ? (
            <div className="text-center py-10 opacity-30">
               <CheckSquare size={32} className="mx-auto mb-2 text-slate-300" />
               <p className="text-[10px] font-bold uppercase tracking-widest">{t.noActiveTasks}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.map(task => {
                const done = task.subtasks?.filter(s => s.done).length || 0;
                const totalSubs = task.subtasks?.length || 0;
                const pct = totalSubs > 0 ? Math.round((done / totalSubs) * 100) : 0;
                return (
                  <div key={task.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-4">{task.title}</span>
                      <span className={`text-[10px] font-black uppercase ${
                        task.priority === 'high' ? 'text-red-500' :
                        task.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {task.priority === 'high' ? '●' : '○'} {task.priority}
                      </span>
                    </div>
                    {totalSubs > 0 && (
                      <div className="mt-2">
                        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{done}/{totalSubs} {t.completedSuffix}</p>
                          <p className="text-[10px] font-bold text-primary-500">{pct}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Today tasks section */}
      {todayTasks.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[0.7rem] border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={18} className="text-amber-500" />
            <h2 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-widest">{t.todayTasks}</h2>
            <span className="ml-auto text-[10px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/40">{todayTasks.length} {t.unitPcs}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayTasks.map(task => {
              const user = users.find(u => u.id === task.assignedUser);
              return (
                <div key={task.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-amber-200 transition-all group">
                  <p className="text-sm font-bold text-slate-800 dark:text-white mb-1 group-hover:text-amber-600 transition-colors">{task.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user?.fullName || user?.fullname || '—'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}