import { useState, useRef, useEffect } from 'react'; // useRef va useEffect qo'shildi
import { useApp } from '../../contexts/AppContext';
import {
  Calendar, Paperclip, MessageSquare, Flag, Edit, Send, Trash2,
  ShieldAlert, MoreVertical, Check, X, Star // Yangi ikonlar qo'shildi
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Vakolat yo'qligi haqida kichik modal
function PermissionDeniedModal({ onClose, t }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><ShieldAlert size={32} /></div>
        <h3 className="text-xl font-bold dark:text-white mb-2">{t.noPermissionTitle}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{t.noPermissionModalDesc}</p>
        <button onClick={onClose} className="btn-primary w-full py-3 font-bold uppercase text-xs">{t.understand}</button>
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Yuqoridagi Ikonka */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[2rem] flex items-center justify-center shadow-inner">
            <Star size={40} fill="currentColor" />
          </div>
        </div>

        {/* Sarlavha va Matn */}
        <div className="mb-10">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {t.rateTask || "Вазифани баҳоланг"}
          </h3>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-tight px-4 leading-relaxed">
            {t.selectRatingHint || "Бажарилgan иш сифатига баҳо беринг"}
          </p>
        </div>

        {/* Yulduzchalar - Kengroq masofa (gap-4) */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(n)}
              className="transition-all duration-300 transform hover:scale-125"
            >
              <Star
                size={38}
                className={display >= n ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}
                fill={display >= n ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        {/* Tugmalar - Tiqilmagan (Vertical Stack or Grouped) */}
        <div className="flex flex-col gap-3">
          
          <button
            onClick={() => onConfirm(stars)}
            disabled={!allowClear && stars < 1}
            className="w-full py-4 rounded-2xl bg-[#00aeef] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-[#009cd6] disabled:opacity-40 disabled:shadow-none transition-all"
          >
            {t.confirm || "Тасдиқлаш"}
          </button>

          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-wider border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition-all"
            >
              {t.cancel || "Бекор қилиш"}
            </button>

            {allowClear && (
              <button
                onClick={() => onConfirm(0)}
                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-wider hover:bg-slate-200 transition-all"
              >
                {t.noRating || "Баҳоланмаган"}
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
  // approveTask va rejectTask AppContext'dan olindi
  const { users, t, addComment, currentUser, isSuperAdmin, hasAccess, approveTask, rejectTask, rateTask } = useApp();
  const navigate = useNavigate();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showNoPerm, setShowNoPerm] = useState(false);

  // Baholash modali: 'approve' - review'dan done'ga o'tkazishdan oldin, 'reRate' - done bo'lgan vazifani qayta baholash
  const [ratingMode, setRatingMode] = useState(null);

  // Uch nuqta menyusi uchun state va ref
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Menyudan tashqariga bosilganda yopish
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

  // review statusi uchun badge qo'shildi
  const STATUS_CLASS = {
    new: 'badge-new',
    progress: 'badge-progress',
    review: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase',
    done: 'badge-done'
  };

  const PRIORITY_COLOR = {
    high: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    medium: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    low: 'text-slate-400 bg-slate-50 dark:bg-slate-700/50',
  };
  const PRIORITY_BAR = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-slate-300' };

  return (
    <>
      <div
        draggable={draggable}
        onDragStart={draggable ? handleDragStart : undefined}
        onDragEnd={draggable ? handleDragEnd : undefined}
        className={`bg-white dark:bg-slate-800 p-5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-[0.7rem] transition-all duration-300 group relative select-none shadow-none
          ${isDragging ? 'opacity-40 shadow-2xl ring-2 ring-primary-500 z-50 scale-[1.02] bg-white dark:bg-slate-800' : 'hover:border-primary-400'}
          ${draggable ? 'active:cursor-grabbing' : ''}
        `}
        onClick={() => navigate(`/tasks/${task.id}`)}
      >
        <div className="absolute top-4 right-4 flex gap-1.5 z-10">

          {/* YANGI: UCH NUQTA MENYU (Faqat Review va Admin uchun) */}
          {task.status === 'review' && hasAccess && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-sm border border-indigo-100 dark:border-indigo-800"
              >
                <MoreVertical size={14} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[100] py-1 animate-in fade-in zoom-in duration-200 overflow-hidden">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); setRatingMode('approve'); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                  >
                    <Check size={14} /> {t.approve}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); rejectTask(task.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <X size={14} /> {t.reject}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={(e) => handleAction(e, onEdit)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-600"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => handleAction(e, onDelete)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-600"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className={`w-12 h-1 rounded-full mb-4 ${PRIORITY_BAR[task.priority] || 'bg-slate-200'}`} />
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 line-clamp-2 leading-snug pr-20 group-hover:text-primary-600 transition-colors">{task.title}</h3>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className={STATUS_CLASS[task.status] || 'badge-new'}>
            {task.status === 'review' ? t.statusReview : (t[{ new: 'statusNew', progress: 'statusProgress', done: 'statusDone' }[task.status]] || task.status)}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${PRIORITY_COLOR[task.priority]}`}>
            <Flag size={10} /> {t[{ low: 'priorityLow', medium: 'priorityMedium', high: 'priorityHigh' }[task.priority]]}
          </span>
        </div>

        {totalSubs > 0 && (
          <div className="mb-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold uppercase">
              <span>{t.taskProgress}</span>
              <span className="text-primary-500">{progress}%</span>
            </div>
            <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {task.status === 'done' && (
          <div
            onClick={(e) => { if (!hasAccess) return; e.stopPropagation(); setRatingMode('reRate'); }}
            className={`flex items-center justify-between mb-4 bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30 transition-all
              ${hasAccess ? 'cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20' : ''}
            `}
          >
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  size={14}
                  className={(task.rating || 0) >= n ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}
                  fill={(task.rating || 0) >= n ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-tighter">
              {task.rating ? `${task.rating}/5` : t.noRating}
            </span>
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
            <button onClick={(e) => { e.stopPropagation(); setShowCommentInput(!showCommentInput); }} className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${showCommentInput ? 'text-primary-500' : 'text-slate-400 hover:text-primary-500'}`}>
              <MessageSquare size={15} /> {task.comments?.length || 0}
            </button>
            {task.files?.length > 0 && <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><Paperclip size={15} />{task.files.length}</span>}
            {deadline && <span className={`flex items-center gap-1.5 text-xs font-bold ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}><Calendar size={15} />{format(deadline, 'dd MMM')}</span>}
          </div>
        </div>

        {showCommentInput && (
          <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-1" onClick={e => e.stopPropagation()}>
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto custom-scrollbar text-left text-[11px]">
              {(task.comments || []).map((c, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1 opacity-70">
                    <span className="font-bold text-primary-600">{c.userName || t.unknownUser}</span>
                    <span>{c.createdAt ? format(new Date(c.createdAt), 'HH:mm') : ''}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input autoFocus className="input text-[11px] py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border-none flex-1 rounded-xl" placeholder={t.commentPlaceholder} value={commentText} onChange={e => setCommentText(e.target.value)} />
              <button type="submit" className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg"><Send size={12} /></button>
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