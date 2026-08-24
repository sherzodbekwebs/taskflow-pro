import { useApp } from '../contexts/AppContext';
import { Rocket, Clock, Construction } from 'lucide-react';

export default function KPIDashboard() {
  const { language } = useApp();

  const content = {
    uz: {
      title: "KPI Tizimi",
      status: "Tez orada...",
      desc: "Xodimlarni rag'batlantirish va KPI ko'rsatkichlarini hisoblash bo'limi hozirda ishlab chiqilmoqda."
    },
    ru: {
      title: "Система KPI",
      status: "Скоро...",
      desc: "Раздел поощрения сотрудников и расчета показателей KPI находится в разработке."
    }
  }[language || 'uz'];

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
      
      {/* Visual Icon */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center animate-pulse">
           <Rocket size={60} className="text-primary-500" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center border border-slate-100 dark:border-slate-700">
           <Construction size={24} className="text-amber-500" />
        </div>
      </div>

      {/* Text Content */}
      <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
        {content.title}
      </h1>
      
      <div className="inline-flex items-center gap-2 px-6 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-900/30 mb-6">
        <Clock size={18} className="animate-spin-slow" />
        <span className="font-black uppercase tracking-widest text-sm">{content.status}</span>
      </div>

      <p className="max-w-md text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
        {content.desc}
      </p>

      {/* Decorative dots */}
      <div className="mt-12 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary-300 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

    </div>
  );
}