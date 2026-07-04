import { Link, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer = () => {

    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <footer className="w-full mt-8 sm:mt-20 border-t border-slate-800 bg-slate-950">
            <div className="w-full  mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">

                    {/* Brand */}
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black text-emerald-400">
                            🌱 AgriMarket
                        </h2>
                        <p className="mt-4 sm:mt-5 text-slate-400 leading-7 text-sm sm:text-base">
                            Connecting farmers and customers through technology,
                            creating a transparent and efficient agricultural
                            marketplace.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">

                        <Link
                            to="/home"
                            className={`block pl-3 border-l-2 transition-all duration-300 ${isActive("/home")
                                ? "border-emerald-400 text-emerald-400 font-bold"
                                : "border-transparent text-slate-400 hover:text-emerald-400 hover:border-emerald-500"
                                }`}
                        >

                            Home
                        </Link>

                        <Link
                            to="/customer/marketplace"
                            className={`block pl-3 border-l-2 transition-all duration-300 ${location.pathname.startsWith("/customer")
                                ? "border-emerald-400 text-emerald-400 font-bold"
                                : "border-transparent text-slate-400 hover:text-emerald-400 hover:border-emerald-500"
                                }`}
                        >

                            Marketplace
                        </Link>

                        <Link
                            to="/login"
                            className={`block pl-3 border-l-2 transition-all duration-300  ${isActive("/login")
                                ? "border-emerald-400 text-emerald-400 font-bold"
                                : "border-transparent text-slate-400 hover:text-emerald-400 hover:border-emerald-500"
                                }`}
                        >

                            Login
                        </Link>

                        <Link
                            to="/register"
                            className={`block pl-3 border-l-2 transition-all duration-300  ${isActive("/register")
                                ? "border-emerald-400 text-emerald-400 font-bold"
                                : "border-transparent text-slate-400 hover:text-emerald-400 hover:border-emerald-500"
                                }`}
                        >

                            Register
                        </Link>

                    </div>

                    {/* Contact */}
                    <div>

                        <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5">
                            Contact
                        </h3>

                        <div className="space-y-3 text-slate-400 text-sm sm:text-base">

                            <a
                                href="mailto:asvanthsibirv@gmail.com"
                                className="flex items-center gap-2 hover:text-emerald-400 transition"
                            >
                                <Mail className="w-4 h-4" />
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
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5">Developed By</h3>
                        <p className="text-emerald-400 font-bold text-base sm:text-lg">
                            Asvanth Sibbi R. V.
                        </p>
                        <p className="mt-3 sm:mt-4 text-slate-400 text-sm sm:text-base">
                            Computer Science Engineering
                        </p>
                        <p className="text-slate-400 text-sm sm:text-base">
                            Full Stack Developer
                        </p>
                        <h3 className="text-lg sm:text-xl font-bold mb-3 mt-6 sm:mt-8">Source Code</h3>
                        <div className=" flex gap-3 sm:gap-4">
                            <a
                                href="https://github.com/Asvanth16"
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 sm:px-5 py-2 rounded-xl border border-slate-700 hover:border-emerald-500 transition text-sm sm:text-base"
                            >
                                💻 GitHub
                            </a>

                        </div>
                    </div>
                </div>

                <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-3 sm:gap-4 text-center">
                    <p>
                        © {new Date().getFullYear()} AgriMarket.
                        Built for educational and portfolio purposes.
                    </p>
                    <p className="text-slate-500 text-xs sm:text-sm">
                        Found an issue? Feel free to get in touch.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;