import React, { useRef, useEffect } from 'react';
import { ShieldCheck, Star, ExternalLink, Award, Flame, Zap } from 'lucide-react';
import { TRUSTED_COMPANIES } from '../constants';
import gsap from 'gsap';

export const Trusted: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".header-element", {
        y: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });
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
    <div ref={containerRef} className="relative min-h-screen pt-24 pb-24 px-4 max-w-4xl mx-auto">
      {/* Background glow */}
      <div className="fixed inset-0 -z-50 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="header-element">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-500/10 border border-accent-500/20 mb-4">
            <Award className="text-accent-500" size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Trusted Companies</h1>
          <p className="text-neutral-500 text-sm">
            Verified online casino operators for {new Date().getFullYear()}.
          </p>
        </div>
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 gap-3">
        {TRUSTED_COMPANIES.map((company, idx) => (
          <div 
            key={idx} 
            className="company-card group bg-[#111111] border border-neutral-800 rounded-2xl p-4 md:p-5 hover:border-accent-500/30 hover:shadow-lg hover:shadow-accent-500/5 transition-all duration-300 flex flex-col sm:flex-row items-center gap-4"
          >
            {/* Rank */}
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-600 font-mono font-bold text-xs shrink-0">
              #{idx + 1}
            </div>

            {/* Logo */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 group-hover:border-accent-500/30 transition-all duration-300">
              <span className="text-xl font-black text-neutral-600 uppercase select-none group-hover:text-accent-500 transition-colors">
                {company.name.charAt(0)}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 justify-center sm:justify-start">
                <h3 className="text-lg font-bold text-white">{company.name}</h3>
                <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold w-fit mx-auto sm:mx-0">
                  <ShieldCheck size={10} /> VERIFIED
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-2">
                {company.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] uppercase font-mono font-semibold text-neutral-600 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-0.5 text-amber-400 text-sm">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} fill="currentColor" size={12} />
                ))}
                <span className="text-neutral-600 font-mono ml-1 text-xs">({company.rating}/10)</span>
              </div>
            </div>

            {/* Action */}
            <div className="flex flex-col items-center gap-2 min-w-[130px] w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-neutral-800 pt-3 sm:pt-0 sm:pl-5">
              <div className="text-center mb-1">
                <p className="text-[9px] text-neutral-600 font-mono font-bold uppercase tracking-wider">Welcome Offer</p>
                <p className="text-sm font-bold text-accent-500">{company.bonus}</p>
              </div>
              <button className="w-full bg-accent-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-accent-500/20 hover:bg-accent-600 hover:shadow-accent-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                VISIT <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 text-center text-neutral-700 text-xs font-mono">
        <p>Independent directory. Free of any gaming operator's control.</p>
      </div>
    </div>
  );
};