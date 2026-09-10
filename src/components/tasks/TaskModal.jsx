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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isEdit ? (t.editTask || "Vazifani tahrirlash") : (t.addTask || "Yangi vazifa qo'shish")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEdit ? (t.editTaskSubtitle || "Vazifa ma'lumotlarini o'zgartirish") : (t.addTaskSubtitle || "Barcha kerakli ma'lumotlarni kiriting")}
            </p>
          </div>
          <button 
            onClick={() => onClose(false)} 
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-white dark:bg-slate-900 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT SIDE: Core details */}
            <div className="lg:col-span-7 space-y-5">
              {/* Task Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  {t.taskTitle || "Vazifa nomi"} *
                </label>
                <input 
                  className="input font-semibold text-sm h-11" 
                  value={form.title} 
                  onChange={e => set('title', e.target.value)} 
                  placeholder={t.taskTitlePlaceholder || "Masalan: Oylik hisobotni topshirish"}
                  required 
                />
              </div>

              {/* Recurring Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <RefreshCw size={17} className={form.is_recurring ? 'text-primary-600 animate-spin-slow' : 'text-slate-400'} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {t.recurringTask || "Takrorlanuvchi vazifa"}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={form.is_recurring} 
                      onChange={e => {
                        set('is_recurring', e.target.checked);
                        if (e.target.checked && form.recurring_type === 'none') set('recurring_type', 'daily');
                      }} 
                    />
                    <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {form.is_recurring && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t.period || "Davriyligi"}</label>
                      <select className="input h-9 text-xs font-semibold" value={form.recurring_type} onChange={e => set('recurring_type', e.target.value)}>
                        <option value="daily">{t.daily || "Har kuni"}</option>
                        <option value="weekly">{t.weekly || "Har hafta"}</option>
                        <option value="monthly">{t.monthly || "Har oy"}</option>
                        <option value="quarterly">{t.quarterly || "Har chorak"}</option>
                        <option value="yearly">{t.yearly || "Har yil"}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <AlignLeft size={14} className="text-slate-400" /> 
                  <span>{t.detailedDescription || "Batafsil tavsif"}</span>
                </label>
                <textarea 
                  className="input min-h-[140px] py-3 text-xs leading-relaxed" 
                  value={form.description} 
                  onChange={e => set('description', e.target.value)} 
                  placeholder={t.descriptionPlaceholder || "Vazifa bo'yicha qo'shimcha ko'rsatmalar..."} 
                />
              </div>

              {/* Files */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.taskFiles || "Biriktirilgan fayllar"}</label>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="text-xs font-bold bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60 px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>{t.add || "Fayl qo'shish"}</span>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
                
                {form.files.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {form.files.map(f => (
                      <div key={f.id} className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-800 shadow-2xs group">
                        <FileText size={16} className="text-primary-500 shrink-0" />
                        <span className="text-xs font-medium truncate flex-1 text-slate-700 dark:text-slate-300">{f.name}</span>
                        <button 
                          type="button" 
                          onClick={() => set('files', form.files.filter(file => file.id !== f.id))} 
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Hali fayllar biriktirilmagan</p>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Meta attributes & Subtasks */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                
                {/* Status */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">{t.status || "Holati"}</label>
                  <select className="input h-10 text-xs font-semibold" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="new">{t.statusNew || "Yangi"}</option>
                    <option value="progress">{t.statusProgress || "Jarayonda"}</option>
                    <option value="review">{t.statusReview || "Tekshiruvda"}</option>
                    <option value="done">{t.statusDone || "Tugallangan"}</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar size={12} /> <span>{t.createdDate || "Yaratilgan"}</span>
                    </label>
                    <input type="date" className="input h-9.5 text-xs" value={form.created_at} onChange={e => set('created_at', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Clock size={12} /> <span>{t.deadlineDate || "Muddat"}</span>
                    </label>
                    <input type="date" className="input h-9.5 text-xs" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">{t.department || "Bo'lim"}</label>
                  <select className="input h-10 text-xs font-medium" value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">{t.none || "Tanlanmagan"}</option>
                    {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Assign To */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">{t.assignTo || "Mas'ul shaxs"}</label>
                  <select className="input h-10 text-xs font-medium" value={form.assignedUser} onChange={e => set('assignedUser', e.target.value)}>
                    <option value="">{t.allUsers || "Tanlanmagan"}</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}
                  </select>
                </div>

                {/* Observer */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Eye size={13} className="text-primary-500" /> 
                    <span>{t.observer || "Kuzatuvchi"}</span>
                  </label>
                  <select className="input h-10 text-xs font-medium" value={form.observer} onChange={e => set('observer', e.target.value)}>
                    <option value="">{t.allUsers || "Tanlanmagan"}</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}
                  </select>
                </div>
              </div>

              {/* Subtasks (To-Do) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.subtasksTitle || "Qism vazifalar"}
                  </label>
                  <button 
                    type="button" 
                    onClick={() => set('subtasks', [...form.subtasks, { id: Date.now(), text: '', done: false }])} 
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>{t.add || "Qo'shish"}</span>
                  </button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                  {form.subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-2">
                      <input 
                        className="input h-9 text-xs flex-1" 
                        value={st.text} 
                        onChange={e => set('subtasks', form.subtasks.map(s => s.id === st.id ? { ...s, text: e.target.value } : s))} 
                        placeholder={t.subtaskPlaceholder || "Qadam nomi..."} 
                      />
                      <button 
                        type="button" 
                        onClick={() => set('subtasks', form.subtasks.filter(s => s.id !== st.id))} 
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex justify-end items-center gap-3">
          <button 
            type="button" 
            onClick={() => onClose(false)} 
            className="btn-secondary py-2 px-4 text-xs font-semibold"
          >
            {t.cancel || "Bekor qilish"}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isUploading} 
            className="btn-primary py-2 px-5 text-xs font-bold"
          >
            {isUploading ? (t.processing || "Yuklanmoqda...") : (t.save || "Saqlash")}
          </button>
        </div>
      </div>
    </div>
  );
}