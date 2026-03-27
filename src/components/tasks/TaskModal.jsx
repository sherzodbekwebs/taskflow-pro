import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import TaskService from '../../services/taskService';
import { X, Plus, Trash2, Paperclip, FileText, AlignLeft, Loader2, Building2 } from 'lucide-react';

export default function TaskModal({ task, onClose }) {
  const { addTask, updateTask, users, departments, t } = useApp();
  const fileInputRef = useRef();
  const isEdit = !!(task && task.id);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', status: 'new', priority: 'medium',
    assignedUser: '', department: '', deadline: '', subtasks: [], files: [],
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '', description: task.description || '',
        status: task.status || 'new', priority: task.priority || 'medium',
        assignedUser: task.assignedUser || '',
        department: task.department || '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        subtasks: task.subtasks || [], files: task.files || [],
      });
    }
  }, [task]);

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

  const removeFile = async (f) => {
    await TaskService.deleteStorageFiles([f.url]);
    set('files', form.files.filter(file => file.id !== f.id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || isUploading) return;
    const data = {
      ...form, assignedUser: form.assignedUser === "" ? null : form.assignedUser,
      department: form.department === "" ? null : form.department,
      subtasks: form.subtasks.filter(s => s.text.trim()),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    };

    // MUHIM: await ishlatmaymiz, shunda modal darhol yopiladi
    if (isEdit) updateTask(task.id, data);
    else addTask(data);
    
    onClose(true); // Modalni zudlik bilan yopish
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[0.7rem] w-full max-w-6xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-none overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-800 bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold dark:text-white">{isEdit ? t.editTask : t.addTask}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Boshqaruv paneli</p>
          </div>
          <button onClick={() => onClose(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.taskTitle} *</label><input className="input text-base font-semibold py-3 px-4 rounded-xl border-slate-200 focus:border-primary-500 bg-slate-50/30 dark:bg-slate-800/50" value={form.title} onChange={e => set('title', e.target.value)} required /></div>
              <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><AlignLeft size={12} /> {t.detailedDescription}</label><textarea className="input min-h-[160px] py-3 px-4 rounded-xl border-slate-200 resize-none text-sm bg-slate-50/30 dark:bg-slate-800/50" value={form.description} onChange={e => set('description', e.target.value)} /></div>
              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.taskFiles}</label><button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-primary-500 hover:underline">{isUploading ? t.processing : `+ ${t.add}`}</button></div>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {form.files.map(f => (<div key={f.id} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 truncate"><FileText size={14} className="text-primary-500 flex-shrink-0" /><span className="text-[11px] font-medium truncate flex-1">{f.name}</span><button type="button" onClick={() => removeFile(f)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button></div>))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">{t.status}</label><select className="input h-9 text-[11px] font-bold rounded-lg border-slate-200" value={form.status} onChange={e => set('status', e.target.value)}><option value="new">{t.statusNew}</option><option value="progress">{t.statusProgress}</option><option value="done">{t.statusDone}</option></select></div>
                  <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">{t.priority}</label><select className="input h-9 text-[11px] font-bold rounded-lg border-slate-200" value={form.priority} onChange={e => set('priority', e.target.value)}><option value="high">{t.priorityHigh}</option><option value="medium">{t.priorityMedium}</option><option value="low">{t.priorityLow}</option></select></div>
                </div>
                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Building2 size={10}/> {t.department}</label><select className="input h-9 text-[11px] font-bold rounded-lg border-slate-200" value={form.department} onChange={e => set('department', e.target.value)}><option value="">—</option>{departments.map((d, i) => <option key={i} value={d}>{d}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">{t.assignTo}</label><select className="input h-9 text-[11px] font-bold rounded-lg border-slate-200" value={form.assignedUser} onChange={e => set('assignedUser', e.target.value)}><option value="">— {t.all} —</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">{t.deadline}</label><input type="date" className="input h-9 text-[11px] font-bold rounded-lg border-slate-200" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.subtasks}</label><button type="button" onClick={() => set('subtasks', [...form.subtasks, { id: Date.now(), text: '', done: false }])} className="text-[9px] font-black bg-primary-500 text-white px-2 py-1 rounded hover:bg-primary-600 transition-all">+ {t.add}</button></div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">{form.subtasks.map((st, i) => (<div key={st.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-1"><input className="input h-8 text-[11px] px-3 rounded-lg border-slate-200 focus:border-primary-400 flex-1" value={st.text} onChange={e => set('subtasks', form.subtasks.map(s => s.id === st.id ? { ...s, text: e.target.value } : s))} placeholder={t.add} /><button type="button" onClick={() => set('subtasks', form.subtasks.filter(s => s.id !== st.id))} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14} /></button></div>))}</div>
              </div>
            </div>
          </div>
        </form>

        <div className="px-8 py-4 border-t dark:border-slate-800 bg-slate-50/30 flex justify-end items-center gap-3">
          <button type="button" onClick={() => onClose(false)} className="px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">{t.cancel}</button>
          <button onClick={handleSubmit} disabled={isUploading} className="px-8 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest bg-primary-500 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 disabled:opacity-50 transition-all">{isUploading ? t.processing : t.save}</button>
        </div>
      </div>
    </div>
  );
}