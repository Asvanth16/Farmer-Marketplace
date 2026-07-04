import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from 'react-router-dom';



const Navbar = ({ cartCount = 0 }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // 🌟 Read authentication data directly inside the Navbar
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const isLoggedIn = !!token; // True if token exists

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-[#2e3a59] sticky top-0 w-full z-50 shadow-sm">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3 sm:py-5">

                    {/* Left: Brand Identity & Conditional Links */}
                    <div className="flex items-center gap-3 md:gap-8">
                        <Link to="/customer/marketplace" className="flex items-center">
                            <span className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent tracking-tight leading-tight">
                                AgriMarket
                            </span>
                        </Link>

                        {/* Nav Links - Conditional on Authentication */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                to="/customer/marketplace"
                                className={`text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-medium transition-colors ${isActive('/customer/marketplace') ? 'text-emerald-200' : 'text-slate-300 hover:text-emerald-600'
                                    }`}
                            >
                                Browse Crops
                            </Link>

                            {/* 🌟 Works correctly now on any page! */}
                            {isLoggedIn && (
                                <Link
                                    to="/customer/orders"
                                    className={`text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-medium transition-colors ${isActive('/customer/orders') ? 'text-emerald-200' : 'text-slate-300 hover:text-emerald-600'
                                        }`}
                                >
                                    My Orders
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions & User Metrics */}
                    <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">

                        {/* 🌟 Greeting badge reads from localStorage */}
                        {isLoggedIn && userName && (
                            <div className="bg-slate-900/40 border border-slate-700/60 px-3 py-2 lg:px-4 lg:py-3 xl:px-5 xl:py-3 rounded-xl hidden lg:block">
                                <span className="text-sm lg:text-xl xl:text-2xl text-slate-400 font-medium">👋 Hello, </span>
                                <span className="text-sm lg:text-xl xl:text-2xl text-emerald-400 font-black tracking-wide">{userName}</span>
                            </div>
                        )}

                        <button
                            aria-label="Toggle navigation menu"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-slate-300 hover:text-emerald-400"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        {/* Cart Widget */}
                        <Link
                            to="/customer/cart"
                            className="relative p-2 text-slate-300 hover:text-emerald-400 transition-colors flex items-center group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14 group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-2 lg:-right-3 bg-emerald-400 text-black text-[10px] sm:text-xs lg:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 flex items-center justify-center rounded-full animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="h-8 ml-2 w-px bg-slate-600"></div>

                        {/* 🌟 Authentic Alternating Auth CTA Engine */}
                        <div className="hidden md:block">
                            {isLoggedIn ? (
                                <button
                                    onClick={handleLogout}
                                    className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium text-slate-300 hover:text-red-600 transition-colors"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-700 bg-[#2e3a59] px-4 py-4 space-y-4">

                    <Link
                        to="/customer/marketplace"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-lg font-semibold text-slate-300 hover:text-emerald-400"
                    >
                        Browse Crops
                    </Link>

                    {isLoggedIn && (
                        <Link
                            to="/customer/orders"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-lg font-semibold text-slate-300 hover:text-emerald-400"
                        >
                            My Orders
                        </Link>
                    )}

                    {isLoggedIn && userName && (
                        <div className="pt-2 border-t border-slate-700">
                            <span className="text-slate-400">
                                Hello,
                            </span>{' '}
                            <span className="text-emerald-400 font-bold">
                                {userName}
                            </span>
                        </div>
                    )}

                    {isLoggedIn ? (
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                handleLogout();
                            }}
                            className="block text-lg font-semibold text-red-400 hover:text-red-300"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-lg font-bold text-emerald-400"
                        >
                            Login
                        </Link>
                    )}

                </div>
            )}
        </nav>
    );
};

export default Navbar;