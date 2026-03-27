import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import TaskModal from '../components/tasks/TaskModal';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskCard from '../components/tasks/TaskCard';
import { Plus, Search, LayoutGrid, List, X, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TasksPage() {
  const { tasks, users, departments, t, deleteTask, isActionLoading, refreshData } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [view, setView] = useState('kanban'); // kanban | list
  const [defaultStatus, setDefaultStatus] = useState('new');

  // RESPONSIVE VIEW SWITCHER
  // Ekran kichrayganda avtomatik 'list' rejimiga o'tkazish
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setView('list');
      } else {
        // Agar foydalanuvchi qo'lda o'zgartirmagan bo'lsa 'kanban'ga qaytadi
        // Lekin odatda mobil uchun 'list' afzal
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Dastlabki yuklanishda tekshirish
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const filtered = useMemo(() => {
    return tasks.filter(task => {
      if (search && !task.title?.toLowerCase().includes(search.toLowerCase())) return false;
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

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="h-full flex flex-col relative">

      {/* TOP STICKY CARD */}
      {/* z-[10] qilindi, Topbar z-40 va Sidebar z-50 dan pastda turishi uchun */}
      <div className="sticky top-0 z-[10] pb-4">
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
                {filtered.length} {t.operationsCountLabel || "ta"}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 flex-nowrap">
              <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700">
                <button onClick={() => setView('kanban')} className={`p-1.5 rounded-lg transition-all ${view === 'kanban' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={16} /></button>
                <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400'}`}><List size={16} /></button>
              </div>
              <button onClick={() => handleAddTask()} className="btn-primary h-10 px-3 sm:px-5 rounded-xl shadow-lg shadow-primary-500/10 font-bold text-[11px] sm:text-xs uppercase whitespace-nowrap">
                <Plus size={16} /> <span className="hidden sm:inline">{t.addTask}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/50">
            <div className="relative flex-1 min-w-[150px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9 text-xs h-10 border-transparent bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:border-slate-200" placeholder={t.searchPlaceholder || "Qidiruv..."} value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <select className="input w-auto text-[11px] font-bold py-2 px-3 h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">Holat</option>
                <option value="new">Yangi</option>
                <option value="progress">Jarayon</option>
                <option value="done">Tugal</option>
              </select>

              <select className="input w-auto text-[11px] font-bold py-2 px-3 h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                <option value="all">Ijrochi</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}
              </select>

              {(search || filterStatus !== 'all' || filterUser !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterUser('all'); }} className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar pb-10">
        {view === 'kanban' ? (
          <div className="mt-1 min-w-[1000px] lg:min-w-0"> 
            <KanbanBoard
              tasks={filtered}
              onAddTask={handleAddTask}
              onEditTask={(t) => { setEditTask(t); setShowModal(true); }}
              onDeleteTask={(t) => setTaskToDelete(t)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-1 px-1">
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} onEdit={(t) => { setEditTask(t); setShowModal(true); }} onDelete={(t) => setTaskToDelete(t)} />
            ))}
          </div>
        )}
      </div>

      {/* Modals qolgan qismi o'zgarishsiz qoladi... */}
      {showModal && (
        <TaskModal
          task={editTask ? tasks.find(t => t.id === editTask.id) : { status: defaultStatus }}
          onClose={() => { setShowModal(false); setEditTask(null); }}
        />
      )}

      {taskToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-[1rem] p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-bold dark:text-white mb-2">{t.confirmDeletion}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic">"{taskToDelete.title}" vazifasini o'chirasizmi?</p>
            <div className="flex gap-3"><button onClick={() => setTaskToDelete(null)} className="btn-secondary flex-1 py-3">Yo'q</button><button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex-1 py-3 transition-all">Ha</button></div>
          </div>
        </div>
      )}
    </div>
  );
}