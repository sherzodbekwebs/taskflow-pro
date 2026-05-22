import React from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function KanbanBoard({ tasks, onAddTask, onEditTask, onDeleteTask }) {
  const { hasAccess } = useApp();

  const columns = {
    new: { title: 'Янги', color: 'bg-blue-500' },
    progress: { title: 'Жараёнда', color: 'bg-amber-500' },
    review: { title: 'Текширувда', color: 'bg-purple-500' },
    done: { title: 'Тугалланган', color: 'bg-green-500' }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-start w-full">
      {Object.entries(columns).map(([status, info]) => {
        
        // --- МАНА ШУ ЕРДА ТАРТИБЛАШ БЎЛИШИ ШАРТ ---
        const columnTasks = tasks
          .filter(t => t.status === status)
          .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA; // Янгиси тепага
          });

        return (
          <div key={status} className="flex flex-col min-h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[0.7rem] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${info.color}`} />
                <h3 className="text-[11px] font-black uppercase text-slate-500">{info.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border">{columnTasks.length}</span>
              </div>
              <button onClick={() => onAddTask(status)} className="text-slate-400 hover:text-primary-500"><Plus size={16} /></button>
            </div>

            <div className="p-3 space-y-3 flex-1">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}