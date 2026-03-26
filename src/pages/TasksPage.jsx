import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import TaskModal from '../components/tasks/TaskModal';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskCard from '../components/tasks/TaskCard';
import { Plus, Search, LayoutGrid, List, X, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';

export default function TasksPage() {
  const { tasks, users, departments, t, deleteTask, isActionLoading } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('kanban'); 
  const [defaultStatus, setDefaultStatus] = useState('new');

  const showSuccess = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const filtered = useMemo(() => {
    return tasks.filter(task => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterUser !== 'all' && task.assignedUser !== filterUser) return false;
      return true;
    });
  }, [tasks, search, filterStatus, filterUser]);

  const handleAddTask = (status = 'new') => {
    setEditTask(null);
    setDefaultStatus(status);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      showSuccess(t.toastTaskDeleted || "Vazifa tizimdan muvaffaqiyatli olib tashlandi");
    }
  };

  return (
    <div className="h-full flex flex-col relative">

      {/* SUCCESS TOAST */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <CheckCircle2 size={18} className="text-green-400 dark:text-green-600" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        </div>
      )}

      {/* TOP STICKY CARD */}
      <div className="sticky top-0 z-30 pb-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[0.7rem] p-5 space-y-5 transition-colors shadow-none">

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                {t.tasks}
              </h1>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                {filtered.length} {t.operationsCountLabel || "ta jarayon"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700">
                <button onClick={() => setView('kanban')} className={`p-1.5 rounded-lg transition-all ${view === 'kanban' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16} /></button>
                <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={16} /></button>
              </div>
              <button onClick={() => handleAddTask()} className="btn-primary h-10 px-5 rounded-xl shadow-lg shadow-primary-500/10 font-bold text-xs uppercase tracking-tight">
                <Plus size={16} /> <span>{t.addTask}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/50">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9 text-xs h-10 bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white focus:border-slate-200" placeholder={t.searchPlaceholder || "Filtrlash va qidiruv..."} value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <select className="input w-auto text-[11px] font-bold py-2 px-4 h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">{t.allStatuses || "Barcha holatlar"}</option>
                <option value="new">{t.statusNew}</option>
                <option value="progress">{t.statusProgress}</option>
                <option value="done">{t.statusDone}</option>
              </select>

              <select className="input w-auto text-[11px] font-bold py-2 px-4 h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                <option value="all">{t.allAssignees || "Barcha ijrochilar"}</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}
              </select>

              {(search || filterStatus !== 'all' || filterUser !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterUser('all'); }} className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-10">
        {view === 'kanban' ? (
          <div className="mt-1">
            <KanbanBoard
              tasks={filtered}
              onAddTask={handleAddTask}
              onEditTask={(t) => { setEditTask(t); setShowModal(true); }}
              onDeleteTask={(t) => setTaskToDelete(t)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-1">
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} onEdit={(t) => { setEditTask(t); setShowModal(true); }} onDelete={(t) => setTaskToDelete(t)} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-30">
                <p className="text-sm font-bold uppercase tracking-widest">{t.noTasksFound || "Hech qanday ma'lumot aniqlanmadi"}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editTask ? tasks.find(t => t.id === editTask.id) : { status: defaultStatus }}
          onClose={(updated) => {
            setShowModal(false);
            setEditTask(null);
            if(updated === true) showSuccess(editTask ? t.toastChangesSaved : t.toastTaskCreated);
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-[1rem] p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100 dark:border-red-900/40">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">{t.confirmDeletion || "O'chirishni tasdiqlang"}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic">
              "{taskToDelete.title}" {t.deletionWarning || "vazifasi tizimdan butunlay olib tashlanadi."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setTaskToDelete(null)} className="btn-secondary flex-1 py-3 font-bold">{t.cancel}</button>
              <button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex-1 py-3 shadow-lg shadow-red-500/20 transition-all">{t.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}