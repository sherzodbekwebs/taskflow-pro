import React from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function KanbanBoard({ tasks, onAddTask, onEditTask, onDeleteTask }) {
  // context'dan hasAccess olindi
  const { hasAccess } = useApp();

  const columns = {
    new: { title: 'Янги', color: 'bg-blue-500' },
    progress: { title: 'Жараёнда', color: 'bg-amber-500' },
    review: { title: 'Текширувда', color: 'bg-purple-500' },
    done: { title: 'Тугалланган', color: 'bg-green-500' }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-start w-full min-w-[1200px] lg:min-w-0">
      {Object.entries(columns).map(([status, info]) => {
        const columnTasks = tasks.filter(t => t.status === status);

        return (
          <div 
            key={status} 
            className="flex flex-col min-h-[500px] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[0.7rem] overflow-hidden shadow-none"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${info.color}`} />
                <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {info.title}
                </h3>
                <span className="text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  {columnTasks.length}
                </span>
              </div>
              <button 
                onClick={() => onAddTask(status)} 
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-400 transition-all border border-transparent hover:border-slate-200"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="p-3 space-y-3 flex-1">
              {columnTasks.map((task) => (
                <div key={task.id}>
                  <TaskCard 
                    task={task} 
                    onEdit={onEditTask} 
                    onDelete={onDeleteTask} 
                    isDragging={false}
                  />
                </div>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="flex-1 flex items-center justify-center py-20 opacity-20">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Бўш</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}