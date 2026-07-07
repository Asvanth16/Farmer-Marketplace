import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Trash2 } from 'lucide-react';

import {
    ArrowLeft, Star, Calendar, MapPin, CheckCircle,
    Layers, ShoppingCart, ShieldCheck, RefreshCw,
    MessageSquare, Send
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

                const reviewRes = await api.get(`/api/reviews/${id}`);
                setReviews(reviewRes.data.reviews);
                setAverageRating(reviewRes.data.averageRating);
                setReviewCount(reviewRes.data.reviewCount);
                setSummary(reviewRes.data.summary);

                const relatedRes = await api.get(`/api/products/${id}/related`);
                setRelatedProducts(relatedRes.data);

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
            showDemoModal("Submitting ratings and reviews is disabled for the Demo Customer account.");
            return;
        }
        try {
            if (editingReviewId) {
                await api.put(`/api/reviews/${editingReviewId}`, { rating, comment });
            } else {
                await api.post('/api/reviews', { productId: id, rating, comment });
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
            alert(error.response?.data?.message || "Failed to submit review.");
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
            navigate('/customer/cart');
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

            {/* FLUID LAYOUT BOUNDS MATCHING THE CART EDGE PADDING */}
            <div className="w-full px-4 sm:px-6 lg:px-12 2xl:px-16 py-5 sm:py-8 md:py-12 flex flex-col gap-8">

                {/* BREADCRUMB HEADER PORTAL */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
                    <button onClick={() => navigate('/customer/marketplace')} className="hover:text-emerald-400 flex items-center gap-1.5 bg-transparent border border-slate-800 rounded-xl cursor-pointer px-3 py-1.5 text-emerald-500 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
                    </button>
                    <span>/</span>
                    <span className="capitalize text-slate-500">{product?.category || 'Vegetables'}</span>
                    <span>/</span>
                    <span className="text-slate-300 font-bold">{product?.name || 'Small Onion'}</span>
                </div>

                {/* MAIN SPLIT STAGE SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

                    {/* LEFT COLUMN: MEDIA BOX FRAME */}
                    <div className="w-full lg:col-span-6 flex flex-col gap-4">
                        <div className="w-full aspect-square max-h-[400px] lg:max-h-[450px] rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800 flex items-center justify-center shadow-xl">
                            {gallery[activeImageIdx] ? (
                                <img src={gallery[activeImageIdx]} alt={product?.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-6xl">🌾</span>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SYSTEM ACTION DATA PANEL (DOWNSCALED EXACTLY LIKE CART CHECKOUT) */}
                    <div className="w-full lg:col-span-6 flex flex-col gap-5 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl shadow-xl">
                        
                        <div className="flex items-center">
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-wide px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Organic
                            </span>
                        </div>

                        {/* COMPACT CLEAN HEADINGS MATCHING CART INTERFACE */}
                        <h1 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-black tracking-tight text-slate-100 uppercase">
                            {product?.name || 'Small Onion'}
                        </h1>

                        {/* Ratings Metrics Row */}
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-yellow-400 text-base">⭐</span>
                            <span className="font-bold text-slate-200">
                                {product?.averageRating ? product.averageRating.toFixed(1) : "0.0"}
                            </span>
                            <span className="text-slate-500 font-medium">
                                ({product?.reviewCount || 0} reviews)
                            </span>
                        </div>

                        {/* Price Unit Frame */}
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-emerald-400 font-black text-2xl lg:text-2xl xl:text-3xl tracking-tight">₹{displayPrice}</span>
                            <span className="text-slate-400 text-xs sm:text-sm font-semibold">/ {displayUnit}</span>
                        </div>

                        {/* SPECIFICATION PILLS CONTAINER (2x2 Compact Grid Layout) */}
                        <div className="grid grid-cols-2 gap-4 mt-1 text-sm">
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                                <Layers className="h-5 w-5 text-emerald-400 shrink-0" />
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-0.5">Availability</span>
                                    <span className="font-bold text-emerald-400">{displayStock} {displayUnit} Left</span>
                                </div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                                <Calendar className="h-5 w-5 text-emerald-400 shrink-0" />
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-0.5">Harvested On</span>
                                    <span className="font-bold text-slate-300">
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
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                                <MapPin className="h-5 w-5 text-emerald-400 shrink-0" />
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-0.5">From Farm</span>
                                    <span className="font-bold text-slate-300 truncate max-w-[140px] block">{displayFarmName}</span>
                                </div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-0.5">Category</span>
                                    <span className="font-bold text-slate-300">{product?.category || 'Vegetables'}</span>
                                </div>
                            </div>
                        </div>

                        {/* INTERACTIVE CONTROLS WRAPPER (Compact sizing matching Cart modifiers) */}
                        <div className="flex flex-col gap-2 mt-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                                Quantity (in {displayUnit})
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-lg font-bold transition flex items-center justify-center border border-slate-800/60 cursor-pointer active:scale-95"
                                    >
                                        -
                                    </button>
                                    <span className="text-slate-100 font-black text-sm px-5 min-w-[40px] text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(displayStock, q + 1))}
                                        className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-lg font-bold transition flex items-center justify-center border border-slate-800/60 cursor-pointer active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/5 uppercase tracking-wider border-0 cursor-pointer text-center flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="h-4 w-4 fill-current" /> Add To Cart
                                </button>
                            </div>
                        </div>

                        {/* Guard Policy Disclaimers Line */}
                        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-1 text-xs text-slate-500 font-medium mt-1 pt-3 border-t border-slate-800/60">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> 100% Secure Payment</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5 text-emerald-500" /> Easy Returns</span>
                        </div>
                    </div>
                </div>

                {/* FARMER PROFILE COMPACT BANNER CARD */}
                <div onClick={() => navigate(`/customer/farmer/${product.farmer._id}`)} 
                     className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6 cursor-pointer hover:border-emerald-500/30 transition-all duration-300 shadow-lg text-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="Farmer Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-extrabold text-base text-white">{displayFarmerName}</h4>
                                {product?.farmer?.farmDetails?.isVerified ? (
                                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-black">✓ Verified</span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[10px] font-black">Unverified</span>
                                )}
                            </div>
                            <span className="text-slate-400 font-medium text-xs">📍 {product?.farmer?.farmDetails?.location || 'Location Not Available'}</span>
                        </div>
                    </div>

                    {/* Compact Metrics Columns */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex items-center border-t xl:border-t-0 xl:border-l border-slate-800/80 pt-4 xl:pt-0 pl-0 xl:pl-8 gap-4 sm:gap-8 text-center">
                        <div>
                            <span className="text-emerald-400 font-black text-sm block">{product?.isOrganic ? 'Organic' : 'Conventional'}</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mt-0.5">Method</span>
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-slate-800/80 mx-auto"></div>
                        <div>
                            <span className="text-emerald-400 font-black text-sm block">Active</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mt-0.5">Status</span>
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-slate-800/80 mx-auto"></div>
                        <div>
                            <span className="text-emerald-400 font-black text-sm block">{product?.farmerStats?.totalProducts || 0}</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mt-0.5">Products</span>
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-slate-800/80 mx-auto"></div>
                        <div>
                            <span className="text-emerald-400 font-black text-sm block">{product?.farmerStats?.totalCategories || 0}</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mt-0.5">Categories</span>
                        </div>
                    </div>
                </div>

                {/* RELATED PRODUCTS */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-sm uppercase tracking-widest font-black text-slate-400 mb-5 border-b border-slate-800/60 pb-3">
                        Related Products
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {relatedProducts.map(item => (
                            <div
                                key={item._id}
                                onClick={() => navigate(`/customer/product/${item._id}`)}
                                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all duration-300 shadow-md flex flex-col text-sm"
                            >
                                <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
                                <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                                    <div>
                                        <h4 className="font-bold text-white truncate">{item.name}</h4>
                                        <p className="text-slate-400 text-xs mt-0.5">{item.farmer?.name}</p>
                                    </div>
                                    <p className="text-emerald-400 font-black text-base mt-2">₹{item.pricePerUnit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BOTTOM FEEDBACK REGION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-sm">

                    {/* LEFT PANEL: REVIEW SUMMARY BOX */}
                    <div className="w-full lg:col-span-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                            <h3 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-4">
                                Review Summary
                            </h3>

                            <div className="flex items-center gap-4 mb-5">
                                <div className="text-3xl font-black text-emerald-400">
                                    {averageRating}
                                </div>
                                <div>
                                    <div className="text-yellow-400 text-base">
                                        {'⭐'.repeat(Math.round(Number(averageRating)))}
                                    </div>
                                    <p className="text-slate-500 text-xs font-semibold mt-0.5">
                                        {reviewCount} Reviews total
                                    </p>
                                </div>
                            </div>

                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} className="flex items-center gap-3 mb-2 text-xs">
                                    <span className="w-6 text-slate-400 font-bold">{star}★</span>
                                    <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                                        <div
                                            style={{ width: reviewCount > 0 ? `${((summary[star] || 0) / reviewCount) * 100}%` : '0%' }}
                                            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                        />
                                    </div>
                                    <span className="w-6 text-right text-slate-500">{summary[star] || 0}</span>
                                </div>
                            ))}
                        </div>

                        {/* Customer Reviews Mapping Stack */}
                        <div className="flex flex-col gap-4">
                            {reviews.length === 0 ? (
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center">
                                    <MessageSquare className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                                    <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">No Reviews Yet</h4>
                                </div>
                            ) : (
                                reviews.map(review => (
                                    <div key={review._id} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h4 className="font-bold text-slate-200 text-xs sm:text-sm">
                                                    {review.customer?.name}
                                                    <span className='text-slate-500 font-normal ml-2 text-xs'>
                                                        {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </h4>
                                                <div className="text-yellow-400 text-xs mt-0.5">
                                                    {'⭐'.repeat(review.rating)}
                                                </div>
                                            </div>

                                            {user?._id === review.customer?._id && (
                                                <div className="flex items-center gap-2.5">
                                                    <button
                                                        onClick={() => {
                                                            setEditingReviewId(review._id);
                                                            setRating(review.rating);
                                                            setComment(review.comment);
                                                        }}
                                                        className="text-blue-400 hover:text-blue-300 text-xs font-bold bg-transparent border-0 cursor-pointer p-0"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review._id)}
                                                        className="text-red-400 hover:text-red-300 bg-transparent border-0 cursor-pointer p-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: WRITE REVIEW INPUT FIELD */}
                    <div className="w-full lg:col-span-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl flex flex-col gap-4 shadow-xl">
                        <div>
                            <h3 className="text-xs uppercase tracking-widest font-black text-slate-400">Leave a Review</h3>
                            <p className="text-slate-500 text-xs mt-0.5">Share your firsthand experience with this item choice.</p>
                        </div>

                        {/* Rating Star Matrices */}
                        <div className="flex flex-col gap-1.5 mt-1">
                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Your Rating</span>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="bg-transparent border-0 p-0 cursor-pointer"
                                        >
                                            <Star className={`w-6 h-6 transition-all ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 font-bold min-w-[70px]">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent'}
                                </p>
                            </div>
                        </div>

                        {/* Text Review Box Scribe Area */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Your Review</span>
                            <textarea
                                rows={4}
                                placeholder="Write your feedback observations here..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl focus:outline-none text-slate-200 placeholder-slate-700 text-xs sm:text-sm font-medium transition resize-none shadow-inner"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmitReview}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3 rounded-xl transition-all uppercase tracking-wider border-0 cursor-pointer shadow-md flex items-center justify-center gap-2"
                        >
                            <Send className="h-4 w-4 fill-current" />
                            {editingReviewId ? 'Update Review' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= MOBILE STICKY BOTTOM PURCHASE BAR ================= */}
            <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 z-50 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                        <button
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white"
                        >
                            <span className="text-lg font-bold">-</span>
                        </button>
                        <span className="w-8 text-center font-black text-sm text-white">{quantity}</span>
                        <button
                            onClick={() => setQuantity(q => Math.min(displayStock, q + 1))}
                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white"
                        >
                            <span className="text-lg font-bold">+</span>
                        </button>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl py-2.5 font-black transition flex flex-col items-center justify-center border-0 cursor-pointer"
                    >
                        <span className="text-sm font-black uppercase tracking-wider">Add To Cart</span>
                        <span className="text-xs opacity-80 font-bold">₹{displayPrice * quantity}</span>
                    </button>
                </div>
            </div>

            {/* ERROR / ACTIONS MANAGEMENT DIALOG MODAL LAYERS */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full text-center relative z-10 shadow-2xl text-sm">
                        <h3 className="text-lg font-black text-slate-100 mb-2">Login Required</h3>
                        <p className="text-slate-400 mb-5 leading-relaxed">Please sign into an active customer session to place choice crops inside your order cart container node structures.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowAuthModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl border-0 cursor-pointer">Cancel</button>
                            <button onClick={() => { setShowAuthModal(false); navigate('/login'); }} className="flex-1 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl transition uppercase tracking-wider border-0 cursor-pointer">Sign In</button>
                        </div>
                    </div>
                </div>
            )}

            {demoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm text-center text-sm shadow-2xl">
                        <div className="text-5xl mb-3">⭐</div>
                        <h2 className="text-xl font-black text-white mb-2">Demo Customer</h2>
                        <p className="text-slate-300 leading-relaxed">{demoMessage}</p>
                        <p className="text-slate-500 text-xs mt-4">Submitting review ratings is locked in order to preserve public testing platform environments safely.</p>
                        <button
                            onClick={() => setDemoModal(false)}
                            className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl border-0 cursor-pointer"
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

export default ProductDetails;