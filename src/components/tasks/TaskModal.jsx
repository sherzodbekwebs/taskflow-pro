import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import TaskService from '../../services/taskService';
import { X, Plus, Trash2, FileText, AlignLeft, Building2, RefreshCw, CalendarDays } from 'lucide-react';

export default function TaskModal({ task, onClose }) {
  const { addTask, updateTask, users, departments, t } = useApp();
  const fileInputRef = useRef();
  
  const isEdit = !!(task && task.id);
  const [isUploading, setIsUploading] = useState(false);

  // Formani boshlang'ich holati
  const [form, setForm] = useState({
    title: '', description: '', status: 'new',
    assignedUser: '', department: '', deadline: '', subtasks: [], files: [],
    is_recurring: false, 
    recurring_type: 'none', 
    recurring_value: 1,
    recurring_value_end: 10
  });

  // Task o'zgarganda faqat bir marta yuklash
  useEffect(() => {
    if (task) {
      const rVal = typeof task.recurring_value === 'object' ? task.recurring_value?.start : (task.recurring_value || 1);
      const rEnd = typeof task.recurring_value === 'object' ? task.recurring_value?.end : 10;

      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'new',
        assignedUser: task.assignedUser || '',
        department: task.department || '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        subtasks: task.subtasks || [],
        files: task.files || [],
        is_recurring: task.is_recurring || false,
        recurring_type: task.recurring_type || 'none',
        recurring_value: rVal,
        recurring_value_end: rEnd
      });
    }
  }, [task?.id]); // Faqat ID o'zgarganda ishlaydi, bu input tozalanishini oldini oladi

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || isUploading) return;

    let finalRecurringValue = form.recurring_value;
    if (['monthly', 'quarterly', 'yearly'].includes(form.recurring_type)) {
      finalRecurringValue = {
        start: parseInt(form.recurring_value),
        end: parseInt(form.recurring_value_end)
      };
    }

    const data = {
      ...form, 
      assignedUser: form.assignedUser === "" ? null : form.assignedUser,
      department: form.department === "" ? null : form.department,
      subtasks: form.subtasks.filter(s => s.text.trim()),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      recurring_type: form.is_recurring ? form.recurring_type : 'none',
      recurring_value: finalRecurringValue
    };

    // Tozalash
    const submissionData = { ...data };
    delete submissionData.recurring_value_end;

    if (isEdit) updateTask(task.id, submissionData);
    else addTask(submissionData);
    
    onClose(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[0.7rem] w-full max-w-6xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-none overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-800 bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold dark:text-white">{isEdit ? t.editTask : t.addTask}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Бошқарув панели</p>
          </div>
          <button onClick={() => onClose(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              {/* Sarlavha */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.taskTitle} *</label>
                <input className="input text-base font-semibold py-3 px-4 rounded-xl border-slate-200 focus:border-primary-500 bg-slate-50/30 dark:bg-slate-800/50 w-full" 
                  value={form.title} 
                  onChange={e => set('title', e.target.value)} 
                  required 
                />
              </div>
              
              {/* Takrorlanish */}
              <div className="p-5 bg-primary-50/30 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw size={18} className={`${form.is_recurring ? 'text-primary-500 animate-spin-slow' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-sm font-bold dark:text-white">Такрорланувчи вазифа</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Даврий топшириқларни бошқариш</p>
                    </div>
                  </div>
                  <input type="checkbox" className="w-6 h-6 rounded-lg accent-primary-500 cursor-pointer" checked={form.is_recurring} onChange={e => {
                      set('is_recurring', e.target.checked);
                      if(e.target.checked && form.recurring_type === 'none') set('recurring_type', 'daily');
                  }} />
                </div>

                {form.is_recurring && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-primary-600 uppercase">Такрорланиш даври</label>
                      <select className="input h-10 text-xs font-bold rounded-xl border-primary-100 w-full" value={form.recurring_type} onChange={e => set('recurring_type', e.target.value)}>
                        <option value="daily">Ҳар куни</option>
                        <option value="weekly">Ҳар ҳафталик</option>
                        <option value="monthly">Ҳар ойлик</option>
                        <option value="quarterly">Ҳар чораклик (3 ойлик)</option>
                        <option value="yearly">Ҳар йиллик</option>
                      </select>
                    </div>

                    {form.recurring_type === 'weekly' && (
                       <div className="space-y-1">
                       <label className="text-[9px] font-black text-primary-600 uppercase">Ҳафта куни</label>
                       <select className="input h-10 text-xs font-bold rounded-xl border-primary-100 w-full" value={form.recurring_value} onChange={e => set('recurring_value', e.target.value)}>
                         <option value="1">Душанба</option><option value="2">Сешанба</option><option value="3">Чоршанба</option><option value="4">Пайшанба</option><option value="5">Жума</option><option value="6">Шанба</option><option value="7">Якшанба</option>
                       </select>
                     </div>
                    )}

                    {['monthly', 'quarterly', 'yearly'].includes(form.recurring_type) && (
                      <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-primary-600 uppercase">Boshlanish kuni (1-31)</label>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={14} />
                            <input type="number" min="1" max="31" className="input h-10 pl-9 text-xs font-bold rounded-xl border-primary-100 w-full" value={form.recurring_value} onChange={e => set('recurring_value', e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-primary-600 uppercase">Tugash kuni (1-31)</label>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={14} />
                            <input type="number" min="1" max="31" className="input h-10 pl-9 text-xs font-bold rounded-xl border-primary-100 w-full" value={form.recurring_value_end} onChange={e => set('recurring_value_end', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><AlignLeft size={12} /> {t.detailedDescription}</label><textarea className="input min-h-[160px] py-3 px-4 rounded-xl border-slate-200 resize-none text-sm bg-slate-50/30 dark:bg-slate-800/50 w-full" value={form.description} onChange={e => set('description', e.target.value)} /></div>
            </div>

            {/* O'ng tomon (Status, Deadlines, h.k.) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">{t.status}</label>
                  <select className="input h-9 text-[11px] font-bold rounded-lg border-slate-200 w-full" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="new">Янги</option>
                    <option value="progress">Жараёнда</option>
                    <option value="review">Текширувда</option>
                    <option value="done">Тугалланган</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Building2 size={10}/> {t.department}</label>
                  <select className="input h-9 text-[11px] font-bold rounded-lg border-slate-200 w-full" value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">—</option>
                    {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">{t.assignTo}</label>
                  <select className="input h-9 text-[11px] font-bold rounded-lg border-slate-200 w-full" value={form.assignedUser} onChange={e => set('assignedUser', e.target.value)}>
                    <option value="">— {t.all} —</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.fullname}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">{t.deadline}</label>
                  <input type="date" className="input h-9 text-[11px] font-bold rounded-lg border-slate-200 w-full" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="px-8 py-4 border-t dark:border-slate-800 bg-slate-50/30 flex justify-end items-center gap-3">
          <button type="button" onClick={() => onClose(false)} className="px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">{t.cancel}</button>
          <button onClick={handleSubmit} disabled={isUploading} className="px-8 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest bg-primary-500 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 disabled:opacity-50 transition-all">
            {isUploading ? t.processing : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}