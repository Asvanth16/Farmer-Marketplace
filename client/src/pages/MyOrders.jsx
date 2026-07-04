import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";
import vegetableBox from '../assets/vegetable_box.png';

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    const fetchOrderDataAndSyncLogs = async () => {
        try {

            const res = await api.get(
                '/api/orders/myorders'
            );

            // Show only confirmed orders
            const finalizedOrders = res.data.filter(
                order => order.deliverySlot !== 'Not Selected'
            );

            // Newest orders first
            finalizedOrders.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setOrders(finalizedOrders);

            // Navbar cart count
            const activeCart = res.data.find(
                order => order.deliverySlot === 'Not Selected'
            );

            setCartCount(
                activeCart?.items?.reduce(
                    (total, item) => total + item.quantity,
                    0
                ) || 0
            );

        } catch (err) {
            console.error('Error fetching order logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial load
        fetchOrderDataAndSyncLogs();

        // Auto refresh every 5 seconds
        const interval = setInterval(() => {
            fetchOrderDataAndSyncLogs();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-amber-950/50 text-amber-400 border-amber-500/50';
            case 'Accepted':
                return 'bg-emerald-950/50 text-emerald-400 border-emerald-500/50';
            case 'Rejected':
                return 'bg-red-950/50 text-red-400 border-red-500/50';
            case 'Cancelled':
                return 'bg-slate-800 text-slate-400 border-slate-700';
            case 'Dispatched':
                return 'bg-blue-950/50 text-blue-400 border-blue-500/50';
            case 'Delivered':
                return 'bg-cyan-950/50 text-cyan-400 border-cyan-500/50';
            default:
                return 'bg-slate-950/60 text-slate-400 border-slate-800/60';
        }
    };

    const getTimelineColor = (status) => {
        switch (status) {
            case 'Accepted':
                return 'bg-emerald-500';
            case 'Dispatched':
                return 'bg-amber-500';
            case 'Delivered':
                return 'bg-blue-500';
            default:
                return 'bg-slate-700';
        }
    };

    const getProgress = (status) => {
        switch (status) {
            case 'Accepted':
                return 33;
            case 'Dispatched':
                return 66;
            case 'Delivered':
                return 100;
            default:
                return 0;
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {

            await api.put(
                `/api/orders/${orderId}/cancel`,
                {}
            );

            fetchOrderDataAndSyncLogs();
        } catch (error) {
            alert(error.response?.data?.message || 'Unable to cancel order');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1329] text-slate-100 font-sans selection:bg-emerald-500/30">
            <Navbar cartCount={cartCount} />

            {/* Main Container */}
            <div className="max-w-[2700px] mx-auto p-4 sm:p-6 lg:p-10 flex flex-col gap-6 lg:gap-8">

                {/* ================= HEADER PANEL ================= */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 sm:p-8 rounded-2xl shadow-xl shadow-black/20 flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-slate-100 uppercase">
                            Order Tracking Logs
                        </h1>
                        <p className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-400 font-medium mt-1 sm:mt-2">
                            Monitor fulfillment dispatch schedules and review archive transaction histories.
                        </p>
                    </div>
                    <div className="hidden lg:block shrink-0">
                        <img
                            src={vegetableBox}
                            alt="Vegetable Box"
                            className="h-32 xl:h-40 object-contain"
                        />
                    </div>
                </div>

                {/* ================= HISTORY LIST ================= */}
                {orders.length === 0 ? (
    <div className="min-h-[calc(100vh-320px)] flex items-center justify-center">

        <div className="text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl backdrop-blur-sm px-8 py-16 max-w-2xl w-full">

            <p className="text-slate-500 text-base sm:text-2xl lg:text-3xl font-medium mb-6">
                No historical orders found on your profile.
            </p>

            <button
                onClick={() => navigate("/customer/marketplace")}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm md:text-lg px-8 py-4 rounded-xl transition-all uppercase tracking-wider w-full sm:w-auto"
            >
                Start Shopping
            </button>

        </div>

    </div>
) : (
                    <div className="flex flex-col gap-6 sm:gap-8">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className={`bg-slate-900/80 border rounded-2xl overflow-hidden shadow-xl
                                    ${order.status === 'Accepted'
                                        ? 'border-emerald-500/40'
                                        : order.status === 'Dispatched'
                                            ? 'border-amber-500/40'
                                            : 'border-blue-500/40'
                                    }`}
                            >
                                {/* Card Top Metadata Info Header */}
                                <div className="bg-slate-950/60 p-5 sm:p-6 lg:p-10 border-b border-slate-800/60 flex flex-col gap-4">
                                    
                                    {/* Main Row: Farm Name and Order Status Badge */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/50 pb-4">
                                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 sm:px-6 sm:py-4 w-full sm:w-auto sm:min-w-[280px]">
                                            <span className="text-slate-500 block uppercase font-black text-xs tracking-wider">🚜 Farm</span>
                                            <p className="text-emerald-400 text-lg md:text-2xl font-black line-clamp-1">
                                                {order.items?.[0]?.product?.farmer?.name || 'Unknown Farm'}'s Farm
                                            </p>
                                        </div>

                                        <div className={`flex items-center justify-center gap-3 px-5 py-3 rounded-xl border shadow-lg font-black text-base sm:text-2xl lg:text-4xl tracking-wide w-full sm:w-auto sm:min-w-[200px] ${getStatusColor(order.status)}`}>
                                            <span className="text-lg sm:text-2xl md:text-3xl xl:text-5xl">
                                                {order.status === 'Pending' && '⏳'}
                                                {order.status === 'Accepted' && '✓'}
                                                {order.status === 'Rejected' && '❌'}
                                                {order.status === 'Cancelled' && '🚫'}
                                                {order.status === 'Dispatched' && '🚚'}
                                                {order.status === 'Delivered' && '🎉'}
                                            </span>
                                            <span className="uppercase tracking-wider">{order.status}</span>
                                        </div>
                                    </div>

                                    {/* Grid Row: Compact Information Blocks */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3">
                                            <p className="text-slate-500 uppercase tracking-wider text-xs font-bold">Placed Date</p>
                                            <p className="text-white text-base sm:text-xl lg:text-2xl font-black mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3">
                                            <p className="text-slate-500 uppercase tracking-wider text-xs font-bold">Order ID</p>
                                            <p className="text-white text-base sm:text-xl lg:text-2xl font-black mt-0.5">
                                                #{order._id.slice(-6)}
                                            </p>
                                        </div>
                                        <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3">
                                            <p className="text-slate-500 uppercase tracking-wider text-xs font-bold">Time Slot</p>
                                            <p className="text-white text-base sm:text-xl lg:text-2xl font-black mt-0.5 line-clamp-1">
                                                {order.deliverySlot}
                                            </p>
                                        </div>
                                        <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3">
                                            <p className="text-slate-500 uppercase tracking-wider text-xs font-bold">Total Items</p>
                                            <p className="text-white text-base md:text-2xl font-black mt-0.5">
                                                {order.items.length} Units
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Container & Order Fulfillment Row */}
                                <div className="p-5 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-[2fr_1.3fr_300px] gap-6 lg:gap-8 items-center">
                                    
                                    {/* Sub-Items List mapping */}
                                    <div className="flex flex-col gap-5 sm:gap-6">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center border-b border-slate-800/50 last:border-0 pb-5 last:pb-0">
                                                <div className="w-full sm:w-40 sm:h-40 lg:w-64 lg:h-64 rounded-2xl overflow-hidden border border-slate-700 shadow-lg shrink-0 aspect-video sm:aspect-square">
                                                    <img
                                                        src={item.product?.imageUrl}
                                                        alt={item.product?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 w-full text-center sm:text-left">
                                                    <h4 className="text-lg sm:text-3xl lg:text-5xl font-black text-white mb-1 sm:mb-3">
                                                        {item.product?.name || 'Marketplace Crop'}
                                                    </h4>
                                                    <span className="text-slate-400 text-xs sm:text-base md:text-xl font-medium">
                                                        Category: {item.product?.category || 'General'}
                                                    </span>
                                                    <div className="flex flex-row justify-center sm:justify-start gap-3 mt-4 text-sm">
                                                        <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2">
                                                            <p className="text-xs uppercase text-slate-400">⚖️ Qty</p>
                                                            <p className="font-black text-white text-base sm:text-xl lg:text-2xl mt-0.5">
                                                                {item.quantity} {item.product?.unit || 'kg'}
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2">
                                                            <p className="text-xs uppercase text-slate-400">Rate</p>
                                                            <p className="font-black text-white text-lg md:text-2xl mt-0.5">
                                                                ₹{item.priceAtPurchase} / {item.product?.unit || 'kg'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Timeline Tracker Pipeline Status Block */}
                                    <div className="xl:border-l border-t xl:border-t-0 border-slate-800 pt-6 xl:pt-0 xl:pl-6 w-full">
                                        {order.status !== 'Rejected' && order.status !== 'Cancelled' ? (
                                            <div className="flex flex-col items-center sm:items-start xl:items-center">
                                                <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
                                                    
                                                    <div className="flex flex-col items-center">
                                                        <div className={`h-3 w-3 rounded-full ${['Accepted', 'Dispatched', 'Delivered'].includes(order.status) ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                                        <span className="text-xs sm:text-2xl lg:text-3xl font-bold mt-1">Accepted</span>
                                                    </div>

                                                    <div className={`h-1 w-6 sm:w-10 lg:w-16 ${['Dispatched', 'Delivered'].includes(order.status) ? 'bg-emerald-500' : 'bg-slate-700'}`} />

                                                    <div className="flex flex-col items-center">
                                                        <div className={`h-3 w-3 rounded-full ${['Dispatched', 'Delivered'].includes(order.status) ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                                        <span className="text-xs sm:text-2xl lg:text-3xl font-bold mt-1">Dispatch</span>
                                                    </div>

                                                    <div className={`h-1 w-6 sm:w-10 lg:w-16 ${order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-slate-700'}`} />

                                                    <div className="flex flex-col items-center">
                                                        <div className={`h-3 w-3 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                                        <span className="text-xs sm:text-2xl lg:text-3xl font-bold mt-1">Delivered</span>
                                                    </div>
                                                </div>

                                                <div className="w-full sm:max-w-xs xl:w-[85%] mt-4">
                                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-700 ${getTimelineColor(order.status)}`}
                                                            style={{ width: `${getProgress(order.status)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end mt-1">
                                                        <span className="text-emerald-400 text-sm sm:text-xl lg:text-2xl font-black">
                                                            {getProgress(order.status)}%
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-xs sm:text-lg lg:text-2xl text-slate-300 text-center sm:text-left xl:text-center mt-2 font-bold">
                                                    {order.status === 'Pending' && <span className='text-amber-400/90'>⏳ Waiting for farmer approval</span>}
                                                    {order.status === 'Accepted' && '✓ Farmer confirmed your order'}
                                                    {order.status === 'Dispatched' && '🚚 Your order is on the way'}
                                                    {order.status === 'Delivered' && '🎉 Successfully delivered'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center py-4">
                                                {order.status === 'Rejected' && (
                                                    <p className="text-red-400 text-sm sm:text-2xl lg:text-3xl font-black">❌ Farmer rejected this order</p>
                                                )}
                                                {order.status === 'Cancelled' && (
                                                    <p className="text-slate-400 text-sm sm:text-2xl lg:text-3xl font-black">🚫 Order cancelled</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Financial Metrics System Action Grid Column */}
                                    <div className="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border border-emerald-800 rounded-2xl p-4 sm:p-6 text-center w-full shadow-lg">
                                        <span className="text-emerald-300 block uppercase font-black text-xs sm:text-sm lg:text-md tracking-wider">
                                            Order Value
                                        </span>
                                        <span className="text-emerald-400 text-lg sm:text-3xl md:text-4xl xl:text-5xl font-black block mt-0.5">
                                            ₹{order.totalAmount}
                                        </span>
                                        
                                        {(order.status === 'Pending' || order.status === 'Accepted') && (
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm md:text-base py-3 sm:py-4 rounded-xl transition tracking-wide uppercase"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default MyOrders;