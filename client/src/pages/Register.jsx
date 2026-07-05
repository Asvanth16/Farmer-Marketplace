import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Lock, Mail, User, ShieldCheck, Loader, UserCheck, MapPin, Sprout } from 'lucide-react';
import { Link } from "react-router-dom";

function Register() {
    const { register } = useContext(AuthContext); 
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer'); 
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [leaves, setLeaves] = useState([]);

    // Conditional Farmer states
    const [location, setLocation] = useState('');
    const [farmingMethod, setFarmingMethod] = useState('organic');

    useEffect(() => {
        const generatedLeaves = Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 8}s`,
            duration: `${12 + Math.random() * 16}s`,
            size: `${12 + Math.random() * 24}px`,
            opacity: 0.04 + Math.random() * 0.12,
            rotation: `${Math.random() * 360}deg`,
        }));
        setLeaves(generatedLeaves);
    }, []);

    const handleRoleChange = (newRole) => {
        setRole(newRole);

        if (newRole !== "farmer") {
            setLocation("");
            setFarmingMethod("organic");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const registrationPayload = {
                name,
                email,
                password,
                role,
                ...(role === 'farmer' && {
                    farmDetails: {
                        location,
                        farmingMethod
                    }
                })
            };

            await register(registrationPayload);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-gradient-to-r from-emerald-950 via-brand-800 to-emerald-300 m-0 p-0 box-border overflow-x-hidden overflow-y-auto antialiased select-none relative">

            {/* GLOBAL FALLING LEAVES LAYER */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {leaves.map((leaf) => (
                    <div
                        key={leaf.id}
                        className="absolute animate-fall"
                        style={{
                            left: leaf.left,
                            top: '-5%',
                            animationDelay: leaf.delay,
                            animationDuration: leaf.duration,
                            opacity: leaf.opacity,
                        }}
                    >
                        <Leaf
                            size={leaf.size}
                            fill="currentColor"
                            className="text-white"
                            style={{ transform: `rotate(${leaf.rotation})` }}
                        />
                    </div>
                ))}
            </div>

            {/* ================= LEFT SIDE (DESKTOP ONLY) ================= */}
            <div className="hidden lg:flex lg:w-1/2 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden shrink-0 bg-transparent z-10">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute -bottom-40 right-0 w-96 h-96 bg-emerald-800 rounded-full blur-3xl opacity-15"></div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                    <div className="animate-spin-slow p-8">
                        <Leaf className="w-80 h-80 text-brand-100 fill-brand-100/10 stroke-[0.5]" />
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
                        <Leaf className="h-6 w-6 text-brand-100 fill-brand-100/20" />
                    </div>
                    <span className="text-4xl font-black tracking-tight bg-clip-text bg-gradient-to-r from-white to-brand-100">
                        AgriMarket
                    </span>
                </div>

                {/* FIXED HEIGHT SYSTEM PREVENTS LAYOUT JUMPING */}
                <div className="relative z-10 my-auto flex flex-col justify-center min-h-[220px] space-y-4">
                    <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-md">
                        Grow Your Digital Agricultural Network Today.
                    </h1>
                    <p className="text-brand-100/80 text-lg max-w-lg leading-relaxed font-normal">
                        Join thousands of regional farmers and corporate buyers managing real-time inventory sourcing schedules seamlessly.
                    </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-brand-200/80 relative z-10 font-medium tracking-wide">
                    <ShieldCheck className="h-4 w-4 text-brand-300 animate-pulse" />
                    <span>Secure Enterprise Dashboard Environment • © 2026</span>
                </div>
            </div>

            {/* ================= RIGHT SIDE (FORM + MOBILE TOP BRANDING) ================= */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 md:p-10 lg:p-12 xl:p-16 shrink-0 relative bg-transparent z-10">
                
                {/* MOBILE & TABLET HEADER ONLY */}
                <div className="flex lg:hidden items-center gap-3 mb-6 text-white relative z-10 animate-fade-in">
                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
                        <Leaf className="h-6 w-6 text-brand-100 fill-brand-100/20" />
                    </div>
                    <span className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text bg-gradient-to-r from-white to-brand-100">
                        AgriMarket
                    </span>
                </div>

                {/* RESPONSIVE CONTROLLED FORM CONTAINER (Smaller caps for md & lg scales) */}
                <div className="w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-lg xl:max-w-xl bg-white border border-slate-100/80 p-5 sm:p-8 md:p-8 lg:p-10 xl:p-12 rounded-2xl shadow-2xl shadow-emerald-950/10 space-y-5 md:space-y-6 lg:space-y-8 relative z-10">

                    <div className="space-y-1.5 md:space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
                            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-brand-500 animate-pulse"></span>
                            Onboarding Registration
                        </span>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-earth-900 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">Set up your profile to start exploring listings.</p>
                    </div>

                    {error && (
                        <div className="p-3 sm:p-4 lg:p-5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs sm:text-sm md:text-base font-semibold rounded-r-xl shadow-xs animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 md:space-y-5 lg:space-y-6">
                        
                        {/* Full Name Field */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-xs sm:text-sm font-bold text-earth-800 tracking-wide block">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-xs sm:text-sm font-medium shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-xs sm:text-sm font-bold text-earth-800 tracking-wide block">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-xs sm:text-sm font-medium shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Account Role Selector */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-xs sm:text-sm font-bold text-earth-800 tracking-wide block">Select Portal Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange("farmer")}
                                    className={`py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide border transition-all flex items-center justify-center gap-2 cursor-pointer ${role === 'farmer'
                                        ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-md shadow-brand-500/5'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <Leaf className="h-4 w-4" />
                                    I am a Farmer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange("customer")}
                                    className={`py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide border transition-all flex items-center justify-center gap-2 cursor-pointer ${role === 'customer'
                                        ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-md shadow-brand-500/5'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <UserCheck className="h-4 w-4" />
                                    I am a Customer
                                </button>
                            </div>
                        </div>

                        {/* FARMER SPECIFIC INPUTS */}
                        {role === 'farmer' && (
                            <div className="space-y-3.5 sm:space-y-4 animate-fade-in">
                                {/* Farm Location Field */}
                                <div className="space-y-1 sm:space-y-1.5">
                                    <label className="text-xs sm:text-sm font-bold text-earth-800 tracking-wide block">Farm Location</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        <input
                                            type="text"
                                            required={role === 'farmer'}
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="City, State (e.g. Coimbatore, TN)"
                                            className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-xs sm:text-sm font-medium shadow-xs"
                                        />
                                    </div>
                                </div>

                                {/* Farming Method Dropdown Selection */}
                                <div className="space-y-1 sm:space-y-1.5">
                                    <label className="text-xs sm:text-sm font-bold text-earth-800 tracking-wide block">Farming Method</label>
                                    <div className="relative group">
                                        <Sprout className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none" />
                                        <select
                                            value={farmingMethod}
                                            onChange={(e) => setFarmingMethod(e.target.value)}
                                            className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-earth-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-xs sm:text-sm font-medium shadow-xs"
                                        >
                                            <option value="organic">Organic</option>
                                            <option value="conventional">Conventional</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Password Field */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-xs sm:text-sm font-bold text-earth-800 tracking-wide block">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="password"
                                    autoComplete='new-password'
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-xs sm:text-sm font-medium shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 pt-2 md:pt-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-600/20 transition-all focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 text-xs sm:text-sm cursor-pointer tracking-wide"
                            >
                                {isLoading ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Create Secure Profile'
                                )}
                            </button>

                            <div className="text-center text-[11px] sm:text-xs font-medium text-slate-500 tracking-wide">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all ml-0.5"
                                >
                                    Sign in here
                                </Link>
                            </div>
                        </div>

                    </form>
                </div>
            </div>

        </div>
    );
}

export default Register;