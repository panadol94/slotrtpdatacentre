import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            // Save Token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Store basic user info

            // Redirect
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-slate-800 p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white mb-3 shadow-lg shadow-primary-500/30">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <h2 className="text-white font-bold text-xl">Member Login</h2>
                    <p className="text-slate-400 text-xs mt-1">Access Premium RTP Data</p>
                </div>

                <div className="p-8 space-y-5">
                    {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100 text-center">{error}</div>}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                placeholder="Enter username"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                        {isLoading ? 'Verifying...' : 'LOGIN ACCESS'}
                    </button>

                    <div className="text-center">
                        <span className="text-xs text-slate-400 font-medium">Bukan ahli? </span>
                        <span onClick={() => navigate('/register')} className="text-xs text-primary-600 font-bold cursor-pointer hover:underline">Daftar Percuma</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
