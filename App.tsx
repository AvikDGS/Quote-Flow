
import React, { useState } from 'react';
import { QuotationForm } from './components/QuotationForm';
import { QuotationPreview } from './components/QuotationPreview';
import { QuotationData } from './types';
import { enhanceQuotation } from './services/geminiService';

const App: React.FC = () => {
  const getInitialData = (): QuotationData => ({
    senderName: 'Taskio',
    senderAddress: 'India, Hyderabad,\nHitech City',
    senderEmail: 'hello@taskio.com',
    senderPhone: '+91 98765 43210',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    clientWhatsapp: '',
    clientWebsite: '',
    quoteNumber: `QTN-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    expiryDate: '',
    items: [], 
    notes: '* This quote is valid for 14 days. Terms and conditions apply.',
    taxRate: 0,
    discount: 0,
    clientBudget: 0,
    preferredContactMode: 'Email',
    currency: '$'
  });

  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuotationData>(getInitialData());

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRefId = 'quotation-preview';

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the entire quotation? All unsaved data will be lost.')) {
      setData(getInitialData());
      setStep(1);
    }
  };

  const toggleTheme = (event: React.MouseEvent) => {
    // @ts-ignore
    if (!document.startViewTransition) {
      // Fixed: Removed the incorrect classList.toggle('class', 'dark') call which caused a type error.
      document.documentElement.classList.toggle('dark');
      return;
    }
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    // @ts-ignore
    const transition = document.startViewTransition(() => {
      document.documentElement.classList.toggle('dark');
    });
    transition.ready.then(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];
      document.documentElement.animate(
        { clipPath: isDark ? clipPath : [...clipPath].reverse() },
        { duration: 500, easing: 'ease-in', pseudoElement: isDark ? '::view-transition-new(root)' : '::view-transition-old(root)' }
      );
    });
  };

  const handleEnhance = async () => {
    if (!data.items.length) return; 
    setIsEnhancing(true);
    try {
      const result = await enhanceQuotation(data);
      setData(prev => ({ ...prev, notes: result.enhancedNotes }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const exportAsPDF = async () => {
    const element = document.getElementById(previewRefId);
    if (!element) return;
    
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 100));

    try {
      // @ts-ignore
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(previewRefId);
          if (clonedElement) {
             clonedElement.style.transform = 'none';
             clonedElement.style.boxShadow = 'none';
             clonedElement.style.borderRadius = '0';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      // @ts-ignore
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Quotation-${data.quoteNumber}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const total = data.items.reduce((acc, i) => acc + i.total, 0);

  const isStepValid = () => {
    if (step === 1) {
      const basicInfo = data.clientName.trim() !== '' && 
                        data.clientEmail.trim() !== '' && 
                        data.clientAddress.trim() !== '';
      
      const whatsappRequired = data.preferredContactMode === 'WhatsApp';
      const whatsappValid = whatsappRequired ? (data.clientWhatsapp?.trim() !== '') : true;
      
      return basicInfo && whatsappValid;
    }
    if (step === 2) {
      return data.items.length > 0;
    }
    return true;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* LEFT PANE: PREVIEW STAGE */}
      <div className={`relative hidden md:flex w-1/2 flex-col items-center justify-center bg-[#eef0f5] dark:bg-[#0b0f17] overflow-hidden perspective-container z-10 transition-colors duration-500 ${isExporting ? 'perspective-none' : ''}`}>
        <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-8 left-8 flex items-center gap-2 opacity-50 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-xl">visibility</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Live Document Preview</span>
        </div>
        
        <div className={`paper-doc origin-center transition-transform duration-500 ${isExporting ? 'scale-[0.5] !transform-none !rotate-0 !shadow-none' : 'scale-[0.5] lg:scale-[0.6] xl:scale-[0.7]'}`}>
          <QuotationPreview data={data} id={previewRefId} step={step} />
        </div>

        {isExporting && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center z-[100] backdrop-blur-sm">
             <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Generating High-Res PDF...</p>
          </div>
        )}
      </div>

      {/* RIGHT PANE: FORM CONTROLLER */}
      <div className="w-full md:w-1/2 flex flex-col h-full bg-white dark:bg-background-dark border-l border-slate-100 dark:border-slate-800 shadow-2xl z-20">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className={`flex items-center justify-center size-8 rounded-full transition-colors ${step === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h2 className="text-slate-900 dark:text-white text-base font-bold leading-tight">New Quotation</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Drafting Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 text-rose-500 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button onClick={toggleTheme} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <span className="material-symbols-outlined text-xl dark:hidden">dark_mode</span>
              <span className="material-symbols-outlined text-xl hidden dark:block">light_mode</span>
            </button>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase">Step {step} of 3</span>
              <div className="w-20 h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div className={`h-full bg-primary transition-all duration-500`} style={{ width: `${(step / 3) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10 custom-scrollbar">
          <div className="max-w-md mx-auto">
            <QuotationForm 
              step={step} 
              data={data} 
              setData={setData} 
              onEnhance={handleEnhance} 
              isEnhancing={isEnhancing} 
            />
          </div>
        </div>

        <footer className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark sticky bottom-0 z-30">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Est. Total ({data.currency})</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {data.currency}{total.toLocaleString()}
                <span className="text-slate-400 text-sm font-normal">.00</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {step < 3 ? (
                <button 
                  onClick={() => isStepValid() && setStep(step + 1)}
                  disabled={!isStepValid()}
                  className={`group flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${!isStepValid() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02]'}`}
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              ) : (
                <button 
                  onClick={exportAsPDF}
                  disabled={total === 0 || isExporting}
                  className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${total === 0 || isExporting ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02]'}`}
                >
                  <span className="material-symbols-outlined text-lg">{isExporting ? 'autorenew' : 'picture_as_pdf'}</span>
                  <span>{isExporting ? 'Exporting...' : 'Finish & Export'}</span>
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
