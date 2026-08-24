import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import TaskService from '../../services/taskService';
import { 
  X, Plus, Trash2, FileText, AlignLeft, RefreshCw, 
  Calendar, Eye, Star, Clock
} from 'lucide-react';

export default function TaskModal({ task, onClose }) {
  const { addTask, updateTask, users, departments, t, currentUser } = useApp();
  const fileInputRef = useRef();
  const isEdit = !!(task && task.id);
  const [isUploading, setIsUploading] = useState(false);

  // Boshlang'ich holat: Agar tahrirlash bo'lmasa, currentUser ma'lumotlarini qo'yamiz
  const [form, setForm] = useState({
    title: '', 
    description: '',
    status: task?.status || 'new',
    assignedUser: isEdit ? (task?.assignedUser || '') : (currentUser?.id || ''),
    observer: task?.observer || '',
    department: isEdit ? (task?.department || '') : (currentUser?.department || ''),
    deadline: '',
    created_at: new Date().toISOString().split('T')[0],
    subtasks: [], 
    files: [],
    rating: task?.rating || 0,
    is_recurring: false,
    recurring_type: 'none',
    recurring_value: 1,
    recurring_value_end: 10
  });

  useEffect(() => {
    if (isEdit && task) {
      const rVal = typeof task.recurring_value === 'object' ? task.recurring_value?.start : (task.recurring_value || 1);
      const rEnd = typeof task.recurring_value === 'object' ? task.recurring_value?.end : 10;

      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'new',
        assignedUser: task.assignedUser || '',
        observer: task.observer || '',
        department: task.department || '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        created_at: task.created_at ? new Date(task.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        subtasks: task.subtasks || [],
        files: task.files || [],
        rating: task.rating || 0,
        is_recurring: task.is_recurring || false,
        recurring_type: task.recurring_type || 'none',
        recurring_value: rVal,
        recurring_value_end: rEnd
      });
    }
  }, [task?.id, isEdit]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleFileAdd = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedFiles = [];
      for (const file of selectedFiles) {
        const res = await TaskService.uploadFile(file);
        uploadedFiles.push(res);
      }
      set('files', [...form.files, ...uploadedFiles]);
    } catch (err) { alert("Xatolik: " + err.message); } finally { setIsUploading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || isUploading) return;

    let rValue = parseInt(form.recurring_value) || 1;
    if (form.is_recurring && ['monthly', 'quarterly', 'yearly'].includes(form.recurring_type)) {
      rValue = {
        start: parseInt(form.recurring_value) || 1,
        end: parseInt(form.recurring_value_end) || 10
      };
    }

    const data = {
      title: form.title.trim(),
      description: form.description || null,
      status: form.status || 'new',
      assignedUser: form.assignedUser === "" ? null : form.assignedUser,
      observer: form.observer === "" ? null : form.observer,
      department: form.department === "" ? null : form.department,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      subtasks: form.subtasks.filter(s => s.text.trim()),
      files: form.files || [],
      rating: form.status === 'done' ? Number(form.rating) : 0,
      is_recurring: form.is_recurring,
      recurring_type: form.is_recurring ? form.recurring_type : 'none',
      recurring_value: form.is_recurring ? rValue : null,
      created_at: form.created_at ? new Date(form.created_at).toISOString() : new Date().toISOString()
    };

    if (isEdit) {
      updateTask(task.id, data);
    } else {
      addTask(data);
    }
    onClose(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] w-full max-w-6xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {isEdit ? t.editTask : t.addTask}
            </h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {isEdit ? "Vazifani tahrirlash rejimi" : "Yangi vazifa yaratish paneli"}
            </p>
          </div>
          <button onClick={() => onClose(false)} className="p-2.5 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* LEFT SIDE */}
            <div className="lg:col-span-7 space-y-8">
              {/* Task Title */}
              <div>
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">{t.taskTitle} *</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none text-base font-bold py-4 px-6 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all dark:text-white placeholder:text-slate-400" 
                  value={form.title} 
                  onChange={e => set('title', e.target.value)} 
                  placeholder="Vazifa nomini kiriting..."
                  required 
                />
              </div>

              {/* Recurring Section */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw size={20} className={form.is_recurring ? 'text-primary-500 animate-spin-slow' : 'text-slate-400'} />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.recurringTask}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={form.is_recurring} onChange={e => {
                      set('is_recurring', e.target.checked);
                      if (e.target.checked && form.recurring_type === 'none') set('recurring_type', 'daily');
                    }} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {form.is_recurring && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-primary-600 uppercase tracking-wide">{t.period}</label>
                      <select className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-11 text-xs font-bold rounded-xl shadow-sm" value={form.recurring_type} onChange={e => set('recurring_type', e.target.value)}>
                        <option value="daily">{t.daily}</option>
                        <option value="weekly">{t.weekly}</option>
                        <option value="monthly">{t.monthly}</option>
                        <option value="quarterly">{t.quarterly}</option>
                        <option value="yearly">{t.yearly}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><AlignLeft size={14} /> {t.detailedDescription}</label>
                <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-none min-h-[200px] py-4 px-6 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all dark:text-white text-sm leading-relaxed" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Batafsil ma'lumot yozing..." />
              </div>

              {/* Files */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.taskFiles}</label>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-all uppercase tracking-tighter">+ Qo'shish</button>
                </div>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.files.map(f => (
                    <div key={f.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm group transition-all">
                      <FileText size={18} className="text-primary-500" />
                      <span className="text-[11px] font-bold truncate flex-1 dark:text-slate-300">{f.name}</span>
                      <button type="button" onClick={() => set('files', form.files.filter(file => file.id !== f.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE (SIDEBAR) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-7 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6 shadow-sm">
                
                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Holat</label>
                  <select className="w-full bg-white dark:bg-slate-900 border-none h-12 text-sm font-black rounded-xl shadow-sm dark:text-white px-4" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="new">{t.statusNew}</option>
                    <option value="progress">{t.statusProgress}</option>
                    <option value="review">{t.statusReview}</option>
                    <option value="done">{t.statusDone}</option>
                  </select>
                </div>

                {/* Dates (Yonma-yon) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={13} /> Qo'shilgan sana</label>
                    <input type="date" className="w-full bg-white dark:bg-slate-900 border-none h-11 text-xs font-bold rounded-xl shadow-sm dark:text-white px-3" value={form.created_at} onChange={e => set('created_at', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={13} /> Yakuniy muddat</label>
                    <input type="date" className="w-full bg-white dark:bg-slate-900 border-none h-11 text-xs font-bold rounded-xl shadow-sm dark:text-white px-3" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bo'lim</label>
                  <select className="w-full bg-white dark:bg-slate-900 border-none h-11 text-xs font-bold rounded-xl shadow-sm dark:text-white px-4" value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">—</option>
                    {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Assign To (Kim uchun) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kim uchun</label>
                  <select className="w-full bg-white dark:bg-slate-900 border-none h-11 text-xs font-bold rounded-xl shadow-sm dark:text-white px-4" value={form.assignedUser} onChange={e => set('assignedUser', e.target.value)}>
                    <option value="">— Hammasi —</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}
                  </select>
                </div>

                {/* Observer (Tekshiruvchi) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Eye size={13} className="text-primary-500" /> Tekshiruvchi
                  </label>
                  <select className="w-full bg-white dark:bg-slate-900 border border-primary-100 dark:border-primary-900/30 h-11 text-xs font-bold rounded-xl shadow-sm dark:text-white px-4" value={form.observer} onChange={e => set('observer', e.target.value)}>
                    <option value="">— Hammasi —</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}
                  </select>
                </div>
              </div>

              {/* Subtasks (To-Do) */}
              <div className="space-y-4 px-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bosqichlar (To-do)</label>
                  <button type="button" onClick={() => set('subtasks', [...form.subtasks, { id: Date.now(), text: '', done: false }])} className="text-[9px] font-black bg-slate-800 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-all">+ Qo'shish</button>
                </div>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {form.subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-3 group animate-in slide-in-from-right-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                      <input 
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none h-10 text-xs font-medium px-4 rounded-xl focus:ring-1 focus:ring-primary-500 dark:text-slate-300" 
                        value={st.text} 
                        onChange={e => set('subtasks', form.subtasks.map(s => s.id === st.id ? { ...s, text: e.target.value } : s))} 
                        placeholder="Bosqich nomi..." 
                      />
                      <button type="button" onClick={() => set('subtasks', form.subtasks.filter(s => s.id !== st.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="px-10 py-6 border-t bg-slate-50 dark:bg-slate-900/50 flex justify-end items-center gap-4">
          <button 
            type="button" 
            onClick={() => onClose(false)} 
            className="px-8 py-3 rounded-2xl font-black text-[12px] uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {t.cancel}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isUploading} 
            className="px-12 py-3 rounded-2xl font-black text-[12px] uppercase bg-[#00aeef] text-white shadow-xl shadow-blue-500/20 hover:bg-blue-500 disabled:opacity-50 transition-all"
          >
            {isUploading ? t.processing : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}