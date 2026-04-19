import React from 'react';

// No router needed — single landing page
function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white">
      <LandingPage />
    </div>
  );
}

/* ── Data ── */
const SCANNERS = [
  {
    id: 'cyberslot',
    name: 'CyberSlot Scanner',
    tagline: 'P2P Hacking System',
    description: 'Hack trick tips jackpot untuk Mega888, 918Kiss, Pussy888 dan Pragmatic Play. Scanner P2P yang scan dan detect pola slot dengan teknologi hacking terkini.',
    accent: 'red',
    accentColor: '#FF3333',
    accentBg: 'rgba(255,51,51,0.08)',
    accentBorder: 'rgba(255,51,51,0.2)',
    accentGlow: 'rgba(255,51,51,0.15)',
    features: [
      'P2P Scanning System',
      'Mega888 / 918Kiss / Pussy888',
      'Hack Trick & Tips Jackpot',
      'Video Feedback & Bukti Cuci',
    ],
    cta: 'Launch Bot',
    ctaLink: 'https://t.me/Cyberslotscannerplusbot?start=5925622731',
    website: 'cyberslotofficial.com',
    websiteLink: 'https://cyberslotofficial.com',
  },
  {
    id: 'tipsmega888',
    name: 'TipsMega888 Scanner',
    tagline: 'AI RTP + Trusted Agent',
    description: 'Laman rujukan Mega888 Malaysia. AI RTP Scanner untuk semakan live, panduan download APK, dan halaman trusted agent sebagai bahan rujukan pengguna.',
    accent: 'gold',
    accentColor: '#F59E0B',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.2)',
    accentGlow: 'rgba(245,158,11,0.15)',
    features: [
      'AI RTP Scanner Live',
      'Panduan Download & Login',
      'Trusted Agent Reference',
      'Bahasa Melayu Friendly',
    ],
    cta: 'Open Scanner',
    ctaLink: 'https://tipsmega888.com',
    website: 'tipsmega888.com',
    websiteLink: 'https://tipsmega888.com',
  },
  {
    id: 'slotpatcher',
    name: 'SlotPatcher Scanner',
    tagline: 'Live Casino Scanner',
    description: 'Live casino scanner Malaysia. Scan provider, dapat live RTP analysis dalam beberapa saat. 16+ provider, real-time data, dan stat dashboard.',
    accent: 'blue',
    accentColor: '#3B82F6',
    accentBg: 'rgba(59,130,246,0.08)',
    accentBorder: 'rgba(59,130,246,0.2)',
    accentGlow: 'rgba(59,130,246,0.15)',
    features: [
      '16+ Provider Support',
      'Live RTP Analysis',
      'Real-time Stats Dashboard',
      'Mobile Friendly PWA',
    ],
    cta: 'Start Scan',
    ctaLink: 'https://slotpatcher.com',
    website: 'slotpatcher.com',
    websiteLink: 'https://slotpatcher.com',
  },
];

const STATS = [
  { label: 'Providers', value: '50+' },
  { label: 'Scans Daily', value: '10K+' },
  { label: 'Live', value: '24/7' },
  { label: 'Accuracy', value: '99.2%' },
];

