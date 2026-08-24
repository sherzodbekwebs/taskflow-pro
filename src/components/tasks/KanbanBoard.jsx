import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function KanbanBoard({ tasks, onAddTask, onEditTask, onDeleteTask }) {
  const { hasAccess, t, moveTask } = useApp();

  // Sudralayotgan vazifa ID'si va ustiga sudralayotgan ustun (drop target)
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const columns = {
    new: { title: t.statusNew || 'Янги', color: 'bg-blue-500' },
    progress: { title: t.statusProgress || 'Жараёнда', color: 'bg-amber-500' },
    review: { title: t.statusReview || 'Текширувда', color: 'bg-purple-500' },
    done: { title: t.statusDone || 'Тугалланган', color: 'bg-green-500' }
  };

  const handleDragStart = (task) => {
    setDraggedTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault(); // Drop imkoniyatini yoqish uchun shart
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
    if (!task || task.status === status) return; // o'sha ustunga tashlansa hech narsa qilmaymiz

    moveTask(taskId, status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-start w-full">
      {Object.entries(columns).map(([status, info]) => {

        // --- МАНА ШУ ЕРДА ТАРТИБЛАШ БЎЛИШИ ШАРТ ---
        const columnTasks = tasks
          .filter(t => t.status === status)
          .sort((a, b) => {
            // Bu yerda ham updated_at bo'yicha saralaymiz
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
            className={`flex flex-col min-h-[500px] bg-white dark:bg-slate-900 border rounded-[0.7rem] overflow-hidden transition-colors
              ${isDropTarget ? 'border-primary-400 ring-2 ring-primary-200 dark:ring-primary-900/40' : 'border-slate-200 dark:border-slate-700'}
            `}
          >
            <div className="p-4 border-b flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${info.color}`} />
                <h3 className="text-[11px] font-black uppercase text-slate-500">{info.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border">{columnTasks.length}</span>
              </div>
              <button onClick={() => onAddTask(status)} className="text-slate-400 hover:text-primary-500"><Plus size={16} /></button>
            </div>

            <div className={`p-3 space-y-3 flex-1 ${isDropTarget ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
              {columnTasks.map((task) => (
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
              ))}
              {columnTasks.length === 0 && (
                <div className="py-8 text-center text-[10px] font-bold uppercase text-slate-300 dark:text-slate-600 select-none">
                  —
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}