import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  isActive: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, isActive }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 overflow-hidden rounded-xl border border-neutral-800 bg-[#0d0d0d] shadow-2xl shadow-black/50 relative">
      {/* Scan-line effect overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,51,51,0.15) 2px, rgba(255,51,51,0.15) 4px)',
        backgroundSize: '100% 4px'
      }}></div>

      {/* Header bar */}
      <div className="bg-[#111111] border-b border-neutral-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-accent-500" />
          <span className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider">System Log</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-accent-500 animate-pulse shadow-[0_0_6px_rgba(255,51,51,0.5)]' : 'bg-neutral-700'}`}></div>
        </div>
      </div>

      {/* Log content */}
      <div
        ref={containerRef}
        className="h-48 overflow-y-auto p-4 font-mono text-xs md:text-sm bg-[#0a0a0a] scrollbar-hide relative"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-600 space-y-2">
            <p className="text-neutral-600">$ waiting for command...</p>
            <p className="text-neutral-700 text-[10px]">Select a provider and hit scan.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 leading-relaxed">
                <span className="text-neutral-700 shrink-0 font-mono">[{log.timestamp}]</span>
                <span className={`
                  ${log.type === 'success' ? 'text-emerald-400 font-medium' : ''}
                  ${log.type === 'error' ? 'text-accent-500 font-medium' : ''}
                  ${log.type === 'warning' ? 'text-amber-500' : ''}
                  ${log.type === 'info' ? 'text-neutral-500' : ''}
                `}>
                  {log.type === 'success' && '✓ '}
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
        {/* Blinking cursor */}
        {isActive && (
          <span className="inline-block w-2 h-4 bg-accent-500 animate-pulse ml-1 align-middle"></span>
        )}
      </div>
    </div>
  );
};