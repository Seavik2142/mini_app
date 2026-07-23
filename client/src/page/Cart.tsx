import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaTag, FaCheck, FaArrowRight, FaShoppingBag, FaQrcode, FaCreditCard, FaTimes, FaShieldAlt, FaPhoneAlt } from "react-icons/fa";
import { mainButton } from "@telegram-apps/sdk";

const Cart: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    promoCode,
    applyPromoCode,
    totalPrice,
    formatKHR,
    placeOrder,
  } = useCart();

  const navigate = useNavigate();
  const [inputCode, setInputCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ABA" | "BAKONG" | "CARD">("ABA");
  const [phone, setPhone] = useState("+855 12 345 678");
  const [showKHQRModal, setShowKHQRModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setShowKHQRModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      const order = await placeOrder(paymentMethod, phone);
      setIsVerifying(false);
      setShowKHQRModal(false);
      if (order) {
        navigate("/app/orders");
      }
    }, 1200);
  };

  // Telegram Native MainButton integration
  useEffect(() => {
    try {
      if (cart.length > 0) {
        const mb = mainButton as any;
        if (mb.mount?.isAvailable && !mb.isMounted?.()) {
          mb.mount();
        }
        if (mb.setParams?.isAvailable) {
          mb.setParams({
            text: `PAY $${totalPrice.toFixed(2)} (${formatKHR(totalPrice)}) VIA ${paymentMethod}`,
            backgroundColor: paymentMethod === 'ABA' ? '#dc2626' : paymentMethod === 'BAKONG' ? '#0284c7' : '#f59e0b',
            textColor: '#ffffff',
            isVisible: true,
            isEnabled: true,
          });
        }
        const off = mb.onClick?.(handleOpenPayment);
        return () => {
          if (off) off();
          if (mb.setParams?.isAvailable) {
            mb.setParams({ isVisible: false });
          }
        };
      }
    } catch (err) {
      // Running outside Telegram app
    }
  }, [cart, totalPrice, paymentMethod, phone, formatKHR]);

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500 text-3xl shadow-xl">
          <FaShoppingBag />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400">Select digital keys to add them to your cart.</p>
        </div>
        <button
          onClick={() => navigate("/app")}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20"
        >
          Browse Digital Keys
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-bold text-white">Checkout Cart</h1>
        <p className="text-xs text-slate-400">{cart.length} digital key(s) ready for purchase</p>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {cart.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-md"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-xl bg-slate-950 border border-slate-800"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-white truncate">{product.name}</h3>
              <p className="text-xs font-extrabold text-amber-400 mt-0.5">
                ${product.price.toFixed(2)} <span className="text-emerald-400 text-[10px]">({formatKHR(product.price)})</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(product.id, -1)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <FaMinus className="text-[10px]" />
                  </button>
                  <span className="px-2 text-xs font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, 1)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <FaPlus className="text-[10px]" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-300"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-white">${(product.price * quantity).toFixed(2)}</p>
              <p className="text-[10px] font-bold text-emerald-400">{formatKHR(product.price * quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Input */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FaTag className="text-amber-400" /> Promo Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Try code TELEGRAM10 or ABA10"
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase tracking-wider focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => applyPromoCode(inputCode)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700"
          >
            Apply
          </button>
        </div>
        {promoCode && (
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <FaCheck /> Active Code: {promoCode} (15% OFF applied)
          </p>
        )}
      </div>

      {/* Contact Phone */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FaPhoneAlt className="text-amber-400" /> Telegram / Phone Number
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+855 12 345 678"
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
        />
      </div>

      {/* Payment Selection (ABA PAY vs Bakong KHQR vs Card) */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
          <FaQrcode className="text-rose-500" /> Select Payment Method
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {/* ABA PAY */}
          <button
            type="button"
            onClick={() => setPaymentMethod("ABA")}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              paymentMethod === "ABA"
                ? "bg-rose-600/20 border-rose-500 text-rose-400 font-black scale-105 shadow-md shadow-rose-500/20"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <div className="w-7 h-7 bg-rose-600 text-white font-black rounded-lg text-[10px] flex items-center justify-center mx-auto mb-1">
              ABA
            </div>
            <p className="text-[10px] font-bold">ABA PAY</p>
          </button>

          {/* Bakong KHQR */}
          <button
            type="button"
            onClick={() => setPaymentMethod("BAKONG")}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              paymentMethod === "BAKONG"
                ? "bg-sky-600/20 border-sky-500 text-sky-400 font-black scale-105 shadow-md shadow-sky-500/20"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <div className="w-7 h-7 bg-sky-600 text-white font-black rounded-lg text-[10px] flex items-center justify-center mx-auto mb-1">
              KHQR
            </div>
            <p className="text-[10px] font-bold">Bakong KHQR</p>
          </button>

          {/* Card */}
          <button
            type="button"
            onClick={() => setPaymentMethod("CARD")}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              paymentMethod === "CARD"
                ? "bg-amber-600/20 border-amber-500 text-amber-400 font-black scale-105 shadow-md shadow-amber-500/20"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <FaCreditCard className="text-lg mx-auto mb-1.5" />
            <p className="text-[10px] font-bold">Card Pay</p>
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span className="text-white font-medium">${subtotal.toFixed(2)} ({formatKHR(subtotal)})</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-400 font-medium">
            <span>Discount (15%)</span>
            <span>-${discount.toFixed(2)} (-{formatKHR(discount)})</span>
          </div>
        )}
        <div className="flex justify-between text-slate-400">
          <span>Instant Digital Key Delivery</span>
          <span className="text-emerald-400 font-bold">FREE ⚡</span>
        </div>
        <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold text-sm text-white">
          <span>Total Amount</span>
          <div className="text-right">
            <p className="text-base text-amber-400 font-black">${totalPrice.toFixed(2)}</p>
            <p className="text-xs text-emerald-400 font-mono font-extrabold">{formatKHR(totalPrice)}</p>
          </div>
        </div>
      </div>

      {/* Proceed to Payment Button */}
      <button
        onClick={handleOpenPayment}
        className={`w-full py-3.5 ${
          paymentMethod === 'ABA'
            ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-600/30'
            : paymentMethod === 'BAKONG'
            ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 shadow-sky-600/30'
            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/30'
        } text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-[0.99] transition-all`}
      >
        <FaQrcode className="text-lg" />
        Pay ${totalPrice.toFixed(2)} ({formatKHR(totalPrice)}) via {paymentMethod} <FaArrowRight className="text-xs" />
      </button>

      {/* ABA / Bakong KHQR Payment Modal */}
      {showKHQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs ${
                  paymentMethod === 'ABA' ? 'bg-rose-600' : paymentMethod === 'BAKONG' ? 'bg-sky-600' : 'bg-amber-600'
                }`}>
                  {paymentMethod}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">{paymentMethod} KHQR Payment</h3>
                  <p className="text-[10px] text-slate-400">Scan KHQR code to complete order</p>
                </div>
              </div>
              <button
                onClick={() => setShowKHQRModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            {/* Total Amount Badge */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-0.5">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Payable</p>
              <p className="text-2xl font-black text-amber-400 font-mono">${totalPrice.toFixed(2)}</p>
              <p className="text-xs font-black text-emerald-400 font-mono">{formatKHR(totalPrice)}</p>
            </div>

            {/* KHQR Code Box */}
            <div className="p-4 bg-white rounded-2xl border-4 border-slate-800 space-y-2 inline-block mx-auto shadow-inner">
              <div className="relative aspect-square w-48 mx-auto flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021238580016A000000770010111011300012345602080001234565204581253038405802KH5925SIAMDEV+KEY+STORE6010PHNOM+PENH62150711KEYSTORE${totalPrice.toFixed(2)}`}
                  alt="KHQR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[10px] text-slate-900 font-black uppercase tracking-wider flex items-center justify-center gap-1">
                <FaShieldAlt className="text-rose-600" /> OFFICIAL KHQR PAYLOAD
              </div>
            </div>

            {/* Merchant Details */}
            <div className="text-left text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Merchant:</span>
                <span className="text-white font-bold">SIAMDEV DIGITAL KEY STORE</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Account No:</span>
                <span className="text-amber-400 font-mono font-bold">000 123 456 ({paymentMethod})</span>
              </div>
            </div>

            {/* Confirm Payment Button */}
            <button
              disabled={isVerifying}
              onClick={handleConfirmPayment}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {isVerifying ? (
                "Verifying KHQR Payment..."
              ) : (
                <>
                  <FaCheck /> I Have Paid ${totalPrice.toFixed(2)} ({formatKHR(totalPrice)})
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
