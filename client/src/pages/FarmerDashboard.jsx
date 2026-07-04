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
    Award,
    ShoppingBag,
    Clock,
    CheckCircle2,
    Truck,
    ClipboardList
} from 'lucide-react';

function FarmerDashboard() {
    const { user, logout, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const isDemoFarmer =
        localStorage.getItem("isDemo") === "true" &&
        localStorage.getItem("role") === "farmer";

    // 🌟 FIX: Added tab toggle state ('inventory' vs 'orders') to fix navigation
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
                api.get(
                    '/api/products/my-inventory',
                ),
                api.get(
                    '/api/orders/farmer-stats',
                )
            ]);

            setListings(Array.isArray(inventoryRes.data)
                ? inventoryRes.data
                : []);

            // Inside fetchDashboardData ...
            if (statsRes.data) {
                // 1. Get the orders array from response
                const receivedOrders = statsRes.data.orders || [];

                // 2. Sort orders from latest to oldest (Newest date first)
                const sortedOrders = [...receivedOrders].sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                const weeklyRevenue = sortedOrders // Using sorted orders here
                    .filter(order => {
                        return (
                            order.status === 'Delivered' &&
                            new Date(order.createdAt) >= oneWeekAgo
                        );
                    })
                    .reduce((sum, order) => {
                        return sum + (order.totalPrice || 0);
                    }, 0);

                // 3. Update state with the sorted list
                setOrders(sortedOrders);

                setStats({
                    totalOrders: sortedOrders.length,

                    pendingOrders: sortedOrders.filter(
                        order => order.status === 'Pending'
                    ).length,

                    dispatchedOrders: sortedOrders.filter(
                        order => order.status === 'Dispatched'
                    ).length,

                    weeklyRevenue
                });
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setIsPageLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        const interval = setInterval(() => {
            fetchDashboardData();
        }, 10000);

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
            showDemoModal(
                "Order management actions are disabled in the public demo."
            );
            return;
        }
        try {

            await api.put(
                `/api/orders/${orderId}`,
                { status: newStatus },
            );
            await fetchDashboardData();
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Update failed. Check your network console for details.');
        }
    };

    const handleAddProduct = async (e) => {

        e.preventDefault();
        if (isDemoFarmer) {
            showDemoModal(
                "Adding and editing products are disabled in the public demo."
            );
            return;
        }
        setIsSubmitting(true);
        setFormError('');

        const formData = new FormData();

        formData.append('name', name);
        formData.append('category', category);
        formData.append('pricePerUnit', Number(pricePerUnit));
        formData.append('unit', unit);
        formData.append(
            'availabilityQuantity',
            Number(availabilityQuantity)
        );
        formData.append(
            'harvestDate',
            harvestDate || new Date()
        );
        formData.append('isOrganic', isOrganic);

        if (selectedImage) {
            formData.append('image', selectedImage);
        }
        if (removeCurrentImage) {
            formData.append('removeImage', 'true');
        }

        try {
            if (editingProduct) {
                await api.put(
                    `/api/products/${editingProduct._id}`,
                    formData,
                    uploadConfig
                );
            } else {
                await api.post(
                    '/api/products',
                    formData,
                    uploadConfig
                );
            }
            await fetchDashboardData();

            setIsModalOpen(false);
            setEditingProduct(null);

            setName('');
            setCategory('Vegetables');
            setPricePerUnit('');
            setUnit('kg');
            setAvailabilityQuantity('');
            setHarvestDate('');
            setIsOrganic(false);

            // Clear image state
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
        setHarvestDate(
            product.harvestDate
                ? product.harvestDate.split('T')[0]
                : ''
        );
        setIsOrganic(product.isOrganic);
        setPreviewImage(product.imageUrl || '');

        setRemoveCurrentImage(false);
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (id) => {
        if (isDemoFarmer) {
            showDemoModal(
                "Deleting products is disabled in the public demo."
            );
            return;
        }
        try {
            await api.delete(`/api/products/${id}`);
            await fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error executing delete procedure.');
        }
    };

    const maxRevenueValue = revenueData.length > 0
        ? Math.max(...revenueData.map(d => Number(d.revenue || 0)))
        : 0;

    // 🌟 FIX: Updated filter to count 'Accepted' and 'Dispatched' as part of your active/pending workflow
    const pendingOrdersCount = orders.filter(
        o => o.status === 'Pending'
    ).length;
    const totalOrdersCount = orders.length;

    if (isPageLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-6">
                <Loader className="h-16 w-16 text-emerald-500 animate-spin" />
                <p className="text-2xl font-black text-slate-300">Loading your farm operations...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans antialiased text-slate-100 text-lg">

            {/* NAVBAR */}
            <nav className="bg-slate-900 text-white px-4 sm:px-6 lg:px-10 py-4 lg:py-6 flex items-center justify-between shadow-xl border-b border-slate-800 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <Sprout className="h-5 w-5 lg:h-9 lg:w-9 text-emerald-400 fill-emerald-400/20" />
                    </div>
                    <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-white">
                        AgriMarket <span className="text-emerald-400 hidden lg:inline text-xs sm:text-sm font-bold tracking-widest uppercase ml-3 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">Farmer Portal</span>
                    </span>
                </div>

                {/* Navbar Switch Tabs */}
                <div className="hidden md:flex lg:flex items-center gap-4 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 py-2 rounded-lg text-lg font-bold flex items-center gap-2 transition-all cursor-pointer border-0 ${activeTab === 'inventory' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white bg-transparent'}`}
                    >
                        <Package className="h-4 w-4" /> My Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-lg text-lg font-bold flex items-center gap-2 transition-all cursor-pointer border-0 relative ${activeTab === 'orders' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white bg-transparent'}`}
                    >
                        <ClipboardList className="h-4 w-4" /> Customer Orders
                        {pendingOrdersCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black h-4 w-4 flex items-center justify-center rounded-full shadow-md">
                                {pendingOrdersCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-4 border-r border-slate-800 pr-8">
                        <div className="h-10 w-10 lg:h-14 lg:w-14 bg-emerald-950 rounded-full flex items-center justify-center font-black text-lg lg:text-2xl xl:text-3xl border border-emerald-800 uppercase text-emerald-400">
                            {user?.name ? user.name[0] : 'F'}
                        </div>
                        <div className="text-left">
                            <p className="text-lg lg:text-2xl xl:text-3xl font-black leading-none text-slate-100">{user?.name || 'Farmer Workspace'}</p>
                            <p className="text-md lg:text-xl text-emerald-400 font-bold mt-1.5 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" /> {user?.farmDetails?.location || 'Coimbatore, TN'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white font-black text-base transition-all cursor-pointer shadow-md active:scale-95"
                    >
                        <LogOut className="h-5 w-5" />
                        <div className='text-xs lg:text-lg xl:text-xl'>Sign Out</div>
                    </button>
                </div>

            </nav>
            <div className="md:hidden px-4 py-3 bg-slate-900 border-b border-slate-800">

                <p className="text-sm text-slate-400">
                    <span className='text-slate-100'> {user?.name} </span> 📍 {user?.farmDetails?.location}
                </p>

            </div>

            {/* MAIN CONTAINER */}
            <main className="flex-1 py-10 px-4 xl:px-12 w-full mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-8 gap-8 items-start">

                    {/* FINANCIAL OVERVIEW */}
                    {/* FINANCIAL OVERVIEW */}
                    <div className="hidden lg:flex bg-slate-900 border-2 border-slate-800 p-6 rounded-[2rem] shadow-xl top-28 flex-col justify-between xl:col-span-2 xl:sticky xl:top-28 min-h-[400px] xl:min-h-[75vh]">
                        <div className="space-y-2">
                            <span className="text-xs font-black text-slate-500 tracking-widest uppercase block">Financial Overview</span>
                            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                                Daily Revenue <TrendingUp className="h-5 w-5 text-emerald-400" />
                            </h2>
                            <span className="inline-block bg-emerald-950 text-emerald-400 font-black px-3 py-1 mt-1 rounded-xl text-xl border border-emerald-900/60">
                                Max: ₹{maxRevenueValue.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <div className="w-full mt-8 h-[450px] text-xs font-bold">
                            {revenueData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-center font-bold text-slate-500 p-4">
                                    No financial records found.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenueSide" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                        <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#64748b" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                                        <YAxis tickLine={false} axisLine={false} stroke="#64748b" tickFormatter={(v) => `₹${v}`} style={{ fontSize: '11px', fontWeight: 'bold' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1rem', border: '1px solid #334155', color: '#fff', padding: '12px', fontSize: '14px' }}
                                            formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueSide)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* CENTER WORKSPACE */}
                    <div className="xl:col-span-4 space-y-12">

                        {/* BANNER */}
                        <div className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-10 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
                            <div className="space-y-3 relative z-10 max-w-3xl">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight flex items-center gap-3">
                                    Vanakkam, {user?.name || 'Farmer'}! <Sparkles className="h-9 w-9 text-amber-400 fill-amber-400/10" />
                                </h1>
                                <p className="text-slate-400 text-base lg:text-lg xl:text-xl font-bold leading-relaxed">
                                    Manage your agricultural yield, monitor retail order processing, and spin up new marketplace crop entries.
                                </p>
                                <div className="flex flex-wrap gap-3 mt-5">

                                    <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
                                        🌾 <span className="font-bold">{listings.length}</span> Listed Crops
                                    </div>

                                    <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
                                        📦 <span className="font-bold">{stats.totalOrders}</span> Orders
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* METRICS ROW */}
                        {/* METRICS ROW */}
                        <div className="
grid
grid-cols-2
xl:grid-cols-4

gap-3
sm:gap-4
xl:gap-8
">

                            <div className="
bg-slate-900
border-2
border-slate-800
rounded-2xl
p-4
sm:p-6
lg:p-8
">
                                <span className="text-[10px] sm:text-xs lg:text-sm font-black tracking-widest uppercase">
                                    Total Orders
                                </span>

                                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3">
                                    {stats.totalOrders}
                                </h3>
                            </div>

                            <div className="
bg-red-500/30
border-2
border-slate-800
rounded-2xl
p-4
sm:p-6
lg:p-8
">
                                <span className="text-[10px] sm:text-xs lg:text-sm font-black text-amber-300 tracking-widest uppercase">
                                    Pending
                                </span>

                                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-400 mt-3">
                                    {stats.pendingOrders}
                                </h3>
                            </div>

                            <div className="
bg-blue-500/30
border-2
border-slate-800
rounded-2xl
p-4
sm:p-6
lg:p-8
">
                                <span className="text-[10px] sm:text-xs lg:text-sm font-black text-blue-300 tracking-widest uppercase">
                                    Dispatched
                                </span>

                                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-400 mt-3">
                                    {stats.dispatchedOrders}
                                </h3>
                            </div>

                            <div className="
bg-emerald-500/30
border-2
border-slate-800
rounded-2xl
p-4
sm:p-6
lg:p-8
">
                                <span className="text-[10px] sm:text-xs lg:text-sm font-black text-emerald-300 tracking-widest uppercase">
                                    Weekly Revenue
                                </span>

                                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 mt-3">
                                    ₹{stats.weeklyRevenue.toLocaleString('en-IN')}
                                </h3>
                            </div>

                        </div>

                        {/* Tab Selection Buttons */}
                        <div className="flex border-b border-slate-800 gap-2">
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`pb-4 px-6 text-xl font-black transition-colors bg-transparent border-0 cursor-pointer ${activeTab === 'inventory' ? 'text-emerald-400 border-b-4 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Live Inventory
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`pb-4 px-6 text-xl font-black transition-colors bg-transparent border-0 cursor-pointer ${activeTab === 'orders' ? 'text-amber-400 border-b-4 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Received Customer Orders ({totalOrdersCount})
                            </button>
                        </div>

                        {/* 🌟 FIX: Added activeTab wrapper conditional to swap tables */}
                        {
                            activeTab === 'orders' ? (
                                /* RECEIVED ORDERS PANEL */
                                <div className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-xl overflow-hidden">
                                    <div className="p-8 border-b-2 border-slate-800 flex items-center justify-between bg-slate-900/50">
                                        <h2 className="text-2xl font-black text-slate-100 tracking-tight">Incoming Customer Orders</h2>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="p-24 text-center text-xl font-bold text-slate-500">
                                            No customer orders found in your incoming metrics data queue.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="hidden lg:block overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-850 text-slate-400 text-lg lg:text-xl font-black uppercase tracking-widest">
                                                            <th className="py-5 px-8 w-[25%]">Order Summary</th>
                                                            <th className="py-5 px-8 w-[15%]">Buyer</th>
                                                            <th className="py-5 px-8 w-[10%]">Volume</th>
                                                            <th className="py-5 px-8 w-[25%]">Delivery Address</th>
                                                            <th className="py-5 px-8 w-[15%]">Status</th>
                                                            <th className="py-5 px-8 w-[10%] text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y-2 divide-slate-800 text-sm lg:text-base font-bold text-slate-300">
                                                        {orders.map((order, idx) => (
                                                            <tr key={`${order._id || order.id}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                                                                <td className="py-6 px-8">
                                                                    <p className="text-xl lg:text-2xl font-black text-slate-100">
                                                                        {order.items
                                                                            ?.map(item => item.product?.name)
                                                                            .join(', ')}
                                                                    </p>

                                                                    <p className="text-lg text-slate-500 font-mono mt-2">
                                                                        ID: #{String(order._id).slice(-6)}
                                                                    </p>
                                                                </td>
                                                                <td className="py-5 px-6">
                                                                    <p className="text-slate-200 text-lg lg:text-xl">{order.buyerName || order.buyer?.name || 'Retail Buyer'}</p>
                                                                </td>
                                                                <td className="py-6 px-8 font-mono text-2xl text-slate-100 whitespace-nowrap">
                                                                    {order.items?.length} Items
                                                                </td>
                                                                <td className="py-6 px-8 text-lg lg:text-xl text-slate-300">
                                                                    <p className="max-w-[280px] truncate">
                                                                        {order.shippingAddress?.addressLine1 || 'No Address'}
                                                                    </p>
                                                                </td>
                                                                <td className="py-5 px-6">
                                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-md lg:text-md px-6 py-3 font-black tracking-wide uppercase ${order.status === 'Pending'
                                                                        ? 'bg-amber-950 text-amber-400 border border-amber-900/60'
                                                                        : order.status === 'Accepted'
                                                                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60'
                                                                            : order.status === 'Rejected'
                                                                                ? 'bg-red-950 text-red-400 border border-red-900/60'
                                                                                : order.status === 'Dispatched'
                                                                                    ? 'bg-blue-950 text-blue-400 border border-blue-900/60'
                                                                                    : order.status === 'Cancelled'
                                                                                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                                                                        : 'bg-emerald-950 text-emerald-400 border border-emerald-900/60'
                                                                        }`}>
                                                                        {order.status === 'Pending' &&
                                                                            <Clock className="h-3 w-3" />}

                                                                        {order.status === 'Accepted' &&
                                                                            <CheckCircle2 className="h-3 w-3" />}

                                                                        {order.status === 'Dispatched' &&
                                                                            <Truck className="h-3 w-3" />}

                                                                        {order.status === 'Delivered' &&
                                                                            <CheckCircle2 className="h-3 w-3" />}

                                                                        {order.status === 'Rejected' &&
                                                                            <X className="h-3 w-3" />}

                                                                        {order.status || 'Accepted'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-6 px-6">
                                                                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">

                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedOrder(order);
                                                                                setShowOrderModal(true);
                                                                            }}
                                                                            className="px-4 py-2 min-w-[90px] bg-slate-700 hover:bg-slate-600 text-white text-sm lg:text-base font-bold rounded-xl transition-all"
                                                                        >
                                                                            View
                                                                        </button>

                                                                        {order.status === 'Pending' && (

                                                                            <div className="flex gap-2">

                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleUpdateOrderStatus(
                                                                                            order._id,
                                                                                            'Accepted'
                                                                                        )
                                                                                    }
                                                                                    className="
            px-4 py-2
            bg-emerald-600/20
            hover:bg-emerald-600
            text-emerald-400
            hover:text-white
            border border-emerald-500/30
            rounded-xl
            font-black
        "
                                                                                >
                                                                                    Accept
                                                                                </button>

                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleUpdateOrderStatus(
                                                                                            order._id,
                                                                                            'Rejected'
                                                                                        )
                                                                                    }
                                                                                    className="
            px-4 py-2
            bg-red-600/20
            hover:bg-red-600
            text-red-400
            hover:text-white
            border border-red-500/30
            rounded-xl
            font-black
        "
                                                                                >
                                                                                    Reject
                                                                                </button>

                                                                            </div>

                                                                        )}

                                                                        {order.status === 'Accepted' && (

                                                                            <button
                                                                                onClick={() =>
                                                                                    handleUpdateOrderStatus(
                                                                                        order._id,
                                                                                        'Dispatched'
                                                                                    )
                                                                                }
                                                                                className="
        px-5 py-2
        min-w-[150px]
        bg-blue-600/20
        hover:bg-blue-600
        text-blue-400
        hover:text-white
        border border-blue-500/30
        rounded-xl
        font-black
    "
                                                                            >
                                                                                Dispatch Order
                                                                            </button>

                                                                        )}

                                                                        {(order.status === 'Dispatched' ||
                                                                            order.status === 'Shipped') && (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleUpdateOrderStatus(
                                                                                            order._id,
                                                                                            'Delivered'
                                                                                        )
                                                                                    }
                                                                                    className="px-5 py-2 min-w-[150px] bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-sm lg:text-base font-black rounded-xl transition-all"
                                                                                >
                                                                                    Complete Deliver
                                                                                </button>
                                                                            )}

                                                                        {order.status === 'Rejected' && (

                                                                            <span className="
text-red-400
font-bold
min-w-[150px]
text-center
">
                                                                                Rejected
                                                                            </span>

                                                                        )}

                                                                        {order.status === 'Delivered' && (
                                                                            <span className="text-sm text-slate-500 font-bold min-w-[150px] text-center">
                                                                                Closed
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Mobile Order Cards */}
                                            <div className="lg:hidden space-y-4 p-4">

                                                {orders.map((order, index) => (

                                                    <div
                                                        key={`${order._id}-${index}`}
                                                        className="bg-slate-800 rounded-2xl border border-slate-700 p-5"
                                                    >

                                                        {/* Header */}
                                                        <div className="flex justify-between items-start">

                                                            <div>
                                                                <h3 className="text-lg font-bold text-white">
                                                                    {order.items?.map(item => item.product?.name).join(", ")}
                                                                </h3>

                                                                <p className="text-sm text-slate-400 mt-1">
                                                                    #{String(order._id).slice(-6)}
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === "Pending"
                                                                    ? "bg-amber-900 text-amber-300"
                                                                    : order.status === "Accepted"
                                                                        ? "bg-emerald-900 text-emerald-300"
                                                                        : order.status === "Dispatched"
                                                                            ? "bg-blue-900 text-blue-300"
                                                                            : order.status === "Delivered"
                                                                                ? "bg-emerald-700 text-white"
                                                                                : order.status === "Rejected"
                                                                                    ? "bg-red-900 text-red-300"
                                                                                    : "bg-slate-700 text-slate-300"
                                                                    }`}
                                                            >
                                                                {order.status}
                                                            </span>

                                                        </div>

                                                        {/* Buyer */}

                                                        <div className="mt-5 space-y-2">

                                                            <p className="text-sm text-slate-400">
                                                                Buyer
                                                            </p>

                                                            <p className="text-white font-semibold">
                                                                {order.buyerName || order.buyer?.name || "Customer"}
                                                            </p>

                                                        </div>

                                                        {/* Address */}

                                                        <div className="mt-4">

                                                            <p className="text-sm text-slate-400">
                                                                Delivery Address
                                                            </p>

                                                            <p className="text-white">
                                                                {order.shippingAddress?.addressLine1}
                                                            </p>

                                                            <p className="text-slate-400 text-sm">
                                                                {order.shippingAddress?.city},{" "}
                                                                {order.shippingAddress?.state}
                                                            </p>

                                                        </div>

                                                        {/* Footer */}

                                                        <div className="grid grid-cols-2 gap-4 mt-5">

                                                            <div>

                                                                <p className="text-slate-400 text-sm">
                                                                    Items
                                                                </p>

                                                                <p className="text-white font-bold">
                                                                    {order.items?.length}
                                                                </p>

                                                            </div>

                                                            <div>

                                                                <p className="text-slate-400 text-sm">
                                                                    Amount
                                                                </p>

                                                                <p className="text-emerald-400 font-bold">
                                                                    ₹{order.totalAmount || order.totalPrice}
                                                                </p>

                                                            </div>

                                                        </div>

                                                        {/* Buttons */}

                                                        <div className="mt-6 space-y-3">

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setShowOrderModal(true);
                                                                }}
                                                                className="w-full py-3 rounded-xl bg-slate-700 text-white font-bold"
                                                            >
                                                                View Details
                                                            </button>

                                                            {order.status === "Pending" && (

                                                                <div className="grid grid-cols-2 gap-3">

                                                                    <button
                                                                        onClick={() =>
                                                                            handleUpdateOrderStatus(
                                                                                order._id,
                                                                                "Accepted"
                                                                            )
                                                                        }
                                                                        className="py-3 rounded-xl bg-emerald-600 text-white font-bold"
                                                                    >
                                                                        Accept
                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            handleUpdateOrderStatus(
                                                                                order._id,
                                                                                "Rejected"
                                                                            )
                                                                        }
                                                                        className="py-3 rounded-xl bg-red-600 text-white font-bold"
                                                                    >
                                                                        Reject
                                                                    </button>

                                                                </div>

                                                            )}

                                                            {order.status === "Accepted" && (

                                                                <button
                                                                    onClick={() =>
                                                                        handleUpdateOrderStatus(
                                                                            order._id,
                                                                            "Dispatched"
                                                                        )
                                                                    }
                                                                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold"
                                                                >
                                                                    Dispatch Order
                                                                </button>

                                                            )}

                                                            {(order.status === "Dispatched" ||
                                                                order.status === "Shipped") && (

                                                                    <button
                                                                        onClick={() =>
                                                                            handleUpdateOrderStatus(
                                                                                order._id,
                                                                                "Delivered"
                                                                            )
                                                                        }
                                                                        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold"
                                                                    >
                                                                        Complete Delivery
                                                                    </button>

                                                                )}

                                                        </div>

                                                    </div>

                                                ))}

                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                /* MARKETPLACE LIVE INVENTORY TABLE */
                                <div className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-xl overflow-hidden">

                                    <div className="p-8 border-b-2 border-slate-800 flex items-center justify-between bg-slate-900/50">
                                        <h2 className="text-2xl font-black text-slate-100 tracking-tight">Your Marketplace Live Inventory</h2>
                                        <button
                                            onClick={() => {
                                                setEditingProduct(null);

                                                setName('');
                                                setCategory('Vegetables');
                                                setPricePerUnit('');
                                                setUnit('kg');
                                                setAvailabilityQuantity('');
                                                setHarvestDate('');
                                                setIsOrganic(false);
                                                setSelectedImage(null);
                                                setPreviewImage('');

                                                setIsModalOpen(true);
                                            }}
                                            className=" hidden md:inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black px-5 lg:px-8 py-3 lg:py-5 ml-20 mt-4 rounded-2xl text-base sm:text-lg lg:text-xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] cursor-pointer shrink-0 border-0"
                                        >
                                            <PlusCircle className="h-6 w-6" />
                                            List New Crop Yield
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditingProduct(null);

                                            setName('');
                                            setCategory('Vegetables');
                                            setPricePerUnit('');
                                            setUnit('kg');
                                            setAvailabilityQuantity('');
                                            setHarvestDate('');
                                            setIsOrganic(false);
                                            setSelectedImage(null);
                                            setPreviewImage('');

                                            setIsModalOpen(true);
                                        }}
                                        className=" md:hidden inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black px-5 lg:px-8 py-3 lg:py-5 ml-20 mt-4 rounded-2xl text-base sm:text-lg lg:text-xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] cursor-pointer shrink-0 border-0"
                                    >
                                        <PlusCircle className="h-6 w-6" />
                                        List New Crop Yield
                                    </button>

                                    {listings.length === 0 ? (
                                        <div className="p-24 text-center text-xl font-bold text-slate-500">
                                            You haven't listed any products yet. Click "List New Crop Yield" to start!
                                        </div>
                                    ) : (
                                        <>
                                            <div className="hidden lg:block overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-850 text-slate-400 text-lg lg:text-xl font-black uppercase tracking-widest">
                                                            <th className="py-4 px-6">Product Name</th>
                                                            <th className="py-4 px-6">Category</th>
                                                            <th className="py-4 px-6">Stock</th>
                                                            <th className="py-4 px-6">Price</th>
                                                            <th className="py-4 px-6">Status</th>
                                                            <th className="py-4 px-6 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y-2 divide-slate-800 text-md font-bold text-slate-300">
                                                        {listings.map((item, index) => (
                                                            <tr key={`${item._id}-${index}`} className="hover:bg-slate-800/40 transition-colors">
                                                                <td className="py-6 px-8 text-xl lg:text-2xl font-black text-slate-100">{item.name}</td>
                                                                <td className="py-6 px-8 text-lg lg:text-xl text-slate-400">{item.category}</td>
                                                                <td className="py-6 px-8 font-mono text-xl lg:text-2xl text-slate-100">{item.availabilityQuantity} {item.unit}</td>
                                                                <td className="py-6 px-8 text-xl lg:text-2xl font-black text-emerald-400">₹{item.pricePerUnit}/{item.unit}</td>
                                                                <td className="py-5 px-6">
                                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-md lg:text-lg px-4 py-2 font-black tracking-wide ${item.isOrganic
                                                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60'
                                                                        : 'bg-slate-800 text-slate-400'
                                                                        }`}>
                                                                        {item.isOrganic ? 'Organic' : 'Regular'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-5 px-6 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleEditClick(item)}
                                                                            className="px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400"
                                                                        >
                                                                            Edit
                                                                        </button>

                                                                        <button
                                                                            onClick={() =>
                                                                                setDeleteModal({
                                                                                    isOpen: true,
                                                                                    productId: item._id
                                                                                })
                                                                            }
                                                                            className="p-2.5 text-slate-500 hover:text-red-400"
                                                                        >
                                                                            <Trash2 className="h-5 w-5" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Inventory Cards */}
                                            <div className="lg:hidden space-y-4 p-4">

                                                {listings.map((item) => (

                                                    <div
                                                        key={item._id}
                                                        className="bg-slate-800 rounded-2xl p-4 border border-slate-700"
                                                    >

                                                        <div className="flex justify-between items-start">

                                                            <div>

                                                                <h3 className="text-xl font-bold text-white">
                                                                    {item.name}
                                                                </h3>

                                                                <p className="text-slate-400 mt-1">
                                                                    {item.category}
                                                                </p>

                                                            </div>

                                                            <span
                                                                className={`px-3 py-1 rounded-full text-sm font-bold ${item.isOrganic
                                                                    ? "bg-emerald-900 text-emerald-300"
                                                                    : "bg-slate-700 text-slate-300"
                                                                    }`}
                                                            >
                                                                {item.isOrganic ? "Organic" : "Regular"}
                                                            </span>

                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 mt-5">

                                                            <div>
                                                                <p className="text-slate-500 text-sm">
                                                                    Price
                                                                </p>

                                                                <p className="text-emerald-400 font-bold text-lg">
                                                                    ₹{item.pricePerUnit}/{item.unit}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-slate-500 text-sm">
                                                                    Stock
                                                                </p>

                                                                <p className="text-white font-bold text-lg">
                                                                    {item.availabilityQuantity} {item.unit}
                                                                </p>
                                                            </div>

                                                        </div>

                                                        <div className="flex gap-3 mt-5">

                                                            <button
                                                                onClick={() => handleEditClick(item)}
                                                                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    setDeleteModal({
                                                                        isOpen: true,
                                                                        productId: item._id
                                                                    })
                                                                }
                                                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold"
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </div>

                                                ))}

                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                    </div>

                    {/* INVENTORY INSIGHTS */}
                    <div className="hidden lg:flex bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-xl top-28 flex-col justify-between xl:col-span-2 xl:sticky xl:top-28 min-h-[400px] xl:min-h-[75vh]">
                        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-xl">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">

                                <div>
                                    <h2 className="text-xl lg:text-3xl font-black text-white">
                                        🏆 Top Selling Crops
                                    </h2>

                                    <p className="text-sm text-slate-400 mt-1">
                                        Based on Total Units Sold
                                    </p>
                                </div>

                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
                                    <span className="text-emerald-400 text-xs lg:text-sm font-bold uppercase">
                                        Live
                                    </span>
                                </div>

                            </div>

                            <div className="h-[380px] sm:h-[450px] lg:h-[850px]">

                                <ResponsiveContainer width="100%" height="100%">

                                    <BarChart
                                        data={topCropsData}
                                        margin={{
                                            top: 35,
                                            right: 20,
                                            left: 10,
                                            bottom: 0,
                                        }}
                                        barCategoryGap="25%"
                                    >

                                        <CartesianGrid
                                            stroke="#334155"
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="name"
                                            interval={0}
                                            tickFormatter={(value) =>
                                                value.length > 8
                                                    ? value.substring(0, 8) + "..."
                                                    : value
                                            }
                                            tick={{
                                                fill: "#CBD5E1",
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                            tickLine={false}
                                            axisLine={false}
                                        />

                                        <YAxis
                                            stroke="#64748b"
                                            tick={{
                                                fill: "#94A3B8",
                                                fontSize: 12,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            domain={[0, "dataMax + 1"]}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${value} Units Sold`, "Sales"]}
                                            contentStyle={{
                                                backgroundColor: "#0f172a",
                                                border: "1px solid #334155",
                                                borderRadius: "12px",
                                            }}
                                            labelStyle={{
                                                color: "#ffffff",
                                                fontWeight: "bold"
                                            }}
                                            itemStyle={{
                                                color: "#10B981",
                                                fontWeight: "600"
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[10, 10, 0, 0]}
                                            barSize={40}
                                            animationDuration={1200}
                                        >

                                            <LabelList
                                                dataKey="value"
                                                position="top"
                                                fill="#F8FAFC"
                                                fontSize={13}
                                                fontWeight="700"
                                            />

                                            {topCropsData.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={entry.color || "#10B981"}
                                                />
                                            ))}

                                        </Bar>

                                    </BarChart>

                                </ResponsiveContainer>

                            </div>

                        </div>
                    </div>

                </div>
                {/* ================= MOBILE ANALYTICS ================= */}
                <div className="lg:hidden mt-10 space-y-6">

                    {/* Revenue */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">

                        <h2 className="text-xl font-black mb-5">
                            Revenue Overview
                        </h2>

                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="mobileRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid stroke="#1e293b" />

                                    <XAxis dataKey="day" />

                                    <YAxis hide />

                                    <Tooltip />

                                    <Area
                                        dataKey="revenue"
                                        stroke="#10b981"
                                        fill="url(#mobileRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                    </div>

                    {/* Top Crops */}

                    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 lg:p-8 shadow-xl">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">

                            <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold">
                                    INVENTORY INSIGHTS
                                </p>

                                <h2 className="text-2xl lg:text-4xl font-black text-white mt-2">
                                    🏆 Top Selling Crops
                                </h2>

                                <p className="text-sm lg:text-base text-slate-400 mt-2">
                                    Products ranked by total units sold
                                </p>
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
                                <span className="text-emerald-400 text-xs lg:text-sm font-bold uppercase tracking-wider">
                                    Live
                                </span>
                            </div>

                        </div>

                        {/* Chart */}

                        <div className="h-[380px] lg:h-[550px]">

                            <ResponsiveContainer width="100%" height="100%">

                                <BarChart
                                    data={topCropsData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 70,
                                    }}
                                    barCategoryGap="25%"
                                >

                                    <CartesianGrid
                                        stroke="#334155"
                                        strokeDasharray="4 4"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="name"
                                        interval={0}
                                        tickFormatter={(value) =>
                                            value.length > 16
                                                ? value.substring(0, 16) + "..."
                                                : value
                                        }
                                        tick={{
                                            fill: "#CBD5E1",
                                            fontSize: 13,
                                            fontWeight: 600,
                                        }}
                                        tickMargin={15}
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <YAxis
                                        hide
                                        domain={[0, "dataMax + 1"]}
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            `${value} Units Sold`,
                                            "Sales"
                                        ]}
                                        cursor={{
                                            fill: "rgba(16,185,129,0.08)"
                                        }}
                                        contentStyle={{
                                            backgroundColor: "#0f172a",
                                            border: "1px solid #334155",
                                            borderRadius: "14px",
                                            color: "#fff",
                                            padding: "12px"
                                        }}
                                    />

                                    <Bar
                                        dataKey="value"
                                        radius={[12, 12, 0, 0]}
                                        barSize={45}
                                        animationDuration={1200}
                                    >
                                        {topCropsData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={entry.color || "#10B981"}
                                            />
                                        ))}
                                    </Bar>

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>
            </main >

            {/* POPUP MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-6">
                    <div className="bg-slate-900 w-full max-w-full lg:max-w-4xl rounded-t-[2rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden border-2 border-slate-800 flex flex-col h-[100dvh] lg:max-h-[92vh]">
                        <div className="p-4 sm:p-6 lg:p-10 border-b-2 border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-4 text-emerald-400">
                                <PlusCircle className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
                                <h3 className="text-lg sm:text-xl lg:text-3xl font-black tracking-tight text-slate-100">{editingProduct
                                    ? 'Edit Marketplace Listing'
                                    : 'Create New Marketplace Listing'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-400 cursor-pointer transition-colors border-0 bg-transparent">
                                <X className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                            </button>
                        </div>

                        <form onSubmit={handleAddProduct} className="p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 overflow-y-auto flex-1 text-lg">
                            {formError && (
                                <div className="p-6 bg-red-950 text-red-400 font-black text-lg rounded-2xl border-2 border-red-900 shadow-xs">
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-xs sm:text-sm lg:text-base font-black text-slate-400 uppercase tracking-widest block">Produce Name</label>
                                    <input
                                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Premium Basmati Rice, Ooty Carrots"
                                        className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-sm sm:text-lg lg:text-2xl focus:outline-none focus:border-emerald-500 text-slate-100 shadow-xs placeholder:text-slate-500"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs sm:text-sm lg:text-base font-black text-slate-400 uppercase tracking-widest block">Category</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5  bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-sm sm:text-lg lg:text-2xl focus:outline-none focus:border-emerald-500 text-slate-100 cursor-pointer shadow-xs">
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Fruits">Fruits</option>
                                        <option value="Grains">Grains</option>
                                        <option value="Dairy">Dairy</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs sm:text-sm lg:text-base font-black text-slate-400 uppercase tracking-widest block">Unit Measure</label>
                                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5  bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-sm sm:text-lg lg:text-2xl focus:outline-none focus:border-emerald-500 text-slate-100 cursor-pointer shadow-xs">
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="liter">Liter (L)</option>
                                        <option value="bunch">Bunch</option>
                                        <option value="unit">Unit / Piece</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs sm:text-sm lg:text-base font-black text-slate-400 uppercase tracking-widest block">Available Stock Volume</label>
                                    <input type="number" required min="0" value={availabilityQuantity} onChange={(e) => setAvailabilityQuantity(e.target.value)} placeholder="e.g., 250" className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-sm sm:text-lg lg:text-2xl focus:outline-none focus:border-emerald-500 text-slate-100 shadow-xs" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs sm:text-sm lg:text-base font-black text-slate-400 uppercase tracking-widest block">Price per Unit (₹)</label>
                                    <input type="number" required min="0" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} placeholder="e.g., 45" className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5  bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-sm sm:text-lg lg:text-2xl focus:outline-none focus:border-emerald-500 text-slate-100 shadow-xs" />
                                </div>

                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-xs sm:text-sm lg:text-base font-black text-slate-400 uppercase tracking-widest block">Harvest Date</label>
                                    <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5  bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-sm sm:text-lg lg:text-2xl focus:outline-none focus:border-emerald-500 text-slate-100 cursor-pointer shadow-xs" />
                                </div>
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs sm:text-sm lg:text-base font-black text-slate-400 uppercase tracking-widest block">
                                    Product Image
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];

                                        if (!file) return;

                                        const allowedTypes = [
                                            'image/jpeg',
                                            'image/jpg',
                                            'image/png',
                                            'image/webp'
                                        ];

                                        if (!allowedTypes.includes(file.type)) {
                                            setFormError(
                                                'Only JPG, JPEG, PNG and WEBP images are supported.'
                                            );

                                            setSelectedImage(null);
                                            setPreviewImage('');
                                            return;
                                        }

                                        setFormError('');
                                        setSelectedImage(file);
                                        setPreviewImage(URL.createObjectURL(file));
                                        setRemoveCurrentImage(false);
                                    }}
                                    className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5  bg-slate-800 border-2 border-slate-700 rounded-2xl text-sm sm:text-lg lg:text-2xl"
                                />

                                {previewImage && (
                                    <div className="space-y-3">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="h-40 sm:h-52 lg:h-60 w-full object-cover rounded-2xl border border-slate-700"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewImage('');
                                                setSelectedImage(null);
                                                setRemoveCurrentImage(true);
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm sm:text-lg lg:text-2xl text-slate-500 font-semibold mt-2">
                                Supported formats: JPG, JPEG, PNG, WEBP • Max size: 5MB
                            </p>

                            <div className="flex items-center gap-5 p-4 sm:p-5 lg:p-6 rounded-2xl border-2 border-emerald-800 bg-emerald-950/45 shadow-xl shadow-emerald-950/20">
                                <input type="checkbox" id="organic" checked={isOrganic} onChange={(e) => setIsOrganic(e.target.checked)} className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-emerald-500 focus:ring-emerald-500 border-slate-600 bg-slate-800 rounded-xl cursor-pointer shrink-0" />
                                <label htmlFor="organic" className="text-sm sm:text-lg lg:text-xl font-bold text-slate-200 cursor-pointer select-none leading-snug">
                                    This crop is certified 100% Organic, eco-friendly, or grown with natural cultivation parameters.
                                </label>
                            </div>

                            <div className="pt-8 flex items-center justify-end gap-5 border-t-2 border-slate-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-3 lg:px-8 lg:py-5 rounded-2xl text-slate-400 hover:bg-slate-800 font-black cursor-pointer text-sm sm:text-lg lg:text-xl transition-colors bg-transparent border-0">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 text-sm sm:text-lg lg:text-xl flex items-center gap-3 cursor-pointer active:scale-98 border-0">
                                    {isSubmitting && <Loader className="h-6 w-6 animate-spin" />}
                                    {editingProduct
                                        ? 'Update Product'
                                        : 'Publish Product Listing'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-10 rounded-2xl max-w-2xl w-full shadow-2xl">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-5">Delete Listing?</h3>
                        <p className="text-slate-400 text-base sm:text-lg lg:text-2xl mb-9">This action is permanent and will remove this crop from the marketplace.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setDeleteModal({ isOpen: false, productId: null })} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition cursor-pointer border-0">
                                <div className='text-2xl'>Cancel</div>
                            </button>
                            <button onClick={() => { handleDeleteProduct(deleteModal.productId); setDeleteModal({ isOpen: false, productId: null }); }} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition cursor-pointer border-0">
                                <div className='text-2xl'>Confirm</div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl xl:max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">

                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-800">
                            <h2 className="text-5xl font-black text-white">
                                Order Details
                            </h2>

                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="text-slate-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">

                            {/* Customer */}
                            <div className="bg-slate-800/50 rounded-xl p-5">
                                <h3 className="text-2xl lg:text-3xl text-emerald-400 font-black mb-5">
                                    Customer Information
                                </h3>

                                <p className="text-xl lg:text-2xl leading-relaxed">
                                    <span className="text-slate-400">Name:</span>{' '}
                                    <span className="text-white">
                                        {selectedOrder.buyerName ||
                                            selectedOrder.buyer?.name ||
                                            'Customer'}
                                    </span>
                                </p>

                                <p className="text-xl lg:text-2xl leading-relaxed">
                                    <span className="text-slate-400">Phone:</span>{' '}
                                    <span className="text-white">
                                        {selectedOrder.shippingAddress?.phone || 'N/A'}
                                    </span>
                                </p>
                            </div>

                            {/* Address */}
                            <div className="bg-slate-800/50 rounded-xl p-5">
                                <h3 className="text-2xl lg:text-3xl text-emerald-400 font-black mb-3">
                                    Delivery Address
                                </h3>

                                <p className="text-white text-xl lg:text-2xl ">
                                    {selectedOrder.shippingAddress?.fullName}
                                </p>

                                <p className="text-slate-300 text-xl lg:text-2xl">
                                    {selectedOrder.shippingAddress?.addressLine1}
                                </p>

                                <p className="text-slate-300 text-xl lg:text-2xl">
                                    {selectedOrder.shippingAddress?.city},{' '}
                                    {selectedOrder.shippingAddress?.state}
                                </p>

                                <p className="text-slate-300 text-xl lg:text-2xl">
                                    {selectedOrder.shippingAddress?.pincode}
                                </p>
                            </div>

                            {/* Order Info */}
                            <div className="bg-slate-800/50 rounded-xl p-5">
                                <h3 className="text-2xl lg:text-3xl text-emerald-400 font-black mb-3">
                                    Order Information
                                </h3>

                                <p className="text-xl lg:text-2xl py-1">
                                    <span className="text-slate-400">Order ID:</span>{' '}
                                    <span className="text-white font-mono">
                                        {selectedOrder._id}
                                    </span>
                                </p>

                                <p className="text-xl lg:text-2xl py-1">
                                    <span className="text-slate-400">Delivery Slot:</span>{' '}
                                    <span className="text-white">
                                        {selectedOrder.deliverySlot}
                                    </span>
                                </p>

                                <p className="text-xl lg:text-2xl py-1">
                                    <span className="text-slate-400">Status:</span>{' '}
                                    <span className="text-emerald-400 font-bold">
                                        {selectedOrder.status}
                                    </span>
                                </p>

                                <p className="text-xl lg:text-2xl py-1">
                                    <span className="text-slate-400">Amount:</span>{' '}
                                    <span className="text-emerald-400 font-black">
                                        ₹{selectedOrder.totalAmount || selectedOrder.totalPrice}
                                    </span>
                                </p>
                            </div>

                            {/* Items */}
                            <div className="bg-slate-800/50 rounded-xl p-5">
                                <h3 className="text-2xl lg:text-3xl text-emerald-400 font-black mb-3">
                                    Products
                                </h3>

                                {selectedOrder.items?.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between py-4 text-xl lg:text-2xl border-b border-slate-700 last:border-none"
                                    >
                                        <span className="text-white">
                                            {item.product?.name || 'Product'}
                                        </span>

                                        <span className="text-white">
                                            {item.quantity} {item.product?.unit || 'kg'}
                                        </span>
                                    </div>
                                ))}
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
                                🌾
                            </div>

                            <h2 className="text-2xl font-black text-white mb-3">
                                Demo Account
                            </h2>

                            <p className="text-slate-300 leading-relaxed">
                                {demoMessage}
                            </p>

                            <p className="text-slate-500 text-sm mt-4">
                                You can explore your dashboard, analytics, inventory and
                                orders, but actions that modify data are disabled to
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
        </div >
    );
}

export default FarmerDashboard;