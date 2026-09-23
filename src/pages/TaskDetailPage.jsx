import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import TaskModal from '../components/tasks/TaskModal';
import {
  ArrowLeft, Calendar, User, AlignLeft,
  CheckCircle2, Circle, Paperclip, FileText, Download, X, Eye, Edit3, Trash2, ShieldAlert, RefreshCw, Check, Undo2, Layers, CheckCircle, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { uz, ru } from 'date-fns/locale';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    tasks, users, toggleSubtask, currentUser, isSuperAdmin,
    hasAccess, deleteTask, approveTask, rejectTask,
    moveTask, isActionLoading, language, t
  } = useApp();

  const task = useMemo(() => tasks.find(t => String(t.id) === String(id)), [id, tasks]);

  const [zoomImage, setZoomImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoPerm, setShowNoPerm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [syncingSubtasks, setSyncingSubtasks] = useState({});

  const handleToggleSubtask = async (taskId, subtaskId) => {
    if (syncingSubtasks[subtaskId]) return;
    setSyncingSubtasks(prev => ({ ...prev, [subtaskId]: true }));
    try {
      await toggleSubtask(taskId, subtaskId);
    } catch (err) {
      console.error("Subtask toggle error:", err);
    } finally {
      setSyncingSubtasks(prev => {
        const next = { ...prev };
        delete next[subtaskId];
        return next;
      });
    }
  };

  if (!task) return null;

  const dateFnsLocale = language === 'ru' ? ru : uz;

  // --- MUDDATNI ANIQLASH LOGIKASI ---
  const getDeadlineDisplay = () => {
    if (task.is_recurring) {
      const type = task.recurring_type;
      const val = task.recurring_value;

      if (type === 'daily') return t.everyDay;
      if (type === 'weekly') return t.everyWeek;

      // Agar start-end ko'rinishidagi ob'ekt bo'lsa
      if (typeof val === 'object' && val !== null) {
        const label = type === 'monthly' ? t.everyMonth : type === 'quarterly' ? t.everyQuarter : t.everyYear;
        return `${label} (${val.start}-${val.end} ${t.onDatesRangeWord})`;
      }

      // Agar bitta raqam bo'lsa
      if (val) {
        const label = type === 'monthly' ? t.everyMonth : type === 'quarterly' ? t.everyQuarter : t.everyYear;
        return `${label} (${val}-${t.onDateSingle})`;
      }

      return t.recurringGeneric;
    }

    // Agar oddiy vazifa bo'lsa
    return task.deadline ? format(new Date(task.deadline), 'dd MMM, yyyy', { locale: dateFnsLocale }) : '—';
  };

  const assignedUser = users.find(u => String(u.id) === String(task?.assignedUser));
  const doneCount = task.subtasks?.filter(s => s.done).length || 0;
  const totalCount = task.subtasks?.length || 0;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const canModify = isSuperAdmin || hasAccess || task.assignedUser === currentUser?.id;
  const isAdminOnly = isSuperAdmin || hasAccess;

  const handleApprove = () => {
    if (isAdminOnly) approveTask(task.id);
    else setShowNoPerm(true);
  };

  const handleReject = () => {
    if (isAdminOnly) rejectTask(task.id);
    else setShowNoPerm(true);
  };

  const confirmDelete = async () => {
    await deleteTask(task.id);
    navigate('/tasks');
  };

  const getIsImage = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);
  };

  const handleFileClick = (file) => {
    const ext = file.name?.split('.').pop()?.toLowerCase();
    if (getIsImage(file.name)) setZoomImage(file.url);
    else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'].includes(ext)) {
      setPreviewFile(file);
      setIframeKey(prev => prev + 1);
    }
    else window.open(file.url, '_blank');
  };

  return (
    <>
      <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">

        {/* 1. TOP ACTION & NAVIGATION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-colors w-fit"
          >
            <ArrowLeft size={16} /> 
            <span>{t.back || "Orqaga qaytish"}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            {task.status === 'review' && isAdminOnly && (
              <>
                <button 
                  onClick={handleReject} 
                  className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <Undo2 size={15} /> 
                  <span>{t.reject || "Qaytarish"}</span>
                </button>
                <button 
                  onClick={handleApprove} 
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Check size={15} /> 
                  <span>{t.approve || "Tasdiqlash"}</span>
                </button>
              </>
            )}

            {task.status !== 'review' && task.status !== 'done' && (
              <button
                onClick={() => moveTask(task.id, 'review')}
                disabled={isActionLoading}
                className="flex items-center gap-1.5 btn-primary py-2 px-4 text-xs font-bold"
              >
                {isActionLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle size={15} />
                )}
                <span>{t.finishTask || "Yakunlashga topshirish"}</span>
              </button>
            )}

            <button 
              onClick={() => canModify ? setShowEditModal(true) : setShowNoPerm(true)} 
              className="btn-secondary py-2 px-3.5 text-xs font-semibold"
            >
              <Edit3 size={15} /> 
              <span>{t.edit || "Tahrirlash"}</span>
            </button>

            <button 
              onClick={() => canModify ? setShowDeleteConfirm(true) : setShowNoPerm(true)} 
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border border-slate-200/80 dark:border-slate-800"
              title={t.delete || "O'chirish"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* 2. TASK OVERVIEW CARD */}
        <div className="card p-6 lg:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  task.status === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' :
                  task.status === 'progress' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400' :
                  task.status === 'review' ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400' :
                  'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-400'
                }`}>
                  {task.status === 'review' ? (t.statusReview || 'Tekshiruvda') : 
                   task.status === 'done' ? (t.statusDone || 'Tugallangan') : 
                   task.status === 'progress' ? (t.statusProgress || 'Jarayonda') : (t.statusNew || 'Yangi')}
                </span>

                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  task.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400' :
                  task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {task.priority || 'Normal'}
                </span>

                {task.department && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                    {task.department}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {task.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-[10px]">
                    {(assignedUser?.fullName || assignedUser?.fullname || "?")[0].toUpperCase()}
                  </div>
                  <span>{t.assignee || "Mas'ul"}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {assignedUser?.fullName || assignedUser?.fullname || "Tayinlanmagan"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-500" />
                  <span>{t.deadlineLabel || "Muddat"}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{getDeadlineDisplay()}</span>
                </div>
              </div>
            </div>

            {/* Progress Gauge */}
            <div className="lg:w-64 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-center">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {t.progressLabel || "Ijro holati"}
                </span>
                <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-2 text-right">
                {doneCount} / {totalCount} {t.completedLabel || "qism bajarildi"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Description & Files */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Description */}
            <div className="card p-6">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm mb-4">
                <AlignLeft size={16} className="text-primary-500" />
                <span>{t.taskDescriptionLabel || "Batafsil tavsif"}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {task.description || (t.noDescriptionText || "Ushbu vazifaga tavsif berilmagan.")}
              </p>
            </div>

            {/* Files & Attachments */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
                  <Paperclip size={16} className="text-primary-500" />
                  <span>{t.attachedFiles || "Biriktirilgan fayllar"}</span>
                </div>
                {task.files?.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {task.files.length} ta fayl
                  </span>
                )}
              </div>

              {task.files?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {task.files.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="group relative rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 aspect-square transition-all hover:shadow-xs"
                    >
                      <div onClick={() => handleFileClick(file)} className="w-full h-full cursor-pointer flex flex-col items-center justify-center p-2 text-center">
                        {getIsImage(file.name) ? (
                          <img src={file.url} className="w-full h-full object-cover rounded-lg" alt="file" />
                        ) : (
                          <>
                            <FileText size={26} className="text-slate-400 mb-1.5" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2 px-1 break-all">{file.name}</span>
                          </>
                        )}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                          <Eye size={20} className="text-white" />
                        </div>
                      </div>
                      <a 
                        href={file.url} 
                        download 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xs text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors"
                      >
                        <Download size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Paperclip size={24} className="mx-auto mb-1.5 opacity-40" />
                  <p>{t.noFilesText || "Biriktirilgan fayllar mavjud emas"}</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Subtasks List */}
          <div className="lg:col-span-4">
            <div className="card overflow-hidden">
              <div className="p-4 px-5 border-b border-slate-200/70 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  {t.subtasksListTitle || "Qism vazifalar (Checklist)"}
                </h3>
                <span className="text-xs font-extrabold bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full border border-primary-200/50 dark:border-primary-800/50">
                  {doneCount}/{totalCount}
                </span>
              </div>

              <div className="p-4 space-y-2">
                {task.subtasks && task.subtasks.length > 0 ? (
                  task.subtasks.map((st, idx) => {
                    const isSyncing = Boolean(syncingSubtasks[st.id]);
                    return (
                      <button 
                        key={st.id || idx} 
                        onClick={() => handleToggleSubtask(task.id, st.id)} 
                        disabled={isSyncing}
                        className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all text-left group ${
                          st.done 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300' 
                            : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 text-slate-700 dark:text-slate-200'
                        } ${isSyncing ? 'opacity-85 cursor-wait' : 'cursor-pointer hover:shadow-xs active:scale-[0.99]'}`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`mt-0.5 flex-shrink-0 transition-colors ${
                            isSyncing 
                              ? 'text-primary-500 dark:text-primary-400' 
                              : st.done 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-slate-300 dark:text-slate-600 group-hover:text-primary-500'
                          }`}>
                            {isSyncing ? (
                              <Loader2 size={17} className="animate-spin text-primary-500 dark:text-primary-400" />
                            ) : st.done ? (
                              <CheckCircle2 size={17} className="text-emerald-600 dark:text-emerald-400 transition-transform duration-150" />
                            ) : (
                              <Circle size={17} className="transition-transform duration-150 group-hover:scale-105" />
                            )}
                          </div>
                          <span className={`text-xs font-medium leading-relaxed select-none transition-all ${
                            st.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'
                          }`}>
                            {st.text}
                          </span>
                        </div>

                        {isSyncing && (
                          <div className="flex-shrink-0 flex items-center gap-1.5 pl-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-md border border-primary-200/60 dark:border-primary-800/60 animate-pulse">
                              <Loader2 size={10} className="animate-spin" />
                              <span>{language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...'}</span>
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    <Layers size={28} className="mx-auto mb-2 opacity-40" />
                    <p>{t.noSubtasksText || "Qism vazifalar mavjud emas"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MODALS SECTION */}
      {showNoPerm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowNoPerm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 max-w-sm w-full text-center border border-slate-200 dark:border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-900/40">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.noPermissionTitle || "Ruxsat yo'q"}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{t.noPermissionMsg || "Ushbu amalni bajarish uchun sizda yetarli ruxsat yo'q."}</p>
            <button onClick={() => setShowNoPerm(false)} className="btn-primary w-full py-2.5 text-xs font-bold">{t.understood || "Tushunarli"}</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 max-w-sm w-full text-center border border-slate-200 dark:border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900/40">
              <Trash2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.deleteConfirmTitle || "Vazifani o'chirish"}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{t.deleteConfirmMsg || "Haqiqatan ham ushbu vazifani o'chirmoqchimisiz?"}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 py-2.5 text-xs font-bold">{t.no || "Bekor qilish"}</button>
              <button onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex-1 py-2.5 text-xs transition-colors shadow-xs">{t.yesDelete || "O'chirish"}</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999]"><TaskModal task={task} onClose={() => setShowEditModal(false)} /></div>}
      {zoomImage && (
        <div className="fixed inset-0 bg-slate-950/90 z-[9999] flex items-center justify-center p-8 animate-fade-in" onClick={() => setZoomImage(null)}>
          <button className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors p-2"><X size={28} /></button>
          <img src={zoomImage} className="max-w-full max-h-[85vh] rounded-2xl border border-slate-700 shadow-2xl object-contain" alt="zoom" />
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 px-5 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <div className="flex items-center gap-3 truncate max-w-[60%]">
                <FileText className="text-primary-600 dark:text-primary-400" size={20} />
                <span className="text-sm font-bold truncate">{previewFile.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIframeKey(k => k + 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors" title={t.refresh}>
                  <RefreshCw size={16} />
                </button>
                <a href={previewFile.url} download target="_blank" rel="noreferrer" className="btn-primary py-2 px-3 text-xs font-bold">
                  <Download size={14} /> <span>{t.download || "Yuklab olish"}</span>
                </a>
                <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-950">
              <iframe key={iframeKey} src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewFile.url)}&embedded=true`} className="w-full h-full border-none" title="viewer" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}