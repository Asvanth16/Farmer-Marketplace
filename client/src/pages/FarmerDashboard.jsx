import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from "../components/Footer";
import api from "../api/axios";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    LabelList
} from 'recharts';
import {
    PlusCircle,
    Sprout,
    Package,
    DollarSign,
    MapPin,
    LogOut,
    X,
    Trash2,
    Sparkles,
    Loader,
    TrendingUp,
    Clock,
    CheckCircle2,
    Truck,
    ClipboardList,
    BarChart3
} from 'lucide-react';

function FarmerDashboard() {
    const { user, logout, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const isDemoFarmer =
        localStorage.getItem("isDemo") === "true" &&
        localStorage.getItem("role") === "farmer";

    // 🌟 UPDATED: Active tab state now supports three independent full-screen layout paths
    const [activeTab, setActiveTab] = useState('inventory');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
    const [listings, setListings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
    const [demoModal, setDemoModal] = useState(false);
    const [demoMessage, setDemoMessage] = useState("");

    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');

    // Dynamic Live Analytics States
    const [revenueData, setRevenueData] = useState([]);
    const [topCropsData, setTopCropsData] = useState([]);

    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        dispatchedOrders: 0,
        weeklyRevenue: 0
    });

    // Crop Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Vegetables');
    const [pricePerUnit, setPricePerUnit] = useState('');
    const [unit, setUnit] = useState('kg');
    const [availabilityQuantity, setAvailabilityQuantity] = useState('');
    const [harvestDate, setHarvestDate] = useState('');
    const [isOrganic, setIsOrganic] = useState(false);

    const uploadConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    };

    const fetchDashboardData = async () => {
        try {
            const [inventoryRes, statsRes] = await Promise.all([
                api.get('/api/products/my-inventory'),
                api.get('/api/orders/farmer-stats')
            ]);

            setListings(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);

            if (statsRes.data) {
                const receivedOrders = Array.isArray(statsRes.data)
                    ? statsRes.data
                    : (statsRes.data.orders || statsRes.data.allOrders || []);

                // Sort newest first
                const sortedOrders = [...receivedOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                const weeklyRevenue = sortedOrders
                    .filter(order => order.status === 'Delivered' && new Date(order.createdAt) >= oneWeekAgo)
                    .reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || order.amount || 0), 0);

                setOrders(sortedOrders);

                setStats({
                    totalOrders: sortedOrders.length,
                    pendingOrders: sortedOrders.filter(order => order.status === 'Pending' || order.status === 'pending').length,
                    dispatchedOrders: sortedOrders.filter(order => order.status === 'Dispatched' || order.status === 'dispatched').length,
                    weeklyRevenue
                });

                // ==========================================
                // 📊 1. REVENUE TIMELINE GENERATOR
                // ==========================================
                const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dailyRevenueMap = {};

                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    dailyRevenueMap[daysOfWeek[d.getDay()]] = 0;
                }

                sortedOrders.forEach(order => {
                    const orderStatus = order.status ? order.status.toLowerCase() : '';
                    if (orderStatus === 'delivered' || orderStatus === 'accepted' || orderStatus === 'dispatched') {
                        const orderDate = new Date(order.createdAt || order.date);
                        if (!isNaN(orderDate.getTime())) {
                            const dayName = daysOfWeek[orderDate.getDay()];
                            if (dailyRevenueMap[dayName] !== undefined) {
                                const numericPrice = Number(order.totalPrice || order.totalAmount || order.amount || 0);
                                dailyRevenueMap[dayName] += numericPrice;
                            }
                        }
                    }
                });

                const formattedRevenue = Object.keys(dailyRevenueMap).map(day => ({
                    day,
                    revenue: dailyRevenueMap[day]
                }));

                setRevenueData(formattedRevenue);

                // ==========================================
                // 📊 2. TOP SELLING CROPS GENERATOR
                // ==========================================
                const cropSalesMap = {};

                sortedOrders.forEach(order => {
                    const orderStatus = order.status ? order.status.toLowerCase() : '';
                    if (orderStatus !== 'rejected' && orderStatus !== 'cancelled') {
                        const itemsList = order.items || order.products || [];

                        if (Array.isArray(itemsList)) {
                            itemsList.forEach(item => {
                                const cName = item.product?.name || item.name || item.productName || 'Yield Crop';
                                const quantity = Number(item.quantity || item.qty || 0);
                                cropSalesMap[cName] = (cropSalesMap[cName] || 0) + quantity;
                            });
                        } else if (order.productName) {
                            const quantity = Number(order.quantity || order.qty || 1);
                            cropSalesMap[order.productName] = (cropSalesMap[order.productName] || 0) + quantity;
                        }
                    }
                });

                const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
                const formattedTopCrops = Object.keys(cropSalesMap)
                    .map((name, idx) => ({
                        name,
                        value: cropSalesMap[name],
                        color: chartColors[idx % chartColors.length]
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                setTopCropsData(formattedTopCrops);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setIsPageLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(() => { fetchDashboardData(); }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        if (logout) logout();
        navigate('/login');
    };

    const showDemoModal = (message) => {
        setDemoMessage(message);
        setDemoModal(true);
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        if (isDemoFarmer) {
            showDemoModal("Order management actions are disabled in the public demo.");
            return;
        }
        try {
            await api.put(`/api/orders/${orderId}`, { status: newStatus });
            await fetchDashboardData();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (isDemoFarmer) {
            showDemoModal("Adding and editing products are disabled in the public demo.");
            return;
        }
        setIsSubmitting(true);
        setFormError('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('pricePerUnit', Number(pricePerUnit));
        formData.append('unit', unit);
        formData.append('availabilityQuantity', Number(availabilityQuantity));
        formData.append('harvestDate', harvestDate || new Date());
        formData.append('isOrganic', isOrganic);

        if (selectedImage) formData.append('image', selectedImage);
        if (removeCurrentImage) formData.append('removeImage', 'true');

        try {
            if (editingProduct) {
                await api.put(`/api/products/${editingProduct._id}`, formData, uploadConfig);
            } else {
                await api.post('/api/products', formData, uploadConfig);
            }
            await fetchDashboardData();
            setIsModalOpen(false);
            setEditingProduct(null);
            setName('');
            setPricePerUnit('');
            setAvailabilityQuantity('');
            setHarvestDate('');
            setIsOrganic(false);
            setSelectedImage(null);
            setPreviewImage('');
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to publish item.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setName(product.name);
        setCategory(product.category);
        setPricePerUnit(product.pricePerUnit);
        setUnit(product.unit);
        setAvailabilityQuantity(product.availabilityQuantity);
        setHarvestDate(product.harvestDate ? product.harvestDate.split('T')[0] : '');
        setIsOrganic(product.isOrganic);
        setPreviewImage(product.imageUrl || '');
        setRemoveCurrentImage(false);
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (id) => {
        if (isDemoFarmer) {
            showDemoModal("Deleting products is disabled in the public demo.");
            return;
        }
        try {
            await api.delete(`/api/products/${id}`);
            await fetchDashboardData();
        } catch (err) {
            console.error(err);
        }
    };

    const maxRevenueValue = revenueData.length > 0 ? Math.max(...revenueData.map(d => Number(d.revenue || 0))) : 0;
    const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
    const totalOrdersCount = orders.length;

    if (isPageLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
                <Loader className="h-10 w-10 text-emerald-500 animate-spin" />
                <p className="text-base font-semibold text-slate-400">Loading your farm operations...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans antialiased text-slate-200 text-sm">

            {/* COMPACT NAVBAR */}
            <nav className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <Sprout className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-white">
                        AgriMarket <span className="text-emerald-400 hidden sm:inline text-xs font-semibold ml-2 px-2 py-0.5 bg-slate-800 rounded">Farmer Portal</span>
                    </span>
                </div>

                {/* Navbar Desktop Tabs */}
                <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-0 ${activeTab === 'inventory' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white bg-transparent'}`}
                    >
                        <Package className="h-3.5 w-3.5" /> Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-0 relative ${activeTab === 'orders' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white bg-transparent'}`}
                    >
                        <ClipboardList className="h-3.5 w-3.5" /> Orders
                        {pendingOrdersCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full">
                                {pendingOrdersCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`lg:hidden px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-0 ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white bg-transparent'}`}
                    >
                        <BarChart3 className="h-3.5 w-3.5" /> Analytics
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 border-r border-slate-800 pr-4">
                        <div className="h-7 w-7 bg-emerald-950 rounded-full flex items-center justify-center font-bold text-xs border border-emerald-800 text-emerald-400 uppercase">
                            {user?.name ? user.name[0] : 'F'}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-slate-200">{user?.name || 'Farmer Workspace'}</p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> {user?.farmDetails?.location || 'Coimbatore'}</p>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white font-semibold text-xs cursor-pointer transition-all">
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </nav>

            {/* CORE WORKSPACE GRID */}
            <main className="flex-1 py-4 px-4 max-w-[1600px] w-full mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-start">

                    {/* DESKTOP LEFT SIDEBAR: FIXED REVENUE ANALYSIS */}
                    <div className="hidden lg:flex bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-col justify-between lg:col-span-2 lg:sticky lg:top-20 h-[340px]">
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Financial Insights</span>
                            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                                Revenue Curve <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </h2>
                            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900 mt-1 inline-block"> Peak: ₹{maxRevenueValue}</span>
                        </div>

                        <div className="w-full h-[220px] text-[10px] font-medium mt-2">
                            {revenueData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-500">No data records.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="curveRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                        <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#64748b" />
                                        <YAxis tickLine={false} axisLine={false} stroke="#64748b" tickFormatter={(v) => `₹${v}`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.5rem', border: '1px solid #334155', color: '#fff', fontSize: '11px' }} />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#curveRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* MIDDLE SPACE LAYER CONTAINER */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* COMPACT GREETING BANNER */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                            <div>
                                <h1 className="text-lg font-black text-slate-100 flex items-center gap-1.5">
                                    Vanakkam, {user?.name || 'Farmer'}! <Sparkles className="h-4 w-4 text-amber-400" />
                                </h1>
                                <p className="text-xs text-slate-400 mt-0.5">Manage live products, fulfill incoming retail customer orders, and track metrics dashboards.</p>
                            </div>
                            <div className="flex gap-2 text-xs">
                                <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold text-slate-300">🌾 {listings.length} Crops</div>
                                <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold text-slate-300">📦 {stats.totalOrders} Orders</div>
                            </div>
                        </div>

                        {/* COMPACT METRICS GRID */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Total Orders</span>
                                <h3 className="text-xl font-bold text-white mt-1">{stats.totalOrders}</h3>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">Pending</span>
                                <h3 className="text-xl font-bold text-amber-400 mt-1">{stats.pendingOrders}</h3>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">Dispatched</span>
                                <h3 className="text-xl font-bold text-blue-400 mt-1">{stats.dispatchedOrders}</h3>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">Weekly Net</span>
                                <h3 className="text-xl font-bold text-emerald-400 mt-1">₹{stats.weeklyRevenue}</h3>
                            </div>
                        </div>

                        {/* WORKSPACE SELECTION TABS (DYNAMIC THREE-BUTTON PIPELINE ON MOBILE VIEWPORTS) */}
                        <div className="flex border-b border-slate-800 gap-1 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
                            <button onClick={() => setActiveTab('inventory')} className={`pb-2 px-3 sm:px-4 font-bold bg-transparent border-0 cursor-pointer transition-all ${activeTab === 'inventory' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-400'}`}>
                                Live Inventory
                            </button>
                            <button onClick={() => setActiveTab('orders')} className={`pb-2 px-3 sm:px-4 font-bold bg-transparent border-0 cursor-pointer transition-all ${activeTab === 'orders' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-400'}`}>
                                Customer Orders ({totalOrdersCount})
                            </button>
                            <button onClick={() => setActiveTab('analytics')} className={`md:hidden pb-2 px-3 sm:px-4 font-bold bg-transparent border-0 cursor-pointer transition-all ${activeTab === 'analytics' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-400'}`}>
                                Analytics Feed
                            </button>
                        </div>

                        {/* TAB SYSTEM CONDITIONAL CONTENT INTERPRETER */}
                        {activeTab === 'inventory' && (
                            /* COMPACT CROPS LIST INVENTORY */
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Crop Catalog Listings</h2>
                                    <button onClick={() => { setEditingProduct(null); setName(''); setPricePerUnit(''); setAvailabilityQuantity(''); setHarvestDate(''); setIsOrganic(false); setSelectedImage(null); setPreviewImage(''); setIsModalOpen(true); }} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer border-0">
                                        <PlusCircle className="h-3.5 w-3.5" /> Add New Crop
                                    </button>
                                </div>

                                {listings.length === 0 ? (
                                    <div className="p-12 text-center font-medium text-slate-500">Your inventory pipeline is blank. Click add crop above to update.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-950/20 text-slate-400 font-bold border-b border-slate-800">
                                                    <th className="py-2.5 px-4">Name</th>
                                                    <th className="py-2.5 px-4">Stock</th>
                                                    <th className="py-2.5 px-4">Price</th>
                                                    <th className="py-2.5 px-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                                                {listings.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                                        <td className="py-2.5 px-4 font-bold text-slate-200">{item.name} <span className="text-[10px] text-emerald-400 font-normal ml-1">{item.isOrganic ? '• Organic' : ''}</span></td>
                                                        <td className="py-2.5 px-4 font-mono">{item.availabilityQuantity} {item.unit}</td>
                                                        <td className="py-2.5 px-4 text-emerald-400 font-semibold">₹{item.pricePerUnit}/{item.unit}</td>
                                                        <td className="py-2.5 px-4 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <button onClick={() => handleEditClick(item)} className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/10 hover:bg-blue-600 hover:text-white transition-all text-[11px] font-semibold">Edit</button>
                                                                <button onClick={() => setDeleteModal({ isOpen: true, productId: item._id })} className="p-1 text-slate-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            /* COMPACT ORDERS SHEET */
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                {orders.length === 0 ? (
                                    <div className="p-12 text-center font-medium text-slate-500">No incoming dynamic order requests.</div>
                                ) : (
                                    <>
                                        {/* Desktop Viewports */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase border-b border-slate-800">
                                                        <th className="py-2.5 px-4">Summary</th>
                                                        <th className="py-2.5 px-4">Buyer</th>
                                                        <th className="py-2.5 px-4">Status</th>
                                                        <th className="py-2.5 px-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                                                    {orders.map((order, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                                            <td className="py-3 px-4">
                                                                <p className="font-bold text-slate-200">{order.items?.map(i => i.product?.name).join(', ')}</p>
                                                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">#{String(order._id).slice(-6)}</p>
                                                            </td>
                                                            <td className="py-3 px-4 text-slate-300">{order.buyerName || order.buyer?.name || 'Buyer'}</td>
                                                            <td className="py-3 px-4">
                                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${order.status === 'Pending' ? 'bg-amber-950 text-amber-400 border border-amber-900' : order.status === 'Accepted' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-blue-950 text-blue-400 border border-blue-900'}`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <button onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-[11px] font-semibold cursor-pointer">View</button>
                                                                    {order.status === 'Pending' && (
                                                                        <>
                                                                            <button onClick={() => handleUpdateOrderStatus(order._id, 'Accepted')} className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded text-[11px] font-bold border border-emerald-500/20 cursor-pointer">Accept</button>
                                                                            <button onClick={() => handleUpdateOrderStatus(order._id, 'Rejected')} className="px-2 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded text-[11px] font-bold border border-red-500/20 cursor-pointer">Reject</button>
                                                                        </>
                                                                    )}
                                                                    {order.status === 'Accepted' && (
                                                                        <button onClick={() => handleUpdateOrderStatus(order._id, 'Dispatched')} className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded text-[11px] font-bold border border-blue-500/20 cursor-pointer">Dispatch</button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Responsive Small Mobile Viewports */}
                                        <div className="md:hidden space-y-3 p-3">
                                            {orders.map((order, index) => (
                                                <div key={index} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex flex-col gap-2">
                                                    <div className="flex justify-between items-start font-bold">
                                                        <div className="max-w-[70%]">
                                                            <span className="text-slate-200 block truncate">{order.items?.map(i => i.product?.name).join(", ")}</span>
                                                            <span className="text-[10px] text-slate-500 font-mono block font-normal">#{String(order._id).slice(-6)}</span>
                                                        </div>
                                                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${order.status === 'Pending' ? 'bg-amber-950 text-amber-400 border border-amber-900' : order.status === 'Accepted' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-blue-950 text-blue-400 border border-blue-900'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center text-slate-400 mt-1 border-t border-slate-900 pt-2">
                                                        <div>
                                                            <p className="text-[10px] text-slate-500">Total Invoice</p>
                                                            <span className="text-emerald-400 font-bold">₹{order.totalAmount || order.totalPrice}</span>
                                                        </div>
                                                        <button onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }} className="text-blue-400 font-semibold px-2 py-1 hover:bg-slate-900 rounded cursor-pointer">Manage</button>
                                                    </div>

                                                    {/* Mobile Quick Action Buttons Row */}
                                                    <div className="flex gap-1.5 mt-1 pt-2 border-t border-slate-900/60">
                                                        {order.status === 'Pending' && (
                                                            <>
                                                                <button onClick={() => handleUpdateOrderStatus(order._id, 'Accepted')} className="flex-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg font-bold border border-emerald-500/20 cursor-pointer text-center text-xs">Accept</button>
                                                                <button onClick={() => handleUpdateOrderStatus(order._id, 'Rejected')} className="flex-1 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg font-bold border border-red-500/20 cursor-pointer text-center text-xs">Reject</button>
                                                            </>
                                                        )}
                                                        {order.status === 'Accepted' && (
                                                            <button onClick={() => handleUpdateOrderStatus(order._id, 'Dispatched')} className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg font-bold border border-blue-500/20 cursor-pointer text-center text-xs">Dispatch Order</button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* 📱 MOBILE EXCLUSIVE ANALYTICS VIEW PORTAL LAYER */}
                        {activeTab === 'analytics' && (
                            <div className="md:hidden space-y-4">
                                {/* Revenue Module Card */}
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-[300px]">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Financial Insights</span>
                                        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                                            Revenue Curve <TrendingUp className="h-4 w-4 text-emerald-400" />
                                        </h2>
                                        <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900 mt-1 inline-block"> Peak: ₹{maxRevenueValue}</span>
                                    </div>
                                    <div className="w-full h-[180px] text-[10px] font-medium mt-2">
                                        {revenueData.length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-slate-500">No data records.</div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="curveRevMobile" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                                    <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#64748b" />
                                                    <YAxis tickLine={false} axisLine={false} stroke="#64748b" tickFormatter={(v) => `₹${v}`} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.5rem', border: '1px solid #334155', color: '#fff', fontSize: '11px' }} />
                                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#curveRevMobile)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>

                                {/* Top Selling Crops Card */}
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-[300px]">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Demand Metrics</span>
                                        <h2 className="text-sm font-bold text-slate-200 mt-0.5">🏆 Top Selling Yields</h2>
                                    </div>
                                    <div className="w-full h-[200px] text-[10px] font-semibold mt-2">
                                        {topCropsData.length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-slate-500">No chart data.</div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={topCropsData} margin={{ top: 15, right: 5, left: -25, bottom: 5 }} barCategoryGap="20%">
                                                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 5 ? `${val.substring(0, 5)}.` : val} />
                                                    <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: "11px" }} />
                                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={18}>
                                                        <LabelList dataKey="value" position="top" fill="#fff" fontSize={9} fontWeight="bold" />
                                                        {topCropsData.map((entry, index) => <Cell key={index} fill={entry.color || "#10B981"} />)}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DESKTOP RIGHT SIDEBAR: FIXED TOP CROPS BAR CHART */}
                    <div className="hidden lg:flex bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-col justify-between lg:col-span-2 lg:sticky lg:top-20 h-[340px]">
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Demand Metrics</span>
                            <h2 className="text-sm font-bold text-slate-200 mt-0.5">🏆 Top Selling Yields</h2>
                        </div>

                        <div className="w-full h-[240px] text-[10px] font-semibold mt-2">
                            {topCropsData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-500">No chart data.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topCropsData} margin={{ top: 15, right: 5, left: -25, bottom: 5 }} barCategoryGap="20%">
                                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 7 ? `${val.substring(0, 7)}.` : val} />
                                        <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: "11px" }} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                                            <LabelList dataKey="value" position="top" fill="#fff" fontSize={9} fontWeight="bold" />
                                            {topCropsData.map((entry, index) => <Cell key={index} fill={entry.color || "#10B981"} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {/* MODAL INPUT PIPELINE FORMS */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 w-full max-w-md rounded-xl border border-slate-800 flex flex-col max-h-[90vh] shadow-xl">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-1.5"><PlusCircle className="h-4 w-4 text-blue-400" /> {editingProduct ? 'Modify Listing' : 'New Listing'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"><X className="h-4 w-4" /></button>
                        </div>

                        <form onSubmit={handleAddProduct} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
                            {formError && <div className="p-2 bg-red-950/60 border border-red-900 text-red-400 rounded-lg">{formError}</div>}

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Crop / Product Name</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ooty Carrots" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-medium focus:outline-none focus:border-blue-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-medium cursor-pointer">
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Fruits">Fruits</option>
                                        <option value="Grains">Grains</option>
                                        <option value="Dairy">Dairy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit</label>
                                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-medium cursor-pointer">
                                        <option value="kg">kg</option>
                                        <option value="liter">Liters</option>
                                        <option value="bunch">Bunch</option>
                                        <option value="unit">Piece</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Stock</label>
                                    <input type="number" required min="0" value={availabilityQuantity} onChange={(e) => setAvailabilityQuantity(e.target.value)} placeholder="e.g. 100" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Price per Unit (₹)</label>
                                    <input type="number" required min="0" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} placeholder="e.g. 50" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-medium" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Harvest Date</label>
                                <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-medium cursor-pointer" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Media Attachment</label>
                                <input type="file" accept="image/*" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    setSelectedImage(file);
                                    setPreviewImage(URL.createObjectURL(file));
                                    setRemoveCurrentImage(false);
                                }} className="w-full text-slate-400 text-[11px]" />
                                {previewImage && (
                                    <div className="mt-2 relative h-20 w-full rounded-lg overflow-hidden border border-slate-700">
                                        <img src={previewImage} alt="preview" className="h-full w-full object-cover" />
                                        <button type="button" onClick={() => { setPreviewImage(''); setSelectedImage(null); setRemoveCurrentImage(true); }} className="absolute bottom-1 right-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">Remove</button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 p-2 rounded-lg border border-emerald-800/60 bg-emerald-950/20">
                                <input type="checkbox" id="org" checked={isOrganic} onChange={(e) => setIsOrganic(e.target.checked)} className="cursor-pointer" />
                                <label htmlFor="org" className="text-[11px] text-slate-300 font-semibold cursor-pointer select-none">Certified 100% Organic cultivated parameters.</label>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 font-bold bg-transparent border-0 cursor-pointer">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 border-0 cursor-pointer">
                                    {isSubmitting && <Loader className="h-3 w-3 animate-spin" />}
                                    <span>{editingProduct ? 'Update Listing' : 'Publish Yield'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL FEEDS */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl max-w-xs w-full text-center">
                        <h3 className="text-base font-bold text-white mb-2">Delete Crop Listing?</h3>
                        <p className="text-xs text-slate-400 mb-4">This action cannot be undone and deletes it from global search feeds.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setDeleteModal({ isOpen: false, productId: null })} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg border-0 cursor-pointer">Cancel</button>
                            <button onClick={() => { handleDeleteProduct(deleteModal.productId); setDeleteModal({ isOpen: false, productId: null }); }} className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg border-0 cursor-pointer">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ORDER PROFILE DISPLAY MODAL */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl text-xs">
                        <div className="flex justify-between items-center p-4 border-b border-slate-800">
                            <h2 className="text-sm font-bold text-white">Order Analysis Pipeline</h2>
                            <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer">✕</button>
                        </div>
                        <div className="p-4 space-y-3 font-medium">
                            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 space-y-1.5">
                                <h3 className="text-emerald-400 font-bold mb-1">Customer Delivery Meta</h3>
                                <p><span className="text-slate-400">Buyer:</span> {selectedOrder.buyerName || selectedOrder.buyer?.name || 'Customer'}</p>
                                <p><span className="text-slate-400">Address:</span> {selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city}</p>

                                <p>
                                    <span className="text-slate-400">Ordered Date:</span>{' '}
                                    <span className="text-slate-200">
                                        {selectedOrder.createdAt
                                            ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : 'N/A'
                                        }
                                    </span>
                                </p>

                                <p>
                                    <span className="text-slate-400">Delivery Slot:</span>{' '}
                                    <span className="text-amber-400 font-semibold">
                                        {selectedOrder.deliverySlot || 'Standard Delivery (Flexible Time)'}
                                    </span>
                                </p>

                                <p className="mt-1"><span className="text-slate-400">Current Status:</span> <span className="text-amber-400 font-bold">{selectedOrder.status}</span></p>
                            </div>

                            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                                <h3 className="text-emerald-400 font-bold mb-1">Yield Metrics</h3>
                                {selectedOrder.items?.map((item, index) => (
                                    <div key={index} className="flex justify-between border-b border-slate-800 py-1 last:border-none">
                                        <span>{item.product?.name || 'Product'}</span>
                                        <span>{item.quantity} {item.product?.unit || 'kg'}</span>
                                    </div>
                                ))}
                                <p className="mt-2 pt-1 border-t border-slate-800 text-right font-bold text-emerald-400">Total Invoice: ₹{selectedOrder.totalAmount || selectedOrder.totalPrice}</p>
                            </div>

                            <div className="pt-2 flex gap-2">
                                {selectedOrder.status === 'Pending' && (
                                    <>
                                        <button onClick={() => { handleUpdateOrderStatus(selectedOrder._id, 'Accepted'); setShowOrderModal(false); }} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg border-0 cursor-pointer">Accept Order</button>
                                        <button onClick={() => { handleUpdateOrderStatus(selectedOrder._id, 'Rejected'); setShowOrderModal(false); }} className="flex-1 py-2 bg-red-650 hover:bg-red-700 text-white font-bold rounded-lg border-0 cursor-pointer">Reject Order</button>
                                    </>
                                )}
                                {selectedOrder.status === 'Accepted' && (
                                    <button onClick={() => { handleUpdateOrderStatus(selectedOrder._id, 'Dispatched'); setShowOrderModal(false); }} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg border-0 cursor-pointer">Dispatch Order</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DEMO SATELLITE GATEWAY PROTECTION PORT MODAL */}
            {demoModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xs w-full p-5 text-center text-xs">
                        <div className="text-3xl mb-2">🌾</div>
                        <h2 className="text-sm font-bold text-white mb-1">Demo Farmer</h2>
                        <p className="text-slate-300 leading-relaxed">{demoMessage}</p>
                        <p className="text-slate-500 mt-2">Exploration access is complete, but write transactions are limited to maintain server states.</p>
                        <button onClick={() => setDemoModal(false)} className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg border-0 cursor-pointer">Acknowledge</button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default FarmerDashboard;