import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  Calendar, Paperclip, MessageSquare, Flag, Edit, Send, Trash2,
  ShieldAlert, MoreVertical, Check, X, Star
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Vakolat yo'qligi haqida modal
function PermissionDeniedModal({ onClose, t }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <ShieldAlert size={24} />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">{t.noPermissionTitle || "Vakolat yetarli emas"}</h3>
        <p className="text-xs text-slate-500 mb-6">{t.noPermissionModalDesc || "Ushbu amalni bajarish uchun sizda yetarli ruxsat yo'q."}</p>
        <button onClick={onClose} className="btn-primary w-full py-2.5 text-xs font-bold">{t.understand || "Tushundim"}</button>
      </div>
    </div>
  );
}

// Vazifani 1-5 yulduz bilan baholash modali
function RatingModal({ initialRating = 0, onClose, onConfirm, t, allowClear = false }) {
  const [stars, setStars] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const display = hover || stars;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[250] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150" 
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Star size={24} fill="currentColor" />
        </div>

        <div className="mb-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
            {t.rateTask || "Vazifani baholang"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.selectRatingHint || "Bajarilgan ish sifatiga 1 dan 5 gacha baho bering"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2.5 mb-6">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(n)}
              className="p-1 rounded-lg transition-transform hover:scale-115 focus:outline-none"
            >
              <Star
                size={30}
                className={display >= n ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}
                fill={display >= n ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onConfirm(stars)}
            disabled={!allowClear && stars < 1}
            className="btn-primary w-full py-2.5 text-xs font-bold disabled:opacity-40"
          >
            {t.confirm || "Tasdiqlash"}
          </button>

          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="btn-secondary flex-1 py-2 text-xs font-semibold"
            >
              {t.cancel || "Bekor qilish"}
            </button>

            {allowClear && (
              <button
                onClick={() => onConfirm(0)}
                className="btn-secondary flex-1 py-2 text-xs font-semibold"
              >
                {t.noRating || "Baholanmagan"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TaskCard({
  task, onEdit, onDelete, isDragging = false,
  draggable = false, onDragStart, onDragEnd,
}) {
  const { users, t, addComment, currentUser, isSuperAdmin, hasAccess, approveTask, rejectTask, rateTask } = useApp();
  const navigate = useNavigate();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showNoPerm, setShowNoPerm] = useState(false);
  const [ratingMode, setRatingMode] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = users.find(u => u.id === task.assignedUser);
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadline && isPast(deadline) && task.status !== 'done';

  const doneSubs = task.subtasks?.filter(s => s.done).length || 0;
  const totalSubs = task.subtasks?.length || 0;
  const progress = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;

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

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(task.id));
    onDragStart?.(task);
  };

  const handleDragEnd = (e) => {
    e.stopPropagation();
    onDragEnd?.(task);
  };

  const STATUS_BADGE = {
    new: 'badge-new',
    progress: 'badge-progress',
    review: 'badge-review',
    done: 'badge-done'
  };

  const PRIORITY_BADGE = {
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  };

  const PRIORITY_LINE = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-slate-300 dark:bg-slate-700',
  };

  return (
    <>
      <div
        draggable={draggable}
        onDragStart={draggable ? handleDragStart : undefined}
        onDragEnd={draggable ? handleDragEnd : undefined}
        className={`bg-white dark:bg-slate-800/90 p-4 cursor-pointer border border-slate-200/90 dark:border-slate-700/80 rounded-xl transition-all duration-200 group relative select-none shadow-xs hover:shadow-md hover:border-primary-400 dark:hover:border-primary-600 ${
          isDragging ? 'opacity-40 shadow-2xl ring-2 ring-primary-500 z-50 scale-[1.02]' : ''
        } ${draggable ? 'active:cursor-grabbing' : ''}`}
        onClick={() => navigate(`/tasks/${task.id}`)}
      >
        {/* Top Accent Line */}
        <div className={`h-1 w-10 rounded-full mb-3 ${PRIORITY_LINE[task.priority] || 'bg-slate-300'}`} />

        {/* Action buttons (hover or review state) */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 z-10">
          {task.status === 'review' && hasAccess && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1 rounded-lg text-primary-600 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 transition-all"
                title="Tasdiqlash menyusi"
              >
                <MoreVertical size={14} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[100] py-1 animate-in fade-in zoom-in duration-150 overflow-hidden">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); setRatingMode('approve'); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left"
                  >
                    <Check size={13} /> {t.approve || "Qabul qilish"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); rejectTask(task.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-left"
                  >
                    <X size={13} /> {t.reject || "Qaytarish"}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={(e) => handleAction(e, onEdit)}
            className="p-1 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
            title="Tahrirlash"
          >
            <Edit size={13} />
          </button>
          <button
            onClick={(e) => handleAction(e, onDelete)}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all opacity-0 group-hover:opacity-100"
            title="O'chirish"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Task Title */}
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-2.5 line-clamp-2 leading-snug pr-12 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {task.title}
        </h3>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className={STATUS_BADGE[task.status] || 'badge-new'}>
            {task.status === 'review' ? (t.statusReview || 'Tekshiruvda') : (t[{ new: 'statusNew', progress: 'statusProgress', done: 'statusDone' }[task.status]] || task.status)}
          </span>
          <span className={PRIORITY_BADGE[task.priority] || 'badge-low'}>
            <Flag size={10} />
            <span>{t[{ low: 'priorityLow', medium: 'priorityMedium', high: 'priorityHigh' }[task.priority]] || task.priority}</span>
          </span>
        </div>

        {/* Subtasks Progress */}
        {totalSubs > 0 && (
          <div className="mb-3 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
              <span>{t.taskProgress || "Jarayon"}</span>
              <span className="text-primary-600 dark:text-primary-400">{progress}%</span>
            </div>
            <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Rating widget (for done status) */}
        {task.status === 'done' && (
          <div
            onClick={(e) => { if (!hasAccess) return; e.stopPropagation(); setRatingMode('reRate'); }}
            className={`flex items-center justify-between mb-3 bg-amber-50/50 dark:bg-amber-950/20 px-2.5 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/30 transition-all ${
              hasAccess ? 'cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/30' : ''
            }`}
          >
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  size={12}
                  className={(task.rating || 0) >= n ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}
                  fill={(task.rating || 0) >= n ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
              {task.rating ? `${task.rating}/5` : (t.noRating || "Baholanmagan")}
            </span>
          </div>
        )}

        {/* Card Footer: User & Metadata */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-primary-600 flex items-center justify-center text-white text-[10px] font-extrabold shrink-0 shadow-xs">
              {(user?.fullName || user?.fullname || '?')[0].toUpperCase()}
            </div>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[80px]">
              {user?.fullName || user?.fullname || '—'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowCommentInput(!showCommentInput); }} 
              className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                showCommentInput ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <MessageSquare size={13} />
              <span>{task.comments?.length || 0}</span>
            </button>
            {task.files?.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Paperclip size={13} />
                <span>{task.files.length}</span>
              </span>
            )}
            {deadline && (
              <span className={`flex items-center gap-1 text-[11px] font-semibold ${
                isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
              }`}>
                <Calendar size={13} />
                <span>{format(deadline, 'dd MMM')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Comment Section Pop-down */}
        {showCommentInput && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="space-y-1.5 mb-2.5 max-h-28 overflow-y-auto text-left text-xs">
              {(task.comments || []).map((c, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-0.5 text-[10px] text-slate-400">
                    <span className="font-bold text-primary-600 dark:text-primary-400">{c.userName || (t.unknownUser || 'Foydalanuvchi')}</span>
                    <span>{c.createdAt ? format(new Date(c.createdAt), 'HH:mm') : ''}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs">{c.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleCommentSubmit} className="flex gap-1.5">
              <input 
                autoFocus 
                className="input text-xs py-1.5 px-2.5 flex-1 h-8" 
                placeholder={t.commentPlaceholder || "Izoh qoldiring..."} 
                value={commentText} 
                onChange={e => setCommentText(e.target.value)} 
              />
              <button type="submit" className="btn-primary px-2.5 h-8 flex items-center justify-center">
                <Send size={12} />
              </button>
            </form>
          </div>
        )}
      </div>

      {showNoPerm && <PermissionDeniedModal onClose={() => setShowNoPerm(false)} t={t} />}

      {ratingMode && (
        <RatingModal
          initialRating={ratingMode === 'reRate' ? (task.rating || 0) : 0}
          allowClear={ratingMode === 'reRate'}
          onClose={() => setRatingMode(null)}
          onConfirm={(stars) => {
            if (ratingMode === 'approve') {
              approveTask(task.id, stars);
            } else {
              rateTask(task.id, stars);
            }
            setRatingMode(null);
          }}
          t={t}
        />
      )}
    </>
  );
}