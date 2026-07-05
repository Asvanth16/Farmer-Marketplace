import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Lock, Mail, Loader, ShieldCheck } from 'lucide-react';
import { Link } from "react-router-dom";


function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);

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

  useEffect(() => {
    if (location.state) {
      setEmail(location.state.email || "");
      setPassword(location.state.password || "");
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Execute login through your AuthContext
      const data = await login(email, password);
      // 🌟 2. SAVE THE USERNAME METRIC TO LOCAL STORAGE
      if (data?.user?.name) {
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('role', data.user.role);
      } else if (data?.name) {
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userId', data._id);
        localStorage.setItem('role', data.role);
      }

      const demoEmails = [
        "customer@demo.com",
        "farmer@demo.com",
        "admin@demo.com"
      ];

      localStorage.setItem(
        "isDemo",
        demoEmails.includes(email)
      );

      // 3. Route dynamically based on user role 
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/customer/marketplace');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
      setPassword("");
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
          <span className="text-2xl font-black tracking-tight bg-clip-text bg-gradient-to-r from-white to-brand-100">
            AgriMarket
          </span>
        </div>

        <div className="relative z-10 space-y-4 my-auto">
          <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-md">
            Connecting Local Farmers Directly to Your Market.
          </h1>
          <p className="text-brand-100/80 text-lg max-w-lg leading-relaxed font-normal">
            Log in to manage your inventory, monitor live crop pricing schedules, and manage fresh regional listings effortlessly.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-200/80 relative z-10 font-medium tracking-wide">
          <ShieldCheck className="h-4 w-4 text-brand-300 animate-pulse" />
          <span>Secure Enterprise Dashboard Environment • © 2026</span>
        </div>
      </div>

      {/* ================= RIGHT SIDE (FORM + MOBILE TOP BRANDING) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10 md:p-12 lg:p-14 xl:p-16 shrink-0 relative bg-transparent z-10">
        
        {/* MOBILE & TABLET HEADER ONLY */}
        <div className="flex lg:hidden items-center gap-3 mb-8 text-white relative z-10 animate-fade-in">
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
            <Leaf className="h-6 w-6 text-brand-100 fill-brand-100/20" />
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight bg-clip-text bg-gradient-to-r from-white to-brand-100">
            AgriMarket
          </span>
        </div>

        {/* RESPONSIVE CONTROLLED FORM CONTAINER */}
        <div className="w-full max-w-md sm:max-w-base lg:max-w-xl xl:max-w-2xl bg-white border border-slate-100/80 p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 rounded-2xl shadow-2xl shadow-emerald-950/10 space-y-6 md:space-y-8 lg:space-y-10 relative z-10">

          <div className="space-y-2 md:space-y-3 lg:space-y-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-bold bg-brand-50 text-brand-700 border border-brand-100">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-brand-500 animate-pulse"></span>
              Portal Authorization
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-earth-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-xs sm:text-sm md:text-base font-medium">Enter your credentials to access your workspace.</p>
          </div>

          {location.state?.email && (
            <div className="p-3 sm:p-4 lg:p-5 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-emerald-700 font-bold text-xs sm:text-sm md:text-base">
                🟢 Demo Mode
              </p>
              <p className="text-emerald-600 text-[11px] sm:text-xs md:text-sm mt-0.5 leading-relaxed">
                Demo credentials have been filled automatically. Just click <strong>Sign In</strong>.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 sm:p-4 lg:p-5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs sm:text-sm md:text-base font-semibold rounded-r-xl shadow-xs animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
            <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
              <label className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-earth-800 tracking-wide block">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 sm:pl-11 md:pl-12 pr-4 py-2 sm:py-2.5 md:py-3 lg:py-3.5 bg-white border border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-xs sm:text-sm md:text-base lg:text-lg font-medium shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-earth-800 tracking-wide block">Password</label>
                <button type="button" className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors" disabled>
                  Forgot password? <span className="text-slate-400 font-normal hidden sm:inline">(Coming Soon)</span>
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 sm:pl-11 md:pl-12 pr-4 py-2 sm:py-2.5 md:py-3 lg:py-3.5 bg-white border border-slate-200 rounded-xl text-earth-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-xs sm:text-sm md:text-base lg:text-lg font-medium shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2 md:pt-4 lg:pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 md:py-3 lg:py-3.5 px-4 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-600/20 transition-all focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 text-xs sm:text-sm md:text-base lg:text-lg cursor-pointer tracking-wide"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  'Sign In to Account'
                )}
              </button>

              <div className="text-center text-[11px] sm:text-xs md:text-sm lg:text-base font-medium text-slate-500 tracking-wide">
                New to AgriMarket?{' '}
                <Link
                  to="/register"
                  className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all ml-0.5"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;