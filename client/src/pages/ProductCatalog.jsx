import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";

const ProductCatalog = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [sortBy, setSortBy] = useState('default');

    // 🌟 State for handling the custom popup modal
    const [showAuthModal, setShowAuthModal] = useState(false);
    const token = localStorage.getItem("token");
    // Check login state and extract basic user data on mount
    useEffect(() => {
        const storedName = localStorage.getItem("userName");

        if (token) {
            setUser({
                name: storedName || "Customer"
            });
        }
    }, []);

    // 1. Fetch Marketplace Products on Mount
    useEffect(() => {
        fetchProducts();

        const interval = setInterval(() => {
            fetchProducts();
        }, 10000);

        return () => clearInterval(interval);
    }, []);


    // 2. Sync Existing Pending Order Session (Cart) from Backend on Initialization
    useEffect(() => {
        const fetchActiveCartOrder = async () => {

            if (!token) return;

            try {
                const res = await api.get('/api/orders/myorders');

                const activeOrder = res.data.find(order => order.status === 'Pending');

                if (activeOrder && activeOrder.items) {
                    const loadedCartItems = activeOrder.items.map(item => ({
                        _id: item.product?._id || item.product,
                        name: item.product?.name || 'Marketplace Item',
                        pricePerUnit: item.priceAtPurchase,
                        cartQuantity: item.quantity
                    }));
                    setCart(loadedCartItems);
                }
            } catch (err) {
                console.error("Error setting initial order metrics from database:", err);
            }
        };

        if (!loading) {
            fetchActiveCartOrder();
        }
    }, [loading]);

    const fetchProducts = async () => {
        try {
            const isDemoFarmer =
                localStorage.getItem("isDemo") === "true" &&
                localStorage.getItem("role") === "farmer";
            const res = await api.get(`/api/products?demoFarmer=${isDemoFarmer}`);

            setProducts(res.data);

        } catch (err) {
            console.error(
                "Error fetching marketplace products:",
                err
            );
        } finally {
            setLoading(false);
        }
    };

    // 3. Dynamic Relative Quantity Matrix Pipeline
    const handleUpdateQuantity = async (product, quantityChange) => {

        // 🌟 Auth Guard Check: Instead of window.alert, trigger the stateful popup modal
        if (!token) {
            setShowAuthModal(true);
            return;
        }

        const displayPrice = product.pricePerUnit ?? 0;

        // A. Optimistic Local State Update
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item._id === product._id);

            if (existingItem) {
                const targetedQuantity = existingItem.cartQuantity + quantityChange;

                if (targetedQuantity <= 0) {
                    return prevCart.filter(item => item._id !== product._id);
                }

                return prevCart.map(item =>
                    item._id === product._id
                        ? { ...item, cartQuantity: targetedQuantity }
                        : item
                );
            }

            if (quantityChange <= 0) return prevCart;
            return [...prevCart, { _id: product._id, name: product.name, pricePerUnit: displayPrice, cartQuantity: 1 }];
        });

        // B. Persist structural snapshot metrics down to server pipeline arrays
        try {
            await api.post(
                '/api/orders/cart',
                {
                    productId: product._id,
                    quantity: quantityChange,
                    priceAtPurchase: displayPrice
                }
            );
        } catch (err) {
            console.error("Order controller failed to balance product card modifier snapshot changes:", err);
            alert(err.response?.data?.message || "Failed to sync item update with your pending order.");
            await fetchProducts();
        }
    };

    const totalCartCount = cart.reduce((total, item) => total + item.cartQuantity, 0);

    const filteredProducts = products
        .filter(product => {
            const productName = product.name || '';
            const productCategory = product.category || 'All';

            return (
                productName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) &&
                (
                    selectedCategory === 'All' ||
                    productCategory === selectedCategory
                )
            );
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'priceLow':
                    return a.pricePerUnit - b.pricePerUnit;

                case 'priceHigh':
                    return b.pricePerUnit - a.pricePerUnit;

                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);

                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);

                default:
                    return 0;
            }
        });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1329] text-slate-100 font-sans selection:bg-emerald-500/30 relative text-sm">
            <Navbar cartCount={totalCartCount} user={user} />

            {/* Main Container */}
            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

                {/* ================= HEADER & SEARCH PANEL ================= */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 sm:p-6 lg:p-6 rounded-xl shadow-xl shadow-black/20 ">
                    <div className="hidden md:grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">

                        <div className="md:col-span-4 flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest font-black text-slate-400">Search Crops</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ex: Organic Carrots, Basmati Rice, Fresh Milk..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-200 placeholder-slate-600 font-medium transition text-xs sm:text-sm shadow-inner"
                                />
                                <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest font-black text-slate-400">Category Filter</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-2 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-200 font-bold cursor-pointer transition text-xs sm:text-sm shadow-md"
                            >
                                <option value="All">🌾 All Categories</option>
                                <option value="Vegetables">🥕 Vegetables</option>
                                <option value="Fruits">🍎 Fruits</option>
                                <option value="Grains">🌾 Grains</option>
                                <option value="Dairy">🥛 Dairy</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest font-black text-slate-400">
                                Sort By
                            </label>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-2 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-200 font-bold cursor-pointer transition text-xs sm:text-sm shadow-md"
                            >
                                <option value="default">Default</option>
                                <option value="priceLow">💰 Price: Low → High</option>
                                <option value="priceHigh">💸 Price: High → Low</option>
                                <option value="newest">🆕 Newest First</option>
                                <option value="oldest">📅 Oldest First</option>
                            </select>
                        </div>

                    </div>
                    <div className="md:hidden space-y-4">

                        <div className="relative">

                            <input
                                type="text"
                                placeholder="Ex: Organic Carrots, Basmati Rice..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
                            />

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>

                        </div>

                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="w-full bg-emerald-500 text-slate-900 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 text-xs"
                        >
                            ⚙ Filters & Sort
                        </button>

                    </div>
                </div>

                {/* ================= PRODUCT DISPLAY GRID ================= */}
                <div>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl backdrop-blur-sm">
                            <p className="text-slate-500 text-sm font-medium">No agricultural products match your active search filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {filteredProducts.map((product) => {
                                const displayPrice = product.pricePerUnit ?? 0;
                                const displayStock = product.availabilityQuantity ?? 0;
                                const displayUnit = product.unit || 'kg';
                                const displayFarmName = product.farmer?.farmName || product.farmer?.name || 'Local Farm';

                                const activeCartItem = cart.find(item => item._id === product._id);
                                const currentQuantityInCart = activeCartItem ? activeCartItem.cartQuantity : 0;

                                return (
                                    <div
                                        key={product._id}
                                        onClick={() =>
                                            navigate(`/customer/product/${product._id}`)
                                        }
                                        className="bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-hidden hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/10 transition-all duration-300 flex flex-col justify-between group shadow-lg cursor-pointer text-xs"
                                    >
                                        <div>
                                            <div className="h-40 sm:h-48 lg:h-52 bg-slate-950 w-full relative flex items-center justify-center text-slate-600 overflow-hidden border-b border-slate-800/60">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <span className="text-[10px] uppercase font-extrabold tracking-widest bg-slate-900 text-slate-400 px-4 py-2 rounded-lg border border-slate-800">
                                                        {product.category}
                                                    </span>
                                                )}

                                                {product.isOrganic && (
                                                    <span className="absolute top-3 left-3 bg-emerald-500 text-slate-950 text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-md shadow-md shadow-black/40">
                                                        Organic
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-4 pb-3">
                                                <div className="flex justify-between items-start gap-3 mb-2">
                                                    <h3 className="font-extrabold py-0.5 text-sm sm:text-base text-slate-100 tracking-tight line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                    <div className="text-right shrink-0">
                                                        <span className="text-emerald-400 font-black text-sm sm:text-base tracking-tight block">
                                                            ₹{displayPrice}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                                            per {displayUnit}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-[11px] text-slate-400 font-semibold tracking-wide mb-3 flex items-center gap-1.5 bg-slate-950/40 py-1 px-2.5 rounded-md border border-slate-800/50 w-fit">
                                                    <span>🚜</span>
                                                    <span className="line-clamp-1">{displayFarmName}'s Farm</span>
                                                </div>

                                                {product.harvestDate && (
                                                    <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400 text-[10px] font-semibold mt-0.5">
                                                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                                                        Harvested: {new Date(product.harvestDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="px-4 pb-4 pt-0">
                                            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/60">

                                                <div className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg border inline-flex items-center justify-center ${displayStock > 10
                                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                                    : displayStock > 0
                                                        ? 'bg-amber-950/40 text-red-400 border-amber-800/40'
                                                        : 'bg-red-950/40 text-red-700 border-red-800/40'
                                                    }`}>
                                                    {displayStock > 0 ? `${displayStock} ${displayUnit} left` : 'Out of Stock'}
                                                </div>

                                                <div className="shrink-0">
                                                    <span className="bg-emerald-500 hover:bg-emerald-200 text-slate-950 disabled:bg-slate-800 disabled:text-slate-600 font-black text-[10px] px-4 py-2 rounded-lg transition-all shadow-md uppercase tracking-wider block text-center">
                                                        View Details
                                                    </span>
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ================= 🌟 CUSTOM AUTHENTICATION PORTAL POPUP MODAL ================= */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dark overlay background */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
                        onClick={() => setShowAuthModal(false)}
                    ></div>

                    {/* Modal content body */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-black text-slate-100 mb-2 tracking-tight">Login Required</h3>
                        <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">
                            Please log in to your account to place crop listings inside your marketplace order session.
                        </p>

                        <div className="flex gap-3 items-center">
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-700/50 transition text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowAuthModal(false);
                                    navigate('/login');
                                }}
                                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg transition shadow-md text-xs"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showMobileFilters && (

                <div className="fixed inset-0 z-50 mb-30">

                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setShowMobileFilters(false)}
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-2xl p-5 animate-in slide-in-from-bottom">

                        <h2 className="text-lg font-black mb-4">

                            Filters & Sorting

                        </h2>

                        <div className="space-y-4">

                            <div>

                                <label className="font-bold text-slate-400 text-xs">

                                    Category

                                </label>

                                <select
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                    className="mt-1.5 w-full p-2.5 bg-slate-800 rounded-xl text-xs text-slate-200"
                                >
                                    <option value="All">All</option>
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Grains">Grains</option>
                                    <option value="Dairy">Dairy</option>
                                </select>

                            </div>

                            <div>

                                <label className="font-bold text-slate-400 text-xs">

                                    Sort

                                </label>

                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value)
                                    }
                                    className="mt-1.5 w-full p-2.5 bg-slate-800 rounded-xl text-xs text-slate-200"
                                >
                                    <option value="default">Default</option>
                                    <option value="priceLow">Price Low → High</option>
                                    <option value="priceHigh">Price High → Low</option>
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                </select>

                            </div>

                            <div className="flex gap-3 mt-4">

                                <button
                                    onClick={() => {

                                        setSelectedCategory("All");
                                        setSortBy("default");

                                    }}
                                    className="flex-1 py-2.5 border border-slate-700 rounded-xl text-xs font-semibold"
                                >

                                    Reset

                                </button>

                                <button
                                    onClick={() =>
                                        setShowMobileFilters(false)
                                    }
                                    className="flex-1 py-2.5 bg-emerald-500 text-slate-900 rounded-xl font-black text-xs"
                                >

                                    Apply

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}
            <Footer />
        </div>
    );
};

export default ProductCatalog;