import React from 'react';
import { Printer } from 'lucide-react'; // Printer ikonkasini import qilamiz

const CallCenterPage = () => {
  
  // Print qilish funksiyasi
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full w-full flex flex-col gap-4 animate-in fade-in duration-500">
      
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

      {/* Sarlavha va Print tugmasi qismi */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Koll-markaz hisoboti</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-vaqtda yangilanadigan jadval</p>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm font-semibold text-sm"
        >
          <Printer size={18} className="text-primary-500" />
          Chop etish (Print)
        </button>
      </div>

      {/* Jadval uchun konteyner - Border radius kamaytirildi (rounded-xl) */}
      <div className="print-container flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        <iframe 
          src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSG-JJQRA6kYHcUAKGZZ5EQgJiaEX_BUgS3koW-p-1skaQxgfeLs4XjW3l9djvSFiK7TrgYPe2_OAb8/pubhtml?gid=0&amp;single=true&amp;widget=false&amp;headers=false&amp;chrome=false" 
          className="absolute inset-0 w-full h-full border-none"
          title="Google Sheet Report"
        ></iframe>
      </div>
      
      <div className="flex justify-end no-print">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Task Flow • System Report
        </span>
      </div>
    </div>
  );
};

export default CallCenterPage;