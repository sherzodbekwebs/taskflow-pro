import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function KanbanBoard({ tasks, onAddTask, onEditTask, onDeleteTask }) {
  const { hasAccess, t, moveTask } = useApp();

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const columns = {
    new: { 
      title: t.statusNew || 'Yangi', 
      color: 'bg-sky-500', 
      headerBg: 'bg-sky-50/70 dark:bg-sky-950/30',
      badgeBg: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300',
      borderColor: 'border-sky-200 dark:border-sky-800'
    },
    progress: { 
      title: t.statusProgress || 'Jarayonda', 
      color: 'bg-amber-500', 
      headerBg: 'bg-amber-50/70 dark:bg-amber-950/30',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
      borderColor: 'border-amber-200 dark:border-amber-800'
    },
    review: { 
      title: t.statusReview || 'Tekshiruvda', 
      color: 'bg-purple-500', 
      headerBg: 'bg-purple-50/70 dark:bg-purple-950/30',
      badgeBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    done: { 
      title: t.statusDone || 'Tugallangan', 
      color: 'bg-emerald-500', 
      headerBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    }
  };

  const handleDragStart = (task) => {
    setDraggedTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== status) setDragOverStatus(status);
  };

  const handleDragLeave = (status) => {
    if (dragOverStatus === status) setDragOverStatus(null);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = draggedTaskId;
    setDraggedTaskId(null);
    setDragOverStatus(null);

    if (!taskId) return;

    const task = tasks.find(t => String(t.id) === String(taskId));
    if (!task || task.status === status) return;

    moveTask(taskId, status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch w-full">
      {Object.entries(columns).map(([status, info]) => {
        const columnTasks = tasks
          .filter(t => t.status === status)
          .sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
            const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
            return dateB - dateA;
          });

        const isDropTarget = dragOverStatus === status;

        return (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={() => handleDragLeave(status)}
            onDrop={(e) => handleDrop(e, status)}
            className={`flex flex-col h-[calc(100vh-230px)] min-h-[600px] bg-slate-50/50 dark:bg-slate-900/50 border rounded-2xl overflow-hidden transition-all duration-200
              ${isDropTarget 
                ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/20 dark:bg-primary-950/20 shadow-md' 
                : 'border-slate-200/80 dark:border-slate-800 shadow-2xs'}
            `}
          >
            {/* Column Header */}
            <div className={`p-3.5 px-4 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between shrink-0 ${info.headerBg}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${info.color} shadow-xs`} />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{info.title}</h3>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${info.badgeBg}`}>
                  {columnTasks.length}
                </span>
              </div>
              <button 
                onClick={() => onAddTask(status)} 
                title={t.addTask || "Vazifa qo'shish"}
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center transition-colors shadow-xs"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Task list container */}
            <div className={`p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar ${isDropTarget ? 'bg-primary-50/10' : ''}`}>
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                  <span>{t.noTasksInColumn || "Vazifalar yo'q"}</span>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    isDragging={draggedTaskId === task.id}
                    draggable
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}