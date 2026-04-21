import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── DATA ──────────────────────────────────────────
const SCANNERS = [
  {
    id: 'cyberslot',
    name: 'CyberSlot Scanner',
    tagline: 'P2P Hacking System',
    description: 'Hack trick tips jackpot untuk Mega888, 918Kiss, Pussy888 dan Pragmatic Play. Scanner P2P yang scan dan detect pola slot dengan teknologi hacking terkini.',
    accentColor: '#FF3333',
    accentBg: 'rgba(255,51,51,0.08)',
    accentBorder: 'rgba(255,51,51,0.25)',
    accentGlow: 'rgba(255,51,51,0.15)',
    features: ['P2P Scanning System', 'Mega888 / 918Kiss / Pussy888', 'Hack Trick & Tips Jackpot', 'Video Feedback & Bukti Cuci'],
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
    accentColor: '#F59E0B',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.25)',
    accentGlow: 'rgba(245,158,11,0.15)',
    features: ['AI RTP Scanner Live', 'Panduan Download & Login', 'Trusted Agent Reference', 'Bahasa Melayu Friendly'],
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
    accentColor: '#3B82F6',
    accentBg: 'rgba(59,130,246,0.08)',
    accentBorder: 'rgba(59,130,246,0.25)',
    accentGlow: 'rgba(59,130,246,0.15)',
    features: ['16+ Provider Support', 'Live RTP Analysis', 'Real-time Stats Dashboard', 'Mobile Friendly PWA'],
    cta: 'Start Scan',
    ctaLink: 'https://slotpatcher.com',
    website: 'slotpatcher.com',
    websiteLink: 'https://slotpatcher.com',
  },
];

const REVIEW_BANNERS = [
  {
    id: 'alya',
    name: 'Alya',
    role: 'Mobile user review',
    accentColor: '#FF3333',
    accentBg: 'from-[#351112] via-[#181016] to-[#10131a]',
    badge: 'CYBERSLOT PICK',
    headline: 'Senang compare terus 3 scanner dalam satu page.',
    quote: 'Aku suka sebab terus nampak mana satu style yang sesuai. CyberSlot rasa paling padu untuk vibe hacker, tapi semua 3 scanner jelas dan senang try.',
    chips: ['CyberSlot', 'TipsMega888', 'SlotPatcher'],
  },
  {
    id: 'nabila',
    name: 'Nabila',
    role: 'Guide-style review',
    accentColor: '#F59E0B',
    accentBg: 'from-[#2c2010] via-[#151216] to-[#10131a]',
    badge: 'TIPSMEGA888 PICK',
    headline: 'Banner ni terus bagi rasa trusted dan premium.',
    quote: 'Bila user baru buka, terus faham TipsMega888 untuk panduan, CyberSlot untuk bot style, dan SlotPatcher untuk live scan. Conversion memang lagi sedap.',
    chips: ['Trusted vibe', 'Clean compare', 'Beginner friendly'],
  },
  {
    id: 'sofia',
    name: 'Sofia',
    role: 'Live scan review',
    accentColor: '#3B82F6',
    accentBg: 'from-[#101829] via-[#13131a] to-[#0e1116]',
    badge: 'SLOTPATCHER PICK',
    headline: 'Carousel macam ni buat orang rasa nak swipe dan cuba.',
    quote: 'Setiap slide boleh push angle berbeza. Satu untuk trust, satu untuk live scan, satu untuk bot. User tak bosan dan terus rasa nak klik CTA.',
    chips: ['Animated', 'Premium', 'High intent'],
  },
  {
    id: 'amira',
    name: 'Amira',
    role: 'Conversion-style review',
    accentColor: '#E879F9',
    accentBg: 'from-[#281126] via-[#151116] to-[#11131a]',
    badge: 'REVIEW MODE',
    headline: 'Rasa macam banner promo brand besar, bukan landing biasa.',
    quote: 'Kalau rotate beberapa banner macam ni, user rasa page aktif dan ada banyak angle review. Lagi senang push depa try semua 3 scanner sekali.',
    chips: ['Carousel motion', 'Visual trust', 'CTA ready'],
  },
];

// ─── HOOKS ──────────────────────────────────────────

/* Typing animation */
function useTypingEffect(text: string, speed = 50, startDelay = 500) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

/* Count-up animation on scroll */
function useCountUp(target: number, duration = 2000, suffix = '') {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(eased * target));
          if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { value: value.toLocaleString() + suffix, ref };
}

