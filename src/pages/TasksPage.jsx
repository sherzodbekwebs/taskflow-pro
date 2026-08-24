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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[0.7rem] p-4 sm:p-5 space-y-5 transition-colors shadow-none">

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2 sm:gap-3 truncate">
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-none truncate">
                  {t.tasks}
                </h1>
                <div className="hidden xs:flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md border border-green-100 dark:border-green-800/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-tighter">Live</span>
                </div>
              </div>
              <span className="hidden md:inline text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                {filtered.length} {t.operationsCountLabel || "та"}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 flex-nowrap">
              {view === 'table' && (
                <button
                  onClick={handlePrint}
                  title={t.print || "Чоп etish"}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary-500 border border-slate-100 dark:border-slate-700 transition-all"
                >
                  <Printer size={18} />
                </button>
              )}

              <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700 shadow-none">
                <button title={t.kanban || "Канбан"} onClick={() => setView('kanban')} className={`p-1.5 rounded-lg transition-all ${view === 'kanban' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={16} /></button>
                <button title={t.listView || "Рўйхат"} onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400'}`}><List size={16} /></button>
                <button title={t.tableView || "Жадвал"} onClick={() => setView('table')} className={`p-1.5 rounded-lg transition-all ${view === 'table' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400'}`}><TableProperties size={16} /></button>
              </div>
              <button onClick={() => handleAddTask()} className="btn-primary h-10 px-3 sm:px-5 rounded-xl shadow-lg shadow-primary-500/10 font-bold text-[11px] sm:text-xs uppercase whitespace-nowrap">
                <Plus size={16} /> <span className="hidden sm:inline">{t.addTask}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/50">
            <div className="relative flex-1 min-w-[150px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9 text-xs h-10 bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white focus:border-slate-200" placeholder={t.searchPlaceholder || "Қидирув..."} value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select className="input w-auto text-[11px] font-bold py-2 px-4 h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">{t.allStatuses || "Ҳамма ҳолатлар"}</option>
                <option value="new">{statusLabels.new}</option>
                <option value="progress">{statusLabels.progress}</option>
                <option value="review">{statusLabels.review}</option>
                <option value="done">{statusLabels.done}</option>
              </select>

              <select className="input w-auto text-[11px] font-bold py-2 px-4 h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                <option value="all">{t.allAssignees || "Ҳамма ижрочилар"}</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}
              </select>

              {(search || filterStatus !== 'all' || filterUser !== 'all') && (
                <button onClick={clearFilters} className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100">
                  <X size={16} />
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
            <div id="print-area" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[0.7rem] overflow-hidden mt-1 mx-1 shadow-none print:border-none print:m-0">
              <table className="w-full text-left border-collapse min-w-[600px] print:text-[12pt]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 print:bg-slate-100">
                    <th className="px-4 py-4 w-12 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center print:text-black">№</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest print:text-black">{t.taskName || "Вазифа номи"}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest print:text-black">{t.responsible || "Масъул"}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest print:text-black">{t.createdAt || "Яратилган вақти"}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right print:text-black">{t.deadline || "Муддат"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filtered.map((task, index) => {
                    const assigned = users.find(u => String(u.id) === String(task.assignedUser));
                    return (
                      <tr key={task.id}
                        onClick={() => { setEditTask(task); setShowModal(true); }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group print:break-inside-avoid"
                      >
                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-400 print:text-black">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-10 rounded-full shrink-0 ${getStatusColor(task.status)} print:hidden shadow-sm`} />
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary-500 transition-colors print:text-black leading-tight">
                                {task.title}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-tighter text-white ${getStatusColor(task.status)}`}>
                                  {statusLabels[task.status]}
                                </span>
                                {task.department && (
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                    • {task.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 print:hidden">
                              {(assigned?.fullName || assigned?.fullname || "?")[0]}
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 print:text-black">
                              {assigned?.fullName || assigned?.fullname || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 print:text-black">
                              {task.created_at ? format(new Date(task.created_at), 'dd.MM.yyyy') : "—"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {task.created_at ? format(new Date(task.created_at), 'HH:mm') : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 print:border-none print:bg-transparent">
                            {task.is_recurring ? <RefreshCw size={14} className="text-primary-500 print:hidden" /> : <CalendarIcon size={14} className="text-slate-400 print:hidden" />}
                            <span className={`text-[11px] font-bold ${task.is_recurring ? 'text-primary-600' : 'text-slate-500'} print:text-black print:text-[10pt]`}>
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
            <div className="py-20 text-center opacity-30 print:hidden">
              <p className="text-sm font-bold uppercase tracking-widest">{t.noTasksFound || "Маълумот мавжуд эмас"}</p>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-white dark:bg-slate-800 rounded-[1rem] p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-100"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-bold dark:text-white mb-2">{t.confirmDeletion}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic">
               {t.deleteWarning?.replace('{title}', taskToDelete.title) || `"${taskToDelete.title}" вазифасини ўчирасизми?`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setTaskToDelete(null)} className="btn-secondary flex-1 py-3 font-bold">{t.no || "Йўқ"}</button>
              <button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex-1 py-3 transition-all">{t.yes || "Ҳа"}</button>
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