import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Zap, MessageCircle, Send } from 'lucide-react';
import gsap from 'gsap';

export const Register: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [method, setMethod] = useState<'whatsapp' | 'telegram' | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        code: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Animation hook
    React.useEffect(() => {
        gsap.from(".anim-entry", { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 });
    }, [step]);

    const handleRegister = async () => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Registration failed');

            alert('Registration Successful! Please Login.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-primary-600 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <Zap size={48} className="text-white relative z-10" />
                    <h1 className="text-3xl font-bold text-white ml-2 relative z-10">Register</h1>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 text-center anim-entry">Verifikasi Akaun</h2>
                            <p className="text-slate-500 text-center text-sm anim-entry">Pilih platform untuk dapatkan kod pengesahan (Percuma):</p>

                            <div className="grid gap-4 anim-entry">
                                <button
                                    onClick={() => {
                                        setMethod('whatsapp');
                                        window.open('https://wa.me/60135326433?text=Register', '_blank');
                                        setStep(2);
                                    }}
                                    className="flex items-center gap-4 p-4 border rounded-xl hover:bg-green-50 hover:border-green-500 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <MessageCircle />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-800 group-hover:text-green-700">WhatsApp</div>
                                        <div className="text-xs text-slate-400">Dapat kod dalam 5-10 saat</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setMethod('telegram');
                                        window.open('https://t.me/rptslotdatabot?start=Register', '_blank'); // TODO: Update Bot User
                                        setStep(2);
                                    }}
                                    className="flex items-center gap-4 p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                        <Send />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-800 group-hover:text-blue-700">Telegram</div>
                                        <div className="text-xs text-slate-400">Bot automatik (Pantas)</div>
                                    </div>
                                </button>
                            </div>

                            <div className="text-center pt-4 border-t border-slate-100 anim-entry">
                                <span className="text-xs font-bold text-slate-400 cursor-pointer hover:text-primary-600" onClick={() => setStep(2)}>
                                    Saya sudah ada kod &gt;
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {error && <div className="p-3 bg-red-100 text-red-600 text-xs font-bold rounded-lg text-center animate-pulse">{error}</div>}

                            <div className="anim-entry">
                                <label className="text-xs font-bold text-slate-500">Username</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="nama_samaran"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>

                            <div className="anim-entry">
                                <label className="text-xs font-bold text-slate-500">Password</label>
                                <input
                                    type="password"
                                    className="w-full p-3 border rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div className="anim-entry">
                                <label className="text-xs font-bold text-slate-500 flex justify-between">
                                    Kod Pengesahan
                                    <span className="text-primary-500 cursor-pointer" onClick={() => setStep(1)}>Belum dapat?</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-lg font-mono text-center tracking-widest text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="123456"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={isLoading}
                                className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700 transition-transform active:scale-95 mt-4 anim-entry"
                            >
                                {isLoading ? 'Processing...' : 'Selesai & Login'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
