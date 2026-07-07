import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Sprout } from 'lucide-react'; 

const Navbar = ({ cartCount = 0 }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('role')?.toLowerCase(); // Read user role
    const isLoggedIn = !!token;

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
                <div className="flex justify-between items-center py-2.5 sm:py-3.5">

                    {/* Left: Brand Identity & Conditional Links */}
                    <div className="flex items-center gap-3 md:gap-6">
                        <Link to="/customer/marketplace" className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center">
                                <Sprout className="h-5 w-5 text-emerald-400" />
                            </div>
                            <span className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent tracking-tight leading-tight">
                                AgriMarket
                            </span>
                        </Link>

                        {/* Nav Links - Conditional on Authentication */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                to="/customer/marketplace"
                                className={`text-xs sm:text-sm font-bold transition-colors ${isActive('/customer/marketplace') ? 'text-emerald-200' : 'text-slate-300 hover:text-emerald-500'
                                    }`}
                            >
                                Browse Crops
                            </Link>

                            {/* Hide 'My Orders' if user is an Admin */}
                            {isLoggedIn && userRole !== "admin" && (
                                <Link
                                    to="/customer/orders"
                                    className={`text-xs sm:text-sm font-bold transition-colors ${isActive('/customer/orders') ? 'text-emerald-200' : 'text-slate-300 hover:text-emerald-500'
                                        }`}
                                >
                                    My Orders
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions & User Metrics */}
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">

                        {/* Greeting badge reads from localStorage */}
                        {isLoggedIn && userName && (
                            <div className="bg-slate-900/40 border border-slate-700/60 px-2.5 py-1.5 rounded-xl hidden lg:block">
                                <span className="text-xs text-slate-400 font-medium">Hello, </span>
                                <span className="text-xs text-emerald-400 font-black tracking-wide">{userName}</span>
                            </div>
                        )}

                        <button
                            aria-label="Toggle navigation menu"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-slate-300 hover:text-emerald-400 border-0 bg-transparent cursor-pointer"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
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

                        {/* Cart Widget - Hidden completely if user is an Admin */}
                        {userRole !== "admin" && (
                            <Link
                                to="/customer/cart"
                                className="relative p-1.5 text-slate-300 hover:text-emerald-400 transition-colors flex items-center group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1.5 bg-emerald-400 text-black text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        <div className="h-6 ml-1 w-px bg-slate-600"></div>

                        {/* Authentic Alternating Auth CTA Engine */}
                        <div className="hidden md:block">
                            {isLoggedIn ? (
                                <button
                                    onClick={handleLogout}
                                    className="text-xs font-bold text-slate-300 hover:text-red-400 transition-colors border-0 bg-transparent cursor-pointer"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-700 bg-[#2e3a59] px-4 py-3 space-y-3 text-xs font-bold">

                    <Link
                        to="/customer/marketplace"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-slate-300 hover:text-emerald-400"
                    >
                        Browse Crops
                    </Link>

                    {/* Mobile Menu: Hide 'My Orders' if user is an Admin */}
                    {isLoggedIn && userRole !== "admin" && (
                        <Link
                            to="/customer/orders"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-slate-300 hover:text-emerald-400"
                        >
                            My Orders
                        </Link>
                    )}

                    {isLoggedIn && userName && (
                        <div className="pt-2 border-t border-slate-700 text-slate-400 font-medium">
                            <span>Hello,</span>{' '}
                            <span className="text-emerald-400 font-black">
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
                            className="block w-full text-left font-bold text-red-400 hover:text-red-300 border-0 bg-transparent cursor-pointer"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block font-black text-emerald-400 uppercase tracking-wider"
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