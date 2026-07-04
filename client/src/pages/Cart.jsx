import React, { useState, useEffect } from 'react';
import api from "../api/axios";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";


const Cart = () => {
  const navigate = useNavigate();
  const [cartOrder, setCartOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliverySlot, setDeliverySlot] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const isDemoCustomer =
    localStorage.getItem("isDemo") === "true" &&
    localStorage.getItem("role") === "customer";

  const [demoModal, setDemoModal] = useState(false);
  const [demoMessage, setDemoMessage] = useState("");

  // Modal States
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(true);

  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const res = await api.get('/api/users/profile');

        if (res.data.address) {
          setFullName(res.data.address.fullName || '');
          setPhone(res.data.address.phone || '');
          setAddressLine1(res.data.address.addressLine1 || '');
          setCity(res.data.address.city || '');
          setStateName(res.data.address.state || '');
          setPincode(res.data.address.pincode || '');

          if (res.data.address) {
            setEditingAddress(false);
          } else {
            setEditingAddress(true);
          }
        }

      } catch (err) {
        console.error('Failed to load saved address:', err);
      }
    };

    loadSavedAddress();
  }, []);

  // 1. Fetch current 'Pending' order session from database on mount
  const fetchCartOrder = async () => {
    try {
      const res = await api.get('/api/orders/myorders');

      const activeCart = res.data.find(
        order => order.deliverySlot === 'Not Selected'
      );
      setCartOrder(activeCart);
      setLoading(false);
    } catch (err) {
      console.error("Error loading cart sequence:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartOrder();
  }, []);

  // 2. Core Quantity Matrix Update Method
  const updateQuantity = async (productId, quantityChange, currentPrice, forceDelete = false) => {
    try {
      
      const currentItem = cartOrder.items.find(item => (item.product._id || item.product) === productId);

      if (!currentItem) return;

      // Check if decrementing causes the stock count to hit absolute 0, or if it's an explicit delete
      if (forceDelete || (currentItem.quantity + quantityChange <= 0)) {
        setItemToDelete({
          id: productId,
          name: currentItem?.product?.name || 'Marketplace Crop',
          price: currentPrice,
          currentQty: currentItem?.quantity || 0
        });
        return;
      }

      await api.post('/api/orders/cart', {
        productId,
        quantity: quantityChange,
        priceAtPurchase: currentPrice
      });

      fetchCartOrder();
    } catch (err) {
      console.error("Quantity update execution encountered an issue:", err);
      alert(err.response?.data?.message || "Could not update crop quantity matrix adjustments.");
    }
  };

  // 3. Confirm Deletion Callback Handler via Custom Overlay Modal
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      

      await api.post('/api/orders/cart', {
        productId: itemToDelete.id,
        quantity: -itemToDelete.currentQty,
        priceAtPurchase: itemToDelete.price
      });

      setItemToDelete(null);
      fetchCartOrder();
    } catch (err) {
      console.error("Failed to delete basket asset allocation node:", err);
      alert(err.response?.data?.message || "Could not process structural item deletion.");
    }
  };

  const clearEntireCart = async () => {
    try {
      

      await api.delete('/api/orders/cart');

      setShowClearCartModal(false);
      fetchCartOrder();

    } catch (err) {
      console.error('Failed to clear cart:', err);
      alert('Unable to clear cart.');
    }
  };

  // 4. Handle Final Purchase Authorization Checkout
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (isDemoCustomer) {
      showDemoModal(
        "Checkout is disabled for the Demo Customer account."
      );
      return;
    }
    if (
      !deliverySlot ||
      !fullName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !stateName ||
      !pincode
    ) {
      alert('Please complete all delivery details.');
      return;
    }

    setCheckingOut(true);
    try {
      const checkoutPayload = {
        items: cartOrder.items.map(item => ({
          product: item.product._id || item.product,
          quantity: item.quantity
        })),

        deliverySlot: deliverySlot,

        shippingAddress: {
          fullName,
          phone,
          addressLine1,
          city,
          state: stateName,
          pincode
        }
      };

      await api.post('/api/orders', checkoutPayload);

      // 🌟 Instead of window.alert, open our premium completion overlay modal
      setCartOrder(null);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Checkout process failed:", err);
      alert(err.response?.data?.message || "An issue occurred while executing order processing.");
      setCheckingOut(false);
    }
  };

  // Safe router navigation exit step used by success modal dismissals
  const handleSuccessRedirect = () => {
    setShowSuccessModal(false);
    navigate('/customer/orders');
  };

  const showDemoModal = (message) => {
    setDemoMessage(message);
    setDemoModal(true);
  };

  const totalItemCount = cartOrder?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 font-sans selection:bg-emerald-500/30">
      <Navbar cartCount={totalItemCount} />

      {/* Main Container */}
      <div className="max-w-[2600px] mx-auto p-4 sm:p-6 lg:p-12 flex flex-col gap-8">

        {/* ================= HEADER PANEL ================= */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-8 rounded-2xl shadow-xl shadow-black/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-slate-100 uppercase">
                Review Your Basket
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 font-medium mt-2">
                Manage selected crops before checking out and locking inventory allocations.
              </p>
            </div>
            <div className="hidden md:flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="bg-slate-950 px-6 py-4 rounded-xl border border-slate-800 text-right">
                <span className="text-slate-500 uppercase font-black tracking-widest text-xs lg:text-sm block">Subtotal Basket Cost</span>
                <span className="text-emerald-400 font-black text-xl sm:text-3xl lg:text-4xl xl:text-5xl tracking-tight">
                  ₹{cartOrder?.totalAmount ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CORE CART INTERFACE ================= */}
        {!cartOrder || cartOrder.items.length === 0 ? (
          <div className="min-h-[calc(100vh-280px)] flex items-center justify-center">

            <div className="text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl backdrop-blur-sm p-12 max-w-2xl w-full">

              <p className="text-slate-500 text-xl sm:text-2xl lg:text-3xl font-medium mb-6">
                Your basket session is currently empty.
              </p>

              <button
                onClick={() => navigate("/customer/marketplace")}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg px-8 py-4 rounded-xl transition-all uppercase tracking-wider"
              >
                Browse Marketplace Crops
              </button>

            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* LEFT SIDE: PRODUCT ITEMS SEGMENT LIST */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Mobile Browse More */}
              <div className="xl:hidden">
                <button
                  onClick={() => navigate('/customer/marketplace')}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl uppercase tracking-wider"
                >
                  Browse More
                </button>
              </div>

              {/* Desktop Browse More */}
              <div className="hidden xl:block">
                <button
                  onClick={() => navigate('/customer/marketplace')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-xl uppercase tracking-wider"
                >
                  Browse More
                </button>
              </div>

              {cartOrder.items.map((item) => {
                const productInfo = item.product || {};
                const pId = productInfo._id || item.product;
                const itemTotal = item.quantity * item.priceAtPurchase;
                const displayUnit = productInfo.unit || 'kg';

                return (
                  <div
                    key={item._id}
                    className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 flex flex-col md:flex-row shadow-lg group"
                  >
                    {/* Item Visual Frame */}
                    <div className="h-52 sm:h-56 md:h-auto md:w-64 lg:w-72 bg-slate-950 shrink-0 relative flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-800/60 overflow-hidden">
                      {productInfo.imageUrl ? (
                        <img
                          src={productInfo.imageUrl}
                          alt={productInfo.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-sm uppercase font-extrabold tracking-widest bg-slate-900 text-slate-500 px-4 py-2 rounded-lg border border-slate-800">
                          {productInfo.category || 'Crop'}
                        </span>
                      )}
                    </div>

                    {/* Metadata Content Mapping */}
                    <div className="p-8 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                          <h3 className="font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-slate-100 tracking-tight line-clamp-1">
                            {productInfo.name || 'Unknown Marketplace Item'}
                          </h3>
                          <div className="text-left md:text-right">
                            <span className="text-emerald-400 font-black text-xl sm:text-2xl lg:text-4xl block">
                              ₹{itemTotal}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Allocation Modifiers Area */}
                        <div className="text-lg text-slate-400 font-semibold tracking-wide mt-4 flex flex-wrap items-center gap-4">
                          <span className="bg-slate-950/60 py-1 px-3 rounded-lg border border-slate-800/50 text-sm sm:text-sm md:text-lg">
                            Rate: ₹{item.priceAtPurchase} / {displayUnit}
                          </span>

                          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => updateQuantity(pId, -1, item.priceAtPurchase)}
                              className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xl font-bold transition flex items-center justify-center border border-slate-800/60 hover:text-emerald-400 active:scale-95"
                            >
                              -
                            </button>

                            <span className="text-slate-100 font-black text-base sm:text-lg md:text-2xl px-4 min-w-[70px] text-center">
                              {item.quantity} <span className="text-sm text-slate-500 font-bold uppercase">{displayUnit}</span>
                            </span>

                            <button
                              onClick={() => updateQuantity(pId, 1, item.priceAtPurchase)}
                              className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xl font-bold transition flex items-center justify-center border border-slate-800/60 hover:text-emerald-400 active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center">
                        <span className="text-xs lg:text-lg text-slate-500 font-medium italic">
                          Captured at transactional request snapshot rate.
                        </span>

                        <button
                          onClick={() => updateQuantity(pId, 0, item.priceAtPurchase, true)}
                          className="text-red-400 hover:text-red-200 text-xs sm:text-sm md:text-lg font-extrabold uppercase tracking-wider transition duration-200 flex items-center gap-2 bg-red-950/20 hover:bg-red-950/40 px-3 py-2 rounded-xl border border-red-900/30"
                        >
                          🗑️ Remove Item
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {cartOrder && cartOrder.items.length > 0 && (
                <button
                  onClick={() => setShowClearCartModal(true)}
                  className="bg-red-950/40 hover:bg-red-950/50 border border-red-900/40 text-red-400 hover:text-red-300 font-black uppercase tracking-wider px-6 py-4 rounded-xl transition-all"
                >
                  🗑️ Remove All
                </button>
              )}

              <div className="md:hidden bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">
                    Total Amount
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    ₹{cartOrder?.totalAmount ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: PREMIUM SYSTEM ACTION PANEL */}
            <div className="lg:col-span-1 flex flex-col gap-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-8 rounded-2xl shadow-xl lg:sticky lg:top-36">
              <h2 className="text-base sm:text-xl lg:text-2xl uppercase tracking-widest font-black text-slate-400 border-b border-slate-800/60 pb-4">
                Checkout Execution
              </h2>

              <form onSubmit={handleCheckout} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm sm:text-base md:text-lg lg:text-xl uppercase tracking-widest font-black text-slate-400">
                    Select Delivery Slot
                  </label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    required
                    className="w-full px-4 py-5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-200 font-bold cursor-pointer transition text-sm sm:text-lg lg:text-2xl shadow-md"
                  >
                    <option value="" disabled hidden>⏰ Choose Time Frame...</option>
                    <option value="Morning (6 AM - 11 AM)">🌅 Morning (6 AM - 11 AM)</option>
                    <option value="Mid-Day (11 AM - 4 PM)">☀️ Mid-Day (11 AM - 4 PM)</option>
                    <option value="Evening (4 PM - 9 PM)">🌌 Evening (4 PM - 9 PM)</option>
                  </select>
                  <div className="flex justify-between items-center mt-4">
                    <h3 className="text-base lg:text-xl font-black text-slate-300 uppercase tracking-wide">
                      Delivery Address
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingAddress(!editingAddress)}
                      className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl font-bold transition-all"
                    >
                      {editingAddress ? 'Cancel Edit' : 'Edit Address'}
                    </button>
                  </div>
                </div>

                {/* Saved Address Card */}
                {!editingAddress && fullName && (
                  <div onClick={() => setEditingAddress(true)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2 cursor-pointer">
                    <p className="text-xl font-black text-white">
                      {fullName}
                    </p>
                    <p className="text-slate-400">
                      📞 {phone}
                    </p>
                    <p className="text-slate-400">
                      📍 {addressLine1}
                    </p>
                    <p className="text-slate-400">
                      {city}, {stateName} - {pincode}
                    </p>
                    <p className="text-xs text-slate-500 mt-3">
                      Click anywhere to edit address
                    </p>
                  </div>
                )}

                {/* Address Form */}
                {editingAddress && (
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                    />

                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                    />

                    <textarea
                      placeholder="Address Line"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 resize-none"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                    />
                  </div>
                )}

                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col gap-3 shadow-inner">
                  <div className="flex justify-between items-center text-md lg:text-2xl font-medium text-slate-400">
                    <span>Total Crops Items Count:</span>
                    <span className="text-slate-200 text-md lg:text-2xl font-bold">{totalItemCount} Units</span>
                  </div>
                  <div className="flex justify-between items-center text-md lg:text-2xl font-medium text-slate-400">
                    <span>Logistics Delivery Charge:</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-md lg:text-2xl bg-emerald-950/40 px-2 py-1 rounded border border-emerald-900/40">Free</span>
                  </div>
                  <div className="h-px bg-slate-800 my-1"></div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-md lg:text-2xl font-black text-slate-300">Total Bill Amount:</span>
                    <span className="text-emerald-400 font-black text-md lg:text-2xl sm:text-3xl lg:text-4xl tracking-tight">
                      ₹{cartOrder?.totalAmount ?? 0}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checkingOut}
                  className="w-full bg-emerald-500 hover:bg-emerald-200 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black text-sm py-4 lg:text-xl lg:py-6 rounded-xl transition-all shadow-lg shadow-emerald-500/10 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {checkingOut ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-950"></div>
                      <span>Locking Order...</span>
                    </div>
                  ) : (
                    <span>Authorize Checkout</span>
                  )}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* ================= CUSTOM CONFIRMATION REMOVAL MODAL ================= */}
      {
        itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-sm w-full shadow-2xl transition-all duration-200">
              <h3 className="text-2xl font-black text-white mb-2">Remove Item?</h3>
              <p className="text-slate-400 mb-6">
                Are you sure you want to remove <strong>{itemToDelete.name}</strong> from your basket?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )
      }
      {
        showClearCartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl">

              <h3 className="text-2xl font-black text-white mb-3">
                Clear Entire Basket?
              </h3>

              <p className="text-slate-400 mb-6">
                This will remove every item from your cart.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowClearCartModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={clearEntireCart}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl"
                >
                  Remove All
                </button>
              </div>

            </div>
          </div>
        )
      }
      {/* ================= 🌟 CUSTOM ORDER SUCCESS MODAL 🌟 ================= */}
      {
        showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl shadow-emerald-950/20 text-center border-t-4 border-t-emerald-500">
              {/* Elegant Checkmark Graphics Circle */}
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="text-emerald-400 text-4xl font-black">✓</span>
              </div>

              <h3 className="text-3xl font-black text-slate-100 uppercase tracking-tight mb-2">
                Order Placed!
              </h3>
              <p className="text-slate-400 text-lg font-medium mb-8 leading-relaxed">
                Your transactional lock is complete. Live marketplace inventory references have been successfully balanced and updated.
              </p>

              <button
                onClick={handleSuccessRedirect}
                className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
              >
                View My Orders
              </button>
            </div>
          </div>
        )
      }
      {demoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md text-center">

            <div className="text-6xl mb-4">
              🛒
            </div>

            <h2 className="text-3xl font-black text-white mb-3">
              Demo Customer
            </h2>

            <p className="text-slate-300 leading-relaxed">
              {demoMessage}
            </p>

            <p className="text-slate-500 text-sm mt-5">
              You can browse products, explore the marketplace and use every feature,
              but checkout is disabled to preserve the public demo environment.
            </p>

            <button
              onClick={() => setDemoModal(false)}
              className="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl"
            >
              Got it
            </button>

          </div>

        </div>
      )}
      <Footer />
    </div >
  );
};

export default Cart;