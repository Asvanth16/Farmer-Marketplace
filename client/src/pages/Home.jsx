import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import Footer from "../components/Footer";
import heroImage from "../assets/hero-farmer.jpeg";

const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalFarmers: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalOrders: 0,
    });
    const [menuOpen, setMenuOpen] = useState(false);

    const DEMO_ACCOUNTS = {
        customer: {
            email: "customer@demo.com",
            password: "customer123",
        },
        farmer: {
            email: "farmer@demo.com",
            password: "farmer123",
        },
        admin: {
            email: "admin@demo.com",
            password: "admin123",
        },
    };

    useEffect(() => {
        const loadStats = async () => {
            try {
                const { data } = await api.get("/api/public/home-stats");
                setStats(data);
            } catch (err) {
                console.error("Failed to load homepage statistics:", err);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="min-h-screen w-full bg-slate-950 text-white overflow-x-hidden">

            {/* Navbar */}
            <nav className="w-full border-b border-slate-800 sticky top-0 z-50 bg-slate-950/90 backdrop-blur">
                <div className="w-full flex items-center justify-between px-4 sm:px-10 lg:px-16 xl:px-24 py-2 md:py-4">

                    <h1 className="text-base sm:text-2xl font-black text-emerald-400 tracking-tight">
                        AgriMarket
                    </h1>

                    {/* Desktop links */}
                    <div className="hidden sm:flex gap-3 md:gap-4">
                        <Link
                            to="/login"
                            className="px-4 py-1.5 rounded-lg border border-slate-700 hover:border-emerald-500 transition text-xs md:text-sm font-medium"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition text-xs md:text-sm"
                        >
                            Register
                        </Link>
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMenuOpen((o) => !o)}
                        className="sm:hidden w-6 h-6 flex items-center justify-center rounded-lg border border-slate-800"
                        aria-label="Toggle menu"
                    >
                        <span className="text-[10px]">{menuOpen ? "✕" : "☰"}</span>
                    </button>
                </div>

                {/* Mobile menu panel */}
                {menuOpen && (
                    <div className="sm:hidden w-full border-t border-slate-800 px-4 py-2 flex flex-col gap-1.5 bg-slate-950 text-[10px] font-medium">
                        <Link
                            to="/login"
                            onClick={() => setMenuOpen(false)}
                            className="w-full text-center py-1.5 rounded-xl border border-slate-800 hover:border-emerald-500 transition"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            onClick={() => setMenuOpen(false)}
                            className="w-full text-center py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition"
                        >
                            Register
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero */}
            <section className="w-full px-4 sm:px-10 lg:px-16 xl:px-24 py-6 sm:py-12 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-14 lg:gap-8 xl:gap-12 items-center">

                    {/* Left */}
                    <div className="lg:col-span-6 text-center lg:text-left">
                        <span className="inline-block bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-bold border border-emerald-500/20">
                            🌱 Smart Agriculture Marketplace
                        </span>

                        <h1 className="mt-2.5 sm:mt-6 text-lg sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                            Connecting
                            <span className="text-emerald-400"> Farmers</span>
                            <br />
                            with
                            <span className="text-emerald-400"> Customers</span>
                        </h1>

                        <p className="mt-2 sm:mt-5 text-[11px] sm:text-sm lg:text-base text-slate-400 leading-normal sm:leading-relaxed max-w-xl mx-auto lg:mx-0">
                            AgriMarket enables farmers to sell fresh produce directly to
                            customers while ensuring transparency, fair pricing,
                            secure ordering, and efficient delivery management.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4 sm:mt-6">
                            <Link
                                to="/customer/marketplace"
                                className="px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition text-[10px] sm:text-sm shadow-lg shadow-emerald-500/5"
                            >
                                Explore Marketplace
                            </Link>
                            <Link
                                to="/register"
                                className="px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-lg border border-slate-800 hover:border-emerald-500 transition text-[10px] sm:text-sm font-medium"
                            >
                                Become a Farmer
                            </Link>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="lg:col-span-6 relative mt-2 lg:mt-0">
                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-slate-900 rounded-xl lg:rounded-[24px] p-1.5 sm:p-6">
                            <img
                                src={heroImage}
                                alt="Farmer"
                                className="rounded-lg sm:rounded-2xl w-full h-[140px] sm:h-[300px] lg:h-[340px] xl:h-[380px] object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="w-full px-4 sm:px-10 lg:px-16 xl:px-24 py-2 sm:py-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                    {[
                        { number: stats.totalFarmers, label: "Farmers" },
                        { number: stats.totalCustomers, label: "Customers" },
                        { number: stats.totalProducts, label: "Products" },
                        { number: stats.totalOrders, label: "Orders" },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="bg-slate-900 border border-slate-900 rounded-lg lg:rounded-2xl p-2 sm:p-5 text-center"
                        >
                            <h2 className="text-base sm:text-2xl lg:text-3xl font-black text-emerald-400">
                                {item.number}+
                            </h2>
                            <p className="text-slate-400 mt-0.5 sm:mt-1.5 text-[9px] sm:text-sm font-medium">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Explore the platform */}
            <section className="w-full bg-slate-950 px-4 sm:px-10 lg:px-16 xl:px-24 py-4 sm:py-12 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-10 items-center mb-4 sm:mb-10">

                    {/* Left */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-base sm:text-2xl lg:text-3xl font-black tracking-tight">
                            Explore the Platform
                        </h2>
                        <p className="text-slate-400 mt-1.5 sm:mt-3 text-[11px] sm:text-sm max-w-xl mx-auto lg:mx-0">
                            Experience AgriMarket from different perspectives. Explore the
                            marketplace as a customer, manage inventory as a farmer,
                            or oversee the platform as an administrator.
                        </p>
                    </div>

                    {/* Right */}
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-2.5 sm:p-5 text-[11px] sm:text-sm">
                        <div className="flex gap-2 sm:gap-4 items-start">
                            <div className="text-lg sm:text-2xl mt-0.5">💡</div>
                            <div>
                                <h3 className="text-[11px] sm:text-base font-black text-amber-400">
                                    Public Demo Environment
                                </h3>
                                <p className="mt-1 sm:mt-1.5 text-slate-300 leading-normal sm:leading-relaxed text-[10px] sm:text-xs">
                                    Demo accounts are available for Customer,
                                    Farmer and Administrator.
                                </p>
                                <p className="mt-1 sm:mt-1.5 text-slate-400 leading-normal sm:leading-relaxed text-[10px] sm:text-xs">
                                    Administrative actions that modify or delete
                                    important data may be disabled to preserve
                                    the demo environment.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {/* Customer */}
                    <div className="bg-slate-900 border border-slate-900 rounded-lg lg:rounded-2xl p-3.5 sm:p-6 hover:border-emerald-500 transition-all duration-300 sm:hover:-translate-y-1 flex flex-col justify-between">
                        <div>
                            <div className="text-xl sm:text-4xl mb-1.5 sm:mb-4">🛒</div>
                            <h3 className="text-[11px] sm:text-lg font-black">🛒 Explore Marketplace</h3>
                            <p className="text-slate-400 mt-1 sm:mt-2 text-[10px] sm:text-xs leading-normal">
                                Browse fresh products, search crops, compare prices,
                                add products to cart and place orders.
                            </p>
                            <ul className="mt-2 sm:mt-4 space-y-1 sm:space-y-2 text-slate-300 text-[9px] sm:text-xs font-medium">
                                <li>✔ Browse Marketplace</li>
                                <li>✔ Search & Filter</li>
                                <li>✔ Shopping Cart</li>
                                <li>✔ Order Tracking</li>
                            </ul>
                        </div>
                        <button
                            onClick={() =>
                                navigate("/login", { state: DEMO_ACCOUNTS.customer })
                            }
                            className="w-full mt-4 sm:mt-6 py-1.5 sm:py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition text-[10px] sm:text-xs"
                        >
                            Explore Customer →
                        </button>
                    </div>

                    {/* Farmer */}
                    <div className="bg-slate-900 border border-slate-900 rounded-lg lg:rounded-2xl p-3.5 sm:p-6 hover:border-emerald-500 transition-all duration-300 sm:hover:-translate-y-1 flex flex-col justify-between">
                        <div>
                            <div className="text-xl sm:text-4xl mb-1.5 sm:mb-4">🌾</div>
                            <h3 className="text-[11px] sm:text-lg font-black">🌾 Manage as Farmer</h3>
                            <p className="text-slate-400 mt-1 sm:mt-2 text-[10px] sm:text-xs leading-normal">
                                Manage products, update inventory, accept customer
                                orders and monitor sales analytics.
                            </p>
                            <ul className="mt-2 sm:mt-4 space-y-1 sm:space-y-2 text-slate-300 text-[9px] sm:text-xs font-medium">
                                <li>✔ Inventory Management</li>
                                <li>✔ Order Management</li>
                                <li>✔ Revenue Analytics</li>
                                <li>✔ Top Selling Crops</li>
                            </ul>
                        </div>
                        <button
                            onClick={() =>
                                navigate("/login", { state: DEMO_ACCOUNTS.farmer })
                            }
                            className="w-full mt-4 sm:mt-6 py-1.5 sm:py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition text-[10px] sm:text-xs"
                        >
                            Explore Farmer →
                        </button>
                    </div>

                    {/* Admin */}
                    <div className="bg-slate-900 border border-slate-900 rounded-lg lg:rounded-2xl p-3.5 sm:p-6 hover:border-emerald-500 transition-all duration-300 sm:hover:-translate-y-1 sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
                        <div>
                            <div className="text-xl sm:text-4xl mb-1.5 sm:mb-4">🛡️</div>
                            <h3 className="text-[11px] sm:text-lg font-black">🛡️ Platform Administration</h3>
                            <p className="text-slate-400 mt-1 sm:mt-2 text-[10px] sm:text-xs leading-normal">
                                View platform analytics, manage users, review farmers,
                                and oversee marketplace operations.
                            </p>
                            <ul className="mt-2 sm:mt-4 space-y-1 sm:space-y-2 text-slate-300 text-[9px] sm:text-xs font-medium">
                                <li>✔ Dashboard Analytics</li>
                                <li>✔ User Management</li>
                                <li>✔ Product Monitoring</li>
                                <li>✔ Farmer Verification</li>
                            </ul>
                        </div>
                        <button
                            onClick={() =>
                                navigate("/login", { state: DEMO_ACCOUNTS.admin })
                            }
                            className="w-full mt-4 sm:mt-6 py-1.5 sm:py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition text-[10px] sm:text-xs"
                        >
                            Explore Admin →
                        </button>
                    </div>
                </div>

            </section>

            {/* Technology stack (banded) */}
            <section className="w-full bg-slate-900/40 border-y border-slate-800 px-4 sm:px-10 lg:px-16 xl:px-24 py-6 sm:py-12 lg:py-14">
                <div className="max-w-2xl text-center sm:text-left mx-auto sm:mx-0">
                    <span className="inline-block bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-bold border border-emerald-500/20">
                        TECHNOLOGY STACK
                    </span>
                    <h2 className="mt-2 sm:mt-4 text-base sm:text-2xl lg:text-3xl font-black tracking-tight">
                        Built with Modern Technologies
                    </h2>
                    <p className="mt-1.5 sm:mt-3 text-slate-400 text-[11px] sm:text-sm leading-normal sm:leading-relaxed">
                        AgriMarket is built using the MERN stack with modern frontend,
                        backend and cloud technologies to provide a scalable and responsive
                        marketplace experience.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 mt-5 sm:mt-10">
                    {[
                        { icon: "⚛️", name: "React.js", color: "text-cyan-400" },
                        { icon: "🚀", name: "Express.js", color: "text-green-400" },
                        { icon: "🟢", name: "Node.js", color: "text-lime-400" },
                        { icon: "🍃", name: "MongoDB", color: "text-emerald-400" },
                        { icon: "🎨", name: "Tailwind CSS", color: "text-sky-400" },
                        { icon: "☁️", name: "Cloudinary", color: "text-blue-400" },
                        { icon: "📊", name: "Recharts", color: "text-orange-400" },
                        { icon: "🔐", name: "JWT Auth", color: "text-yellow-400" },
                    ].map((tech) => (
                        <div
                            key={tech.name}
                            className="bg-slate-900 border border-slate-900 rounded-lg lg:rounded-2xl p-2 sm:p-5 hover:border-emerald-500 sm:hover:-translate-y-1 transition-all duration-300 text-center"
                        >
                            <div className="text-base sm:text-2xl mb-1 sm:mb-3">{tech.icon}</div>
                            <h3 className={`text-[9px] sm:text-xs font-black ${tech.color}`}>
                                {tech.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Project highlights */}
            <section className="w-full px-4 sm:px-10 lg:px-16 xl:px-24 py-6 sm:py-12 lg:py-14">
                <div className="max-w-2xl text-center sm:text-left mx-auto sm:mx-0">
                    <span className="inline-block bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-bold border border-emerald-500/20">
                        PROJECT HIGHLIGHTS
                    </span>
                    <h2 className="mt-2 sm:mt-4 text-base sm:text-2xl lg:text-3xl font-black tracking-tight">
                        Everything You Need in One Platform
                    </h2>
                    <p className="mt-1.5 sm:mt-3 text-[11px] sm:text-sm text-slate-400 leading-normal sm:leading-relaxed">
                        AgriMarket combines modern technologies with real-world agricultural
                        workflows to create a seamless marketplace for farmers,
                        customers, and administrators.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-5 sm:mt-10">
                    {[
                        {
                            icon: "🔐",
                            title: "Secure Authentication",
                            desc: "JWT-based authentication with Customer, Farmer and Admin roles.",
                        },
                        {
                            icon: "🌾",
                            title: "Farmer Dashboard",
                            desc: "Manage products, inventory, orders, revenue and crop analytics.",
                        },
                        {
                            icon: "🛒",
                            title: "Customer Marketplace",
                            desc: "Browse products, search, filter, add to cart and track orders.",
                        },
                        {
                            icon: "🛡️",
                            title: "Admin Control Panel",
                            desc: "Platform analytics, user management, product monitoring and approvals.",
                        },
                        {
                            icon: "📦",
                            title: "Inventory Management",
                            desc: "Real-time product listings with image upload and stock management.",
                        },
                        {
                            icon: "📊",
                            title: "Business Analytics",
                            desc: "Revenue charts, top-selling crops and marketplace insights.",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="bg-slate-900 border border-slate-900 rounded-lg lg:rounded-2xl p-3.5 sm:p-6 hover:border-emerald-500 sm:hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="text-base sm:text-2xl mb-1.5 sm:mb-4">{item.icon}</div>
                            <h3 className="text-[11px] sm:text-base font-black">{item.title}</h3>
                            <p className="mt-1 sm:mt-2 text-slate-400 leading-normal text-[10px] sm:text-xs">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;