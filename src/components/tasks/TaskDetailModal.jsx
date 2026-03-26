import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, Plus, Trash2, Calendar, User, Building2 } from 'lucide-react';

export default function TaskModal({ task, onClose }) {
  const { users, departments, addTask, updateTask, t } = useApp();
  const isEdit = !!(task && task.id); // Tahrirlash yoki yangi qo'shishni aniqlash

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'new',
    priority: 'medium',
    assignedUser: '',
    department: '',
    deadline: '',
    subtasks: []
  });

  const [newSubtask, setNewSubtask] = useState('');

  // Eski datalarni formaga yuklash
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'new',
        priority: task.priority || 'medium',
        assignedUser: task.assignedUser || '',
        department: task.department || '',
        // Sanani input date formatiga (YYYY-MM-DD) o'tkazish
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        subtasks: task.subtasks || []
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // UUID xatosini oldini olish uchun "assignedUser"ni tozalash
    const payload = { 
      ...form,
      assignedUser: form.assignedUser === "" ? null : form.assignedUser 
    };

    if (isEdit) {
      await updateTask(task.id, payload);
    } else {
      await addTask(payload);
    }
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const sub = { id: `st-${Date.now()}`, text: newSubtask.trim(), done: false };
    setForm(f => ({ ...f, subtasks: [...f.subtasks, sub] }));
    setNewSubtask('');
  };

  const removeSubtask = (id) => {
    setForm(f => ({ ...f, subtasks: f.subtasks.filter(s => s.id !== id) }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEdit ? "Vazifani tahrirlash" : t.addTask}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Sarlavha */}
          <div>
            <label className="label">Sarlavha *</label>
            <input 
              className="input" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Kim uchun - Select */}
            <div>
              <label className="label">Kim uchun</label>
              <select 
                className="input" 
                value={form.assignedUser} 
                onChange={e => setForm({...form, assignedUser: e.target.value})}
              >
                <option value="">— Hammasi —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>

            {/* Bo'lim */}
            <div>
              <label className="label">Bo'lim</label>
              <select 
                className="input" 
                value={form.department} 
                onChange={e => setForm({...form, department: e.target.value})}
              >
                <option value="">— Bo'lim tanlang —</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Holat */}
             <div>
              <label className="label">Holat</label>
              <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="new">Yangi</option>
                <option value="progress">Jarayonda</option>
                <option value="done">Tugallangan</option>
              </select>
            </div>
            {/* Muhimlik */}
            <div>
              <label className="label">Muhimlik</label>
              <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="high">Yuqori</option>
                <option value="medium">O'rta</option>
                <option value="low">Past</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="label">Muddati (Deadline)</label>
            <input 
              type="date" 
              className="input" 
              value={form.deadline} 
              onChange={e => setForm({...form, deadline: e.target.value})} 
            />
          </div>

          {/* Kichik vazifalar (Subtasks) */}
          <div>
            <label className="label">Kichik vazifalar (Bandlar)</label>
            <div className="flex gap-2 mb-2">
              <input 
                className="input flex-1" 
                placeholder="Yangi band qo'shish..." 
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              />
              <button type="button" onClick={addSubtask} className="btn-primary p-2">
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {form.subtasks.map((st, i) => (
                <div key={st.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{i + 1}. {st.text}</span>
                  <button type="button" onClick={() => removeSubtask(st.id)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t dark:border-slate-700">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Bekor qilish
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}