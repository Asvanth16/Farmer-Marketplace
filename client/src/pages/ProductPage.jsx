import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Trash2 } from 'lucide-react';

import {
    ArrowLeft, Star, Calendar, MapPin, CheckCircle,
    Layers, ShoppingCart, ShieldCheck, RefreshCw,
    Heart, ChevronRight, MessageSquare, Send, User
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Core layout states
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImageIdx, setActiveImageIdx] = useState(0);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const isDemoCustomer =
        localStorage.getItem("isDemo") === "true" &&
        localStorage.getItem("role") === "customer";

    const [demoModal, setDemoModal] = useState(false);
    const [demoMessage, setDemoMessage] = useState("");

    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [summary, setSummary] = useState({});
    const [comment, setComment] = useState('');
    const [editingReviewId, setEditingReviewId] = useState(null);
    // Mock images fallback matching image_ee15e3.jpg style if backend lacks a gallery array
    const [gallery, setGallery] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        const storedId = localStorage.getItem('userId');

        if (token) {
            setUser({
                _id: storedId,
                name: storedName || 'Customer'
            });
        }
    }, []);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const res = await api.get(`/api/products/${id}`);
                setProduct(res.data);

                const reviewRes = await api.get(
                    `/api/reviews/${id}`
                );

                setReviews(reviewRes.data.reviews);
                setAverageRating(reviewRes.data.averageRating);
                setReviewCount(reviewRes.data.reviewCount);
                setSummary(reviewRes.data.summary);

                const relatedRes =
                    await api.get(
                        `/api/products/${id}/related`
                    );

                setRelatedProducts(relatedRes.data);

                // Populate gallery layout array
                if (res.data.imageUrl) {
                    setGallery([res.data.imageUrl, res.data.imageUrl, res.data.imageUrl, res.data.imageUrl]);
                }

                if (token) {
                    const orderRes = await api.get('/api/orders/myorders');
                    const activeOrder = orderRes.data.find(o => o.status === 'Pending');
                    if (activeOrder?.items) {
                        setCart(activeOrder.items.map(item => ({
                            _id: item.product?._id || item.product,
                            cartQuantity: item.quantity
                        })));
                    }
                }
            } catch (err) {
                console.error("Error reading application data records:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [id]);

    const displayPrice = product?.pricePerUnit ?? 40;
    const displayStock = product?.availabilityQuantity ?? 120;
    const displayUnit = product?.unit || 'kg';
    const displayFarmName = product?.farmer?.farmName || "Asvanth Farm";
    const displayFarmerName = product?.farmer?.name || "Asvanth";

    const handleSubmitReview = async () => {
        if (isDemoCustomer) {
            showDemoModal(
                "Submitting ratings and reviews is disabled for the Demo Customer account."
            );
            return;
        }
        try {
            if (editingReviewId) {
                await api.put(
                    `/api/reviews/${editingReviewId}`,
                    { rating, comment },
                );
            } else {
                await api.post(
                    '/api/reviews',
                    { productId: id, rating, comment },
                );
            }

            const reviewRes = await api.get(`/api/reviews/${id}`);
            setReviews(reviewRes.data.reviews);
            setAverageRating(reviewRes.data.averageRating);
            setReviewCount(reviewRes.data.reviewCount);
            setSummary(reviewRes.data.summary);

            const productRes = await api.get(`/api/products/${id}`);
            setProduct(productRes.data);

            setRating(0);
            setComment('');
            setEditingReviewId(null);

        } catch (error) {

            if (rating === 0) {
                alert("Please select at least a 1-star rating.");
                return;
            }

            alert(
                error.response?.data?.message || "Failed to submit review."
            );
        }
    };

    const handleAddToCart = async () => {
        if (!token) {
            setShowAuthModal(true);
            return;
        }

        try {
            await api.post('/api/orders/cart', {
                productId: id,
                quantity: quantity,
                priceAtPurchase: displayPrice
            });

            setCart(prev => {
                const existing = prev.find(i => i._id === id);
                if (existing) {
                    return prev.map(i => i._id === id ? { ...i, cartQuantity: i.cartQuantity + quantity } : i);
                }
                return [...prev, { _id: id, cartQuantity: quantity }];
            });
            navigate('/customer/cart')
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await api.delete(`/api/reviews/${reviewId}`);

            const reviewRes = await api.get(`/api/reviews/${id}`);
            setReviews(reviewRes.data.reviews);
            setAverageRating(reviewRes.data.averageRating);
            setReviewCount(reviewRes.data.reviewCount);
            setSummary(reviewRes.data.summary);

            const productRes = await api.get(`/api/products/${id}`);
            setProduct(productRes.data);
        } catch (error) {
            alert('Failed to delete review');
        }
    };

    const showDemoModal = (message) => {
        setDemoMessage(message);
        setDemoModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#060c18]">
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060c18] text-slate-100 font-sans selection:bg-emerald-500/20">
            <Navbar cartCount={cart.reduce((t, i) => t + i.cartQuantity, 0)} user={user} />

            {/* FULL TRUE EDGE-TO-EDGE FLUID CONTAINER */}
            <div className="w-full px-4 sm:px-6 lg:px-20 2xl:px-28 py-5 sm:py-8 md:py-16 pb-28 lg:pb-0 flex flex-col gap-8 md:gap-14">

                {/* BREADCRUMB HEADER PORTAL LINK MATRICES */}
                <div className="flex flex-wrap items-center gap-2 text-sm md:text-base lg:text-3xl text-slate-400 font-medium">
                    <button onClick={() => navigate('/customer/marketplace')} className="hover:text-emerald-400 flex items-center gap-1.5 bg-transparent border-1 rounded-2xl cursor-pointer p-3 text-emerald-600 transition-colors ">
                        <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" /> Back to Marketplace
                    </button>
                    <span>/</span>
                    <span className="capitalize text-slate-500">{product?.category || 'Vegetables'}</span>
                    <span>/</span>
                    <span className="text-slate-300 font-bold">{product?.name || 'Small Onion'}</span>
                </div>

                {/* MAIN SPLIT STAGE SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start">

                    {/* LEFT COLUMN: PRIMARY MEDIA GALLERIES */}
                    <div className="w-full md:col-span-1 lg:col-span-6 flex flex-col gap-4">
                        <div className="w-full aspect-square max-h-[450px] lg:max-h-[850px] sm:aspect-[4/3] md:aspect-square xl:max-h-[850px] rounded-3xl lg:rounded-4xl overflow-hidden bg-slate-900/60 border border-slate-800 flex items-center justify-center shadow-2xl">
                            {gallery[activeImageIdx] ? (
                                <img src={gallery[activeImageIdx]} alt={product?.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-7xl sm:text-8xl lg:text-9xl">🌾</span>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CORE CHECKOUT PRICING GRID SYSTEM */}
                    <div className="w-full md:col-span-1 lg:col-span-6 flex flex-col gap-6 md:gap-10">
                        <div className="flex items-center">
                            <span className="bg-emerald-500/10 text-emerald-400 text-sm md:text-base lg:text-lg font-bold tracking-wide px-5 py-2 rounded-full border border-emerald-500/20 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span> Organic
                            </span>
                        </div>

                        {/* MASSIVE HEADINGS FOR ALL DISPLAY BREAKPOINTS */}
                        <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-none">
                            {product?.name || 'Small Onion'}
                        </h1>

                        {/* Ratings Score Metric Lines */}
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-400 text-xl md:text-2xl lg:text-3xl">⭐</span>
                            <span className="font-bold text-xl md:text-2xl lg:text-3xl">
                                {product?.averageRating ? product.averageRating.toFixed(1) : "0.0"}
                            </span>
                            <span className="text-slate-400 text-base md:text-xl lg:text-2xl">
                                ({product?.reviewCount || 0} reviews)
                            </span>
                        </div>

                        {/* Neon Value Matrix Row */}
                        <div className="flex items-baseline gap-2.5">
                            <span className="text-emerald-400 font-black text-4xl lg:text-6xl xl:text-7xl tracking-tight">₹{displayPrice}</span>
                            <span className="text-slate-400 text-base md:text-2xl lg:text-3xl font-medium">/ {displayUnit}</span>
                        </div>

                        {/* SPECIFICATION PILLS CONTAINER (2x2 Grid array layout) */}
                        <div className="grid grid-cols-2 gap-5 lg:gap-8 mt-2">
                            <div className="bg-slate-900/40 border border-slate-800/80 p-4 sm:p-5 lg:p-7 rounded-2xl flex items-center gap-5">
                                <Layers className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 shrink-0" />
                                <div>
                                    <span className="text-md md:text-lg uppercase tracking-wider font-bold text-slate-500 block mb-0.5">Availability</span>
                                    <span className="text-md md:text-xl lg:text-2xl font-bold text-emerald-400">{displayStock} {displayUnit} Available</span>
                                </div>
                            </div>
                            <div className="bg-slate-900/40 border border-slate-800/80 p-4 sm:p-5 lg:p-7 rounded-2xl flex items-center gap-5">
                                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 shrink-0" />
                                <div>
                                    <span className="text-md md:text-lg uppercase tracking-wider font-bold text-slate-500 block mb-0.5">Harvested On</span>
                                    <span className="text-md md:text-xl lg:text-2xl font-bold text-emerald-400">
                                        {product?.harvestDate
                                            ? new Date(product.harvestDate).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-slate-900/40 border border-slate-800/80 p-4 sm:p-5 lg:p-7 rounded-2xl flex items-center gap-5">
                                <MapPin className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 shrink-0" />
                                <div>
                                    <span className="text-md md:text-lg uppercase tracking-wider font-bold text-slate-500 block mb-0.5">From Farm</span>
                                    <span className="text-md md:text-xl lg:text-2xl font-bold text-emerald-400">{displayFarmName}</span>
                                </div>
                            </div>
                            <div className="bg-slate-900/40 border border-slate-800/80 p-4 sm:p-5 lg:p-7 rounded-2xl flex items-center gap-5">
                                <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 shrink-0" />
                                <div>
                                    <span className="text-md md:text-lg uppercase tracking-wider font-bold text-slate-500 block mb-0.5">Category</span>
                                    <span className="text-md md:text-xl lg:text-2xl font-bold text-emerald-400">{product?.category || 'Vegetables'}</span>
                                </div>
                            </div>
                        </div>

                        {/* INTERACTIVE CONTROLS WRAPPER ROW */}
                        <div className="hidden md:flex flex-col gap-4 mt-4">
                            <span className="text-sm lg:text-base font-bold text-slate-400 uppercase tracking-wider">Quantity (in {displayUnit})</span>
                            <div className="flex flex-col md:flex-row items-stretch sm:items-center gap-5">
                                <div className="flex items-center justify-center gap-6 sm:justify-start bg-slate-950 border border-slate-800 rounded-xl p-2 shrink-0">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition border-0 bg-transparent cursor-pointer"
                                    >
                                        <Minus className="h-6 w-6" />
                                    </button>
                                    <span className="text-base md:text-2xl font-black text-white px-8 w-16 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(displayStock, q + 1))}
                                        className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition border-0 bg-transparent cursor-pointer"
                                    >
                                        <Plus className="h-6 w-6" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className=" flex-1 h-14 md:h-16 lg:h-20 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-base md:text-xl rounded-xl transition shadow-xl shadow-emerald-500/10 uppercase tracking-wider flex items-center justify-center gap-4 border-0 cursor-pointer"
                                >
                                    <ShoppingCart className="h-6 w-6 lg:h-7 lg:w-7 fill-current" /> Add To Cart
                                </button>
                            </div>
                        </div>

                        {/* Guard Policy Disclaimers Line */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 text-sm md:text-lg text-slate-500 font-medium mt-2">
                            <span className="flex items-center gap-2.5"><ShieldCheck className="h-6 w-6 text-emerald-500" /> 100% Secure Payment</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-2.5"><RefreshCw className="h-5 w-5 text-emerald-500" /> Easy Returns</span>
                        </div>
                    </div>
                </div>

                {/* FARMER PROFILE CONTEXT BANNER MATRIX */}

                <div onClick={() =>
                    navigate(
                        `/customer/farmer/${product.farmer._id}`
                    )
                } className="bg-slate-900/20 border border-slate-800/60 rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row justify-between items-stretch xl:items-center gap-10 cursor-pointer hover:text-emerald-400 transition hover:border-emerald-500 transition-all duration-300 transform shadow-md hover:shadow-emerald-500/5" >
                    <div className='md:hidden text-2xl md:text-4xl font-black text-white '>Farmer Details</div>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="Farmer Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-3">
                                <h4 className="font-extrabold text-lg md:text-4xl lg:text:5xl text-white">{displayFarmerName}</h4>
                                {product?.farmer?.farmDetails?.isVerified && (
                                    <span className=" px-3 py-1 mt-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-md lg:text-lg font-black ">
                                        ✓ Verified
                                    </span>
                                )}
                                {!product?.farmer?.farmDetails?.isVerified && (
                                    <span className=" px-3 py-1 mt-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm lg:text-lg font-black ">
                                        Yet to be Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 text-md md:text-xl lg:text-2xl text-slate-400 font-medium">
                                <span>📍 {product?.farmer?.farmDetails?.location || 'Location Not Available'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Vertical Metrics Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:flex items-center justify-around border-t xl:border-t-0 xl:border-l border-slate-800/80 pt-8 xl:pt-0 pl-0 xl:pl-16 gap-8 md:gap-16 text-center">
                        <div className="flex flex-col items-center">
                            <span className="text-emerald-400 font-black text-2xl md:text-4xl block">
                                {product?.isOrganic ? 'Organic' : 'Conventional'}
                            </span>
                            <span className="text-xs md:text-sm uppercase tracking-wider text-slate-500 font-bold mt-2">
                                Farming Method
                            </span>
                        </div>
                        <div className="hidden sm:block xl:block h-12 w-px bg-slate-800/80"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-emerald-400 font-black text-2xl md:text-4xl block">Active</span>
                            <span className="text-xs md:text-sm uppercase tracking-wider text-slate-500 font-bold mt-2">
                                Marketplace Seller
                            </span>
                        </div>
                        <div className="hidden sm:block xl:block h-12 w-px bg-slate-800/80"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-emerald-400 font-black text-2xl md:text-4xl block">
                                {product?.farmerStats?.totalProducts || 0}
                            </span>
                            <span className="text-xs md:text-sm uppercase tracking-wider text-slate-500 font-bold mt-2">
                                Products Listed
                            </span>
                        </div>
                        <div className="hidden sm:block xl:block h-12 w-px bg-slate-800/80"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-emerald-400 font-black text-2xl md:text-4xl block">
                                {product?.farmerStats?.totalCategories || 0}
                            </span>
                            <span className="text-xs md:text-sm uppercase tracking-wider text-slate-500 font-bold mt-2">
                                Categories
                            </span>
                        </div>
                    </div>
                </div>

                {/* RELATED PRODUCTS */}
                <div className="bg-slate-900/20 border border-slate-800/60 rounded-3xl p-8 md:p-12">
                    <h3 className="text-2xl md:text-4xl font-black text-white mb-8 md:mb-10">
                        Related Products
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {relatedProducts.map(item => (
                            <div
                                key={item._id}
                                onClick={() => navigate(`/customer/product/${item._id}`)}
                                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-emerald-500/5"
                            >
                                <img src={item.imageUrl} alt={item.name} className="w-full h-40 sm:h-52 lg:h-64 object-cover" />
                                <div className="p-6 md:p-8">
                                    <h4 className="font-bold text-white text-lg md:text-2xl lg:text-3xl truncate">{item.name}</h4>
                                    <p className="text-slate-300 text-sm md:text-lg lg:text-xl mt-1">{item.farmer?.name}</p>
                                    <p className="text-emerald-400 font-black text-xl md:text-3xl mt-5">₹{item.pricePerUnit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BOTTOM TWIN LAYOUT BLOCK: FEEDBACK MANAGEMENT SYSTEMS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-14 items-start">

                    {/* LEFT PANEL SUMMARY CONTAINER ROWS */}
                    <div className="w-full lg:col-span-6 bg-slate-900/10 border border-slate-800/40 rounded-2xl p-6 md:p-10 flex flex-col gap-8">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10">

                            <h3 className="text-lg md:text-2xl lg:text-3xl font-black text-white mb-8">
                                Review Summary
                            </h3>

                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">

                                <div className="text-5xl md:text-7xl font-black text-emerald-400">
                                    {averageRating}
                                </div>

                                <div>
                                    <div className="text-yellow-400 text-2xl md:text-4xl">
                                        {'⭐'.repeat(
                                            Math.round(
                                                Number(averageRating)
                                            )
                                        )}
                                    </div>

                                    <p className="text-slate-400 text-sm md:text-lg mt-2">
                                        {reviewCount} Reviews
                                    </p>
                                </div>

                            </div>

                            {[5, 4, 3, 2, 1].map(star => (

                                <div
                                    key={star}
                                    className="
                flex
                items-center
                gap-4
                mb-4
            "
                                >

                                    <span className="
                w-10
                text-slate-300
                font-bold
                text-lg
            ">
                                        {star}★
                                    </span>

                                    <div className="
                flex-1
                h-3
                bg-slate-800
                rounded-full
                overflow-hidden
            ">

                                        <div
                                            style={{
                                                width:
                                                    reviewCount > 0
                                                        ? `${((summary[star] || 0) / reviewCount) * 100}%`
                                                        : '0%'
                                            }}
                                            className="
                        h-full
                        bg-yellow-400
                        rounded-full
                        transition-all
                        duration-500
                    "
                                        />

                                    </div>

                                    <span className="
                w-8
                text-right
                text-slate-400
            ">
                                        {summary[star] || 0}
                                    </span>

                                </div>

                            ))}

                        </div>

                        <div className="flex flex-col gap-6">
                            {reviews.length === 0 ? (
                                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-10 text-center">
                                    <MessageSquare className="w-14 h-14 mx-auto text-slate-500 mb-4" />
                                    <h4 className="text-lg md:text-2xl lg:text-3xl font-bold text-slate-300">No Reviews Yet</h4>
                                </div>
                            ) : (
                                reviews.map(review => (
                                    <div key={review._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 gap-4">
                                            <div>
                                                <h4 className="font-bold text-base md:text-xl lg:text-2xl text-white">
                                                    {review.customer?.name} <span className='ml-2'>●</span>
                                                    <span className='text-slate-300 text-sm md:text-lg lg:text-xl font-normal ml-2'>
                                                        {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </h4>
                                                <div className="text-yellow-400 text-sm md:text-lg lg:text-xl mt-1.5">
                                                    {'⭐'.repeat(review.rating)}
                                                </div>
                                            </div>

                                            {user?._id === review.customer?._id && (
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setEditingReviewId(review._id);
                                                            setRating(review.rating);
                                                            setComment(review.comment);
                                                        }}
                                                        className="text-blue-400 hover:text-blue-300 text-md md:text-xl lg:text-2xl font-bold bg-transparent border-0 cursor-pointer p-0"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review._id)}
                                                        className="text-red-400 hover:text-red-300 bg-transparent border-0 cursor-pointer p-0"
                                                    >
                                                        <Trash2 className="w-6 h-6 lg:w-7 lg:h-7" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-slate-200 text-md md:text-xl lg:text-3xl mt-5 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL SUMMARY CONTAINER ROWS */}
                    <div className="w-full lg:col-span-6 bg-slate-900/10 border border-slate-800/40 rounded-2xl p-6 md:p-10 flex flex-col gap-8">
                        <div>
                            <h3 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-white">Leave a Review</h3>
                            <p className="text-slate-500 text-sm md:text-base lg:text-xl mt-1">Share your firsthand experience balancing this product selection item.</p>
                        </div>

                        {/* Rating Star Selection Matrix */}
                        <div className="flex flex-col gap-3 mt-1">
                            <span className="text-md md:text-lg lg:text-xl font-bold text-slate-400 uppercase tracking-wider">Your Rating</span>
                            <div className="flex flex-wrap items-center gap-5">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="bg-transparent border-0 p-0 cursor-pointer"
                                        >
                                            <Star className={`w-9 h-9 md:w-12 md:h-12 transition-all ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-md md:text-lg lg:text-xl text-slate-400 font-semibold min-w-[90px]">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent'}
                                </p>
                            </div>
                        </div>

                        {/* Interactive Message Scribe Wrappers */}
                        <div className="flex flex-col gap-3">
                            <span className="text-md md:text-lg lg:text-xl font-bold text-slate-400 uppercase tracking-wider">Your Review</span>
                            <textarea
                                rows={5}
                                placeholder="Write your review here..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full p-5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl focus:outline-none text-slate-200 placeholder-slate-600 text-md md:text-xl lg:text-2xl font-medium transition resize-none shadow-inner leading-relaxed"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmitReview}
                            className="w-full h-14 md:h-16 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm md:text-lg lg:text-xl rounded-xl transition uppercase tracking-wider flex items-center justify-center gap-3 border-0 cursor-pointer shadow-lg shadow-emerald-500/5"
                        >
                            <Send className="h-5 w-5 fill-current" />
                            {editingReviewId
                                ? 'Update Review'
                                : 'Submit Review'}
                        </button>
                    </div>

                </div>

            </div>

            {/* ================= MOBILE STICKY PURCHASE BAR ================= */}
            <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 z-50 shadow-2xl">

                <div className="flex items-center gap-3">

                    {/* Quantity Selector */}
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl">

                        <button
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-white"
                        >
                            <Minus className="h-5 w-5" />
                        </button>

                        <span className="w-10 text-center font-black text-lg text-white">
                            {quantity}
                        </span>

                        <button
                            onClick={() => setQuantity(q => Math.min(displayStock, q + 1))}
                            className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-white"
                        >
                            <Plus className="h-5 w-5" />
                        </button>

                    </div>

                    {/* Add To Cart */}
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl py-3 font-black transition flex flex-col items-center justify-center"
                    >

                        <span className="text-lg">
                            Add To Cart
                        </span>

                        <span className="text-sm opacity-80">
                            ₹{displayPrice * quantity}
                        </span>

                    </button>

                </div>

            </div>

            {/* CUSTOM AUTH POPUP MODAL COMPONENT WINDOW */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowAuthModal(false)}></div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md sm:max-w-lg w-full text-center relative z-10 shadow-2xl">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-100 mb-3">Login Required</h3>
                        <p className="text-slate-400 text-sm md:text-lg mb-8 leading-relaxed">Please register or log into an active customer account shell session to place items inside your order basket vectors.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowAuthModal(false)} className="flex-1 py-3 px-5 bg-slate-800 text-slate-300 font-bold text-sm rounded-xl border border-slate-700 transition cursor-pointer">Cancel</button>
                            <button onClick={() => { setShowAuthModal(false); navigate('/login'); }} className="flex-1 py-3 px-5 bg-emerald-500 text-slate-950 font-black text-sm rounded-xl transition uppercase tracking-wider cursor-pointer border-0 shadow-lg shadow-emerald-500/10">Sign In</button>
                        </div>
                    </div>
                </div>
            )}
            {demoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">

                        <div className="text-6xl mb-4">
                            ⭐
                        </div>

                        <h2 className="text-3xl font-black text-white mb-3">
                            Demo Customer
                        </h2>

                        <p className="text-slate-300 leading-relaxed">
                            {demoMessage}
                        </p>

                        <p className="text-slate-500 text-sm mt-5">
                            You can browse products, read reviews and explore the marketplace,
                            but submitting ratings and reviews is disabled in the public demo environment.
                        </p>

                        <button
                            onClick={() => setDemoModal(false)}
                            className="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition"
                        >
                            Got it
                        </button>

                    </div>

                </div>
            )}
            <Footer />
        </div>
    );
};

const Minus = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>;
const Plus = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;

export default ProductDetails;