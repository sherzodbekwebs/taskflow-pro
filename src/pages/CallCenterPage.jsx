import React from 'react';
import { Printer, ExternalLink, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const CallCenterPage = () => {
  const { t, language } = useApp();
  const [iframeKey, setIframeKey] = React.useState(0);
  const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSG-JJQRA6kYHcUAKGZZ5EQgJiaEX_BUgS3koW-p-1skaQxgfeLs4XjW3l9djvSFiK7TrgYPe2_OAb8/pubhtml?gid=0&single=true&widget=false&headers=false&chrome=false";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full w-full flex flex-col gap-4 animate-fade-in max-w-7xl mx-auto pb-6">
      
      {/* Print vaqtida menyularni yashirish uchun CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, header, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            height: 100vh !important;
            width: 100vw !important;
          }
        }
      `}} />

      {/* Sarlavha va Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.callCenterTitle || (language === 'uz' ? "Koll-markaz hisoboti" : "Отчет колл-центра")}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.callCenterSubtitle || (language === 'uz' ? "Real-vaqtda sinxronlashtiriladigan onlayn hisobot jadvali" : "Онлайн-таблица отчетов с синхронизацией в реальном времени")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIframeKey(k => k + 1)}
            className="btn-secondary py-2 px-3 text-xs font-semibold"
            title={language === 'uz' ? "Yangilash" : "Обновить"}
          >
            <RefreshCw size={14} /> <span>{language === 'uz' ? "Yangilash" : "Обновить"}</span>
          </button>
          
          <a
            href={sheetUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary py-2 px-3 text-xs font-semibold"
            title={language === 'uz' ? "Yangi oynada ochish" : "Открыть в новом окне"}
          >
            <ExternalLink size={14} /> <span>{language === 'uz' ? "Yangi oynada" : "В новом окне"}</span>
          </a>

          <button 
            onClick={handlePrint}
            className="btn-primary py-2 px-3.5 text-xs font-bold"
          >
            <Printer size={14} />
            <span>{t.print || (language === 'uz' ? "Chop etish" : "Печать")}</span>
          </button>
        </div>
      </div>

      {/* Jadval uchun konteyner */}
      <div className="print-container card h-[calc(100vh-170px)] min-h-[520px] overflow-hidden relative">
        <iframe 
          key={iframeKey}
          src={sheetUrl}
          className="absolute inset-0 w-full h-full border-none"
          title="Google Sheet Report"
        />
      </div>
    </div>
  );
};

export default CallCenterPage;