import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaTag, FaCheck, FaArrowRight, FaShoppingBag, FaTimes, FaPhoneAlt, FaPaypal } from "react-icons/fa";
import { mainButton } from "@telegram-apps/sdk";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:3000"
    : "https://mini-app-mzu6.onrender.com");

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
    requireAuth,
  } = useCart();

  const navigate = useNavigate();
  const [inputCode, setInputCode] = useState("");
  const paymentMethod = "PAYPAL";
  const [phone, setPhone] = useState("");
  const [showKHQRModal, setShowKHQRModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paypalData, setPaypalData] = useState<any>(null);

  const handleOpenPayment = async () => {
    requireAuth(async () => {
      if (cart.length === 0) return;
      setIsVerifying(true);
      setShowKHQRModal(true);

      try {
        const res = await fetch(`${API_BASE_URL}/shop/paypal-checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.map(i => ({ productId: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price })),
            totalAmount: totalPrice
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          setPaypalData(data.data);
        }
      } catch (e) {
        console.log("Checkout API error:", e);
      } finally {
        setIsVerifying(false);
      }
    });
  };

  useEffect(() => {
    if (showKHQRModal) {
      const clientId = paypalData?.clientId || "Adwf4rrFyhxGtUTYTTJWTN8Kj5vOiDvSlcDWfiU7xhZnFQGVOST7Ry9I4fBqdG-qRpQe4A3aQFaA9mwe";
      const scriptId = "paypal-js-sdk";
      
      const renderButtons = () => {
        const container = document.getElementById("paypal-button-container");
        if (container && (window as any).paypal) {
          container.innerHTML = "";
          try {
            (window as any).paypal.Buttons({
              style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
              createOrder: (_data: any, actions: any) => {
                return actions.order.create({
                  purchase_units: [{ amount: { value: totalPrice.toFixed(2) } }]
                });
              },
              onApprove: async (_data: any, actions: any) => {
                setIsVerifying(true);
                try {
                  await actions.order.capture();
                } catch (e) {
                  console.log("Capture notice:", e);
                }
                toast.success("🎉 PayPal Payment Approved! Auto-delivering digital keys...");
                const order = await placeOrder("PAYPAL", phone);
                setIsVerifying(false);
                setShowKHQRModal(false);
                if (order) {
                  navigate("/app/orders");
                }
              }
            }).render("#paypal-button-container");
          } catch (e) {
            console.log("PayPal Buttons render fallback:", e);
          }
        }
      };

      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.onload = renderButtons;
        document.body.appendChild(script);
      } else {
        renderButtons();
      }
    }
  }, [showKHQRModal, paypalData, totalPrice]);

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
            text: `PAY $${totalPrice.toFixed(2)} (${formatKHR(totalPrice)}) VIA PAYPAL`,
            backgroundColor: '#0070ba',
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
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto text-indigo-400 text-3xl shadow-xl">
          <FaShoppingBag />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400">Select digital keys to add them to your cart.</p>
        </div>
        <button
          onClick={() => navigate("/app")}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
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
            className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl flex items-center gap-3 shadow-lg"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-xl bg-slate-950 border border-slate-800"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-white truncate">{product.name}</h3>
              <p className="text-xs font-extrabold text-white mt-0.5">
                ${product.price.toFixed(2)} <span className="text-emerald-400 font-extrabold text-[10px]">({formatKHR(product.price)})</span>
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
      <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2 shadow-md">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FaTag className="text-indigo-400" /> Promo Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Try code TELEGRAM10 or ABA10"
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase tracking-wider focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => applyPromoCode(inputCode)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Apply
          </button>
        </div>
        {promoCode && (
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <FaCheck /> Active Code: {promoCode} (15% OFF applied)
          </p>
        )}
      </div>

      {/* Contact Phone */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2 shadow-md">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FaPhoneAlt className="text-indigo-400" /> Telegram / Phone Number
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+855 12 345 678"
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Payment Selection (PayPal Exclusive) */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FaPaypal className="text-indigo-400 text-sm" /> Payment Method
          </h3>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
            PAYPAL ONLINE ⚡
          </span>
        </div>

        {/* PayPal Option Box */}
        <div className="p-3 bg-slate-950 border-2 border-indigo-500/60 rounded-xl flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-lg font-black rounded-xl flex items-center justify-center shadow-md">
              <FaPaypal />
            </div>
            <div>
              <p className="text-xs font-black text-white">PayPal Express Checkout</p>
              <p className="text-[10px] text-slate-400">Direct instant checkout via PayPal</p>
            </div>
          </div>
          <span className="text-xs text-indigo-400 font-extrabold flex items-center gap-1">
            <FaCheck /> Selected
          </span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2 text-xs shadow-lg">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span className="text-white font-medium">${subtotal.toFixed(2)} ({formatKHR(subtotal)})</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-400 font-semibold">
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
            <p className="text-base text-white font-black">${totalPrice.toFixed(2)}</p>
            <p className="text-xs text-emerald-400 font-mono font-extrabold">{formatKHR(totalPrice)}</p>
          </div>
        </div>
      </div>

      {/* Proceed to Payment Button */}
      <button
        onClick={handleOpenPayment}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 active:scale-[0.99] transition-all"
      >
        <FaPaypal className="text-lg" />
        Pay ${totalPrice.toFixed(2)} ({formatKHR(totalPrice)}) via PayPal <FaArrowRight className="text-xs" />
      </button>

      {/* PayPal Checkout Modal */}
      {showKHQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600 text-white text-base">
                  <FaPaypal />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">PayPal Express Checkout</h3>
                  <p className="text-[10px] text-slate-400">Pay via PayPal Gateway</p>
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
              <p className="text-[10px] text-slate-400 uppercase font-semibold">
                {isVerifying ? "Verifying & Delivering Keys..." : "Total Amount Payable"}
              </p>
              <p className="text-2xl font-black text-white font-mono">${totalPrice.toFixed(2)}</p>
              <p className="text-xs font-black text-emerald-400 font-mono">{formatKHR(totalPrice)}</p>
            </div>

            {/* Official PayPal Buttons Container */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-white text-xs font-bold mb-2">
                <FaPaypal className="text-lg text-indigo-400" /> Official PayPal Checkout
              </div>
              
              {/* PayPal SDK Buttons Render Target */}
              <div id="paypal-button-container" className="min-h-[100px] flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const paypalWebUrl = paypalData?.approvalUrl || `https://www.paypal.com/checkoutnow?token=${paypalData?.orderId || ""}`;
                    window.open(paypalWebUrl, "_blank");
                  }}
                  className="w-full py-3.5 bg-[#ffc439] hover:bg-[#f2ba32] text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-all active:scale-95"
                >
                  <FaPaypal className="text-lg text-[#003087]" /> Pay with PayPal
                </button>
              </div>
              <p className="text-[10px] text-slate-400">Automatic Key Delivery upon Payment ⚡</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
