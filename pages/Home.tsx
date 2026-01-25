import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from '../components/Terminal';
import { ResultCard } from '../components/ResultCard';
import { LogEntry, GameResult } from '../types';
import { Wifi, Activity, Play, Filter, ChevronDown, X, Search, Check, Zap, Lock, BatteryLow, BatteryCharging, Clock, Share2 } from 'lucide-react';
import { PROVIDERS_LIST, PROVIDER_GAMES, DEFAULT_GAMES } from '../constants';
import gsap from 'gsap';

const RESTRICTED_PROVIDERS = ["Mega888", "918Kiss", "Pussy888"];

export const Home: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [availableGames, setAvailableGames] = useState<string[]>(DEFAULT_GAMES);
  const [isMaintenance, setIsMaintenance] = useState(false);
  // Removed Lite Mode state


  // Restricted Provider State
  const [userInputId, setUserInputId] = useState("");
  const [inputError, setInputError] = useState(false);

  // GSAP Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scanButtonGlowRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const providerButtonRef = useRef<HTMLButtonElement>(null);

  const isRestricted = RESTRICTED_PROVIDERS.includes(selectedProvider);

  // Initial Page Load Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-element", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Fetch Games List on Provider Change
  useEffect(() => {
    const fetchGameList = async () => {
      setIsMaintenance(false);
      if (!selectedProvider) {
        setAvailableGames(DEFAULT_GAMES);
        return;
      }

      // 1. Check if hardcoded overrides exist in constants
      if (PROVIDER_GAMES[selectedProvider] && PROVIDER_GAMES[selectedProvider].length > 0) {
        setAvailableGames(PROVIDER_GAMES[selectedProvider]);
        return;
      }

      // 2. Try to fetch games.txt from public folder
      try {
        const response = await fetch(`/providers/${encodeURIComponent(selectedProvider)}/games.txt?t=${Date.now()}`); // Cache buster
        if (response.ok) {
          const text = await response.text();

          // CRITICAL FIX: Check if response is HTML (Vite fallback)
          if (text.trim().startsWith("<")) {
            console.warn(`games.txt for ${selectedProvider} returned HTML (likely 404 fallback). Using defaults.`);
            setAvailableGames(DEFAULT_GAMES);
            return;
          }

          // Split by newline, trim whitespace, and remove empty lines
          const games = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

          if (games.length > 0) {
            setAvailableGames(games);
            console.log(`Loaded ${games.length} games for ${selectedProvider}`);
          } else {
            console.warn(`games.txt found for ${selectedProvider} but was empty`);
            setIsMaintenance(true);
            setAvailableGames([]);
          }
        } else {
          // File not found -> Maintenance
          console.warn(`games.txt not found for ${selectedProvider}`);
          setIsMaintenance(true);
          setAvailableGames([]);
        }
      } catch (error) {
        console.error("Error loading game list:", error);
        setIsMaintenance(true);
        setAvailableGames([]);
      }
    };

    fetchGameList();

    // Reset ID input when provider changes
    setUserInputId("");
    setInputError(false);
  }, [selectedProvider]);



  // Force Video Autoplay
  useEffect(() => {
    if (videoRef.current) {
      // Browser policies often block autoplay unless specifically muted via property
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Video autoplay prevented by browser policy:", error);
        });
      }
    }
  }, []);

  // Button Pulse Animation
  useEffect(() => {
    if (!scanButtonGlowRef.current) return;

    // Create a pulse effect
    const pulseTween = gsap.to(scanButtonGlowRef.current, {
      opacity: 0.8,
      scale: 1.1,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    if (isScanning) {
      pulseTween.timeScale(3); // Speed up when scanning
    } else {
      pulseTween.timeScale(1);
    }

    return () => {
      pulseTween.kill();
    };
  }, [isScanning]);

  // Results Stagger Animation
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      gsap.fromTo(
        ".result-row",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: {
            amount: 1.0,
            grid: "auto",
            from: "start"
          },
          ease: "power2.out",
          clearProps: "all"
        }
      );
    }
  }, [results]);

  const startScan = () => {
    // If no provider selected, prompt user
    if (!selectedProvider) {
      setShowProviderModal(true);
      // Shake animation on provider button if possible
      if (providerButtonRef.current) {
        gsap.fromTo(providerButtonRef.current,
          { x: -5 },
          { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" }
        );
      }
      return;
    }

    if (isMaintenance) {
      if (buttonRef.current) {
        gsap.fromTo(buttonRef.current,
          { x: -5 },
          { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" }
        );
      }
      return;
    }

    if (isScanning) return;

    // Check ID requirement
    if (isRestricted && !userInputId.trim()) {
      setInputError(true);
      if (inputRef.current) {
        inputRef.current.focus();
        gsap.fromTo(inputRef.current.parentElement,
          { x: -5 },
          { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" }
        );
      }
      return;
    }

    setIsScanning(true);
    setLogs([]);
    setResults([]);
    setProgress(0);
    setInputError(false);

    // Animate terminal entry
    gsap.fromTo(".terminal-container",
      { height: "auto", opacity: 0.8 },
      { opacity: 1, duration: 0.5 }
    );

    let step = 0;
    const maxSteps = 20;
    const intervalMs = 300;

    const interval = setInterval(() => {
      step++;
      const progressValue = Math.min((step / maxSteps) * 100, 100);
      setProgress(progressValue);

      // Custom message for ID verification
      let msg = "";
      if (isRestricted && step === 2) {
        msg = `Verifying User ID: ${userInputId.substring(0, 3)}****...`;
      } else if (isRestricted && step === 3) {
        msg = `Access granted for ID: ${userInputId}`;
      } else if (step === 1) {
        msg = `Initializing scan for ${selectedProvider}...`;
      } else if (step === 2) {
        msg = `Database loaded: ${availableGames.length} titles found.`; // Debug confirmation
      } else if (step === maxSteps) {
        msg = "Scan complete. Data successfully retrieved.";
      } else {
        // Show tech jargon mixed with game names
        // Chance increased to 80%
        const useGameName = availableGames.length > 0 && Math.random() > 0.2;

        if (useGameName) {
          const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
          const actions = ["Analysing", "Checking RTP for", "Downloading config:", "Verifying signal:", "Ping pong response:"];
          const action = actions[Math.floor(Math.random() * actions.length)];
          msg = `${action} ${randomGame}...`;
        } else {
          msg = getRandomLogMessage();
        }
      }

      const newLog: LogEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: msg,
        type: step === maxSteps ? 'success' : (isRestricted && step === 3 ? 'success' : 'info')
      };

      setLogs(prev => [...prev, newLog]);

      if (step >= maxSteps) {
        clearInterval(interval);
        finishScan();
      }
    }, intervalMs);
  };

  const finishScan = () => {
    setIsScanning(false);
    generateResults();
  };

  const generateResults = () => {
    // Determine which pool to use (default or dynamic)
    const gamePool = availableGames.length > 0 ? availableGames : DEFAULT_GAMES;

    const newResults: GameResult[] = gamePool.map((gameName, i) => {
      // User requested range: 10% to 97%
      const minRtp = 10;
      const maxRtp = 97;
      const finalRtp = Math.random() * (maxRtp - minRtp) + minRtp;

      return {
        id: `game-${i}-${Date.now()}`,
        name: gameName,
        rtp: Number(finalRtp.toFixed(2)),
        provider: selectedProvider,
        volatility: (finalRtp > 90 ? 'High' : 'Med') as 'High' | 'Med', // Adjusted threshold slightly for the new range
        lastWin: `${Math.floor(Math.random() * 20)}m ago` // constant recent wins
      };
    }).sort((a, b) => b.rtp - a.rtp);

    setResults(newResults);
  };

  const getRandomLogMessage = (): string => {
    const messages = [
      "Initializing connection to remote server...",
      "Bypassing firewall security protocols...",
      "Analysing server packet responses...",
      "Detecting algorithmic patterns...",
      "Synchronizing with provider database...",
      "Decrypting RTP stream data...",
      "Filtering noise signals...",
      "Validating checksums...",
      "Optimizing result predictions...",
      "Finalizing data aggregation..."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleShare = async () => {
    if (results.length === 0) return;

    // Get top 5 high RTP games or just top 5 results
    const topGames = results.slice(0, 5);
    const dateStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    let shareText = `🎰 *SLOT RTP SCANNER RESULT* 🎰\n\n`;
    shareText += `📅 ${dateStr}\n`;
    shareText += `🏢 Provider: *${selectedProvider}*\n\n`;
    shareText += `🔥 *TOP HIGH RTP SIGNALS:*\n`;

    topGames.forEach((g, i) => {
      shareText += `${i + 1}. ${g.name} - *${g.rtp}%*\n`;
    });

    shareText += `\n🚀 Good Luck & Have Fun!\n\n`;
    shareText += `🔒 Copyright © www.slotdatartp.com`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Slot RTP Scan Result',
          text: shareText,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Result copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const filteredProviders = PROVIDERS_LIST.filter(p =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative min-h-screen pb-24 pt-20 md:pt-24">

      {/* Background Video Layer */}
      <div className="absolute top-0 inset-x-0 h-[650px] overflow-hidden -z-10">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-server-room-with-blue-lights-1994-large.mp4" type="video/mp4" />
        </video>
        {/* Gradients to fade video into the white background at the bottom and lighten it up */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-slate-50"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="px-4 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="hero-element inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-green-200 text-green-700 text-xs font-semibold mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SYSTEM ONLINE
          </div>



          {/* Cinematic Video Text */}
          {/* Cinematic Video Banner */}
          <div className="hero-element relative w-full overflow-hidden rounded-2xl shadow-2xl mb-8 border border-white/20">
            <div className="absolute inset-0 z-0">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/background_loop.mp4" type="video/mp4" />
              </video>
              {/* Dark Overlay for Readability */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
            </div>

            <div className="relative z-10 py-12 px-6">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg select-none">
                AI Signal Scanner
              </h1>
              <p className="text-white/90 text-lg mt-2 font-medium drop-shadow-md">
                Advanced algorithm analysis for real-time probability detection.
              </p>
            </div>
          </div>

          {/* Provider Selector Button */}
          <div className="hero-element max-w-xs mx-auto mb-6 relative z-20">
            <div className="flex items-center justify-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Filter size={12} /> Target Provider
            </div>
            <button
              ref={providerButtonRef}
              onClick={() => !isScanning && setShowProviderModal(true)}
              disabled={isScanning}
              className={`w-full flex items-center justify-between gap-4 backdrop-blur-md border font-bold py-3 px-5 rounded-2xl shadow-lg transition-all duration-200 group
                ${isScanning
                  ? 'opacity-60 cursor-not-allowed border-slate-200 bg-white/90 text-slate-700'
                  : !selectedProvider
                    ? 'bg-gradient-to-r from-primary-50 to-white border-primary-300 text-primary-700 shadow-primary-200/50 hover:shadow-xl hover:scale-[1.02]'
                    : 'bg-white/90 border-slate-200 text-slate-700 shadow-slate-200/50 hover:bg-white hover:border-primary-300 hover:shadow-xl'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors overflow-hidden
                   ${selectedProvider
                    ? 'bg-white border border-slate-100 shadow-sm'
                    : 'bg-primary-100 text-primary-600'
                  }
                 `}>
                  {selectedProvider ? (
                    <>
                      <img
                        key={selectedProvider}
                        src={`/providers/${selectedProvider}/logo.png`}
                        alt={selectedProvider}
                        className="w-full h-full object-contain p-0.5"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const src = target.src;
                          if (src.endsWith('logo.png')) {
                            target.src = `/providers/${selectedProvider}/logo.webp`;
                          } else if (src.endsWith('logo.webp')) {
                            target.src = `/providers/${selectedProvider}/logo.jpg`;
                          } else {
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }
                        }}
                      />
                      <span className="hidden absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-tr from-primary-600 to-primary-400 text-white">
                        {selectedProvider.charAt(0)}
                      </span>
                    </>
                  ) : <Zap size={14} fill="currentColor" />}
                </div>
                <span className="truncate max-w-[150px]">
                  {selectedProvider || "Select Provider"}
                </span>
              </div>
              <ChevronDown size={18} className={`transition-colors ${!selectedProvider ? 'text-primary-400' : 'text-slate-400'} group-hover:text-primary-500`} />
            </button>
            {!selectedProvider && !isScanning && (
              <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-red-500 animate-pulse border-2 border-white"></div>
            )}
          </div>

          {/* User ID Input for Restricted Providers */}
          {isRestricted && (
            <div className="hero-element max-w-xs mx-auto mb-8 animate-in fade-in zoom-in-95 duration-300">
              <div className={`bg-white/90 backdrop-blur-md rounded-2xl p-1 border-2 transition-all duration-300 ${inputError ? 'border-red-400 shadow-lg shadow-red-100 ring-2 ring-red-100' : 'border-primary-100 shadow-md shadow-primary-50'}`}>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-primary-400 pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInputId}
                    onChange={(e) => {
                      setUserInputId(e.target.value);
                      setInputError(false);
                    }}
                    placeholder={`Enter ${selectedProvider} ID`}
                    disabled={isScanning}
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium focus:outline-none text-center"
                  />
                </div>
              </div>
              {inputError && (
                <p className="text-red-500 text-xs font-bold mt-2 animate-pulse">
                  ⚠ User ID is required
                </p>
              )}
            </div>
          )}

          {/* Start Scan Button */}
          <div className={`hero-element relative inline-block group w-full max-w-xs sm:w-auto mb-4 ${isRestricted ? 'mt-0' : 'mt-8'}`}>
            {/* Multi-layer Pulse Effect */}
            {!isMaintenance && (
              <>
                <div className="absolute -inset-1 bg-primary-500/30 rounded-full animate-ping opacity-75 duration-1000"></div>
                <div className="absolute -inset-2 bg-indigo-500/20 rounded-full animate-pulse duration-2000"></div>
              </>
            )}

            {/* GSAP Controlled Glow */}
            {!isMaintenance && (
              <div
                ref={scanButtonGlowRef}
                className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full blur opacity-50"
              ></div>
            )}

            <button
              ref={buttonRef}
              onClick={startScan}
              disabled={isScanning || isMaintenance}
              className={`
                relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-lg shadow-2xl overflow-hidden transition-all duration-300 transform 
                ${isMaintenance
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300 shadow-none'
                  : isScanning
                    ? 'cursor-not-allowed bg-slate-800 text-white'
                    : 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-primary-500/40 border border-white/20 hover:scale-105 active:scale-95'
                }
              `}
            >
              {/* Shine Effect Layer */}
              {!isScanning && !isMaintenance && (
                <div
                  className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-20 shine-effect"
                  style={{ animation: 'shine-sweep 3s infinite ease-in-out' }}
                ></div>
              )}

              {isScanning && (
                <>
                  <div className="absolute inset-0 bg-slate-800"></div>
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </>
              )}

              <div className="relative z-30 flex items-center gap-2 drop-shadow-md">
                {isScanning ? (
                  <>
                    <Activity className="animate-spin" />
                    <span className="tracking-wide">SCANNING... {Math.round(progress)}%</span>
                  </>
                ) : isMaintenance ? (
                  <>
                    <Lock size={18} /> SYSTEM MAINTENANCE
                  </>
                ) : (
                  <>
                    <Play fill="currentColor" className="animate-pulse" /> START NEW SCAN
                  </>
                )}
              </div>
            </button>
            <style>{`
              @keyframes shine-sweep {
                0% { transform: translateX(-150%) skewX(-12deg); }
                20% { transform: translateX(150%) skewX(-12deg); }
                100% { transform: translateX(150%) skewX(-12deg); }
              }
            `}</style>
          </div>
        </div>

        {/* Terminal Section */}
        <div className="terminal-container">
          <Terminal logs={logs} isActive={isScanning} />
        </div>

        {/* Results Grid */}
        {results.length > 0 && (
          <div ref={resultsRef} className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Wifi className="text-primary-500" /> Detected Signals ({results.length})
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded hidden sm:inline-block">ID: {Date.now().toString().slice(-6)}</span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>

            <div className="flex flex-col rounded-xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl relative">
              {/* Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

              {results.map((game, i) => (
                <div
                  key={game.id}
                  className={`result-row relative flex items-center justify-between p-4 group transition-all duration-300 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.01] border-b border-white/5 last:border-b-0 overflow-hidden`}
                >
                  {/* Hover Highlight Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  {/* Left: Game Info */}
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="relative">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full font-black text-sm border shadow-lg ${i < 3
                        ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-white border-yellow-200'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700'
                        }`}>
                        {i + 1}
                      </span>
                      {i < 3 && <div className="absolute -inset-1 bg-yellow-400/30 blur-md rounded-full animate-pulse"></div>}
                    </div>

                    {/* Game Thumbnail */}
                    <div className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-primary-500/30 transition-shadow ${game.rtp >= 96 ? 'border-green-400/50' : 'border-slate-600/30'
                      }`}>
                      <img
                        src={`/providers/${encodeURIComponent(game.provider)}/${encodeURIComponent(game.name)}.png`}
                        alt={game.name}
                        className="w-full h-full object-contain p-1 bg-slate-900/80 backdrop-blur"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-500">
                        <Zap size={24} />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors text-lg drop-shadow-sm">{game.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-600 bg-white/60 px-2 py-0.5 rounded-full border border-white/40 shadow-sm backdrop-blur-sm">{game.provider}</span>
                        {game.volatility === 'High' && (
                          <span className="text-[10px] text-white font-bold flex items-center gap-1 bg-red-500/80 px-2 py-0.5 rounded-full shadow-red-500/30 shadow-sm animate-pulse">
                            <i className="w-1.5 h-1.5 rounded-full bg-white"></i> HIGH VOL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div className="text-right flex items-center gap-8 relative z-10">
                    <div className="hidden sm:block text-xs text-slate-500 font-medium text-right">
                      <div className="flex items-center gap-1 justify-end opacity-70"><Clock size={12} /> Last Win</div>
                      <div className="bg-white/40 px-2 py-0.5 rounded-md backdrop-blur-sm">{game.lastWin}</div>
                    </div>

                    <div className="w-24 text-right">
                      <span className={`text-2xl font-black tracking-tighter block drop-shadow-sm ${game.rtp >= 96
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500'
                        : 'text-amber-600'
                        }`}>
                        {game.rtp}%
                      </span>
                    </div>

                    <div className="hidden sm:block">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 ${game.rtp >= 96
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-400 shadow-green-500/30'
                        : 'bg-white text-amber-500 border-amber-200'
                        }`}>
                        {game.rtp >= 96 ? <BatteryCharging size={20} className="animate-bounce" /> : <Activity size={20} />}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provider Selection Modal */}
        {showProviderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowProviderModal(false)}></div>

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <h3 className="text-lg font-bold text-slate-800">Select Provider</h3>
                <button onClick={() => setShowProviderModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                </div>
              </div>

              <div className="p-6 overflow-y-auto bg-slate-50/50">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {/* Removed ALL Button */}

                  {filteredProviders.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedProvider(p);
                        setShowProviderModal(false);
                      }}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group overflow-hidden ${selectedProvider === p
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200 ring-2 ring-primary-100 ring-offset-1'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                    >
                      {/* Shine Effect on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] transition-transform duration-1000 group-hover:translate-x-[150%] z-0"></div>

                      <div className={`relative z-10 w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold overflow-hidden border transition-transform duration-300 group-hover:scale-110 ${selectedProvider === p ? 'bg-white/20 text-white border-transparent' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {/* Image Logo with Fallback */}
                        <img
                          src={`/providers/${p}/logo.png`}
                          alt={p}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const src = target.src;
                            // Chain of extensions: png -> webp -> jpg -> fallback
                            if (src.endsWith('logo.png')) {
                              target.src = `/providers/${p}/logo.webp`;
                            } else if (src.endsWith('logo.webp')) {
                              target.src = `/providers/${p}/logo.jpg`;
                            } else {
                              // Fallback to text if all image formats fail
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }
                          }}
                        />
                        {/* Text Fallback (Hidden by default, shown if image fails) */}
                        <span className="hidden w-full h-full flex items-center justify-center absolute inset-0">
                          {p.charAt(0)}
                        </span>
                      </div>
                      <span className="relative z-10 text-xs font-bold truncate text-left">{p}</span>
                      {selectedProvider === p && <Check size={14} className="absolute top-2 right-2 text-white z-10" />}
                    </button>
                  ))}
                </div>

                {filteredProviders.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    No providers found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};