/* Scroll reveal */
function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* 3D Tilt effect */
function useTilt<T extends HTMLElement>(intensity = 15) {
  const ref = useRef<T>(null);
  const handleMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.02,1.02,1.02)`;
  }, [intensity]);
  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.15s ease-out';
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [handleMove, handleLeave]);
  return ref;
}


// ─── MATRIX RAIN CANVAS ────────────────────────────
const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const chars = '⟨⟩01アイウエオカキクケコ♠♦♣♥█▓▒░⚡';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1).map(() => Math.random() * -50);

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FF3333';
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        // Vary opacity
        const opacity = 0.03 + Math.random() * 0.12;
        ctx.fillStyle = `rgba(255, 51, 51, ${opacity})`;
        ctx.fillText(char, x, y);
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 -z-40 pointer-events-none" />;
};


// ─── TERMINAL AUTO-TYPE ────────────────────────────
const TERMINAL_LINES = [
  { text: 'Initializing SlotData v3.0...', delay: 0 },
  { text: 'Loading scanner modules...', delay: 800 },
  { text: 'CyberSlot Scanner ......... ONLINE ✓', delay: 1600 },
  { text: 'TipsMega888 Scanner ....... ONLINE ✓', delay: 2400 },
  { text: 'SlotPatcher Scanner ........ ONLINE ✓', delay: 3200 },
  { text: 'Connecting to 50+ providers...', delay: 4000 },
  { text: 'All systems operational. Ready to scan.', delay: 5000 },
];

const TerminalFeed: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (lineIndex >= TERMINAL_LINES.length) {
      setComplete(true);
      return;
    }
    const target = TERMINAL_LINES[lineIndex].text;
    if (charIndex < target.length) {
      const timeout = setTimeout(() => {
        setCurrentLine(target.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      }, 25 + Math.random() * 35);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setLines(prev => [...prev, target]);
        setCurrentLine('');
        setCharIndex(0);
        setLineIndex(i => i + 1);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [lineIndex, charIndex]);

  return (
    <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-4 font-mono text-[11px] md:text-xs max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF3333]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
        <span className="text-neutral-600 ml-2">slotdata://terminal</span>
      </div>
      <div className="space-y-1 min-h-[120px]">
        {lines.map((line, i) => (
          <div key={i} className={
            line.includes('ONLINE ✓') ? 'text-emerald-500' :
            line.includes('Ready') ? 'text-[#FF3333] font-bold' :
            'text-neutral-500'
          }>
            <span className="text-neutral-700 mr-2">{String(i + 1).padStart(2, '0')}</span>
            {line}
          </div>
        ))}
        {currentLine && (
          <div className="text-neutral-400">
            <span className="text-neutral-700 mr-2">{String(lineIndex + 1).padStart(2, '0')}</span>
            {currentLine}
            <span className="inline-block w-2 h-3 bg-[#FF3333] ml-0.5 animate-pulse"></span>
          </div>
        )}
        {complete && (
          <div className="text-neutral-700 mt-1">
            <span className="text-neutral-700 mr-2">{'>'}</span>
            <span className="inline-block w-2 h-3 bg-[#FF3333] animate-pulse"></span>
          </div>
        )}
      </div>
    </div>
  );
};


// ─── RIPPLE BUTTON ─────────────────────────────────
const RippleButton: React.FC<React.ButtonHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  accentColor: string;
  accentGlow: string;
  children: React.ReactNode;
}> = ({ href, accentColor, accentGlow, children, ...props }) => {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const handleClick = (e: React.MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };
  return (
    <a
      ref={btnRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="relative overflow-hidden w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 magnetic-btn"
      style={{ background: accentColor, boxShadow: `0 8px 20px ${accentGlow}` }}
      {...props}
    >
      {children}
    </a>
  );
};


// ─── 3D SCANNER CARD ───────────────────────────────
const ScannerCard: React.FC<{ scanner: typeof SCANNERS[0]; index: number }> = ({ scanner, index }) => {
  const tiltRef = useTilt<HTMLDivElement>(12);
  const reveal = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={(el) => { (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = el; (reveal.ref as React.MutableRefObject<HTMLDivElement | null>).current = el; }}
      className={`group relative bg-[#111111]/90 backdrop-blur-sm rounded-3xl p-6 md:p-7 border overflow-hidden transition-all duration-500 hover:-translate-y-2
        ${reveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{
        borderColor: 'rgba(255,255,255,0.05)',
        boxShadow: `0 0 0 1px ${scanner.accentBorder}`,
        transitionDelay: `${index * 150}ms`,
      }}
    >
      {/* Holographic border animation */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="holo-border" style={{ '--holo-color': scanner.accentColor } as React.CSSProperties}></div>
      </div>

      {/* Scan line sweep */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="scan-line-sweep" style={{ background: `linear-gradient(180deg, transparent, ${scanner.accentColor}20, transparent)` }}></div>
      </div>

      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-60" style={{ background: `linear-gradient(90deg, transparent, ${scanner.accentColor}, transparent)` }}></div>

      {/* Accent glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: scanner.accentBg }}></div>

      <div className="relative z-10">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ background: scanner.accentBg, color: scanner.accentColor, border: `1px solid ${scanner.accentBorder}` }}>
            {scanner.tagline}
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: scanner.accentColor }}></span>
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: scanner.accentColor }}></span>
          </span>
        </div>

        {/* Name with glitch on hover */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 glitch-text" data-text={scanner.name}>
          {scanner.name}
        </h3>

        {/* Description */}
        <p className="text-neutral-500 text-sm leading-relaxed mb-5">{scanner.description}</p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {scanner.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2 group/feat">
              <div className="w-1.5 h-1.5 rounded-full shrink-0 group-hover/feat:scale-150 transition-transform" style={{ background: scanner.accentColor }}></div>
              <span className="text-xs text-neutral-400 group-hover/feat:text-neutral-300 transition-colors">{feat}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <RippleButton href={scanner.ctaLink} accentColor={scanner.accentColor} accentGlow={scanner.accentGlow}>
          {scanner.cta}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </RippleButton>

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


// ─── COUNT-UP STAT CARD ────────────────────────────
const StatCard: React.FC<{ label: string; target: number; suffix: string }> = ({ label, target, suffix }) => {
  const { value, ref } = useCountUp(target, 2000, suffix);
  const reveal = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={(el) => { (ref as React.MutableRefObject<HTMLDivElement | null>).current = el; (reveal.ref as React.MutableRefObject<HTMLDivElement | null>).current = el; }}
      className={`bg-[#111111]/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-4 text-center transition-all duration-500 ${reveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="text-2xl md:text-3xl font-black text-white font-mono mb-1 neon-text">{value}</div>
      <div className="text-[10px] uppercase font-mono text-neutral-600 tracking-wider">{label}</div>
    </div>
  );
};

const ReviewAvatar: React.FC<{ name: string; accentColor: string; active: boolean }> = ({ name, accentColor, active }) => {
  return (
    <div className="relative w-[180px] h-[220px] sm:w-[220px] sm:h-[270px] shrink-0">
      <div className="absolute inset-0 rounded-[30px] bg-gradient-to-b from-white/10 to-white/0 border border-white/10 backdrop-blur-sm"></div>
      <div className="absolute -inset-3 rounded-[36px] blur-2xl opacity-30" style={{ background: `${accentColor}33` }}></div>
      <svg viewBox="0 0 220 270" className={`relative w-full h-full transition-transform duration-700 ${active ? 'scale-100' : 'scale-95 opacity-80'}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`card-${name}`} x1="0" y1="0" x2="220" y2="270" gradientUnits="userSpaceOnUse">
            <stop stopColor="#17181D" />
            <stop offset="1" stopColor="#0D1016" />
          </linearGradient>
        </defs>
        <rect x="12" y="12" width="196" height="246" rx="28" fill={`url(#card-${name})`} stroke="rgba(255,255,255,0.08)" />
        <circle cx="110" cy="86" r="48" fill="#F0C7A5" />
        <path d="M62 82C65 40 93 26 111 26C136 26 158 42 160 80C147 66 133 60 111 60C91 60 77 67 62 82Z" fill="#111318" />
        <path d="M62 204C69 160 87 134 110 134C133 134 151 160 158 204V226H62V204Z" fill={accentColor} opacity="0.95" />
        <path d="M79 82C84 73 94 66 110 66C127 66 137 73 141 82" stroke="#1A1C20" strokeWidth="8" strokeLinecap="round" />
        <circle cx="92" cy="92" r="4" fill="#1A1C20" />
        <circle cx="128" cy="92" r="4" fill="#1A1C20" />
        <path d="M96 111C103 117 117 117 124 111" stroke="#AB6B63" strokeWidth="4" strokeLinecap="round" />
        <rect x="40" y="188" width="140" height="22" rx="11" fill="rgba(255,255,255,0.08)" />
        <text x="110" y="203" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700">{name.toUpperCase()}</text>
      </svg>
    </div>
  );
};

const HeroCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  const tiltRef = useTilt<HTMLDivElement>(6);
  const reveal = useScrollReveal<HTMLDivElement>();

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % REVIEW_BANNERS.length);
    }, 4800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={(el) => { (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = el; (reveal.ref as React.MutableRefObject<HTMLDivElement | null>).current = el; }}
      className={`relative mt-10 mb-10 transition-all duration-700 ${reveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="absolute -inset-6 bg-gradient-to-r from-[#FF3333]/14 via-[#F59E0B]/12 to-[#3B82F6]/14 blur-3xl rounded-[42px] pointer-events-none"></div>
      <div className="relative overflow-hidden rounded-[34px] border border-neutral-800/80 bg-[#090909] shadow-[0_0_80px_rgba(255,51,51,0.12)] min-h-[420px] md:min-h-[460px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,51,51,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.10),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_22%)] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]"></div>
        <div className="absolute top-6 left-6 z-10 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.25em] font-mono">
          REVIEW CAROUSEL
        </div>
        <div className="absolute top-6 right-6 z-10 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[#E5E7EB] text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
          AUTO ROTATE
        </div>

        <div className="relative z-[1] p-6 sm:p-8 md:p-10">
          <div className="relative min-h-[360px] md:min-h-[390px]">
            {REVIEW_BANNERS.map((banner, index) => {
              const isActive = active === index;
              return (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-all duration-700 ${isActive ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}`}
                >
                  <div className={`h-full rounded-[28px] border border-white/10 bg-gradient-to-br ${banner.accentBg} p-5 sm:p-7 md:p-8 flex flex-col lg:flex-row gap-6 items-center lg:items-stretch overflow-hidden`}>
                    <div className="absolute inset-y-0 left-0 w-1.5 rounded-r-full" style={{ background: banner.accentColor }}></div>
                    <div className="flex items-center justify-center lg:justify-start lg:pl-3 pt-2 lg:pt-0">
                      <ReviewAvatar name={banner.name} accentColor={banner.accentColor} active={isActive} />
                    </div>

                    <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] border" style={{ color: banner.accentColor, borderColor: `${banner.accentColor}66`, background: `${banner.accentColor}14` }}>
                          {banner.badge}
                        </span>
                        <span className="text-neutral-400 text-[11px] font-mono uppercase tracking-[0.18em]">{banner.role}</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-3 max-w-3xl">
                        {banner.headline}
                      </h3>

                      <p className="text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mb-5">
                        “{banner.quote}”
                      </p>

                      <div className="flex items-center justify-center lg:justify-start gap-3 mb-5">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm border border-white/10" style={{ background: `${banner.accentColor}22` }}>
                          {banner.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold text-base">{banner.name}</div>
                          <div className="text-neutral-500 text-xs uppercase tracking-[0.2em]">Community review style</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                        {banner.chips.map((chip) => (
                          <span key={chip} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-200 text-xs font-semibold">
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-[2] mt-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {REVIEW_BANNERS.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${active === index ? 'w-10' : 'w-2.5 bg-white/20'}`}
                  style={active === index ? { background: banner.accentColor } : undefined}
                  aria-label={`Open banner ${index + 1}`}
                />
              ))}
            </div>
            <div className="text-neutral-500 text-xs font-mono uppercase tracking-[0.18em]">
              Swipe vibe · premium review mode · auto-rotate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ─── MAIN APP ──────────────────────────────────────
function App() {
  const { displayed: heroSubtitle, done: subtitleDone } = useTypingEffect('3 SCANNERS · 1 PLATFORM', 60, 800);
  const heroReveal = useScrollReveal<HTMLDivElement>();
  const ctaReveal = useScrollReveal<HTMLDivElement>();
  const footerReveal = useScrollReveal<HTMLDivElement>();

  // Scan progress bar at very top
  const [scanProgress, setScanProgress] = useState(0);
  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 2;
      if (p > 100) p = 0;
      setScanProgress(p);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden noise-bg">

      {/* Matrix Rain */}
      <MatrixRain />

      {/* Animated scan progress bar at very top */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[60]">
        <div className="h-full bg-gradient-to-r from-[#FF3333] via-[#F59E0B] to-[#3B82F6] transition-all duration-100" style={{ width: `${scanProgress}%` }}></div>
      </div>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FF3333]/5 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#3B82F6]/3 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#F59E0B]/3 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Top Bar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#FF3333] font-bold text-lg animate-pulse">⟩</span>
            <span className="text-base font-serif italic text-white">SlotData</span>
            <span className="text-[10px] text-neutral-600 font-mono ml-2 hidden sm:inline tracking-wider">RTP CENTRE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3333] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3333]"></span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#FF3333]/20 border border-[#FF3333]/30 text-[#FF3333] text-[9px] font-bold uppercase">Live</span>
            <span className="text-xs text-neutral-500 font-mono hidden sm:inline">3 Scanners Online</span>
          </div>
        </div>
      </header>

      <div className="px-4 max-w-5xl mx-auto relative z-10">

        {/* ═══ HERO ═══ */}
        <div ref={heroReveal.ref} className={`text-center pt-24 md:pt-32 pb-16 md:pb-24 transition-all duration-1000 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Terminal Feed */}
          <div className="mb-10">
            <TerminalFeed />
          </div>

          {/* Lightning icon */}
          <div className="mb-6 inline-block">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#FF3333]/10 border border-[#FF3333]/20 glow-red animate-float">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
          </div>

          {/* Hero title with stagger */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-white tracking-tight mb-4 hero-title">
            Slot<span className="text-[#FF3333] glitch-text" data-text="Data">Data</span>
          </h1>

          {/* Typing subtitle */}
          <p className="text-[#FF3333] text-xs md:text-sm font-bold uppercase tracking-[0.25em] mb-6 font-mono min-h-[20px]">
            {heroSubtitle}<span className={`inline-block w-1.5 h-3 bg-[#FF3333] ml-0.5 ${subtitleDone ? 'animate-pulse' : ''}`}></span>
          </p>

          <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto mb-6 leading-relaxed">
            Pilih scanner yang betul untuk anda. Real-time RTP data dari 50+ provider. Scan, track, dan buat keputusan yang tepat.
          </p>

          <div className="max-w-6xl mx-auto">
            <HeroCarousel />
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="#scanners" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#FF3333]/30 transition-all group pill-glow magnetic-btn">
              <span className="px-2 py-0.5 rounded bg-[#FF3333] text-white text-[10px] font-bold uppercase">3 Live</span>
              <span className="text-sm text-neutral-300">Pilih Scanner Anda</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="https://t.me/Cyberslotscannerplusbot?start=5925622731" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#111111]/80 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#F59E0B]/30 transition-all magnetic-btn text-sm font-semibold">
              Cuba Scanner Sekarang
            </a>
          </div>
        </div>


        {/* ═══ SCANNER CARDS ═══ */}
        <div id="scanners" className="scroll-mt-20 pb-16 md:pb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 glitch-text" data-text="⟩ Pilih Scanner">⟩ Pilih Scanner</h2>
            <p className="text-neutral-500 text-sm">3 scanner berbeza, setiap satu unik untuk keperluan anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {SCANNERS.map((scanner, i) => (
              <ScannerCard key={scanner.id} scanner={scanner} index={i} />
            ))}
          </div>
        </div>


        {/* ═══ STATS BAR ═══ */}
        <div className="mb-16 md:mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Providers" target={50} suffix="+" />
            <StatCard label="Scans Daily" target={10} suffix="K+" />
            <StatCard label="Uptime" target={99} suffix=".9%" />
            <StatCard label="Games" target={1000} suffix="+" />
          </div>
        </div>


        {/* ═══ CTA ═══ */}
        <div ref={ctaReveal.ref} className={`mb-16 md:mb-24 transition-all duration-700 ${ctaReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-[#111111]/80 backdrop-blur-sm border border-neutral-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#FF3333]/5 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="scan-line-slow" style={{ background: 'linear-gradient(180deg, transparent, rgba(255,51,51,0.03), transparent)' }}></div>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FF3333]/10 border border-[#FF3333]/20 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 glitch-text" data-text="Join Telegram">Join Telegram</h2>
              <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">Real-time alerts, new providers, dan update scanner terkini.</p>
              <a
                href="https://t.me/slotdatartp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF3333] text-white font-bold text-sm rounded-xl hover:bg-[#e60000] transition-all duration-200 shadow-lg shadow-[#FF3333]/20 hover:shadow-[#FF3333]/40 hover:-translate-y-0.5 magnetic-btn"
              >
                Open Telegram →
              </a>
            </div>
          </div>
        </div>


        {/* ═══ FOOTER ═══ */}
        <footer ref={footerReveal.ref} className={`border-t border-neutral-800 pt-8 pb-12 text-center transition-all duration-700 ${footerReveal.visible ? 'opacity-100' : 'opacity-0'}`}>
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
}

export default App;