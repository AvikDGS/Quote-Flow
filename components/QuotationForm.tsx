
import React, { useState, useRef } from 'react';
import { QuotationData, QuotationItem } from '../types';
import { analyzeCustomService } from '../services/geminiService';

interface Props {
  step: number;
  data: QuotationData;
  setData: React.Dispatch<React.SetStateAction<QuotationData>>;
  onEnhance: () => void;
  isEnhancing: boolean;
}

export const QuotationForm: React.FC<Props> = ({ step, data, setData, onEnhance, isEnhancing }) => {
  const [customDesc, setCustomDesc] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customBilling, setCustomBilling] = useState<'fixed' | 'hourly' | 'monthly'>('fixed');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currencies = [
    { label: 'USD ($)', value: '$' },
    { label: 'EUR (€)', value: '€' },
    { label: 'GBP (£)', value: '£' },
    { label: 'INR (₹)', value: '₹' },
    { label: 'JPY (¥)', value: '¥' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ 
      ...prev, 
      [name]: name === 'clientBudget' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setData(prev => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setContactMode = (mode: string) => {
    setData(prev => ({ ...prev, preferredContactMode: mode }));
  };

  const handleAddCustomService = async () => {
    if (!customDesc.trim() || !customPrice) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeCustomService(customDesc);
      const newItem: QuotationItem = {
        id: Math.random().toString(36).substr(2, 9),
        description: analysis.name,
        serviceDescription: customDesc,
        quantity: 1,
        unitPrice: parseFloat(customPrice),
        total: parseFloat(customPrice),
        includes: analysis.includes,
        excludes: analysis.excludes,
        billingCycle: customBilling
      };
      setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
      setCustomDesc('');
      setCustomPrice('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const contactModes = [
    { label: 'Email', icon: 'mail' },
    { label: 'Phone', icon: 'call' },
    { label: 'WhatsApp', icon: 'chat' },
    { label: 'Video Call', icon: 'video_chat' },
  ];

  const services = [
    { 
      id: 'web', 
      name: 'Growth-Centric Web Infrastructure', 
      description: 'A high-performance digital foundation engineered for rapid scaling and security.',
      price: 4500, 
      icon: 'web',
      includes: ['High-Performance UI/UX Design', 'Backend Development', 'Scalable Cloud Infrastructure', 'Database Architecture', 'Security & SSL Implementation', 'Conversion Rate Optimization (CRO) Setup'],
      excludes: ['Third-Party API Usage Fees', 'Premium Stock Media Licenses', 'Hardware Procurement']
    },
    { 
      id: 'paid_social', 
      name: 'Paid Social Growth Engine', 
      description: 'Strategic advertising and audience growth across Meta platforms including Facebook and Instagram.',
      price: 2500, 
      icon: 'ads_click',
      includes: ['Strategic Campaign Architecture', 'Ad Creative Asset Design', 'Advanced Pixel & API Tracking', 'Lookalike & Interest Targeting', 'Weekly Performance Optimization'],
      excludes: ['Direct Ad Spend', 'Influencer Outreach Fees', 'Long-form Video Production']
    },
    { 
      id: 'google_ads', 
      name: 'High-Intent Search Capture', 
      description: 'Capture leads at the moment of discovery by dominating high-value Google Search results with precision-targeted PPC.',
      price: 2200, 
      icon: 'query_stats',
      includes: [
        'Strategic Google Ads Account Architecture', 
        'High-Intent Keyword Mining & Negative Lists', 
        'Persuasive Search Ad Copywriting & Extensions', 
        'Conversion Tracking & GTM Calibration', 
        'Daily Bid Optimization & ROAS Management', 
        'Comprehensive Monthly Performance Reports'
      ],
      excludes: [
        'Direct Media Spend (Billed by Google)', 
        'Video/Display Banner Creative Production', 
        'Website Landing Page Development'
      ]
    },
    { 
      id: 'seo_system', 
      name: 'Search Authority System', 
      description: 'Technical and content-driven SEO strategy to establish dominant organic search presence.',
      price: 1800, 
      icon: 'hub',
      includes: ['Technical SEO Infrastructure', 'Semantic Content Strategy', 'Authority Link Building (Monthly)', 'Local SEO Visibility Pack', 'Rank Tracking & Competitor Analysis'],
      excludes: ['Paid Backlink Placement Fees', 'Guaranteed #1 Rankings', 'Web Development Fixes']
    },
  ];

  const updateQuantity = (serviceName: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.description === serviceName) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty, total: newQty * item.unitPrice };
        }
        return item;
      })
    }));
  };

  const toggleService = (service: typeof services[0]) => {
    const exists = data.items.find(i => i.description === service.name);
    if (exists) {
      setData(prev => ({ ...prev, items: prev.items.filter(i => i.description !== service.name) }));
    } else {
      const newItem: QuotationItem = {
        id: Math.random().toString(36).substr(2, 9),
        description: service.name,
        serviceDescription: service.description,
        quantity: 1,
        unitPrice: service.price,
        total: service.price,
        includes: service.includes,
        excludes: service.excludes,
        billingCycle: 'fixed'
      };
      setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
  };

  if (step === 1) {
    const isWhatsappMode = data.preferredContactMode === 'WhatsApp';
    
    return (
      <div className="animate-fade-in-up space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Company Branding</h1>
          <p className="text-slate-500 text-sm font-medium">Add your company logo to the quotation.</p>
        </div>

        {/* Logo Upload Section */}
        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
          {data.logoUrl ? (
            <div className="relative group">
              <img src={data.logoUrl} alt="Logo" className="h-24 w-auto object-contain rounded-lg shadow-md" />
              <button 
                onClick={removeLogo}
                className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">add_photo_alternate</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Company Logo</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLogoUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 pt-4">Client Details</h2>
          <p className="text-slate-500 text-sm font-medium">Please provide the client information below.</p>
        </div>
        
        <div className="space-y-5">
          <div className="relative group">
            <input 
              name="clientName" value={data.clientName} onChange={handleChange}
              className="peer floating-input w-full h-14 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 pt-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-transparent" 
              placeholder="Name" type="text"
            />
            <label className="absolute left-4 top-4 text-slate-400 text-[10px] transition-all duration-200 pointer-events-none origin-left uppercase font-black tracking-widest group-focus-within:text-primary">Client Name *</label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative group">
              <input 
                name="clientEmail" value={data.clientEmail} onChange={handleChange}
                className="peer floating-input w-full h-14 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 pt-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-transparent" 
                placeholder="Email" type="email"
              />
              <label className="absolute left-4 top-4 text-slate-400 text-[10px] transition-all duration-200 pointer-events-none origin-left uppercase font-black tracking-widest group-focus-within:text-primary">Email Address *</label>
            </div>
            <div className="relative group">
              <input 
                name="clientAddress" value={data.clientAddress} onChange={handleChange}
                className="peer floating-input w-full h-14 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 pt-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-transparent" 
                placeholder="Company" type="text"
              />
              <label className="absolute left-4 top-4 text-slate-400 text-[10px] transition-all duration-200 pointer-events-none origin-left uppercase font-black tracking-widest group-focus-within:text-primary">Organization *</label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative group">
              <input 
                name="clientPhone" value={data.clientPhone} onChange={handleChange}
                className="peer floating-input w-full h-14 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 pt-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-transparent" 
                placeholder="Phone" type="tel"
              />
              <label className="absolute left-4 top-4 text-slate-400 text-[10px] transition-all duration-200 pointer-events-none origin-left uppercase font-black tracking-widest group-focus-within:text-primary">Phone Number</label>
            </div>
            <div className="relative group">
              <input 
                name="clientWhatsapp" value={data.clientWhatsapp} onChange={handleChange}
                className={`peer floating-input w-full h-14 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 px-4 pt-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-transparent ${isWhatsappMode ? 'border-emerald-400/50 ring-2 ring-emerald-500/5 shadow-sm' : 'border-slate-100 dark:border-slate-800'}`} 
                placeholder="WhatsApp" type="tel"
              />
              <label className={`absolute left-4 top-4 text-slate-400 text-[10px] transition-all duration-200 pointer-events-none origin-left uppercase font-black tracking-widest group-focus-within:text-primary ${isWhatsappMode ? 'text-emerald-500' : ''}`}>
                WhatsApp Number {isWhatsappMode ? '*' : '(Optional)'}
              </label>
              {isWhatsappMode && !data.clientWhatsapp?.trim() && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-black animate-pulse uppercase tracking-widest">Required</span>
              )}
            </div>
          </div>

          <div className="relative group">
            <input 
              name="clientWebsite" value={data.clientWebsite || ''} onChange={handleChange}
              className="peer floating-input w-full h-14 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 pt-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-transparent" 
              placeholder="Website" type="url"
            />
            <label className="absolute left-4 top-4 text-slate-400 text-[10px] transition-all duration-200 pointer-events-none origin-left uppercase font-black tracking-widest group-focus-within:text-primary">Client Website (Optional)</label>
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Preferred Mode of Contact</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {contactModes.map((mode) => (
                <button
                  key={mode.label}
                  onClick={() => setContactMode(mode.label)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all group ${data.preferredContactMode === mode.label ? 'border-primary bg-primary/5 text-primary scale-105 shadow-md' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-200'}`}
                >
                  <span className={`material-symbols-outlined mb-1 group-hover:scale-110 transition-transform ${data.preferredContactMode === mode.label ? 'fill-current' : ''}`}>{mode.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="animate-fade-in-up space-y-10 pb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Select Services</h1>
          <p className="text-slate-500 text-sm font-medium">Draft unique projects and manage your quote's scope.</p>
        </div>
        
        {/* Custom Service Input Section - Enhanced & Fixed Layout */}
        <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-3xl p-8 mb-10 shadow-sm">
           <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary font-black">auto_awesome</span>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">AI Custom Project Creator</h3>
           </div>
           
           <div className="space-y-8">
              {/* Service Description */}
              <div className="space-y-2">
                <textarea 
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Describe your unique project... (e.g. 5-minute promo film for a local bakery with drone shots)"
                  className="w-full text-sm bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all min-h-[110px] shadow-sm resize-none"
                />
              </div>
              
              {/* Document Currency Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Select Document Currency</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {currencies.map((curr) => (
                    <button
                      key={curr.value}
                      onClick={() => setData(prev => ({ ...prev, currency: curr.value }))}
                      className={`flex items-center justify-center py-2.5 px-4 rounded-full border-2 transition-all font-black text-[11px] uppercase ${data.currency === curr.value ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-200'}`}
                    >
                      {curr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing Cycle Selection & Price - Fixed Grid to prevent overlap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Project Price Cycle</label>
                  <div className="flex gap-2">
                    {(['fixed', 'hourly', 'monthly'] as const).map((cycle) => (
                      <button
                        key={cycle}
                        onClick={() => setCustomBilling(cycle)}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all ${customBilling === cycle ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-200'}`}
                      >
                        {cycle}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Price per Cycle ({data.currency})</label>
                  <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">{data.currency}</span>
                      <input 
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        placeholder="Price"
                        className="w-full text-base bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-10 pr-5 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-bold"
                      />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddCustomService}
                disabled={isAnalyzing || !customDesc.trim() || !customPrice}
                className={`w-full text-white dark:text-slate-900 text-[12px] font-black uppercase py-5 rounded-2xl transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-xl ${isAnalyzing ? 'bg-slate-400' : 'bg-slate-900 dark:bg-white hover:scale-[1.01] hover:shadow-2xl active:scale-95'}`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="size-5 border-2 border-current/30 border-t-current rounded-full animate-spin"></span>
                    AI Analyzing Scope...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                    Build & Add Custom Project
                  </>
                )}
              </button>
           </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-100 dark:border-slate-800 pb-3">
             <span className="material-symbols-outlined text-sm text-slate-400">inventory_2</span>
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Predefined Solution Packs</h3>
          </div>
          {services.map(s => {
            const selectedItem = data.items.find(i => i.description === s.name);
            const isSelected = !!selectedItem;
            return (
              <div key={s.id} className="flex flex-col gap-2">
                <label 
                  onClick={() => toggleService(s)}
                  className={`group relative flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/30'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white rotate-6 shadow-primary/30 shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200'}`}>
                      <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{s.name}</h4>
                      <p className="text-[11px] font-black text-primary/70 uppercase tracking-widest mt-1">EST. {data.currency}{s.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    {isSelected && (
                      <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 p-1.5 shadow-sm" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={(e) => updateQuantity(s.name, -1, e)}
                          className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <span className="w-10 text-center text-sm font-black text-slate-900 dark:text-white">{selectedItem.quantity}</span>
                        <button 
                          onClick={(e) => updateQuantity(s.name, 1, e)}
                          className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                        </button>
                      </div>
                    )}
                    <div className={`size-7 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary scale-110 shadow-lg' : 'border-slate-200 dark:border-slate-700'}`}>
                      {isSelected && <span className="material-symbols-outlined text-white text-base font-black">check</span>}
                    </div>
                  </div>
                </label>
                
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isSelected ? 'max-h-[1200px] opacity-100 mt-3' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                  <div className="p-8 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                    <div className="mb-8">
                       <p className="text-[12px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed border-l-4 border-primary/20 pl-5">{s.description}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div>
                        <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em] mb-5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">task_alt</span>
                          Standard In-Scope
                        </h5>
                        <ul className="space-y-4">
                          {s.includes.map((inc, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight leading-tight">
                              <span className="text-emerald-500/40 mt-[-1px] text-base">•</span>
                              {inc}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.25em] mb-5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">do_not_disturb_on</span>
                          Logical Exclusions
                        </h5>
                        <ul className="space-y-4">
                          {s.excludes.map((exc, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-bold italic uppercase tracking-tight leading-tight">
                              <span className="text-rose-300/30 mt-[-1px] text-base">•</span>
                              {exc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="animate-fade-in-up space-y-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Final Details</h1>
          <p className="text-slate-500 text-sm font-medium">Add a personalized message or terms.</p>
        </div>
        <div className="space-y-6">
          <div className="relative">
             <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Notes & Policy</span>
                <button 
                  onClick={onEnhance} 
                  disabled={isEnhancing}
                  className="text-[9px] bg-primary/10 text-primary dark:text-primary-neon px-3 py-1.5 rounded-full font-black hover:bg-primary/20 transition-all flex items-center gap-1 shadow-sm uppercase tracking-widest active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span> 
                  {isEnhancing ? "Refining..." : "AI Professionalize"}
                </button>
             </div>
             <textarea 
               name="notes" value={data.notes} onChange={handleChange}
               className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
               placeholder="Payment terms, timeline, etc." rows={6}
             />
          </div>

          <div className="relative group">
            <input 
              name="clientBudget" value={data.clientBudget || ''} onChange={handleChange}
              className="peer floating-input w-full h-14 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 pt-4 text-base font-black text-primary dark:text-primary-neon focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-transparent shadow-sm" 
              placeholder="Budget" type="number"
            />
            <label className="absolute left-4 top-4 text-slate-400 text-[10px] transition-all duration-200 pointer-events-none origin-left uppercase font-black tracking-widest group-focus-within:text-primary">Allocated Client Budget ({data.currency})</label>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="relative group">
              <input 
                name="quoteNumber" value={data.quoteNumber} readOnly
                className="peer floating-input w-full h-14 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 px-4 pt-4 text-xs font-bold text-slate-400 cursor-not-allowed outline-none transition-all placeholder-transparent" 
                placeholder="ID" type="text"
              />
              <label className="absolute left-4 top-4 text-slate-400 text-[10px] transition-all duration-200 pointer-events-none origin-left uppercase font-black tracking-widest flex items-center gap-1">
                Ref ID <span className="material-symbols-outlined text-[10px]">lock</span>
              </label>
            </div>
            <div className="relative group">
              <input 
                name="date" value={data.date} readOnly
                className="peer floating-input w-full h-14 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 px-4 pt-4 text-xs font-bold text-slate-400 cursor-not-allowed outline-none transition-all placeholder-transparent" 
                placeholder="Date" type="text"
              />
              <label className="absolute left-4 top-4 text-slate-400 text-[10px] transition-all duration-200 pointer-events-none origin-left uppercase font-black tracking-widest flex items-center gap-1">
                Date <span className="material-symbols-outlined text-[10px]">lock</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
