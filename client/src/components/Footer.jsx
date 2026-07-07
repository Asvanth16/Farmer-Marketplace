import { Link, useLocation } from "react-router-dom";
import { Mail, Sprout } from "lucide-react"; // Imported Sprout to match your Navbar design

const Footer = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <footer className="w-full mt-6 sm:mt-12 border-t border-slate-800 bg-slate-950">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2.5">
                            {/* Matching Navbar Icon Styling */}
                            <div className="p-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center">
                                <Sprout className="h-4 w-4 text-emerald-400" />
                            </div>
                            <span className="text-base sm:text-lg font-black bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent tracking-tight leading-tight">
                                AgriMarket
                            </span>
                        </div>
                        <p className="mt-3 text-slate-400 leading-relaxed text-xs sm:text-sm">
                            Connecting farmers and customers through technology,
                            creating a transparent and efficient agricultural
                            marketplace.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-2 text-xs sm:text-sm font-bold">
                        <Link
                            to="/home"
                            className={`block pl-2 border-l-2 transition-all duration-300 ${isActive("/home")
                                ? "border-emerald-400 text-emerald-400"
                                : "border-transparent text-slate-400 hover:text-emerald-500 hover:border-emerald-500"
                                }`}
                        >
                            Home
                        </Link>

                        <Link
                            to="/customer/marketplace"
                            className={`block pl-2 border-l-2 transition-all duration-300 ${location.pathname.startsWith("/customer")
                                ? "border-emerald-400 text-emerald-400"
                                : "border-transparent text-slate-400 hover:text-emerald-500 hover:border-emerald-500"
                                }`}
                        >
                            Marketplace
                        </Link>

                        <Link
                            to="/login"
                            className={`block pl-2 border-l-2 transition-all duration-300  ${isActive("/login")
                                ? "border-emerald-400 text-emerald-400"
                                : "border-transparent text-slate-400 hover:text-emerald-500 hover:border-emerald-500"
                                }`}
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className={`block pl-2 border-l-2 transition-all duration-300  ${isActive("/register")
                                ? "border-emerald-400 text-emerald-400"
                                : "border-transparent text-slate-400 hover:text-emerald-500 hover:border-emerald-500"
                                }`}
                        >
                            Register
                        </Link>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider mb-3 text-slate-200">
                            Contact
                        </h3>
                        <div className="space-y-2 text-slate-400 text-xs sm:text-sm font-medium">
                            <a
                                href="mailto:asvanthsibirv@gmail.com"
                                className="flex items-center gap-2 hover:text-emerald-400 transition"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                asvanthsibirv@gmail.com
                            </a>
                            <a
                                href="https://www.linkedin.com/in/asvanth-sibbi-r-v-1605iz09/"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 hover:text-emerald-400 transition"
                            >
                                💼 LinkedIn
                            </a>
                        </div>
                    </div>

                    {/* Developer */}
                    <div className="text-xs sm:text-sm">
                        <h3 className="font-black uppercase tracking-wider mb-3 text-slate-200">Developed By</h3>
                        <p className="text-emerald-400 font-black">
                            Asvanth Sibbi R. V.
                        </p>
                        <p className="text-slate-400 font-medium">
                            Computer Science Engineering
                        </p>
                        <p className="text-slate-400 font-medium">
                            Full Stack Developer
                        </p>
                        
                        <h3 className="font-black uppercase tracking-wider mb-2 mt-4 text-slate-200">Source Code</h3>
                        <div className="flex">
                            <a
                                href="https://github.com/Asvanth16"
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl border border-slate-800 hover:border-emerald-500 transition font-bold text-xs"
                            >
                                💻 GitHub
                            </a>
                        </div>
                    </div>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-8 pt-4 border-t border-slate-900 flex flex-col lg:flex-row justify-between items-center gap-2 text-center text-xs text-slate-400 font-medium">
                    <p>
                        © {new Date().getFullYear()} AgriMarket. Built for educational and portfolio purposes.
                    </p>
                    <p className="text-slate-600">
                        Found an issue? Feel free to get in touch.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;