/* ── Landing Page ── */
const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 -z-50 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FF3333]/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#3B82F6]/3 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#F59E0B]/3 blur-[100px] rounded-full"></div>
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,51,51,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,51,51,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Top Bar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#FF3333] font-bold text-lg">⟩</span>
            <span className="text-base font-serif italic text-white">SlotData</span>
            <span className="text-[10px] text-neutral-600 font-mono ml-2 hidden sm:inline">RTP CENTRE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-[#FF3333] text-white text-[9px] font-bold uppercase animate-pulse">Live</span>
            <span className="text-xs text-neutral-500 font-mono hidden sm:inline">3 Scanners Online</span>
          </div>
        </div>
      </header>

      <div className="px-4 max-w-5xl mx-auto">

        {/* ═══ HERO ═══ */}
        <div className="text-center pt-24 md:pt-32 pb-16 md:pb-24">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#FF3333]/10 border border-[#FF3333]/20 shadow-[0_0_40px_rgba(255,51,51,0.1)]">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-white tracking-tight mb-4">
            Slot<span className="text-[#FF3333]">Data</span>
          </h1>

          <p className="text-[#FF3333] text-xs md:text-sm font-bold uppercase tracking-[0.25em] mb-6">
            3 SCANNERS · 1 PLATFORM
          </p>

          <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Pilih scanner yang betul untuk anda. Real-time RTP data dari 50+ provider. Scan, track, dan buat keputusan yang tepat.
          </p>

          <a href="#scanners" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#FF3333]/30 transition-all group shadow-[0_0_0_1px_rgba(255,51,51,0.1),0_0_20px_rgba(255,51,51,0.05)]">
            <span className="px-2 py-0.5 rounded bg-[#FF3333] text-white text-[10px] font-bold uppercase">3 Live</span>
            <span className="text-sm text-neutral-300">Pilih Scanner Anda</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>


        {/* ═══ SCANNER CARDS ═══ */}
        <div id="scanners" className="scroll-mt-20 pb-16 md:pb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">⟩ Pilih Scanner</h2>
            <p className="text-neutral-500 text-sm">3 scanner berbeza, setiap satu unik untuk keperluan anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {SCANNERS.map((scanner) => (
              <ScannerCard key={scanner.id} scanner={scanner} />
            ))}
          </div>
        </div>


        {/* ═══ STATS BAR ═══ */}
        <div className="mb-16 md:mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-[#111111] border border-neutral-800 rounded-2xl p-4 text-center">
                <div className="text-2xl md:text-3xl font-black text-white font-mono mb-1">{stat.value}</div>
                <div className="text-[10px] uppercase font-mono text-neutral-600 tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>


        {/* ═══ CTA ═══ */}
        <div className="mb-16 md:mb-24">
          <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#FF3333]/5 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Join Telegram</h2>
              <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">Real-time alerts, new providers, dan update scanner terkini.</p>
              <a
                href="https://t.me/slotdatartp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF3333] text-white font-bold text-sm rounded-xl hover:bg-[#e60000] transition-colors shadow-lg shadow-[#FF3333]/20 hover:shadow-[#FF3333]/30"
              >
                Open Telegram →
              </a>
            </div>
          </div>
        </div>


        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-neutral-800 pt-8 pb-12 text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            <span className="text-[#FF3333] font-bold">⟩</span>
            <span className="text-base font-serif italic text-white">SlotData</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-600 mb-4 flex-wrap">
            <a href="https://cyberslotofficial.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">CyberSlot</a>
            <span className="text-neutral-800">·</span>
            <a href="https://tipsmega888.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TipsMega888</a>
            <span className="text-neutral-800">·</span>
            <a href="https://slotpatcher.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">SlotPatcher</a>
            <span className="text-neutral-800">·</span>
            <a href="https://t.me/slotdatartp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram</a>
          </div>
          <p className="text-xs text-neutral-800 font-mono">
            © {new Date().getFullYear()} SlotData RTP Centre. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

/* ── Scanner Card Component ── */
const ScannerCard: React.FC<{ scanner: typeof SCANNERS[0] }> = ({ scanner }) => {
  return (
    <div
      className="group relative bg-[#111111] rounded-3xl p-6 md:p-7 border overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: 'rgba(255,255,255,0.05)',
        boxShadow: `0 0 0 1px ${scanner.accentBorder}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = scanner.accentBorder;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px ${scanner.accentGlow}, 0 0 0 1px ${scanner.accentBorder}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${scanner.accentBorder}`;
      }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${scanner.accentColor}, transparent)` }}></div>

      {/* Accent glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: scanner.accentBg }}></div>

      <div className="relative z-10">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase" style={{ background: scanner.accentBg, color: scanner.accentColor, border: `1px solid ${scanner.accentBorder}` }}>
            {scanner.tagline}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{scanner.name}</h3>

        {/* Description */}
        <p className="text-neutral-500 text-sm leading-relaxed mb-5">{scanner.description}</p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {scanner.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: scanner.accentColor }}></div>
              <span className="text-xs text-neutral-400">{feat}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={scanner.ctaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: scanner.accentColor,
            color: '#fff',
            boxShadow: `0 8px 20px ${scanner.accentGlow}`,
          }}
        >
          {scanner.cta}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </a>

        {/* Website link */}
        <a
          href={scanner.websiteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-[10px] font-mono text-neutral-700 hover:text-neutral-400 transition-colors mt-3"
        >
          {scanner.website} ↗
        </a>
      </div>
    </div>
  );
};

export default App;