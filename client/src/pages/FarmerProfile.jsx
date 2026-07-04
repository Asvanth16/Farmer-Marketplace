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
            <div className="min-h-screen flex items-center justify-center bg-[#0b1329]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1329] text-white">
            <Navbar />

            <div className="max-w-[1800px] mx-auto p-6 lg:p-12">
                {/* Hero Header Card Container */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-8 lg:p-12 flex flex-col lg:flex-row justify-between gap-6 lg:gap-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-emerald-500/10 border-4 border-emerald-500/30 flex items-center justify-center text-5xl">
                            👨‍🌾
                        </div>

                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl lg:text-6xl font-black">{farmer?.name}</h1>
                                {farmer?.farmDetails?.isVerified ? (
                                    <span className="px-3 py-1 mt-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-md lg:text-lg font-black">✓ Verified</span>
                                ) : (
                                    <span className="px-3 py-1 mt-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-md lg:text-lg font-black">Yet to be Verified</span>
                                )}
                            </div>

                            <p className="text-slate-400 text-lg lg:text-2xl mt-3">📍 {farmer?.farmDetails?.location || 'Location Not Available'}</p>

                            {/* Joined Days Ago Metrics Badge */}


                            <p className="text-emerald-400 font-bold mt-2 text-md lg:text-lg">🌱 {farmer?.farmDetails?.farmingMethod || 'Organic'}</p>
                        </div>
                        <div>
                            {farmer?.createdAt && (
                                <p className="text-slate-300 text-sm sm:text-lg lg:text-2xl italic mt-3 sm:mt-6 lg:mt-24 lg:ml-8">📅 {calculateDaysAgo(farmer.createdAt)}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center lg:items-end">
                        <div className="text-5xl lg:text-7xl font-black text-yellow-400">⭐ {farmerReviewAverage}</div>
                        <p className="text-slate-400 mt-2 text-lg">{farmerReviewCount} Farmer Reviews</p>
                    </div>
                </div>
            </div>

            {/* Farm Stat Counter Dash Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mx-4 sm:mx-6 lg:mx-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="text-3xl lg:text-5xl font-black text-emerald-400">{stats?.totalProducts || 0}</div>
                    <div className="text-slate-400 mt-2">Products Listed</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="text-3xl lg:text-5xl font-black text-emerald-400">{stats?.totalCategories || 0}</div>
                    <div className="text-slate-400 mt-2">Categories</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="text-3xl lg:text-5xl font-black text-emerald-400">{stats?.totalOrders || 0}</div>
                    <div className="text-slate-400 mt-2">Total Orders</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="text-3xl lg:text-5xl font-black text-yellow-400">⭐ {stats?.averageProductRating || 0}</div>
                    <div className="text-slate-400 mt-2">Product Rating</div>
                    <div className="text-xs lg:text-sm text-slate-500 mt-1">{stats?.totalReviewCount || 0} Reviews</div>
                </div>
            </div>

            {/* Top Product Distribution Progression Bars */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 mt-8 mx-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl lg:text-4xl font-black text-white">Top Selling Products</h2>
                    <span className="text-emerald-400 font-bold text-lg">{stats?.totalSales || 0} Units Sold</span>
                </div>

                <div className="flex flex-col gap-6">
                    {stats?.topSellingProducts?.map(product => (
                        <div key={product.name}>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-2">
                                <div>
                                    <h4 className="text-lg lg:text-xl font-bold text-white">{product.name}</h4>
                                    <p className="text-slate-500 text-sm">{product.quantity} units sold</p>
                                </div>
                                <span className="text-emerald-400 font-black text-xl">{product.percentage}%</span>
                            </div>
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                <div style={{ width: `${product.percentage}%` }} className="h-full bg-emerald-500 rounded-full transition-all duration-700" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Slider Showcase Array */}
            <div className="group relative mt-10 mx-4 sm:mx-6 lg:mx-8">

                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black">
                        Products From This Farm
                    </h2>

                    {products.length > 1 && (
                        <div className="hidden lg:flex gap-3">

                            <button
                                onClick={() =>
                                    sliderRef.current?.scrollBy({
                                        left: -sliderRef.current.clientWidth * 0.8,
                                        behavior: "smooth",
                                    })
                                }
                                className="hidden lg:flex absolute left-3 top-[58%] -translate-y-1/2 z-50 w-16 h-16 rounded-full bg-slate-900/70 backdrop-blur-xl border border-slate-700/70 items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-emerald-500 hover:border-emerald-500 hover:scale-110"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <button
                                onClick={() =>
                                    sliderRef.current?.scrollBy({
                                        left: sliderRef.current.clientWidth * 0.8,
                                        behavior: "smooth",
                                    })
                                }
                                className="hidden lg:flex absolute right-3 top-[58%] -translate-y-1/2 z-50 w-16 h-16 rounded-full bg-slate-900/70 backdrop-blur-xl border border-slate-700/70 items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-emerald-500 hover:border-emerald-500 hover:scale-110"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>

                        </div>
                    )}

                </div>

                {products.length === 0 ? (

                    <p className="text-slate-500">
                        No farm items listed under this profile.
                    </p>

                ) : (

                    <div
                        ref={sliderRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 lg:px-12 pb-6 scrollbar-hide select-none"
                    >

                        {products.map((product) => (

                            <div
                                key={product._id}
                                onClick={() => navigate(`/customer/product/${product._id}`)}
                                className="group snap-start shrink-0 w-[88%] sm:w-[48%] md:w-[42%] lg:w-[31%] xl:w-[24%] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden cursor-pointer hover:border-emerald-500 hover:-translate-y-3 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(16,185,129,0.25)] transition-all"
                            >

                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-52 sm:h-56 md:h-60 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                <div className="p-5">

                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black truncate">

                                        {product.name}

                                    </h3>

                                    <p className="text-slate-400 mt-2">

                                        {product.category}

                                    </p>

                                    <div className="flex justify-between mt-5">

                                        <span className="text-emerald-400 text-2xl font-black">

                                            ₹{product.pricePerUnit}

                                        </span>

                                        <span className="text-slate-500">

                                            {product.availabilityQuantity} {product.unit}

                                        </span>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

            {/* Bottom Form and Breakdown Grid System */}
            <div className="mt-14 mx-4 sm:mx-6 lg:mx-8 pb-16">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-14 items-start">

                    {/* Feedback Matrix Aggregates */}
                    <div className="w-full lg:col-span-6 bg-slate-900/10 border border-slate-800/40 rounded-2xl p-6 md:p-10 flex flex-col gap-8">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10">
                            <h3 className="text-lg md:text-2xl lg:text-3xl font-black text-white mb-8">Review Summary</h3>
                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                                <div className="text-5xl md:text-7xl font-black text-emerald-400">{farmerReviewAverage}</div>
                                <div>
                                    <div className="text-yellow-400 text-2xl md:text-4xl">{'⭐'.repeat(Math.round(Number(farmerReviewAverage)))}</div>
                                    <p className="text-slate-400 text-sm md:text-lg mt-2">{farmerReviewCount} Reviews</p>
                                </div>
                            </div>

                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} className="flex items-center gap-4 mb-4">
                                    <span className="w-10 text-slate-300 font-bold text-lg">{star}★</span>
                                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <div style={{ width: farmerReviewCount > 0 ? `${((farmerReviewSummary[star] || 0) / farmerReviewCount) * 100}%` : '0%' }} className="h-full bg-yellow-400 rounded-full transition-all duration-500" />
                                    </div>
                                    <span className="w-8 text-right text-slate-400">{farmerReviewSummary[star] || 0}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-6">
                            {farmerReviews.length === 0 ? (
                                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-10 text-center">
                                    <MessageSquare className="w-14 h-14 mx-auto text-slate-500 mb-4" />
                                    <h4 className="text-lg md:text-2xl lg:text-3xl font-bold text-slate-300">No Reviews Yet</h4>
                                </div>
                            ) : (
                                farmerReviews.map(review => (
                                    <div key={review._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                            <div>
                                                <h4 className="font-bold text-base md:text-xl lg:text-2xl text-white">
                                                    {review.customer?.name} <span className="ml-2">●</span>
                                                    <span className="text-slate-300 text-sm md:text-lg lg:text-xl font-normal ml-2">
                                                        {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </h4>
                                                <div className="text-yellow-400 text-sm md:text-lg lg:text-xl mt-1.5">{'⭐'.repeat(review.rating)}</div>
                                            </div>

                                            {user?._id === review.customer?._id && (
                                                <div className="flex items-center gap-5 shrink-0">
                                                    <button onClick={() => { setEditingReviewId(review._id); setRating(review.rating); setComment(review.comment); }} className="text-blue-400 hover:text-blue-300 text-md md:text-xl lg:text-2xl font-bold bg-transparent border-0 cursor-pointer p-0">Edit</button>
                                                    <button onClick={() => handleDeleteReview(review._id)} className="text-red-400 hover:text-red-300 bg-transparent border-0 cursor-pointer p-0"><Trash2 className="w-6 h-6 lg:w-7 lg:h-7" /></button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-slate-200 text-md md:text-xl lg:text-3xl mt-5 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Interactive Review Action Form */}
                    <div className="w-full lg:col-span-6 bg-slate-900/10 border border-slate-800/40 rounded-2xl p-6 md:p-10 flex flex-col gap-8">
                        {user?._id === farmer?._id ? (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center my-auto">
                                <h4 className="text-xl lg:text-2xl font-bold text-slate-300">You cannot review your own profile</h4>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-white">Leave a Review</h3>
                                    <p className="text-slate-500 text-sm md:text-base lg:text-xl mt-1">Share your experience with this farmer, product quality, delivery and communication.</p>
                                </div>

                                <div className="flex flex-col gap-3 mt-1">
                                    <span className="text-md md:text-lg lg:text-xl font-bold text-slate-400 uppercase tracking-wider">Your Rating</span>
                                    <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-0">
                                        <div className="flex flex-wrap items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} type="button" onClick={() => setRating(star)} className="bg-transparent border-0 p-0 cursor-pointer">
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

                                <div className="flex flex-col gap-3">
                                    <span className="text-md md:text-lg lg:text-xl font-bold text-slate-400 uppercase tracking-wider">Your Review</span>
                                    <textarea rows={4} placeholder="Write your review here..." value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl focus:outline-none text-slate-200 placeholder-slate-600 text-md md:text-xl lg:text-2xl font-medium transition resize-none shadow-inner leading-relaxed" />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button type="button" onClick={handleSubmitReview} className="w-full h-12 sm:h-14 md:h-16 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm md:text-lg lg:text-xl rounded-xl transition uppercase tracking-wider flex items-center justify-center gap-3 border-0 cursor-pointer shadow-lg shadow-emerald-500/5">
                                        <Send className="h-5 w-5 fill-current" /> {editingReviewId ? 'Update Review' : 'Submit Review'}
                                    </button>

                                    {editingReviewId && (
                                        <button type="button" onClick={() => { setEditingReviewId(null); setRating(0); setComment(''); }} className="w-full h-14 border border-slate-700 hover:border-slate-500 rounded-xl font-bold text-slate-300 transition cursor-pointer bg-transparent">Cancel Edit</button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>
            {demoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md text-center">

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
                            You can explore products, farmers and existing reviews,
                            but submitting new ratings or reviews is disabled in the
                            public demo environment.
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

export default FarmerProfile;