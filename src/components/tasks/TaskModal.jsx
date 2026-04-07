import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import TaskService from '../../services/taskService';
import { X, Plus, Trash2, FileText, AlignLeft, Building2, RefreshCw, CalendarDays, Calendar } from 'lucide-react';

export default function TaskModal({ task, onClose }) {
  // currentUser context'dan olindi
  const { addTask, updateTask, users, departments, t, currentUser } = useApp();
  const fileInputRef = useRef();
  const isEdit = !!(task && task.id);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', 
    status: task?.status || 'new', // Kanban'dan kelsa statusni oladi
    // Yangi vazifa bo'lsa currentUser ma'lumotlarini default qilib qo'yamiz
    assignedUser: task?.assignedUser || (isEdit ? '' : currentUser?.id) || '',
    department: task?.department || (isEdit ? '' : currentUser?.department) || '',
    deadline: '',
    created_at: new Date().toISOString().split('T')[0],
    subtasks: [], files: [],
    is_recurring: false,
    recurring_type: 'none',
    recurring_value: 1,
    recurring_value_end: 10
  });

  useEffect(() => {
    if (task) {
      const rVal = typeof task.recurring_value === 'object' ? task.recurring_value?.start : (task.recurring_value || 1);
      const rEnd = typeof task.recurring_value === 'object' ? task.recurring_value?.end : 10;

      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'new',
        // Agar tahrirlash bo'lsa task'dagini, yangi bo'lsa currentUser'nikini qo'yadi
        assignedUser: task.assignedUser || (task.id ? '' : currentUser?.id) || '',
        department: task.department || (task.id ? '' : currentUser?.department) || '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        created_at: task.created_at ? new Date(task.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        subtasks: task.subtasks || [],
        files: task.files || [],
        is_recurring: task.is_recurring || false,
        recurring_type: task.recurring_type || 'none',
        recurring_value: rVal,
        recurring_value_end: rEnd
      });
    }
  }, [task?.id]); 

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
      department: form.department === "" ? null : form.department,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      subtasks: form.subtasks.filter(s => s.text.trim()),
      files: form.files || [],
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
      <div className="bg-white dark:bg-slate-900 rounded-[0.7rem] w-full max-w-6xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-none overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold dark:text-white">{isEdit ? t.editTask : t.addTask}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Бошқарув панели</p>
          </div>
          <button onClick={() => onClose(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* CHAP TOMON */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.taskTitle} *</label>
                <input className="input text-base font-semibold py-3 px-4 rounded-xl border-slate-200 w-full" value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>

              <div className="p-5 bg-primary-50/30 dark:bg-primary-900/10 rounded-2xl border border-primary-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw size={18} className={form.is_recurring ? 'text-primary-500 animate-spin-slow' : 'text-slate-400'} />
                    <p className="text-sm font-bold dark:text-white">Такрорланувчи вазифа</p>
                  </div>
                  <input type="checkbox" className="w-6 h-6 accent-primary-500" checked={form.is_recurring} onChange={e => {
                    set('is_recurring', e.target.checked);
                    if (e.target.checked && form.recurring_type === 'none') set('recurring_type', 'daily');
                  }} />
                </div>

                {form.is_recurring && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-primary-600 uppercase">Давр</label>
                      <select className="input h-10 text-xs font-bold rounded-xl w-full" value={form.recurring_type} onChange={e => set('recurring_type', e.target.value)}>
                        <option value="daily">Ҳар куни</option>
                        <option value="weekly">Ҳар ҳафталик</option>
                        <option value="monthly">Ҳар ойлик</option>
                        <option value="quarterly">Ҳар чораклик</option>
                        <option value="yearly">Ҳар йиллик</option>
                      </select>
                    </div>

                    {['monthly', 'quarterly', 'yearly'].includes(form.recurring_type) && (
                      <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-primary-600 uppercase">Бошланиш (1-31)</label>
                          <input type="number" min="1" max="31" className="input h-10 text-xs font-bold rounded-xl w-full" value={form.recurring_value} onChange={e => set('recurring_value', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-primary-600 uppercase">Тугаш (1-31)</label>
                          <input type="number" min="1" max="31" className="input h-10 text-xs font-bold rounded-xl w-full" value={form.recurring_value_end} onChange={e => set('recurring_value_end', e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><AlignLeft size={12} /> {t.detailedDescription}</label><textarea className="input min-h-[160px] py-3 px-4 rounded-xl border-slate-200 w-full" value={form.description} onChange={e => set('description', e.target.value)} /></div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-3"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.taskFiles}</label><button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-primary-500">+ {t.add}</button></div>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {form.files.map(f => (<div key={f.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border truncate"><FileText size={14} className="text-primary-500" /><span className="text-[11px] truncate flex-1">{f.name}</span><button type="button" onClick={() => set('files', form.files.filter(file => file.id !== f.id))} className="text-red-500"><Trash2 size={14} /></button></div>))}
                </div>
              </div>
            </div>

            {/* O'NG TOMON */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Ҳолат</label>
                  <select className="input h-9 text-[11px] font-bold rounded-lg w-full" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="new">Янги</option><option value="progress">Жараёнда</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={10} /> Қўшилган сана</label>
                  <input type="date" className="input h-9 text-[11px] font-bold rounded-lg w-full" value={form.created_at} onChange={e => set('created_at', e.target.value)} />
                </div>
                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">{t.department}</label><select className="input h-9 text-[11px] font-bold rounded-lg w-full" value={form.department} onChange={e => set('department', e.target.value)}><option value="">—</option>{departments.map((d, i) => <option key={i} value={d}>{d}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">{t.assignTo}</label><select className="input h-9 text-[11px] font-bold rounded-lg w-full" value={form.assignedUser} onChange={e => set('assignedUser', e.target.value)}><option value="">— {t.all} —</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">{t.deadline}</label><input type="date" className="input h-9 text-[11px] font-bold rounded-lg w-full" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.subtasks}</label>
                  <button type="button" onClick={() => set('subtasks', [...form.subtasks, { id: Date.now(), text: '', done: false }])} className="text-[9px] font-black bg-primary-500 text-white px-2 py-1 rounded hover:bg-primary-600 transition-all">+ {t.add}</button>
                </div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {form.subtasks.map((st, i) => (
                    <div key={st.id} className="flex items-center gap-2">
                      <input className="input h-8 text-[11px] px-3 rounded-lg border-slate-200 flex-1" value={st.text} onChange={e => set('subtasks', form.subtasks.map(s => s.id === st.id ? { ...s, text: e.target.value } : s))} placeholder={t.add} />
                      <button type="button" onClick={() => set('subtasks', form.subtasks.filter(s => s.id !== st.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </form>

        <div className="px-8 py-4 border-t bg-slate-50/30 flex justify-end items-center gap-3">
          <button type="button" onClick={() => onClose(false)} className="px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase text-slate-500">{t.cancel}</button>
          <button onClick={handleSubmit} disabled={isUploading} className="px-8 py-2.5 rounded-xl font-bold text-[11px] uppercase bg-primary-500 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 disabled:opacity-50">{isUploading ? t.processing : t.save}</button>
        </div>
      </div>
    </div>
  );
}