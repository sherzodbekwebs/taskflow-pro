import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { 
  CheckSquare, Clock, AlertCircle, TrendingUp, Calendar, 
  User, ArrowUpRight, Plus, CheckCircle2, ChevronRight, Sparkles, Layers
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { uz, ru } from 'date-fns/locale';

function StatCard({ icon: Icon, label, value, subtext, color, bg, borderColor }) {
  return (
    <div className={`card p-5 card-hover border ${borderColor} flex flex-col justify-between`}>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 shadow-xs`}>
          <Icon size={20} className={color} />
        </div>
        {subtext && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {subtext}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

function DeadlineItem({ task, users, t, onClick }) {
  const user = users.find(u => String(u.id) === String(task.assignedUser));
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadline && isPast(deadline) && task.status !== 'done';
  const isToday_ = deadline && isToday(deadline);
  const isTomorrow_ = deadline && isTomorrow(deadline);

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3.5 py-3 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
    >
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOverdue ? 'bg-rose-500 animate-pulse' : isToday_ ? 'bg-amber-500' : 'bg-primary-500'}`} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <User size={12} />
            <span className="truncate max-w-[120px]">{user?.fullName || user?.fullname || 'Tayinlanmagan'}</span>
          </span>
          {task.department && (
            <>
              <span>•</span>
              <span className="truncate max-w-[100px]">{task.department}</span>
            </>
          )}
        </div>
      </div>

      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 border ${
        isOverdue ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50' :
        isToday_ ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50' :
        isTomorrow_ ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50' :
        'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
      }`}>
        {isOverdue ? (t.overdue || "Muddati o'tgan") : isToday_ ? (t.today || "Bugun") : isTomorrow_ ? (t.tomorrow || "Ertaga") : deadline ? format(deadline, 'dd MMM') : '—'}
      </span>
      
      <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors flex-shrink-0" />
    </div>
  );
}

export default function DashboardPage() {
  const { tasks, users, t, currentUser, language } = useApp();
  const navigate = useNavigate();

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'progress').length;
  const inReview = tasks.filter(t => t.status === 'review').length;
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
  const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const inReviewRate = total > 0 ? Math.round((inReview / total) * 100) : 0;
  const newRate = total > 0 ? Math.max(0, 100 - completionRate - inProgressRate - inReviewRate) : 0;

  // My tasks
  const myTasks = tasks.filter(t => String(t.assignedUser) === String(currentUser?.id) && t.status !== 'done').slice(0, 5);

  const dateLocale = language === 'ru' ? ru : uz;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="card p-6 bg-gradient-to-r from-white via-white to-sky-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-primary-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.welcomeBack || "Xush kelibsiz"}, {currentUser?.fullName?.split(' ')[0] || currentUser?.fullname?.split(' ')[0] || 'Foydalanuvchi'}
            </h1>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Calendar size={13} className="text-primary-500" />
            <span>{format(new Date(), 'EEEE, dd MMMM yyyy', { locale: dateLocale })}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/tasks')} 
            className="btn-secondary text-xs sm:text-sm"
          >
            <Layers size={16} />
            <span>{t.tasks || "Vazifalar ro'yxati"}</span>
          </button>
          <button 
            onClick={() => navigate('/tasks?create=true')} 
            className="btn-primary text-xs sm:text-sm"
          >
            <Plus size={16} />
            <span>{t.newTask || "Yangi vazifa"}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={CheckSquare} 
          label={t.totalTasks || "Jami vazifalar"} 
          value={total}
          subtext="Umumiy reja"
          color="text-primary-600 dark:text-primary-400" 
          bg="bg-primary-50 dark:bg-primary-950/50"
          borderColor="border-slate-200/80 dark:border-slate-800"
        />
        <StatCard 
          icon={CheckCircle2} 
          label={t.completedTasks || "Bajarilgan vazifalar"} 
          value={completed}
          subtext={`${completionRate}% ${t.sharePercentage || "ulush"}`}
          color="text-emerald-600 dark:text-emerald-400" 
          bg="bg-emerald-50 dark:bg-emerald-950/50"
          borderColor="border-emerald-200/60 dark:border-emerald-900/40"
        />
        <StatCard 
          icon={Clock} 
          label={t.inProgressTasks || "Jarayondagi vazifalar"} 
          value={inProgress}
          subtext={`${inProgressRate}% ${t.activeRate || (language === 'uz' ? 'faol' : 'активно')}`}
          color="text-amber-600 dark:text-amber-400" 
          bg="bg-amber-50 dark:bg-amber-950/50"
          borderColor="border-amber-200/60 dark:border-amber-900/40"
        />
        <StatCard 
          icon={AlertCircle} 
          label={t.newTasks || "Yangi / Kutilayotgan"} 
          value={newTasks}
          subtext={t.underReview || (language === 'uz' ? "Ko'rib chiqishda" : "На рассмотрении")}
          color="text-sky-600 dark:text-sky-400" 
          bg="bg-sky-50 dark:bg-sky-950/50"
          borderColor="border-sky-200/60 dark:border-sky-900/40"
        />
      </div>

      {/* Main Progress Breakdown Bar */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              {t.completionRate || (language === 'uz' ? "Umumiy ijro samaradorligi" : "Общая эффективность исполнения")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.executionIndex || (language === 'uz' ? "Barcha bo'limlar bo'yicha joriy bajarilish indeksi" : "Текущий индекс выполнения по всем отделам")}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 tracking-tight">{completionRate}%</span>
            <span className="text-xs font-semibold text-slate-400">{t.completedLabel || (language === 'uz' ? "bajarildi" : "выполнено")}</span>
          </div>
        </div>

        {/* Multi-segment visual progress bar */}
        <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div 
            title={`Bajarilgan: ${completed}`}
            className="h-full bg-emerald-500 transition-all duration-700" 
            style={{ width: `${completionRate}%` }} 
          />
          <div 
            title={`Jarayonda: ${inProgress}`}
            className="h-full bg-amber-500 transition-all duration-700" 
            style={{ width: `${inProgressRate}%` }} 
          />
          <div 
            title={`Tekshiruvda: ${inReview}`}
            className="h-full bg-purple-500 transition-all duration-700" 
            style={{ width: `${inReviewRate}%` }} 
          />
          <div 
            title={`Yangi: ${newTasks}`}
            className="h-full bg-sky-400 transition-all duration-700" 
            style={{ width: `${newRate}%` }} 
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400">{t.doneStatus || "Bajarildi"}:</span>
            <span className="font-bold text-slate-900 dark:text-white">{completed}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-400">{t.progressStatus || "Jarayonda"}:</span>
            <span className="font-bold text-slate-900 dark:text-white">{inProgress}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-600 dark:text-slate-400">{t.reviewStatus || "Tekshiruvda"}:</span>
            <span className="font-bold text-slate-900 dark:text-white">{inReview}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-slate-600 dark:text-slate-400">{t.newStatus || "Yangi"}:</span>
            <span className="font-bold text-slate-900 dark:text-white">{newTasks}</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Upcoming Deadlines & My Personal Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Upcoming deadlines */}
        <div className="card p-6 flex flex-col h-full min-h-[440px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Calendar size={18} />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                {t.upcomingDeadlines || "Yaqinlashayotgan muddatlar"}
              </h2>
            </div>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              <span>{t.viewAll || (language === 'uz' ? "Hammasi" : "Все")}</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
              <Calendar size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold">{t.noUpcomingDeadlines || "Yaqin muddatli vazifalar yo'q"}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto max-h-[460px] custom-scrollbar">
              {upcomingDeadlines.map(task => (
                <DeadlineItem 
                  key={task.id} 
                  task={task} 
                  users={users} 
                  t={t}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* My personal tasks */}
        <div className="card p-6 flex flex-col h-full min-h-[440px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckSquare size={18} />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                {t.myTasksTitle || "Mening vazifalarim"}
              </h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {myTasks.length} {t.unitPcs || "ta"}
            </span>
          </div>

          {myTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
              <CheckSquare size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold">{t.noActiveTasks || "Sizga tayinlangan faol vazifalar yo'q"}</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] custom-scrollbar">
              {myTasks.map(task => {
                const done = task.subtasks?.filter(s => s.done).length || 0;
                const totalSubs = task.subtasks?.length || 0;
                const pct = totalSubs > 0 ? Math.round((done / totalSubs) * 100) : 0;
                
                return (
                  <div 
                    key={task.id} 
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700/60 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {task.title}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0 ${
                        task.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40' :
                        task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {task.priority === 'high' ? (t.priorityHigh || "Yuqori") :
                         task.priority === 'medium' ? (t.priorityMedium || "O'rta") :
                         (t.priorityLow || "Past")}
                      </span>
                    </div>

                    {totalSubs > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between mt-1.5 text-[11px] font-semibold text-slate-400">
                          <span>{done}/{totalSubs} {t.subtasksRatio || "qism vazifalar"}</span>
                          <span className="text-primary-600 dark:text-primary-400 font-bold">{pct}%</span>
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

      {/* Today's Tasks Highlight (if any) */}
      {todayTasks.length > 0 && (
        <div className="card p-6 border-amber-200/70 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/20 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                {t.todayTasks || "Bugun bajarilishi lozim bo'lgan vazifalar"}
              </h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              {todayTasks.length} {t.unitPcs || "ta"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayTasks.map(task => {
              const user = users.find(u => String(u.id) === String(task.assignedUser));
              return (
                <div 
                  key={task.id} 
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="p-3.5 rounded-xl border border-amber-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group"
                >
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <User size={12} />
                    <span>{user?.fullName || user?.fullname || 'Tayinlanmagan'}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
