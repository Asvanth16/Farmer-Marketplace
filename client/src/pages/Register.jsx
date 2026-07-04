import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Lock, Mail, User, ShieldCheck, Loader, UserCheck, MapPin, Sprout } from 'lucide-react';
import { Link } from "react-router-dom";

function Register() {
    const { register } = useContext(AuthContext); // Assuming your AuthContext has a register function
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer'); // Default role setup updated to 'customer' to match your enum
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [leaves, setLeaves] = useState([]);

    // Conditional Farmer states
    const [location, setLocation] = useState('');
    const [farmingMethod, setFarmingMethod] = useState('organic'); // Default set to valid enum choice

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
            // 1. Package up all fields into a single, clean object
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

            // 2. Fire it over as a single structured object argument
            await register(registrationPayload);

            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-gradient-to-r from-emerald-950 via-brand-800 to-emerald-300 m-0 p-0 box-border overflow-hidden antialiased select-none relative">

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

            {/* ================= LEFT SIDE: HOVERS OVER UNIFIED BG ================= */}
            <div className="hidden lg:flex lg:w-1/2 text-white p-20 flex-col justify-between relative overflow-hidden shrink-0 bg-transparent z-10">

                <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute -bottom-40 right-0 w-96 h-96 bg-emerald-800 rounded-full blur-3xl opacity-15"></div>

                {/* MASTER ROTATING LEAF HERO */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                    <div className="animate-spin-slow p-8">
                        <Leaf className="w-120 h-120 text-brand-100 fill-brand-100/10 stroke-[0.5]" />
                    </div>
                </div>

                {/* Header App Branding */}
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
                        <Leaf className="h-10 w-10 text-brand-100 fill-brand-100/20" />
                    </div>
                    <span className="text-4xl font-black tracking-tight bg-clip-text bg-gradient-to-r from-white to-brand-100">
                        AgriMarket
                    </span>
                </div>

                {/* Middle Typography Statement */}
                <div className="relative z-10 space-y-6 my-auto">
                    <h1 className="text-6xl font-black leading-tight tracking-tight text-white drop-shadow-md">
                        Grow Your Digital Agricultural Network Today.
                    </h1>
                    <p className="text-brand-100/80 text-2xl max-w-xl leading-relaxed font-normal">
                        Join thousands of regional farmers and corporate buyers managing real-time inventory sourcing schedules seamlessly.
                    </p>
                </div>

                {/* Secure Bottom Footer Badge */}
                <div className="flex items-center gap-2 text-sm text-brand-200/80 relative z-10 font-medium tracking-wide">
                    <ShieldCheck className="h-5 w-5 text-brand-300 animate-pulse" />
                    <span>Secure Enterprise Dashboard Environment • © 2026</span>
                </div>
            </div>

            {/* ================= RIGHT SIDE: HIGH-IMPACT REGISTER CARD ================= */}
            {/* FIXED inline style added below: style={{ scrollbarGutter: 'stable' }} to lock layout shifting */}
            <div
                className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-12 shrink-0 relative bg-transparent z-10 overflow-y-auto max-h-screen py-12"
                style={{ scrollbarGutter: 'stable' }}
            >

                <div className="w-full max-w-3xl xl:max-w-4xl bg-white border border-slate-100/80 p-6 sm:p-8 md:p-12 lg:p-14 rounded-3xl shadow-2xl shadow-emerald-950/10 space-y-8 md:space-y-12 relative z-10 my-auto">

                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-bold bg-brand-50 text-brand-700 border border-brand-100 shadow-xs">
                            <span className="h-3 w-3 rounded-full bg-brand-500 animate-pulse"></span>
                            Onboarding Registration
                        </span>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-earth-900 tracking-tight leading-none">Create Account</h2>
                        <p className="text-slate-500 text-sm sm:text-md md:text-xl lg:text-2xl font-medium tracking-wide">Set up your profile to start exploring listings.</p>
                    </div>

                    {error && (
                        <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm sm:text-base md:text-lg lg:text-xl font-semibold rounded-r-xl shadow-xs animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Full Name Field */}
                        <div className="space-y-4">
                            <label className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-earth-800 tracking-wide block">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-14 sm:pl-16 lg:pl-18 pr-4 py-4 sm:py-5 lg:py-6 bg-white border-2 border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-4">
                            <label className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-earth-800 tracking-wide block">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-14 sm:pl-16 lg:pl-18 pr-4 py-4 sm:py-5 lg:py-6 bg-white border-2 border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Account Role Segment Selection Selector */}
                        <div className="space-y-4">
                            <label className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-earth-800 tracking-wide block">Select Portal Role</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange("farmer")}
                                    className={`py-3 sm:py-4 lg:py-5 px-4 sm:px-6 rounded-xl text-sm sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide border-2 transition-all flex items-center justify-center gap-3 cursor-pointer ${role === 'farmer'
                                        ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-md shadow-brand-500/5'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <Leaf className="h-6 w-6" />
                                    I am a Farmer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange("customer")}
                                    className={`py-3 sm:py-4 lg:py-5 px-4 sm:px-6 rounded-xl text-sm sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide border-2 transition-all flex items-center justify-center gap-3 cursor-pointer ${role === 'customer'
                                        ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-md shadow-brand-500/5'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <UserCheck className="h-6 w-6" />
                                    I am a Customer
                                </button>
                            </div>
                        </div>

                        {/* FARMER SPECIFIC CONFIGURATION INPUTS */}
                        {role === 'farmer' && (
                            <>
                                {/* Farm Location Field */}
                                <div className="space-y-4 transition-all duration-300">
                                    <label className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-earth-800 tracking-wide block">Farm Location</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        <input
                                            type="text"
                                            required={role === 'farmer'}
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="City, State (e.g. Coimbatore, TN)"
                                            className="w-full pl-14 sm:pl-16 lg:pl-18 pr-4 py-4 sm:py-5 lg:py-6 bg-white border-2 border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold shadow-xs"
                                        />
                                    </div>
                                </div>

                                {/* Farming Method Enum Dropdown Selection */}
                                <div className="space-y-4 transition-all duration-300">
                                    <label className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-earth-800 tracking-wide block">Farming Method</label>
                                    <div className="relative group">
                                        <Sprout className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none" />
                                        <select
                                            value={farmingMethod}
                                            onChange={(e) => setFarmingMethod(e.target.value)}
                                            className="w-full pl-14 sm:pl-16 lg:pl-18 pr-4 py-4 sm:py-5 lg:py-6 bg-white border-2 border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold shadow-xs"
                                        >
                                            <option value="organic">Organic</option>
                                            <option value="conventional">Conventional</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Password Field */}
                        <div className="space-y-4">
                            <label className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-earth-800 tracking-wide block">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="password"
                                    autoComplete='new-password'
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-14 sm:pl-16 lg:pl-18 pr-4 py-4 sm:py-5 lg:py-6 bg-white border-2 border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Register Submit Action Action Button & Redirection Link */}
                        <div className="space-y-6 pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-4 py-4 sm:py-5 lg:py-6 px-10 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-black rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-600/20 transition-all focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 text-lg sm:text-xl md:text-2xl lg:text-3xl cursor-pointer tracking-wider"
                            >
                                {isLoading ? (
                                    <Loader className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 animate-spin" />
                                ) : (
                                    'Create Secure Profile'
                                )}
                            </button>

                            <div className="text-center text-base sm:text-lg md:text-2xl lg:text-2xl font-medium text-slate-500 tracking-wide">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-black text-brand-600 hover:text-brand-700 hover:underline transition-all ml-1"
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