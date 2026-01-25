import React, { useRef, useEffect } from 'react';
import { ShieldCheck, Star, ExternalLink, Award } from 'lucide-react';
import { TRUSTED_COMPANIES } from '../constants';
import gsap from 'gsap';

export const Trusted: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".header-element", {
        y: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });

      // Card Stagger Animation
      gsap.from(".company-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.out",
        delay: 0.2
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="pt-24 pb-24 px-4 max-w-4xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="mb-8 text-center md:text-left">
        <div className="header-element">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Award className="text-gold-500" size={28} />
            <h1 className="text-3xl font-bold text-slate-800">Trusted Companies</h1>
          </div>
          <p className="text-slate-500">
            Verified online casino operators for {new Date().getFullYear()}.
          </p>
        </div>
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 gap-4">
        {TRUSTED_COMPANIES.map((company, idx) => (
          <div 
            key={idx} 
            className="company-card group bg-white border border-slate-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:shadow-primary-100/50 hover:border-primary-100 transition-all duration-300 flex flex-col sm:flex-row items-center gap-5"
          >
            {/* Rank Number */}
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-bold text-sm shrink-0">
              #{idx + 1}
            </div>

            {/* Logo Placeholder */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
               <span className="text-2xl font-black text-slate-300 uppercase select-none group-hover:text-primary-300">
                 {company.name.charAt(0)}
               </span>
            </div>

            {/* Content Info */}
            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 justify-center sm:justify-start">
                <h3 className="text-xl font-bold text-slate-800">{company.name}</h3>
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-100 w-fit mx-auto sm:mx-0">
                  <ShieldCheck size={12} /> VERIFIED
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                 {company.tags.map((tag, i) => (
                   <span key={i} className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                     {tag}
                   </span>
                 ))}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1 text-gold-500 font-bold text-sm">
                <Star fill="currentColor" size={16} />
                <Star fill="currentColor" size={16} />
                <Star fill="currentColor" size={16} />
                <Star fill="currentColor" size={16} />
                <Star fill="currentColor" size={16} />
                <span className="text-slate-400 font-normal ml-1">({company.rating}/10)</span>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-col items-center gap-2 min-w-[140px] w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-5">
               <div className="text-center mb-1">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Welcome Offer</p>
                 <p className="text-sm font-bold text-primary-600">{company.bonus}</p>
               </div>
               
               <button className="w-full bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-slate-200 hover:bg-primary-600 hover:shadow-primary-200 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group-hover/btn">
                 VISIT <ExternalLink size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-sm">
        <p>Disclaimer: We are an independent directory and information service free of any gaming operator's control.</p>
      </div>
    </div>
  );
};