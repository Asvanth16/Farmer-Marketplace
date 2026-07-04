import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api/axios";
import Footer from "../components/Footer";
import {
    LayoutDashboard, UserCheck, Users, ShoppingBag,
    Layers, Users2, BarChart3, Settings, ShieldAlert,
    Menu, X, Check, Ban, RefreshCw, Eye, AlertCircle,
    Calendar, MapPin, Mail, Sprout, ShieldCheck, UserMinus, CheckCircle,
    TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const isDemo = localStorage.getItem("isDemo") === "true";

    // UI Control States
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Core Data States
    const [metrics, setMetrics] = useState({
        totalFarmers: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalOrders: 0,
        pendingFarmers: 0
    });
    const [pendingFarmers, setPendingFarmers] = useState([]);
    const [allFarmers, setAllFarmers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderStats, setOrderStats] = useState(null);
    const [orderFilter, setOrderFilter] = useState('All');
    const [products, setProducts] = useState([]);
    const [productLoadingId, setProductLoadingId] = useState(null);
    const [users, setUsers] = useState([]);
    const [userLoadingId, setUserLoadingId] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authChecking, setAuthChecking] = useState(true);
    const [demoModal, setDemoModal] = useState(false);
    const [demoMessage, setDemoMessage] = useState("");
    const showDemoModal = (message) => {
        setDemoMessage(message);
        setDemoModal(true);
    };
    const [deleteModal, setDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // Context Security Validation Layer
    useEffect(() => {
        const verifyAdminAuthorization = () => {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('role');

            if (!token || userRole !== 'admin') {
                setMessage({ type: 'error', text: 'Access Denied: Unrecognized Authorization Parameters.' });
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setAuthChecking(false);
            }
        };
        verifyAdminAuthorization();
    }, [navigate]);

    // Aggregate Initializer Data Collector
    const fetchDashboardState = async () => {
        try {
            const [
                metricsRes,
                pendingRes,
                allFarmersRes,
                ordersRes,
                orderStatsRes,
                productsRes,
                usersRes,
                analyticsRes
            ] = await Promise.all([
                api.get("/api/admin/dashboard"),
                api.get("/api/admin/farmers/pending"),
                api.get("/api/admin/farmers"),
                api.get("/api/admin/orders"),
                api.get("/api/admin/order-stats"),
                api.get("/api/admin/products"),
                api.get("/api/admin/users"),
                api.get("/api/admin/analytics")
            ]);

            setMetrics(metricsRes.data);
            setPendingFarmers(pendingRes.data || []);
            setAllFarmers(allFarmersRes.data || []);
            setOrders(ordersRes.data || []);
            setOrderStats(orderStatsRes.data);
            setProducts(productsRes.data || []);
            setUsers(usersRes.data || []);
            setAnalytics(analyticsRes.data || null);

        } catch (error) {
            console.error('Error synchronizing platform states:', error);
            showFeedback('error', 'Critical operational sync error. Please verify backend state endpoints.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authChecking) {
            fetchDashboardState();
        }
    }, [authChecking]);

    // Status Feedback Handler
    const showFeedback = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    // Global Action Executors
    const executeFarmerAction = async (id, actionType) => {
        if (isDemo) {
            showDemoModal(
                "User activation and suspension are disabled in the public demo."
            );
            return;
        }
        setActionLoadingId(id);
        try {
            await api.put(`/api/admin/farmers/${id}/${actionType}`, {})

            showFeedback('success', `Farmer operational sequence [${actionType.toUpperCase()}] executed successfully.`);
            await fetchDashboardState();
        } catch (error) {
            console.error(`Action structural execution failure: ${actionType}`, error);
            showFeedback('error', `Failed to apply update schema mapping parameter: ${actionType}`);
        } finally {
            setActionLoadingId(null);
        }
    };

    const deleteProduct = (productId) => {

        if (isDemo) {
            showDemoModal(
                "Product deletion is disabled in the public demo."
            );
            return;
        }

        setProductToDelete(productId);
        setDeleteModal(true);
    };

    const confirmDeleteProduct = async () => {

        try {

            setProductLoadingId(productToDelete);

            await api.delete(`/api/admin/products/${productToDelete}`);

            showFeedback("success", "Product deleted successfully");

            fetchDashboardState();

        } catch (error) {

            showFeedback("error", "Failed to delete product");

        } finally {

            setProductLoadingId(null);
            setDeleteModal(false);
            setProductToDelete(null);

        }
    };

    const toggleUserStatus = async (userId) => {
        if (isDemo) {
            showDemoModal(
                "User activation and suspension are disabled in the public demo."
            );
            return;
        }
        try {
            setUserLoadingId(userId);

            await api.put(`/api/admin/users/${userId}/toggle-status`, {})

            showFeedback('success', 'User updated successfully');
            fetchDashboardState();
        } catch (error) {
            showFeedback('error', 'Failed to update user');
        } finally {
            setUserLoadingId(null);
        }
    };

    // Analytical Breakdown Computations
    const insightMetrics = {
        verified: allFarmers.filter(f => f.farmDetails?.isVerified).length,
        pending: allFarmers.filter(f => !f.farmDetails?.isVerified && f.status !== 'suspended').length,
        active: allFarmers.filter(f => f.status === 'active' || !f.status).length,
        suspended: allFarmers.filter(f => f.status === 'suspended').length
    };

    // Custom Tooltip for dark charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">{label}</p>
                    <p className="text-sm font-black text-emerald-400">
                        {payload[0].name}: {payload[0].value.toLocaleString('en-IN')}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Palette configurations for Recharts Cell allocations
    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6'];

    if (authChecking || loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1329] text-white">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-emerald-500 mb-4"></div>
                <p className="text-slate-400 text-lg tracking-widest font-bold uppercase">Securing Enterprise Vectors...</p>
            </div>
        );
    }

    const filteredOrders = orderFilter === 'All' ? orders : orders.filter(order => order.status === orderFilter);

    return (
        <div className="min-h-screen bg-[#0b1329] text-white font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
            <Navbar />

            {/* Notification Toast Banner */}
            {message.text && (
                <div
                    className={`
            fixed
            top-20 sm:top-24
            left-1/2 -translate-x-1/2
            w-[92%] sm:w-auto
            max-w-xl
            z-50
            flex items-start gap-3
            px-4 sm:px-6
            py-3 sm:py-4
            rounded-xl
            shadow-2xl
            border
            backdrop-blur-md
            transition-all duration-300
            ${message.type === "error"
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        }
        `}
                >
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />

                    <span className="text-sm sm:text-base lg:text-lg font-bold leading-relaxed">
                        {message.text}
                    </span>
                </div>
            )}

            <div className="max-w-[2700px] mx-auto flex relative min-h-[calc(100vh-80px)]">

                {/* SIDEBAR MATRIX */}
                <aside className={`fixed lg:sticky top-0 left-0 h-full lg:h-[calc(100vh-80px)] w-[280px] lg:w-80 bg-slate-900/80 border-r border-slate-800/60 backdrop-blur-xl z-40 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-8 flex flex-col h-full justify-between">
                        <div className="space-y-8">
                            <div className="flex items-center justify-between lg:justify-start gap-3">
                                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                                    <LayoutDashboard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-100">Marketplace IQ</h2>
                                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Admin Command Center</p>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <nav className="space-y-1.5">
                                {[
                                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                    { id: 'approvals', label: 'Farmer Approvals', icon: UserCheck, count: pendingFarmers.length },
                                    { id: 'management', label: 'Farmer Management', icon: Users },
                                    { id: 'orders', label: 'Orders', icon: ShoppingBag },
                                    { id: 'products', label: 'Products', icon: Layers },
                                    { id: 'users', label: 'Users', icon: Users2 },
                                    { id: 'analytics', label: 'Analytics', icon: BarChart3 },

                                ].map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                            className={`w-full flex items-center justify-between px-4 py-4 rounded-xl font-bold text-md lg:text-lg transition-all duration-200 border cursor-pointer bg-transparent ${isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:border-slate-800'}`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                                                <span>{item.label}</span>
                                            </div>
                                            {item.count > 0 && (
                                                <span className="px-2 py-0.5 text-xs font-black bg-emerald-500 text-slate-950 rounded-full">{item.count}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="pt-6 border-t border-slate-800/60 flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-black text-lg">A</div>
                            <div>
                                <p className="font-bold text-sm text-slate-200 truncate max-w-[160px]">Root Administrator</p>
                                <p className="text-xs text-slate-500 truncate max-w-[160px]">admin@agrimarket.com</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT WORKSPACE */}
                <main className="flex-1 p-4 sm:p-6 lg:p-12 space-y-12 overflow-x-hidden">

                    {/* PREMIUM HEADER BLOCK */}
                    <header className="bg-slate-900/40 border border-slate-800/60 p-8 lg:p-10 rounded-3xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl cursor-pointer">
                                    <Menu className="w-6 h-6" />
                                </button>
                                <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white">Admin Dashboard</h1>
                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                    <ShieldAlert className="w-3.5 h-3.5" /> System Mode
                                </span>
                            </div>
                            <p className="text-slate-400 text-lg lg:text-xl font-medium">Welcome Admin, platform diagnostic subsystems are operational.</p>
                        </div>
                        {isDemo && (
                            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                                <h3 className="font-bold text-amber-300">
                                    🛡️ Public Demo Mode
                                </h3>

                                <p className="text-sm text-amber-100 mt-1">
                                    You can explore every section of the Admin Dashboard, but actions that modify data are disabled to preserve the demo environment.
                                </p>
                            </div>
                        )}
                        <div className="flex items-center gap-4 text-slate-400 font-bold text-sm lg:text-md bg-slate-950/50 px-5 py-3 rounded-2xl border border-slate-800/80">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </header>

                    {/* TAB CONTENT: DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <>
                            {/* METRIC OVERVIEW CARDS */}
                            <section className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                                {[
                                    { label: 'Total Farmers', value: metrics.totalFarmers, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                                    { label: 'Total Customers', value: metrics.totalCustomers, icon: Users2, color: 'text-blue-400', bg: 'bg-blue-500/5' },
                                    { label: 'Total Products', value: metrics.totalProducts, icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/5' },
                                    { label: 'Total Orders', value: metrics.totalOrders, icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-500/5' },
                                    { label: 'Pending Approvals', value: metrics.pendingFarmers, icon: UserCheck, color: 'text-yellow-400', bg: 'bg-yellow-500/5', alert: metrics.pendingFarmers > 0 }
                                ].map((card, idx) => {
                                    const Icon = card.icon;
                                    return (
                                        <div key={idx} className={`group relative bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 p-8 rounded-3xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between ${card.bg}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <span className="text-slate-400 text-md lg:text-lg font-bold tracking-wide uppercase max-w-[70%]">{card.label}</span>
                                                <div className={`p-3 rounded-2xl bg-slate-950/40 border border-slate-800 group-hover:scale-110 transition-transform ${card.color}`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight">{card.value}</div>
                                                {card.alert && (
                                                    <span className="inline-block text-xs text-yellow-400 font-extrabold animate-pulse">Action required</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>

                            {/* SYSTEM HOTLINKS */}
                            <section className="space-y-6">
                                <h2 className="text-2xl lg:text-3xl font-black text-white">System Hotlinks & Automations</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                    {[
                                        { label: 'Farmer Approvals', target: 'approvals', icon: UserCheck, tint: 'hover:border-yellow-500/40 text-yellow-400' },
                                        { label: 'Farmer Management', target: 'management', icon: Users, tint: 'hover:border-emerald-500/40 text-emerald-400' },
                                        { label: 'Orders Engine', target: 'orders', icon: ShoppingBag, tint: 'hover:border-blue-500/40 text-blue-400' },
                                        { label: 'Products Control', target: 'products', icon: Layers, tint: 'hover:border-purple-500/40 text-purple-400' },
                                        { label: 'Users Grid', target: 'users', icon: Users2, tint: 'hover:border-pink-500/40 text-pink-400' },
                                        { label: 'Analytics Matrix', target: 'analytics', icon: BarChart3, tint: 'hover:border-cyan-500/40 text-cyan-400' }
                                    ].map((act, i) => {
                                        const ActIcon = act.icon;
                                        return (
                                            <button key={i} onClick={() => setActiveTab(act.target)} className={`p-6 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-center group transition-all cursor-pointer hover:bg-slate-900/60 ${act.tint}`} >
                                                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 group-hover:scale-110 transition-transform">
                                                    <ActIcon className="w-6 h-6" />
                                                </div>
                                                <span className="text-sm lg:text-base font-black text-slate-300 group-hover:text-white transition-colors">{act.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        </>
                    )}

                    {/* TAB CONTENT: ANALYTICS */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-10 animate-fade-in">

                            {/* SECTION 1: MARKETPLACE SALES OVERVIEW (KPI CARDS) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Marketplace Sales', value: analytics?.totalSales || 0, trend: 'up', percent: '+12.3%' },
                                    { label: "Today's Sales", value: analytics?.todaySales || 0, trend: 'up', percent: '+8.4%' },
                                    { label: 'Weekly Sales', value: analytics?.weekSales || 0, trend: 'down', percent: '-2.1%' },
                                    { label: 'Monthly Sales', value: analytics?.monthSales || 0, trend: 'up', percent: '+14.6%' }
                                ].map((card, i) => (
                                    <div key={i} className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-slate-400 font-bold text-xs lg:text-sm tracking-wider uppercase">{card.label}</span>
                                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-2">
                                                ₹{card.value.toLocaleString('en-IN')}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold">
                                                {card.trend === 'up' ? (
                                                    <span className="flex items-center gap-0.5 text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full">
                                                        <TrendingUp className="w-3 h-3" /> {card.percent}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-0.5 text-red-400 bg-red-500/5 px-2 py-0.5 rounded-full">
                                                        <TrendingDown className="w-3 h-3" /> {card.percent}
                                                    </span>
                                                )}
                                                <span className="text-slate-500 tracking-wide uppercase">vs last tier</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* SALES TREND & ORDER DISTRIBUTION BLOCK */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* SECTION 2: SALES TREND CHART */}
                                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 p-6 lg:p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col justify-between">
                                    <div className="mb-6">
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-100 tracking-tight">Marketplace Sales Trend</h3>
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Daily sales vectors for the past 7 days (Delivered Only)</p>
                                    </div>
                                    <div className="h-64 sm:h-72 lg:h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={analytics?.salesTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                                                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="sales" name="Sales" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 7, strokeWidth: 0 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* SECTION 3: ORDER STATUS DISTRIBUTION */}
                                <div className="bg-slate-900/40 border border-slate-800/80 p-6 lg:p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-100 tracking-tight">Order Distribution</h3>
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Comprehensive macro lifecycle parameters</p>
                                    </div>
                                    <div className="h-56 sm:h-64 lg:h-72 w-full relative flex items-center justify-center my-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics?.orderStatusData || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={65}
                                                    outerRadius={85}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                >
                                                    {(analytics?.orderStatusData || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                        {(analytics?.orderStatusData || []).map((entry, idx) => (
                                            <div key={idx} className="flex flex-col items-center p-2 bg-slate-950/30 border border-slate-800/50 rounded-xl">
                                                <div className="flex items-center gap-1.5 max-w-full">
                                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{entry.name}</span>
                                                </div>
                                                <span className="text-sm font-black text-white mt-1">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* TOP FARMERS BAR CHART */}
                            {/* SECTION 4: TOP FARMERS */}
                            <div className="bg-slate-900/40 border border-slate-800/80 p-6 lg:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
                                <div className="mb-6">
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-100 tracking-tight">Top Farmers by Delivered Orders</h3>
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Ranked in descending sequence by total absolute delivery confirmations</p>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={analytics?.topFarmers || []} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} horizontal={false} />
                                            <XAxis type="number" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="orders" name="Delivered Orders" fill="#10b981" radius={[0, 8, 8, 0]} barSize={16}>
                                                {(analytics?.topFarmers || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.12} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* TOP PRODUCTS BAR CHART */}
                            {/* SECTION 5: TOP PRODUCTS */}
                            <div className="bg-slate-900/40 border border-slate-800/80 p-6 lg:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
                                <div className="mb-6">
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-100 tracking-tight">Top Products by Units Sold</h3>
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Absolute inventory yield volumes distributed by SKU category</p>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={analytics?.topProducts || []} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} horizontal={false} />
                                            <XAxis type="number" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="quantity" name="Units Sold" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={16}>
                                                {(analytics?.topProducts || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill="#10b981" fillOpacity={1 - index * 0.12} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* CATEGORY & HEALTH BLOCK */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* SECTION 6: CATEGORY PERFORMANCE */}
                                <div className="bg-slate-900/40 border border-slate-800/80 p-6 lg:p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-100 tracking-tight">Top Categories</h3>
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Share of verified orders distributed among system categories</p>
                                    </div>
                                    <div className="h-60 w-full relative my-4 flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics?.topCategories || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={75}
                                                    dataKey="count"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}
                                                >
                                                    {(analytics?.topCategories || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* SECTION 7: MARKETPLACE HEALTH */}
                                <div className="bg-slate-900/40 border border-slate-800/80 p-6 lg:p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col justify-between">
                                    <div className="mb-4">
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-100 tracking-tight">Marketplace Health Matrix</h3>
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Internal account verification state indices</p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-full content-center">
                                        {[
                                            { label: 'Total Farmers', value: metrics.totalFarmers, color: 'text-emerald-400 border-emerald-500/10' },
                                            { label: 'Verified Farmers', value: insightMetrics.verified, color: 'text-blue-400 border-blue-500/10' },
                                            { label: 'Pending Farmers', value: metrics.pendingFarmers, color: 'text-yellow-400 border-yellow-500/10' },
                                            { label: 'Total Customers', value: metrics.totalCustomers, color: 'text-pink-400 border-pink-500/10' },
                                            { label: 'Total Products', value: metrics.totalProducts, color: 'text-purple-400 border-purple-500/10' }
                                        ].map((health, idx) => (
                                            <div key={idx} className={`p-4 bg-slate-950/40 border rounded-2xl flex flex-col justify-between ${health.color}`}>
                                                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider leading-snug">{health.label}</span>
                                                <span className="text-2xl lg:text-3xl font-black mt-3 block">{health.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* TAB CONTENT: APPROVALS */}
                    {activeTab === 'approvals' && (
                        <section className="bg-slate-900/40 border border-slate-800/60 p-8 lg:p-10 rounded-3xl backdrop-blur-md space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                                <div>
                                    <h2 className="text-2xl lg:text-3xl font-black text-slate-100">Pending Farmer Verification Queue</h2>
                                    <p className="text-slate-400 text-sm lg:text-base font-medium mt-1">Review applicant farm credentials to provision secure marketplace access.</p>
                                </div>
                                <span className="px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-black text-sm uppercase rounded-xl tracking-wider">
                                    {pendingFarmers.length} Applications Awaiting
                                </span>
                            </div>

                            {pendingFarmers.length === 0 ? (
                                <div className="p-16 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-500 font-bold uppercase tracking-widest text-lg bg-slate-950/10">
                                    No outstanding registration profiles require audit.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {pendingFarmers.map((farmer) => (
                                        <div key={farmer._id} className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 lg:p-8 flex flex-col justify-between gap-6 hover:border-slate-700/60 transition-colors">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-200">{farmer.fullName}</h3>
                                                        <p className="text-xs text-emerald-400 font-bold tracking-widest uppercase mt-0.5">{farmer.farmDetails?.farmName || 'Unnamed Farm System'}</p>
                                                    </div>
                                                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                                                        ID: {farmer._id?.substring(18)}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-slate-400 bg-slate-900/30 p-4 rounded-xl border border-slate-800/60">
                                                    <div className="flex items-center gap-2.5 truncate">
                                                        <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                        <span className="truncate">{farmer.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                        <span>{farmer.farmDetails?.location || 'Unspecified Lat/Long'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 sm:col-span-2 text-slate-300">
                                                        <Sprout className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                        <span>Produce Focus: <strong className="text-white font-black">{farmer.farmDetails?.produceType || 'Mixed Yield'}</strong></span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 border-t border-slate-900 pt-4">
                                                <button
                                                    onClick={() => executeFarmerAction(farmer._id, 'reject')}
                                                    disabled={actionLoadingId === farmer._id}
                                                    className="flex-1 py-3 px-4 bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold text-sm lg:text-base border border-slate-800 hover:border-red-500/30 rounded-xl transition cursor-pointer disabled:opacity-50"
                                                >
                                                    Reject Profile
                                                </button>
                                                <button
                                                    onClick={() => executeFarmerAction(farmer._id, 'approve')}
                                                    disabled={actionLoadingId === farmer._id}
                                                    className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm lg:text-base border-0 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {actionLoadingId === farmer._id ? 'Processing...' : (
                                                        <>
                                                            <ShieldCheck className="w-5 h-5" /> Approve & Verify
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* TAB CONTENT: FARMER MANAGEMENT */}
                    {activeTab === 'management' && (
                        <section className="bg-slate-900/40 border border-slate-800/60 p-8 lg:p-10 rounded-3xl backdrop-blur-md space-y-6">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-100">Registered Farmer Management Registry</h2>
                                <p className="text-slate-400 text-sm lg:text-base font-medium mt-1">Audit status indices, suspensions, and operational modes across all mapped sellers.</p>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/20">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-950/60 text-slate-400 text-xs font-black tracking-widest uppercase border-b border-slate-800">
                                            <th className="p-5">Farmer Account</th>
                                            <th className="p-5">Farm System</th>
                                            <th className="p-5">Location Parameters</th>
                                            <th className="p-5">Verification State</th>
                                            <th className="p-5 text-right">Actions Matrix</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 font-medium text-sm lg:text-base text-slate-300">
                                        {allFarmers.map((f) => (
                                            <tr key={f._id} className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-5">
                                                    <p className="font-bold text-white text-md lg:text-lg">{f.fullName}</p>
                                                    <p className="text-xs text-slate-500 font-bold truncate max-w-[180px]">{f.email}</p>
                                                </td>
                                                <td className="p-5 text-slate-200 font-semibold">{f.farmDetails?.farmName || 'N/A'}</td>
                                                <td className="p-5">{f.farmDetails?.location || 'N/A'}</td>
                                                <td className="p-5">
                                                    {f.farmDetails?.isVerified ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 uppercase tracking-wider">
                                                            Unverified
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-5 text-right">
                                                    <button
                                                        onClick={() => executeFarmerAction(f._id, f.status === 'suspended' ? 'activate' : 'suspend')}
                                                        className={`px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl border transition ${f.status === 'suspended' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}
                                                    >
                                                        {f.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* TAB CONTENT: ORDERS ENGINE */}
                    {activeTab === 'orders' && (
                        <section className="bg-slate-900/40 border border-slate-800/60 p-8 lg:p-10 rounded-3xl backdrop-blur-md space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
                                <div>
                                    <h2 className="text-2xl lg:text-3xl font-black text-slate-100">Marketplace Orders Engine</h2>
                                    <p className="text-slate-400 text-sm lg:text-base font-medium mt-1">Audit transactions, fulfillment schemas, and verify routing.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2.5 bg-slate-950/60 border border-slate-800 p-1.5 rounded-2xl">
                                    {['All', 'Pending', 'Accepted', 'Dispatched', 'Delivered', 'Cancelled'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setOrderFilter(filter)}
                                            className={`px-4 py-2 text-xs lg:text-sm font-black uppercase tracking-wider rounded-xl transition border cursor-pointer ${orderFilter === filter ? 'bg-emerald-500 text-slate-950 border-0 shadow-md shadow-emerald-500/10' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'}`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                                <div className="xl:col-span-2 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/20">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-950/60 text-slate-400 text-xs font-black tracking-widest uppercase border-b border-slate-800">
                                                <th className="p-5">Order Mapping ID</th>
                                                <th className="p-5">Timestamp</th>
                                                <th className="p-5">Fulfillment Financials</th>
                                                <th className="p-5">Status state</th>
                                                <th className="p-5 text-right">Audit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 text-sm lg:text-base font-medium text-slate-300">
                                            {filteredOrders.map((o) => (
                                                <tr key={o._id} className={`hover:bg-slate-900/30 transition-colors ${selectedOrder?._id === o._id ? 'bg-emerald-500/5' : ''}`}>
                                                    <td className="p-5 font-bold text-white uppercase tracking-wider">#{o._id?.substring(16)}</td>
                                                    <td className="p-5 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                                                    <td className="p-5 text-emerald-400 font-black">₹{o.totalAmount}</td>
                                                    <td className="p-5">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${o.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : o.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                            {o.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <button onClick={() => setSelectedOrder(o)} className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 transition cursor-pointer">
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {selectedOrder && (
                                    <div className="bg-slate-900/60 border border-slate-800 p-6 lg:p-8 rounded-2xl space-y-6 backdrop-blur-md sticky top-28 shadow-2xl">
                                        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-wider">Order Audit</h3>
                                                <p className="text-xs text-slate-500 font-bold uppercase mt-1">ID: {selectedOrder._id}</p>
                                            </div>
                                            <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer">
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
                                            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
                                                <p className="text-slate-500 mb-1">Fulfillment Vector</p>
                                                <p className="text-sm font-black text-white">{selectedOrder.status}</p>
                                            </div>
                                            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
                                                <p className="text-slate-500 mb-1">Total Valuation</p>
                                                <p className="text-sm font-black text-emerald-400">₹{selectedOrder.totalAmount}</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/80 space-y-1.5 font-medium text-sm text-slate-300">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Shipping Logistical Parameters</h4>
                                            <p className="font-bold text-white">{selectedOrder.shippingAddress?.fullName}</p>
                                            <p className="text-slate-400 text-xs">{selectedOrder.shippingAddress?.phone}</p>
                                            <p className="text-slate-200 mt-1">{selectedOrder.shippingAddress?.addressLine1}</p>
                                            <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Manifest Line Items</h4>
                                            {selectedOrder.items?.map(item => (
                                                <div key={item._id} className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 flex justify-between items-center text-sm font-semibold">
                                                    <div>
                                                        <p className="font-bold text-slate-200 text-base">{item.product?.name || 'Unknown SKU Mapping'}</p>
                                                        <p className="text-slate-500 text-xs mt-0.5">Quantity Order Vector: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-emerald-400 font-black text-base">₹{item.priceAtPurchase}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* TAB CONTENT: PRODUCTS REGISTRY */}
                    {activeTab === 'products' && (
                        <section className="bg-slate-900/40 border border-slate-800/60 p-8 lg:p-10 rounded-3xl backdrop-blur-md space-y-6">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-100">Global System SKU Catalog</h2>
                                <p className="text-slate-400 text-sm lg:text-base font-medium mt-1">Audit active offerings, evaluate pricing paradigms, or handle listing removals.</p>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/20">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-950/60 text-slate-400 text-xs font-black tracking-widest uppercase border-b border-slate-800">
                                            <th className="p-5">Product Details</th>
                                            <th className="p-5">Classification</th>
                                            <th className="p-5">Valuation Per Unit</th>
                                            <th className="p-5">Stock Parameter Allocation</th>
                                            <th className="p-5 text-right">Removal Sequence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 text-sm lg:text-base font-medium text-slate-300">
                                        {products.map((p) => (
                                            <tr key={p._id} className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-5">
                                                    <p className="font-bold text-white text-md lg:text-lg">{p.name}</p>
                                                    <p className="text-xs text-slate-500 font-bold truncate max-w-[200px]">Farmer ID: {p.farmer?.name || 'Unknown'}</p>
                                                </td>
                                                <td className="p-5"><span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-black uppercase rounded-lg tracking-wider">{p.category}</span></td>
                                                <td className="p-5 text-emerald-400 font-black">₹{p.pricePerUnit} / {p.unit}</td>
                                                <td className="p-5 font-semibold text-slate-200">{p.availabilityQuantity} {p.unit} remaining</td>
                                                <td className="p-5 text-right">
                                                    <button
                                                        onClick={() => deleteProduct(p._id)}
                                                        disabled={productLoadingId === p._id}
                                                        className="px-3.5 py-2 text-xs font-black bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-xl transition uppercase tracking-wider cursor-pointer disabled:opacity-50"
                                                    >
                                                        {productLoadingId === p._id ? 'Purging...' : 'Delete'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* TAB CONTENT: USERS GRID */}
                    {activeTab === 'users' && (
                        <section className="bg-slate-900/40 border border-slate-800/60 p-8 lg:p-10 rounded-3xl backdrop-blur-md space-y-6">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-100">Global Customer & System User Grid</h2>
                                <p className="text-slate-400 text-sm lg:text-base font-medium mt-1">Provision account state switches, block users, or change parameters across global identities.</p>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/20">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-950/60 text-slate-400 text-xs font-black tracking-widest uppercase border-b border-slate-800">
                                            <th className="p-5">User Mapping Context</th>
                                            <th className="p-5">Identity Vector Schema</th>
                                            <th className="p-5">System Role Assignment</th>
                                            <th className="p-5">Account Node State</th>
                                            <th className="p-5 text-right">State Configuration Toggle</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 text-sm lg:text-base font-medium text-slate-300">
                                        {users.map((u) => (
                                            <tr key={u._id} className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-5 font-bold text-white text-md lg:text-lg">{u.name}</td>
                                                <td className="p-5 text-slate-400 font-semibold">{u.email}</td>
                                                <td className="p-5">
                                                    <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-lg tracking-wider border ${u.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : u.role === 'farmer' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    {u.status === 'suspended' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-500/10 border border-red-500/20 text-red-400 uppercase tracking-wider">
                                                            Suspended
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-5 text-right">
                                                    <button
                                                        onClick={() => toggleUserStatus(u._id)}
                                                        disabled={userLoadingId === u._id}
                                                        className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition cursor-pointer disabled:opacity-50 ${u.status === 'suspended' ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'}`}
                                                    >
                                                        {userLoadingId === u._id ? 'Altering Parameter...' : u.status === 'suspended' ? 'Activate Account' : 'Suspend Node'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </main>
            </div>
            {deleteModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

                    <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md p-8">

                        <div className="text-center">

                            <div className="text-6xl mb-4">
                                🗑️
                            </div>

                            <h2 className="text-2xl font-black text-white mb-3">
                                Delete Product?
                            </h2>

                            <p className="text-slate-300 leading-relaxed">
                                This action will permanently remove this product from the marketplace.
                            </p>

                            <p className="text-red-400 text-sm mt-4 font-semibold">
                                This action cannot be undone.
                            </p>

                            <div className="mt-8 flex gap-3">

                                <button
                                    onClick={() => {
                                        setDeleteModal(false);
                                        setProductToDelete(null);
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={confirmDeleteProduct}
                                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}
            {demoModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

                    <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md p-8">

                        <div className="text-center">

                            <div className="text-6xl mb-4">
                                🛡️
                            </div>

                            <h2 className="text-2xl font-black text-white mb-3">
                                Demo Account
                            </h2>

                            <p className="text-slate-300 leading-relaxed">
                                {demoMessage}
                            </p>

                            <p className="text-slate-500 text-sm mt-4">
                                You can freely explore every page and feature,
                                but actions that modify data are disabled to
                                preserve the public demo environment.
                            </p>

                            <button
                                onClick={() => setDemoModal(false)}
                                className="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition"
                            >
                                Got it
                            </button>

                        </div>

                    </div>

                </div>
            )}
            <Footer />
        </div>
    );
};

export default AdminDashboard;