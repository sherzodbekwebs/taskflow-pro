import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import TaskModal from '../components/tasks/TaskModal';
import {
  ArrowLeft, Calendar, User, AlignLeft,
  CheckCircle2, Circle, Paperclip, FileText, Download, X, Eye, Edit3, Trash2, ShieldAlert, RefreshCw, Check, Undo2, Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, users, toggleSubtask, t, currentUser, isSuperAdmin, hasAccess, deleteTask, approveTask, rejectTask, updateTask } = useApp();
  
  const task = useMemo(() => tasks.find(t => t.id === id), [id, tasks]);

  const [zoomImage, setZoomImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoPerm, setShowNoPerm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!task) return null;

  const assignedUser = users.find(u => u.id === task.assignedUser);
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
      <div className="fixed top-16 left-0 lg:left-64 right-0 bottom-0 bg-[#e9eef2] dark:bg-slate-950 z-10 p-4 lg:p-6 flex flex-col overflow-hidden animate-fade-in font-sans">
        
        {/* 1. HEADER SECTION */}
        <div className="flex-shrink-0 space-y-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-all font-bold uppercase text-[10px] tracking-widest w-fit">
              <ArrowLeft size={16} /> ОРҚАГА ҚАЙТИШ
            </button>
            
            <div className="flex gap-2 w-full sm:w-auto">
              {task.status === 'review' && (isSuperAdmin || hasAccess) && (
                <div className="flex gap-2 flex-1 sm:flex-none mr-4">
                   <button onClick={handleReject} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-[0.7rem] text-[10px] font-bold uppercase transition-all hover:bg-amber-600">
                      <Undo2 size={14} /> Рад этиш
                   </button>
                   <button onClick={handleApprove} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-[0.7rem] text-[10px] font-bold uppercase transition-all hover:bg-green-600">
                      <Check size={14} /> Тасдиқлаш
                   </button>
                </div>
              )}
              <button onClick={() => canModify ? setShowDeleteConfirm(true) : setShowNoPerm(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-[0.7rem] text-slate-400 hover:text-red-500 transition-all uppercase text-[10px] font-bold tracking-widest">
                <Trash2 size={14} /> Ўчириш
              </button>
              <button onClick={() => canModify ? setShowEditModal(true) : setShowNoPerm(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-[0.7rem] text-slate-400 hover:text-primary-500 transition-all uppercase text-[10px] font-bold tracking-widest">
                <Edit3 size={14} /> Таҳрирлаш
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 rounded-[0.7rem] shadow-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start gap-3">
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight break-words flex-1">
                    {task.title}
                  </h1>
                  <div className="flex gap-1 flex-shrink-0 mt-1">
                    <span className={`badge-${task.status} px-2 py-0.5 text-[9px] font-bold uppercase`}>{task.status === 'review' ? 'Текширувда' : task.status}</span>
                    <span className={`badge-${task.priority} px-2 py-0.5 text-[9px] font-bold uppercase`}>{task.priority}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold"><User size={14} className="text-primary-500" /><span className="text-slate-400 uppercase text-[10px]">Ижрочи:</span><span className="dark:text-white">{assignedUser?.fullName || assignedUser?.fullname || '—'}</span></div>
                  <div className="flex items-center gap-2 text-xs font-bold"><Calendar size={14} className="text-amber-500" /><span className="text-slate-400 uppercase text-[10px]">Муддат:</span><span className="dark:text-white">{task.deadline ? format(new Date(task.deadline), 'dd MMM, yyyy', { locale: uz }) : '—'}</span></div>
                </div>
              </div>

              <div className="lg:col-span-4 pl-0 lg:pl-8 lg:border-l border-slate-100 dark:border-slate-700 w-full pt-4 lg:pt-0">
                <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Progress</span><span className="text-xl font-black text-primary-500">{progress}%</span></div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase text-right">{doneCount} / {totalCount} бажарилди</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BODY SECTION */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          {/* LEFT SCROLL (Hujjatlar + Tafsif) */}
          <div className="lg:col-span-8 overflow-y-auto p-1 space-y-4 custom-scrollbar">
            <div className="bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 rounded-[0.7rem]">
              <div className="flex items-center gap-2 text-slate-400 mb-6 font-bold uppercase text-[10px] tracking-widest"><Paperclip size={16} className="text-primary-500" /> Бириктирилган ҳужжатлар</div>
              {task.files?.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {task.files.map((file, idx) => (
                    <div key={idx} className="group relative rounded-[0.7rem] border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 aspect-square transition-all">
                      <div onClick={() => handleFileClick(file)} className="w-full h-full cursor-pointer">
                        {getIsImage(file.name) ? <img src={file.url} className="w-full h-full object-cover" alt="file" /> : <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[7px] font-bold text-slate-400"><FileText size={20} className="text-slate-300 mb-1" /><span className="truncate w-full px-1">{file.name}</span></div>}
                        <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Eye size={16} className="text-primary-500" /></div>
                      </div>
                      <a href={file.url} download target="_blank" rel="noreferrer" className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-slate-800/80 rounded shadow-sm text-slate-500 hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all"><Download size={12} /></a>
                    </div>
                  ))}
                </div>
              ) : <p className="text-[10px] italic text-slate-400">Ҳужжатлар мавжуд эмас</p>}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 rounded-[0.7rem]">
              <div className="flex items-center gap-2 text-slate-400 mb-4 font-bold uppercase text-[10px] tracking-widest"><AlignLeft size={16} /> Вазифа тафсифи</div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">{task.description || "Тавсиф мавжуд эмас."}</p>
            </div>
          </div>

          {/* RIGHT SCROLL (Vazifalar ruyxati + Finish Button) */}
          <div className="lg:col-span-4 flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[0.7rem] overflow-hidden">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-[10px] font-bold uppercase tracking-wider dark:text-white">Вазифалар рўйхати</h3>
              <span className="text-[10px] bg-primary-500 text-white px-2 py-0.5 rounded font-bold">{totalCount}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
              {task.subtasks && task.subtasks.length > 0 ? (
                // РЎЙХАТ БОР БЎЛСА
                task.subtasks.map((st, idx) => (
                  <button key={st.id || idx} onClick={() => toggleSubtask(task.id, st.id)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-[0.7rem] border transition-all text-left group ${st.done ? 'bg-green-50/30 dark:bg-green-900/5 border-green-100 dark:border-green-900/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary-300 shadow-sm'}`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 transition-all ${st.done ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'}`}>{st.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}</div>
                    <span className={`text-[12px] font-bold leading-tight break-words flex-1 ${st.done ? 'line-through text-slate-400 font-medium' : 'text-slate-700 dark:text-slate-200'}`}>{st.text}</span>
                  </button>
                ))
              ) : (
                // РЎЙХАТ БЎШ БЎЛСА - "ВАЗИФАНИ ЯКУНЛАШ" ТУГМАСИ
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto opacity-30">
                    <Layers size={32} className="text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest px-4">
                    Босқичлар белгиланмаган
                  </p>
                  
                  {/* Текширувга юбориш тугмаси (Review ёки Done бўлмаса чиқади) */}
                  {task.status !== 'review' && task.status !== 'done' && (
                    <button 
                      onClick={() => updateTask(task.id, { status: 'review' })}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-black py-4 px-4 rounded-[0.7rem] text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-primary-500/20 active:scale-95 mt-4"
                    >
                      Вазифани якунлаш
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showNoPerm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowNoPerm(false)}>
           <div className="bg-white dark:bg-slate-800 rounded-[0.7rem] p-8 max-w-sm w-full text-center border border-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
              <ShieldAlert className="text-amber-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-bold dark:text-white mb-2">Ваколат етарли эмас</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">Кечирасиз, сизнинг фойдаланувчи ҳуқуқларингиз ушбу амални бажариш учун етарли эмас.</p>
              <button onClick={() => setShowNoPerm(false)} className="btn-primary w-full py-3 font-bold uppercase">Тушунарли</button>
           </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-[0.7rem] p-8 max-w-sm w-full text-center border border-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
             <Trash2 className="text-red-500 mx-auto mb-4" size={40} />
             <h3 className="text-lg font-bold dark:text-white mb-2">Вазифани ўчириш?</h3>
             <p className="text-sm text-slate-500 mb-8 italic">Танланган вазифа бутунлай ўчирилади.</p>
             <div className="flex gap-3"><button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 py-3">Йўқ</button><button onClick={confirmDelete} className="btn-danger flex-1 py-3 font-bold">Ҳа, ўчириш</button></div>
          </div>
        </div>
      )}

      {showEditModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999]"><TaskModal task={task} onClose={() => setShowEditModal(false)} /></div>}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-10 animate-fade-in" onClick={() => setZoomImage(null)}>
          <button className="absolute top-8 right-8 text-white hover:rotate-90 transition-all"><X size={32} /></button>
          <img src={zoomImage} className="max-w-full max-h-full rounded-[0.7rem] border border-white/10" alt="zoom" />
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-6xl h-[90vh] rounded-[0.7rem] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-700 text-slate-900 dark:text-white">
              <div className="flex items-center gap-3 truncate max-w-[50%]"><FileText className="text-primary-500" size={20} /><span className="text-sm font-bold truncate">{previewFile.name}</span></div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIframeKey(k => k + 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all" title="Янгилаш"><RefreshCw size={18} /></button>
                <a href={previewFile.url} download target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md"><Download size={14} /> Юклаб олиш</a>
                <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-900"><iframe key={iframeKey} src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewFile.url)}&embedded=true`} className="w-full h-full border-none" title="viewer" /></div>
          </div>
        </div>
      )}
    </>
  );
}