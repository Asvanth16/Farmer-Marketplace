import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../api/axios";
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";
import { Star, MessageSquare, Send, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const FarmerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const sliderRef = useRef(null);

    const [farmer, setFarmer] = useState(null);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [farmerReviews, setFarmerReviews] = useState([]);

    const [farmerReviewAverage, setFarmerReviewAverage] = useState(0);
    const [farmerReviewCount, setFarmerReviewCount] = useState(0);
    const [farmerReviewSummary, setFarmerReviewSummary] = useState({});

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Context user setup for review management safety checks
    const [user, setUser] = useState(null);

    const isDemoCustomer =
        localStorage.getItem("isDemo") === "true" &&
        localStorage.getItem("role") === "customer";

    const [demoModal, setDemoModal] = useState(false);
    const [demoMessage, setDemoMessage] = useState("");

    // Helper function to calculate days since profile creation
    const calculateDaysAgo = (dateString) => {
        if (!dateString) return '';
        const createdDate = new Date(dateString);
        const currentDate = new Date();

        createdDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(currentDate - createdDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Joined today';
        if (diffDays === 1) return 'Joined 1 day ago';
        return `Joined ${diffDays} days ago`;
    };

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        const storedId = localStorage.getItem('userId');

        if (storedId) {
            setUser({
                _id: storedId,
                name: storedName || "Customer"
            });
        }
    }, []);

    const handleSubmitReview = async () => {
        try {
            if (isDemoCustomer) {
                showDemoModal(
                    "Submitting ratings and reviews is disabled for the Demo Customer account."
                );
                return;
            }

            if (editingReviewId) {
                await api.put(
                    `/api/farmer-reviews/${editingReviewId}`,
                    { rating, comment },
                );
            } else {
                await api.post(
                    '/api/farmer-reviews',
                    { farmerId: id, rating, comment },
                );
            }

            const reviewRes = await api.get(`/api/farmer-reviews/${id}`);
            setFarmerReviews(reviewRes.data.reviews);
            setFarmerReviewAverage(reviewRes.data.averageRating);
            setFarmerReviewCount(reviewRes.data.reviewCount);
            setFarmerReviewSummary(reviewRes.data.summary);

            setRating(0);
            setComment('');
            setEditingReviewId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await api.delete(`/api/farmer-reviews/${reviewId}`);

            const reviewRes = await api.get(`/api/farmer-reviews/${id}`);
            setFarmerReviews(reviewRes.data.reviews);
            setFarmerReviewAverage(reviewRes.data.averageRating);
            setFarmerReviewCount(reviewRes.data.reviewCount);
            setFarmerReviewSummary(reviewRes.data.summary);
        } catch (error) {
            console.error(error);
        }
    };

    const showDemoModal = (message) => {
        setDemoMessage(message);
        setDemoModal(true);
    };

    useEffect(() => {
        const fetchFarmer = async () => {
            try {
                const res = await api.get(`/api/products/farmer-profile/${id}`);
                const reviewRes = await api.get(`/api/farmer-reviews/${id}`);

                setFarmer(res.data.farmer);
                setProducts(res.data.products);
                setStats(res.data.stats);

                setFarmerReviews(reviewRes.data.reviews);
                setFarmerReviewAverage(reviewRes.data.averageRating);
                setFarmerReviewCount(reviewRes.data.reviewCount);
                setFarmerReviewSummary(reviewRes.data.summary);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchFarmer();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060c18]">
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060c18] text-slate-100 font-sans selection:bg-emerald-500/20">
            <Navbar />

            {/* FLUID CONTAINER ATTACHED TO PRODUCT PAGE SPECS */}
            <div className="w-full px-4 sm:px-6 lg:px-12 2xl:px-16 py-5 sm:py-8 md:py-12 flex flex-col gap-8">
                
                {/* HERO HEADER FARMER BANNER */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl text-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left w-full md:w-auto">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-3xl">
                            👨‍🌾
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 uppercase">
                                    {farmer?.name}
                               </h1>
                                {farmer?.farmDetails?.isVerified ? (
                                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-black">✓ Verified</span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[10px] font-black">Unverified</span>
                                )}
                            </div>

                            <p className="text-slate-400 font-medium text-xs mt-1">📍 {farmer?.farmDetails?.location || 'Location Not Available'}</p>
                            <p className="text-emerald-400 font-bold text-xs mt-0.5">🌱 {farmer?.farmDetails?.farmingMethod || 'Organic'}</p>
                        </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto border-t md:border-t-0 border-slate-800/60 pt-4 md:pt-0 shrink-0">
                        <div className="text-xl sm:text-2xl font-black text-yellow-400 flex items-center gap-1.5">
                            <span>⭐</span>{farmerReviewAverage}
                        </div>
                        <p className="text-slate-500 text-xs font-semibold md:mt-0.5">{farmerReviewCount} Farmer Reviews</p>
                        {farmer?.createdAt && (
                            <p className="text-slate-400 text-xs italic mt-1 hidden md:block">{calculateDaysAgo(farmer.createdAt)}</p>
                        )}
                    </div>
                </div>

                {/* FARM STAT COUNTER DASH MATRIX */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <div className="text-lg lg:text-xl font-black text-emerald-400">{stats?.totalProducts || 0}</div>
                        <div className="text-xs uppercase tracking-widest font-black text-slate-500 mt-0.5">Products Listed</div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <div className="text-lg lg:text-xl font-black text-emerald-400">{stats?.totalCategories || 0}</div>
                        <div className="text-xs uppercase tracking-widest font-black text-slate-500 mt-0.5">Categories</div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <div className="text-lg lg:text-xl font-black text-emerald-400">{stats?.totalOrders || 0}</div>
                        <div className="text-xs uppercase tracking-widest font-black text-slate-500 mt-0.5">Total Orders</div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <div className="text-lg lg:text-xl font-black text-yellow-400">⭐ {stats?.averageProductRating || 0}</div>
                        <div className="text-xs uppercase tracking-widest font-black text-slate-500 mt-0.5">Product Rating</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">{stats?.totalReviewCount || 0} Reviews</div>
                    </div>
                </div>

                {/* TOP PRODUCT DISTRIBUTION PROGRESSION BARS */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg text-sm">
                    <div className="flex items-center justify-between mb-5 border-b border-slate-800/60 pb-3">
                        <h2 className="text-xs uppercase tracking-widest font-black text-slate-400">Top Selling Products</h2>
                        <span className="text-emerald-400 font-bold text-xs">{stats?.totalSales || 0} Units Sold</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {stats?.topSellingProducts?.map(product => (
                            <div key={product.name} className="bg-slate-950 border border-slate-800/60 p-3 rounded-xl">
                                <div className="flex justify-between items-center mb-1.5">
                                    <div>
                                        <h4 className="font-bold text-white text-xs sm:text-sm">{product.name}</h4>
                                        <p className="text-slate-500 text-xs">{product.quantity} units sold</p>
                                    </div>
                                    <span className="text-emerald-400 font-black text-sm">{product.percentage}%</span>
                                </div>
                                <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                                    <div style={{ width: `${product.percentage}%` }} className="h-full bg-emerald-500 rounded-full transition-all duration-700" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SLIDER SHOWCASE ARRAY */}
                <div className="group relative text-sm bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-5 border-b border-slate-800/60 pb-3">
                        <h2 className="text-xs uppercase tracking-widest font-black text-slate-400">
                            Products From This Farm
                        </h2>

                        {products.length > 1 && (
                            <div className="hidden lg:flex gap-2">
                                <button
                                    onClick={() =>
                                        sliderRef.current?.scrollBy({
                                            left: -sliderRef.current.clientWidth * 0.8,
                                            behavior: "smooth",
                                        })
                                    }
                                    className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() =>
                                        sliderRef.current?.scrollBy({
                                            left: sliderRef.current.clientWidth * 0.8,
                                            behavior: "smooth",
                                        })
                                    }
                                    className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {products.length === 0 ? (
                        <p className="text-slate-500 text-xs italic">
                            No farm items listed under this profile.
                        </p>
                    ) : (
                        <div
                            ref={sliderRef}
                            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 scrollbar-hide select-none"
                        >
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    onClick={() => navigate(`/customer/product/${product._id}`)}
                                    className="snap-start shrink-0 w-[75%] sm:w-[45%] md:w-[35%] lg:w-[23%] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all flex flex-col text-xs"
                                >
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-36 object-cover"
                                    />

                                    <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
                                        <div>
                                            <h3 className="font-bold text-white text-xs sm:text-sm truncate">
                                                {product.name}
                                            </h3>
                                            <p className="text-slate-500 text-[11px] mt-0.5">
                                                {product.category}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-slate-900">
                                            <span className="text-emerald-400 text-sm font-black">
                                                ₹{product.pricePerUnit}
                                            </span>
                                            <span className="text-slate-500 text-[10px] font-medium">
                                                {product.availabilityQuantity} {product.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* BOTTOM FEEDBACK & REVIEW SYSTEM */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-sm">

                    {/* LEFT PANEL: REVIEW SUMMARY BREAKDOWN BOX */}
                    <div className="w-full lg:col-span-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                            <h3 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-4">
                                Review Summary
                            </h3>

                            <div className="flex items-center gap-4 mb-5">
                                <div className="text-3xl font-black text-emerald-400">
                                    {farmerReviewAverage}
                                </div>
                                <div>
                                    <div className="text-yellow-400 text-base">
                                        {'⭐'.repeat(Math.round(Number(farmerReviewAverage)))}
                                    </div>
                                    <p className="text-slate-500 text-xs font-semibold mt-0.5">
                                        {farmerReviewCount} Reviews total
                                    </p>
                                </div>
                            </div>

                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} className="flex items-center gap-3 mb-2 text-xs">
                                    <span className="w-6 text-slate-400 font-bold">{star}★</span>
                                    <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                                        <div
                                            style={{ width: farmerReviewCount > 0 ? `${((farmerReviewSummary[star] || 0) / farmerReviewCount) * 100}%` : '0%' }}
                                            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                        />
                                    </div>
                                    <span className="w-6 text-right text-slate-500">{farmerReviewSummary[star] || 0}</span>
                                </div>
                            ))}
                        </div>

                        {/* Customer Reviews Mapping Stack */}
                        <div className="flex flex-col gap-4">
                            {farmerReviews.length === 0 ? (
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center">
                                    <MessageSquare className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                                    <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">No Reviews Yet</h4>
                                </div>
                            ) : (
                                farmerReviews.map(review => (
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

                    {/* RIGHT PANEL: INTERACTIVE REVIEW ACTION FORM */}
                    <div className="w-full lg:col-span-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl flex flex-col gap-4 shadow-xl">
                        {user?._id === farmer?._id ? (
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center my-auto">
                                <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">You cannot review your own profile</h4>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-xs uppercase tracking-widest font-black text-slate-400">Leave a Review</h3>
                                    <p className="text-slate-500 text-xs mt-0.5">Share your experience with this farmer, product quality, delivery and communication.</p>
                                </div>

                                {/* Rating Star Matrix */}
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Your Rating</span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} type="button" onClick={() => setRating(star)} className="bg-transparent border-0 p-0 cursor-pointer">
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

                                {/* Text Area Box */}
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Your Review</span>
                                    <textarea
                                        rows={4}
                                        placeholder="Write your review insights here..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl focus:outline-none text-slate-200 placeholder-slate-700 text-xs sm:text-sm font-medium transition resize-none shadow-inner"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSubmitReview}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3 rounded-xl transition-all uppercase tracking-wider border-0 cursor-pointer shadow-md flex items-center justify-center gap-2"
                                    >
                                        <Send className="h-4 w-4 fill-current" />
                                        {editingReviewId ? 'Update Review' : 'Submit Review'}
                                    </button>

                                    {editingReviewId && (
                                        <button
                                            type="button"
                                            onClick={() => { setEditingReviewId(null); setRating(0); setComment(''); }}
                                            className="w-full py-2.5 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-400 font-bold transition cursor-pointer bg-transparent"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ERROR / ACTIONS MANAGEMENT DIALOG MODAL LAYERS */}
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

export default FarmerProfile;