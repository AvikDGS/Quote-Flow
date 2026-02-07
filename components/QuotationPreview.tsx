
import React from 'react';
import { QuotationData } from '../types';

interface Props {
  data: QuotationData;
  id: string;
  step?: number;
}

export const QuotationPreview: React.FC<Props> = ({ data, id, step }) => {
  const total = data.items.reduce((acc, item) => acc + item.total, 0);

  // SVG-based noise pattern for a realistic paper texture
  const noisePattern = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

  return (
    <div 
      id={id} 
      className="relative w-[794px] min-h-[1123px] bg-white text-slate-900 rounded-sm p-16 flex flex-col justify-between overflow-hidden shadow-2xl pdf-capture-area"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Subtle Step Transition Shimmer */}
      <div 
        key={`shimmer-${step}`} 
        className="absolute inset-0 pointer-events-none z-50 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"
      />

      {/* Paper Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" 
        style={{ backgroundImage: noisePattern }}
      ></div>
      
      <div key={`content-${step}`} className="flex flex-col h-full animate-content-pop relative z-10">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
          <div>
            <div className="text-6xl font-black font-display tracking-tighter uppercase leading-none">QUOTATION</div>
            <div className="text-sm font-typewriter text-slate-500 mt-3 font-bold tracking-[0.2em] uppercase">{data.quoteNumber}</div>
            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{data.date}</div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-3 justify-end text-primary mb-2">
              {data.logoUrl ? (
                <img src={data.logoUrl} alt="Logo" className="h-14 w-auto object-contain" />
              ) : (
                <span className="material-symbols-outlined text-5xl font-black">diamond</span>
              )}
              <span className="font-black text-4xl tracking-tighter">{data.senderName || 'Taskio'}</span>
            </div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              {data.senderAddress.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
            </div>
            <div className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest">
               {data.senderEmail} {data.senderPhone && `• ${data.senderPhone}`}
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-grow flex flex-col gap-12">
          {/* Client Info */}
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-black">Prepared Specifically For</div>
              <div className="font-display">
                <div className="text-3xl font-black text-slate-900 uppercase leading-none mb-1">{data.clientName || 'Valued Client'}</div>
                <div className="text-lg font-bold text-slate-600">{data.clientAddress || 'Strategic Partner'}</div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  {data.clientEmail && (
                    <div className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">mail</span>
                      {data.clientEmail}
                    </div>
                  )}
                  {data.clientPhone && (
                    <div className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">call</span>
                      {data.clientPhone}
                    </div>
                  )}
                  {data.clientWhatsapp && (
                    <div className="text-[10px] text-emerald-600 font-black uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">chat</span>
                      WA: {data.clientWhatsapp}
                    </div>
                  )}
                  {data.clientWebsite && (
                    <div className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">language</span>
                      {data.clientWebsite}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {data.preferredContactMode && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1">Preferred Contact</div>
                <div className="flex items-center gap-2 justify-end text-slate-900 font-black uppercase text-xs">
                  <span className="material-symbols-outlined text-sm">
                    {data.preferredContactMode === 'Email' ? 'mail' : 
                     data.preferredContactMode === 'Phone' ? 'call' : 
                     data.preferredContactMode === 'WhatsApp' ? 'chat' : 'video_chat'}
                  </span>
                  {data.preferredContactMode}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Itemization */}
          <div className="space-y-6">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-black">Proposed Scope & Investment ({data.currency})</div>
            
            <div className="space-y-10">
              {data.items.length > 0 ? data.items.map((item) => (
                <div key={item.id} className="group">
                  {/* Item Header */}
                  <div className="flex justify-between items-end border-b-2 border-slate-100 pb-3 mb-4">
                    <div className="flex flex-col max-w-[70%]">
                        <span className="text-xl font-black text-slate-900 uppercase tracking-tight">{item.description}</span>
                        {item.serviceDescription && (
                          <p className="text-[11px] text-slate-500 font-bold mt-1 leading-snug">
                            {item.serviceDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-2">
                             {item.quantity} units @ {data.currency}{item.unitPrice.toLocaleString()} 
                             {item.billingCycle === 'hourly' ? ' / hour' : item.billingCycle === 'monthly' ? ' / month' : ''}
                           </span>
                        </div>
                    </div>
                    <span className="text-2xl font-typewriter font-black text-slate-900 tracking-tighter mb-1">{data.currency}{item.total.toLocaleString()}.00</span>
                  </div>

                  {/* Visual Features: Includes & Excludes */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Includes Section */}
                    <div className="bg-emerald-50/40 rounded-xl p-5 border border-emerald-100/60 shadow-sm min-h-[140px]">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-xl text-emerald-600 font-black">check_circle</span>
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">In-Scope Deliverables</span>
                      </div>
                      <ul className="grid grid-cols-1 gap-y-2">
                        {item.includes?.map((inc, i) => (
                          <li key={i} className="text-[10px] text-emerald-800 font-black flex items-start gap-2 uppercase tracking-tight leading-tight">
                            <span className="text-emerald-400 font-black mt-[-1px]">•</span>
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Excludes Section */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm min-h-[140px]">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-xl text-slate-400 font-black">cancel</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Exclusions</span>
                      </div>
                      <ul className="grid grid-cols-1 gap-y-2">
                        {item.excludes?.map((exc, i) => (
                          <li key={i} className="text-[10px] text-slate-400 font-bold italic flex items-start gap-2 uppercase tracking-tight leading-tight">
                            <span className="text-slate-300 font-black mt-[-1px]">•</span>
                            {exc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-slate-100 rounded-3xl opacity-30">
                  <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">receipt_long</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">Proposal Items Pending Selection</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-auto pt-10 border-t-4 border-slate-900 grid grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
               <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">Legal & Additional Terms</div>
               <div className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase italic">
                  {data.notes}
               </div>
            </div>
            
            <div className="size-32 border-8 border-primary/5 rounded-full flex items-center justify-center transform -rotate-12 opacity-40">
              <div className="text-primary/20 font-black text-[10px] uppercase tracking-[0.4em] text-center leading-tight">OFFICIAL<br/>PROPOSAL</div>
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-end space-y-6">
            {data.clientBudget && data.clientBudget > 0 && (
              <div className="text-right bg-slate-50/50 p-4 rounded-xl border border-slate-100 w-full">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1">Target Client Budget</div>
                <div className="text-2xl font-typewriter font-black text-primary/60 tracking-tighter">
                  {data.currency}{data.clientBudget.toLocaleString()}.00
                </div>
                {total > data.clientBudget && (
                  <div className="text-[8px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest mt-2 inline-block">
                    Budget Adjustment Recommended
                  </div>
                )}
              </div>
            )}

            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-black mb-2">Final Investment Total</div>
              <div className="text-7xl font-typewriter font-black text-slate-900 tracking-tighter flex items-start justify-end leading-none">
                  <span className="text-2xl mt-4 mr-1">{data.currency}</span>
                  {total.toLocaleString()}
                  <span className="text-xl mt-11">.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Brand Watermark */}
      <div className="absolute top-[35%] right-[-180px] opacity-[0.015] rotate-90 pointer-events-none select-none">
        <div className="text-[280px] font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">OFFICIAL QUOTATION OFFICIAL</div>
      </div>
    </div>
  );
};
