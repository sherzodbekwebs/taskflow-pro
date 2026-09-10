import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Wallet, Sparkles, ArrowLeft, Clock } from 'lucide-react';

export default function KPIDashboard() {
  const { language } = useApp();
  const navigate = useNavigate();

  const isUz = language === 'uz';

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-16 px-4 animate-fade-in text-center">
      <div className="card p-8 sm:p-14 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Dekorativ fon nurlari */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Ikonka */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-primary-500/20 ring-8 ring-primary-50 dark:ring-primary-950/40">
            <Wallet className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md animate-bounce">
            <Sparkles size={16} />
          </div>
        </div>

        {/* Skoro Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Clock size={13} />
          <span>{isUz ? "Tez kunda" : "Скоро"}</span>
        </div>

        {/* Sarlavha va Tavsif */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight max-w-lg mb-3">
          {isUz ? "KPI moduli tez orada ishga tushadi" : "Модуль KPI скоро будет доступен"}
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
          {isUz 
            ? "Xodimlarning samaradorlik ko'rsatkichlari, avtomatlashtirilgan oylik baholash va KPI hisob-kitob moduli ishlab chiqilmoqda." 
            : "Модуль показателей эффективности сотрудников, автоматической ежемесячной оценки и расчета KPI находится в разработке."}
        </p>

        {/* Qo'shimcha holat ko'rsatkichi */}
        <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-amber-500 h-full w-[70%] rounded-full animate-pulse" />
        </div>

        {/* Qaytish tugmasi */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary py-2.5 px-5 text-xs font-bold flex items-center gap-2"
          >
            <ArrowLeft size={15} />
            <span>{isUz ? "Bosh sahifaga qaytish" : "Вернуться на главную"}</span>
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="btn-primary py-2.5 px-5 text-xs font-bold"
          >
            <span>{isUz ? "Vazifalar ro'yxatiga o'tish" : "Перейти к задачам"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
