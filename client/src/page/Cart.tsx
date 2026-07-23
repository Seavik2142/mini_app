import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaDollarSign, FaTag, FaCheck, FaArrowRight, FaShoppingBag, FaMoneyBillWave } from "react-icons/fa";
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
  const [paymentMethod, setPaymentMethod] = useState<"USD" | "KHR">("USD");
  const [phone] = useState("+855 12 345 678");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const order = placeOrder(paymentMethod, "Digital Delivery", phone);
      setIsSubmitting(false);
      if (order) {
        navigate("/app/orders");
      }
    }, 800);
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
            text: `PAY $${totalPrice.toFixed(2)} (${formatKHR(totalPrice)})`,
            backgroundColor: '#f59e0b',
            textColor: '#020617',
            isVisible: true,
            isEnabled: true,
          });
        }
        const off = mb.onClick?.(handleCheckout);
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
        <h1 className="text-xl font-bold text-white">Shopping Cart</h1>
        <p className="text-xs text-slate-400">{cart.length} digital key(s) ready for checkout</p>
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
            placeholder="Try code TELEGRAM10"
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

      {/* Payment Selection (USD vs Khmer Riel) */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Payment Currency</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("USD")}
            className={`p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${
              paymentMethod === "USD"
                ? "bg-amber-500/20 border-amber-500 text-amber-400 font-black"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}
          >
            <FaDollarSign className="text-lg" />
            <div className="text-left">
              <p className="text-xs font-bold">USD Dollar ($)</p>
              <p className="text-[10px] text-slate-400">Pay in USD</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("KHR")}
            className={`p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${
              paymentMethod === "KHR"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}
          >
            <FaMoneyBillWave className="text-lg" />
            <div className="text-left">
              <p className="text-xs font-bold">Riel Khmer (៛)</p>
              <p className="text-[10px] text-slate-400">Rate: $1 = 4,000 ៛</p>
            </div>
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
          <span>Instant Key Delivery</span>
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

      {/* Checkout Button */}
      <button
        disabled={isSubmitting}
        onClick={handleCheckout}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-90 active:scale-[0.99] text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all"
      >
        {isSubmitting ? (
          "Delivering Key..."
        ) : (
          <>
            Pay ${totalPrice.toFixed(2)} ({formatKHR(totalPrice)}) <FaArrowRight className="text-xs" />
          </>
        )}
      </button>
    </div>
  );
};

export default Cart;
