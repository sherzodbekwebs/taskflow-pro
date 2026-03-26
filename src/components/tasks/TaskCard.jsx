import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Calendar, Paperclip, MessageSquare, Flag, Edit, Send, Trash2, ShieldAlert } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Vakolat yo'qligi haqida kichik modal
function PermissionDeniedModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100"><ShieldAlert size={32} /></div>
        <h3 className="text-xl font-bold dark:text-white mb-2">Vakolat yetarli emas</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Kechirasiz, ushbu amalni bajarish uchun sizda yetarli ruxsat mavjud emas.</p>
        <button onClick={onClose} className="btn-primary w-full py-3 font-bold uppercase text-xs">Tushunarli</button>
      </div>
    </div>
  );
}

export default function TaskCard({ task, onEdit, onDelete, isDragging = false }) {
  const { users, t, addComment, currentUser, isSuperAdmin, hasAccess } = useApp();
  const navigate = useNavigate();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showNoPerm, setShowNoPerm] = useState(false);
  
  const user = users.find(u => u.id === task.assignedUser);
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadline && isPast(deadline) && task.status !== 'done';

  // PROGRESS HISOB-KITOBLARI (XATO SHU YERDA TUZATILDI)
  const doneSubs = task.subtasks?.filter(s => s.done).length || 0;
  const totalSubs = task.subtasks?.length || 0;
  const progress = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;

  // RUXSAT TEKSHIRUVI
  const canModify = isSuperAdmin || hasAccess || task.assignedUser === currentUser?.id;

  const handleAction = (e, callback) => {
    e.stopPropagation();
    if (canModify) {
      callback(task);
    } else {
      setShowNoPerm(true);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(task.id, commentText.trim());
    setCommentText('');
  };

  const STATUS_CLASS = { new: 'badge-new', progress: 'badge-progress', done: 'badge-done' };
  const PRIORITY_COLOR = {
    high: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    medium: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    low: 'text-slate-400 bg-slate-50 dark:bg-slate-700/50',
  };
  const PRIORITY_BAR = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-slate-300' };

  return (
    <>
      <div
        className={`bg-white dark:bg-slate-800 p-5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-[0.7rem] transition-all duration-300 group relative select-none shadow-none
          ${isDragging ? 'shadow-2xl ring-2 ring-primary-500 z-50 scale-[1.02] bg-white dark:bg-slate-800' : 'hover:border-primary-400'}
        `}
        onClick={() => navigate(`/tasks/${task.id}`)}
      >
        <div className="absolute top-4 right-4 flex gap-1.5 z-20">
          <button 
            onClick={(e) => handleAction(e, onEdit)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-600"
          >
            <Edit size={15} />
          </button>
          <button 
            onClick={(e) => handleAction(e, onDelete)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-600"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className={`w-12 h-1 rounded-full mb-4 ${PRIORITY_BAR[task.priority] || 'bg-slate-200'}`} />

        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 line-clamp-2 leading-snug pr-20 group-hover:text-primary-600 transition-colors">
          {task.title}
        </h3>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className={STATUS_CLASS[task.status] || 'badge-new'}>
            {t[{ new: 'statusNew', progress: 'statusProgress', done: 'statusDone' }[task.status]] || task.status}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${PRIORITY_COLOR[task.priority]}`}>
            <Flag size={10} /> {t[{ low: 'priorityLow', medium: 'priorityMedium', high: 'priorityHigh' }[task.priority]]}
          </span>
        </div>

        {totalSubs > 0 && (
          <div className="mb-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold uppercase">
              <span>Bajarilish</span>
              <span className="text-primary-500">{progress}%</span>
            </div>
            <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-700/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
              {(user?.fullName || user?.fullname || '?')[0].toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-500 truncate max-w-[70px]">{user?.fullName || user?.fullname || '—'}</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowCommentInput(!showCommentInput); }}
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${showCommentInput ? 'text-primary-500' : 'text-slate-400 hover:text-primary-500'}`}
            >
              <MessageSquare size={15} />
              {task.comments?.length || 0}
            </button>

            {task.files?.length > 0 && <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><Paperclip size={15} />{task.files.length}</span>}
            {deadline && <span className={`flex items-center gap-1.5 text-xs font-bold ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}><Calendar size={15} />{format(deadline, 'dd MMM')}</span>}
          </div>
        </div>

        {showCommentInput && (
          <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-1" onClick={e => e.stopPropagation()}>
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto custom-scrollbar text-left">
              {(task.comments || []).map((c, i) => (
                <div key={c.id || i} className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between mb-1 opacity-70">
                    <span className="font-bold text-primary-600">{c.userName || 'Foydalanuvchi'}</span>
                    <span>{c.createdAt ? format(new Date(c.createdAt), 'HH:mm') : ''}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                </div>
              ))}
              {(!task.comments || task.comments.length === 0) && (
                <p className="text-[10px] text-slate-400 italic text-center py-2">Hali izohlar yo'q</p>
              )}
            </div>
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input 
                autoFocus
                className="input text-[11px] py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border-none flex-1 rounded-xl"
                placeholder="Fikr bildiring..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button type="submit" className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg">
                <Send size={12} />
              </button>
            </form>
          </div>
        )}
      </div>

      {showNoPerm && <PermissionDeniedModal onClose={() => setShowNoPerm(false)} />}
    </>
  );
}