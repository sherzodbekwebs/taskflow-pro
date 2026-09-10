import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  CheckCircle2, Clock, AlertCircle, Filter, 
  ArrowUpRight, User, Building2, Plus, CalendarDays
} from 'lucide-react';
import { format, isSameDay, isSameMonth, parseISO, isValid } from 'date-fns';
import { uz as uzLocale, ru as ruLocale } from 'date-fns/locale';

export default function CalendarPage() {
  const { tasks, users, departments, t, language } = useApp();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const dateLocale = language === 'uz' ? uzLocale : ruLocale;

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const d = parseISO(task.deadline);
      if (!isValid(d)) return false;

      if (filterDepartment !== 'all' && task.department !== filterDepartment) return false;
      if (filterUser !== 'all' && String(task.assignedUser) !== String(filterUser)) return false;
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;

      return true;
    });
  }, [tasks, filterDepartment, filterUser, filterStatus]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday is first day of week (1), Sunday is 0 -> convert to 0-6 where Monday is 0
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Previous month padding days
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDate - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month padding days to complete grid (multiples of 7)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentDate]);

  // Monthly stats
  const monthStats = useMemo(() => {
    const currentMonthTasks = filteredTasks.filter(t => {
      const d = parseISO(t.deadline);
      return isSameMonth(d, currentDate);
    });

    const total = currentMonthTasks.length;
    const completed = currentMonthTasks.filter(t => t.status === 'done').length;
    const inProgress = currentMonthTasks.filter(t => t.status === 'progress' || t.status === 'review').length;
    const now = new Date();
    const overdue = currentMonthTasks.filter(t => t.status !== 'done' && parseISO(t.deadline) < now).length;

    return { total, completed, inProgress, overdue };
  }, [filteredTasks, currentDate]);

  // Tasks for selected day
  const selectedDayTasks = useMemo(() => {
    return filteredTasks.filter(task => {
      const d = parseISO(task.deadline);
      return isSameDay(d, selectedDay);
    });
  }, [filteredTasks, selectedDay]);

  const weekDayNames = language === 'uz' 
    ? ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak']
    : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-900/40">
              <CalendarDays size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {language === 'uz' ? "Vazifalar taqvimi" : "Календарь задач"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'uz' 
                  ? "Muddatlar, rejalashtirilgan topshiriqlar va ijro taqvimi" 
                  : "Сроки, запланированные задачи и календарь выполнения"}
              </p>
            </div>
          </div>
        </div>

        {/* Month Navigation & Today Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={goToToday}
            className="btn-secondary py-2 px-3 text-xs font-bold"
          >
            {language === 'uz' ? "Bugun" : "Сегодня"}
          </button>
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={language === 'uz' ? "Oldingi oy" : "Предыдущий месяц"}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[120px] text-center capitalize">
              {format(currentDate, 'LLLL yyyy', { locale: dateLocale })}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={language === 'uz' ? "Keyingi oy" : "Следующий месяц"}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Mini Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <CalendarIcon size={18} />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{monthStats.total}</p>
            <p className="text-[11px] font-semibold text-slate-400">{language === 'uz' ? "Shu oydagi jami" : "Всего за месяц"}</p>
          </div>
        </div>

        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight">{monthStats.completed}</p>
            <p className="text-[11px] font-semibold text-slate-400">{t.completed || "Bajarilgan"}</p>
          </div>
        </div>

        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-base font-extrabold text-amber-600 dark:text-amber-400 leading-tight">{monthStats.inProgress}</p>
            <p className="text-[11px] font-semibold text-slate-400">{t.inProgress || "Jarayonda"}</p>
          </div>
        </div>

        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-base font-extrabold text-rose-600 dark:text-rose-400 leading-tight">{monthStats.overdue}</p>
            <p className="text-[11px] font-semibold text-slate-400">{t.overdue || "Muddati o'tgan"}</p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
            <Filter size={14} />
            <span>{t.filter || "Filtr"}:</span>
          </div>

          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            className="input h-9 text-xs font-semibold py-1 px-2.5 w-full sm:w-44"
          >
            <option value="all">{language === 'uz' ? "Barcha bo'limlar" : "Все отделы"}</option>
            {departments.map((dept, i) => (
              <option key={i} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            className="input h-9 text-xs font-semibold py-1 px-2.5 w-full sm:w-44"
          >
            <option value="all">{language === 'uz' ? "Barcha xodimlar" : "Все сотрудники"}</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.fullName || u.fullname || u.username}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input h-9 text-xs font-semibold py-1 px-2.5 w-full sm:w-36"
          >
            <option value="all">{language === 'uz' ? "Barcha holatlar" : "Все статусы"}</option>
            <option value="new">{t.statusNew || "Yangi"}</option>
            <option value="progress">{t.statusProgress || "Jarayonda"}</option>
            <option value="review">{t.statusReview || "Tekshiruvda"}</option>
            <option value="done">{t.statusDone || "Bajarilgan"}</option>
          </select>
        </div>

        <button
          onClick={() => navigate('/tasks')}
          className="btn-primary py-2 px-3 text-xs font-bold w-full sm:w-auto ml-auto"
        >
          <Plus size={14} />
          <span>{t.newTask || "Yangi vazifa"}</span>
        </button>
      </div>

      {/* Main Content Layout: Calendar Grid (8 cols) + Selected Day Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Calendar Grid Container */}
        <div className="lg:col-span-8 card p-4 sm:p-6 overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {weekDayNames.map((name, i) => (
              <div 
                key={i} 
                className={`text-center py-2 text-xs font-bold uppercase tracking-wider ${
                  i >= 5 ? 'text-rose-500/80 dark:text-rose-400/80' : 'text-slate-400'
                }`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((item, index) => {
              const dayTasks = filteredTasks.filter(task => {
                const d = parseISO(task.deadline);
                return isSameDay(d, item.date);
              });

              const isToday = isSameDay(item.date, new Date());
              const isSelected = isSameDay(item.date, selectedDay);
              const dayNumber = item.date.getDate();

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDay(item.date)}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/20 dark:bg-primary-950/20 shadow-xs'
                      : item.isCurrentMonth
                        ? 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                        : 'border-slate-100 dark:border-slate-900/40 bg-slate-50/40 dark:bg-slate-950/40 opacity-40 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isToday
                          ? 'bg-primary-600 text-white shadow-xs'
                          : isSelected
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Pills */}
                  <div className="space-y-1 mt-1.5 flex-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map(task => {
                      const isDone = task.status === 'done';
                      const isUrgent = task.priority === 'high';

                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tasks/${task.id}`);
                          }}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate border flex items-center gap-1 transition-transform hover:scale-[1.02] ${
                            isDone 
                              ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40 line-through opacity-80' 
                              : isUrgent 
                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40' 
                                : 'bg-slate-50 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}
                          title={task.title}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDone ? 'bg-emerald-500' : isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-primary-500'
                          }`} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}

                    {dayTasks.length > 2 && (
                      <p className="text-[10px] font-semibold text-slate-400 pl-1">
                        +{dayTasks.length - 2} {language === 'uz' ? 'yana' : 'еще'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Task Details Panel */}
        <div className="lg:col-span-4 card p-6 flex flex-col h-full min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                {language === 'uz' ? "Tanlangan sana" : "Выбранная дата"}
              </p>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white capitalize mt-0.5">
                {format(selectedDay, 'dd MMMM, yyyy', { locale: dateLocale })}
              </h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {selectedDayTasks.length} {language === 'uz' ? "ta vazifa" : "задач"}
            </span>
          </div>

          {/* List of Tasks on Selected Day */}
          <div className="py-4 flex-1 overflow-y-auto max-h-[520px] custom-scrollbar space-y-3">
            {selectedDayTasks.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400">
                <CalendarIcon size={36} className="mb-2 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                <p className="text-xs font-semibold">
                  {language === 'uz' ? "Bu kunda hech qanday vazifa belgilanmagan" : "На этот день задач не запланировано"}
                </p>
              </div>
            ) : (
              selectedDayTasks.map(task => {
                const assignedPerson = users.find(u => String(u.id) === String(task.assignedUser));
                const isOverdue = task.status !== 'done' && parseISO(task.deadline) < new Date();

                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600 bg-white dark:bg-slate-900/60 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                        {task.title}
                      </h3>
                      <ArrowUpRight size={15} className="text-slate-400 group-hover:text-primary-600 transition-colors shrink-0" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority === 'high' ? (t.priorityHigh || "Yuqori") :
                         task.priority === 'medium' ? (t.priorityMedium || "O'rta") :
                         (t.priorityLow || "Past")}
                      </span>

                      {task.department && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <Building2 size={10} />
                          <span>{task.department}</span>
                        </span>
                      )}

                      {isOverdue && (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/40">
                          {t.overdue || "Muddati o'tgan"}
                        </span>
                      )}
                    </div>

                    {/* Footer Info: Assignee & Status */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <User size={13} className="text-slate-400" />
                        <span className="truncate max-w-[120px]">
                          {assignedPerson?.fullName || assignedPerson?.fullname || assignedPerson?.username || "Tayinlanmagan"}
                        </span>
                      </div>

                      <span className={`font-semibold capitalize text-[10px] ${
                        task.status === 'done' ? 'text-emerald-600 dark:text-emerald-400' :
                        task.status === 'progress' ? 'text-amber-600 dark:text-amber-400' :
                        task.status === 'review' ? 'text-purple-600 dark:text-purple-400' :
                        'text-sky-600 dark:text-sky-400'
                      }`}>
                        {task.status === 'done' ? (t.statusDone || "Bajarilgan") :
                         task.status === 'progress' ? (t.statusProgress || "Jarayonda") :
                         task.status === 'review' ? (t.statusReview || "Tekshiruvda") :
                         (t.statusNew || "Yangi")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
