import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import TaskModal from '../components/tasks/TaskModal';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskCard from '../components/tasks/TaskCard';
import {
  Plus, Search, LayoutGrid, List, X, CheckCircle2,
  AlertTriangle, Filter, TableProperties, User as UserIcon, Calendar as CalendarIcon,
  RefreshCw,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { uz, ru } from 'date-fns/locale'; // Tilga qarab lokalni ham o'zgartirish mumkin

export default function TasksPage() {
  const {
    tasks, users, departments, t, language, deleteTask, isActionLoading, refreshData,
    taskFilters, setTaskFilters,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [view, setView] = useState('kanban');
  const [defaultStatus, setDefaultStatus] = useState('new');

  // Tanlangan tilga qarab date-fns lokalini tanlash
  const dateLocale = language === 'uz' ? uz : ru;

  const statusLabels = {
    new: t.statusNew || "Янги",
    progress: t.statusProgress || "Жараёнда",
    review: t.statusReview || "Текширувda",
    done: t.statusDone || "Тугалланган"
  };

  const getDeadlineDisplay = (task) => {
    if (!task.is_recurring) {
      return task.deadline ? format(new Date(task.deadline), 'dd MMM, yyyy', { locale: dateLocale }) : "—";
    }

    // Hafta kunlari tarjimalari
    const weekdays = [
      "",
      t.monday || "Душанба",
      t.tuesday || "Сешанба",
      t.wednesday || "Чоршанба",
      t.thursday || "Пайшанба",
      t.friday || "Жума",
      t.saturday || "Шанба",
      t.sunday || "Якшанба"
    ];

    switch (task.recurring_type) {
      case 'daily': return t.daily || "Ҳар куni";
      case 'weekly': return `${t.weekly || "Ҳар ҳафта"} (${weekdays[task.recurring_value] || ""})`;
      case 'monthly': return `${t.monthly || "Ҳар ой"} (${task.recurring_value})`;
      case 'quarterly': return `${t.quarterly || "Ҳар чорак"} (${task.recurring_value})`;
      case 'yearly': return `${t.yearly || "Ҳар йил"} (${task.recurring_value})`;
      default: return t.recurring || "Такрорланувчи";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && view === 'kanban') setView('list');
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // MUHIM: search/filterStatus/filterUser endi mahalliy state emas,
  // AppContext'dagi taskFilters orqali boshqariladi. Shunga ko'ra
  // boshqa pagega o'tib qaytib kelganda ham filterlar saqlanib qoladi.
  const { search, status: filterStatus, user: filterUser } = taskFilters;

  const setSearch = (val) => setTaskFilters({ search: val });
  const setFilterStatus = (val) => setTaskFilters({ status: val });
  const setFilterUser = (val) => setTaskFilters({ user: val });
  const clearFilters = () => setTaskFilters({ search: '', status: 'all', user: 'all' });

  const filtered = useMemo(() => {
    return [...tasks]
      .filter(task => {
        if (search && !task.title?.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterStatus !== 'all' && task.status !== filterStatus) return false;
        if (filterUser !== 'all' && String(task.assignedUser) !== String(filterUser)) return false;
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at || a.id).getTime();
        const timeB = new Date(b.updated_at || b.created_at || b.id).getTime();
        return timeB - timeA;
      });
  }, [tasks, search, filterStatus, filterUser]);

  const handleAddTask = (status = 'new') => {
    setEditTask(null);
    setDefaultStatus(status);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'progress': return 'bg-amber-500';
      case 'review': return 'bg-purple-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="w-full pb-10">

      <div className="pb-4 print:hidden">
        <div className="card p-5 space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.tasks || "Vazifalar"}
              </h1>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                {filtered.length} {t.operationsCountLabel || "ta"}
              </span>
              <div className="hidden xs:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.liveIndicator || (language === 'uz' ? "Jonli" : "В сети")}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {view === 'table' && (
                <button
                  onClick={handlePrint}
                  title={t.print || "Chop etish"}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <Printer size={17} />
                </button>
              )}

              {/* View switch buttons */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/70 dark:border-slate-700">
                <button 
                  title={t.kanban || "Kanban"} 
                  onClick={() => setView('kanban')} 
                  className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    view === 'kanban' 
                      ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid size={15} />
                  <span className="hidden md:inline">{t.kanbanBoard || (language === 'uz' ? "Doska" : "Доска")}</span>
                </button>
                <button 
                  title={t.listView || "Ro'yxat"} 
                  onClick={() => setView('list')} 
                  className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    view === 'list' 
                      ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <List size={15} />
                  <span className="hidden md:inline">{t.cards || (language === 'uz' ? "Kartalar" : "Карточки")}</span>
                </button>
                <button 
                  title={t.tableView || "Jadval"} 
                  onClick={() => setView('table')} 
                  className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    view === 'table' 
                      ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TableProperties size={15} />
                  <span className="hidden md:inline">{t.tableView || (language === 'uz' ? "Jadval" : "Таблица")}</span>
                </button>
              </div>

              <button 
                onClick={() => handleAddTask()} 
                className="btn-primary py-2 px-4 rounded-xl text-xs font-bold"
              >
                <Plus size={16} /> 
                <span>{t.addTask || "Yangi vazifa"}</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="input pl-10 text-xs h-10" 
                placeholder={t.searchPlaceholder || "Vazifalarni izlash..."} 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select 
                className="input w-auto text-xs font-medium py-2 px-3 h-10" 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">{t.allStatuses || "Barcha holatlar"}</option>
                <option value="new">{statusLabels.new}</option>
                <option value="progress">{statusLabels.progress}</option>
                <option value="review">{statusLabels.review}</option>
                <option value="done">{statusLabels.done}</option>
              </select>

              <select 
                className="input w-auto text-xs font-medium py-2 px-3 h-10" 
                value={filterUser} 
                onChange={e => setFilterUser(e.target.value)}
              >
                <option value="all">{t.allAssignees || "Barcha mas'ullar"}</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}
              </select>

              {(search || filterStatus !== 'all' || filterUser !== 'all') && (
                <button 
                  onClick={clearFilters} 
                  title={t.clearFilters || (language === 'uz' ? "Filtrlarni tozalash" : "Сбросить фильтры")}
                  className="h-10 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1 text-xs font-semibold transition-colors"
                >
                  <X size={15} />
                  <span>{t.clear || (language === 'uz' ? "Tozalash" : "Очистить")}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="print:overflow-visible overflow-x-auto">
        <div className="min-w-full">
          {view === 'kanban' ? (
            <div className="mt-1 min-w-[1200px] lg:min-w-0">
              <KanbanBoard tasks={filtered} onAddTask={handleAddTask} onEditTask={(t) => { setEditTask(t); setShowModal(true); }} onDeleteTask={(t) => setTaskToDelete(t)} />
            </div>
          ) : view === 'list' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-1 px-1">
              {filtered.map(task => (
                <TaskCard key={task.id} task={task} onEdit={(t) => { setEditTask(t); setShowModal(true); }} onDelete={(t) => setTaskToDelete(t)} />
              ))}
            </div>
          ) : (
            <div id="print-area" className="card overflow-hidden mt-1 shadow-none print:border-none print:m-0">
              <table className="w-full text-left border-collapse min-w-[650px] print:text-[12pt]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800 print:bg-slate-100">
                    <th className="px-4 py-3.5 w-12 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider text-center print:text-black">№</th>
                    <th className="px-6 py-3.5 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider print:text-black">{t.taskName || "Vazifa nomi"}</th>
                    <th className="px-6 py-3.5 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider print:text-black">{t.responsible || "Mas'ul"}</th>
                    <th className="px-6 py-3.5 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider print:text-black">{t.createdAt || "Yaratilgan vaqti"}</th>
                    <th className="px-6 py-3.5 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider text-right print:text-black">{t.deadline || "Muddat"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filtered.map((task, index) => {
                    const assigned = users.find(u => String(u.id) === String(task.assignedUser));
                    return (
                      <tr key={task.id}
                        onClick={() => { setEditTask(task); setShowModal(true); }}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group print:break-inside-avoid"
                      >
                        <td className="px-4 py-4 text-center text-xs font-semibold text-slate-400 print:text-black">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-2 h-9 rounded-full shrink-0 ${getStatusColor(task.status)} print:hidden`} />
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors print:text-black leading-snug truncate max-w-[320px]">
                                {task.title}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tight text-white ${getStatusColor(task.status)}`}>
                                  {statusLabels[task.status]}
                                </span>
                                {task.department && (
                                  <span className="text-[11px] text-slate-400">
                                    • {task.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-[11px] font-extrabold text-primary-600 dark:text-primary-400 print:hidden border border-primary-200/50 dark:border-primary-800/40">
                              {(assigned?.fullName || assigned?.fullname || "?")[0].toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 print:text-black">
                              {assigned?.fullName || assigned?.fullname || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-black">
                              {task.created_at ? format(new Date(task.created_at), 'dd.MM.yyyy') : "—"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {task.created_at ? format(new Date(task.created_at), 'HH:mm') : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold print:border-none print:bg-transparent">
                            {task.is_recurring ? <RefreshCw size={13} className="text-primary-500 print:hidden" /> : <CalendarIcon size={13} className="text-slate-400 print:hidden" />}
                            <span className={`${task.is_recurring ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-600 dark:text-slate-300'} print:text-black`}>
                              {getDeadlineDisplay(task)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-400 print:hidden">
              <p className="text-sm font-semibold">{t.noTasksFound || "Hech qanday vazifa topilmadi"}</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={editTask ? tasks.find(t => String(t.id) === String(editTask.id)) : { status: defaultStatus }}
          onClose={() => { setShowModal(false); setEditTask(null); }}
        />
      )}

      {taskToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 max-w-sm w-full shadow-2xl text-center border border-slate-200 dark:border-slate-700">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900/40">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.confirmDeletion || "Vazifani o'chirish"}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
               {t.deleteWarning?.replace('{title}', taskToDelete.title) || `"${taskToDelete.title}" vazifasini o'chirishni tasdiqlaysizmi?`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setTaskToDelete(null)} className="btn-secondary flex-1 py-2.5 text-xs font-bold">{t.no || "Bekor qilish"}</button>
              <button onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex-1 py-2.5 text-xs transition-colors shadow-xs">{t.yes || "O'chirish"}</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { size: auto; margin: 10mm; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}