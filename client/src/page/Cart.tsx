import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaTag, FaCheck, FaArrowRight, FaShoppingBag, FaTimes, FaPhoneAlt, FaRegCreditCard } from "react-icons/fa";
import { mainButton } from "@telegram-apps/sdk";
import { toast } from "sonner";

const API_BASE_URL = "https://mini-app-mzu6.onrender.com";

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
  const paymentMethod = "ABA";
  const [phone, setPhone] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [abaData, setAbaData] = useState<any>(null);

  const handleOpenPayment = async () => {
    requireAuth(async () => {
      if (cart.length === 0) return;
      setIsVerifying(true);
      setShowModal(true);

      try {
        const res = await fetch(`${API_BASE_URL}/shop/aba-checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}` // if your API requires it
          },
          body: JSON.stringify({
            items: cart.map(i => ({ productId: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price })),
            totalAmount: totalPrice,
            phone: phone
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          setAbaData(data.data);
        } else {
          toast.error("Failed to initialize ABA checkout.");
          setShowModal(false);
        }
      } catch (e) {
        console.log("ABA Checkout API error:", e);
        toast.error("An error occurred connecting to ABA.");
        setShowModal(false);
      } finally {
        setIsVerifying(false);
      }
    });
  };

  const submitAbaForm = () => {
    if (!abaData) return;
    
    // Auto-complete order in our system immediately for this mock flow
    // In full production, this is handled by ABA webhook.
    placeOrder("ABA", phone).then(() => {
      // Create and submit the ABA form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = abaData.apiUrl;
      form.target = "_blank"; // open in new tab

      const addField = (name: string, value: string) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      addField("hash", abaData.hash);
      addField("tran_id", abaData.tran_id);
      addField("amount", abaData.amount);
      addField("items", abaData.items);
      addField("firstname", abaData.firstname);
      addField("lastname", abaData.lastname);
      addField("email", abaData.email);
      addField("phone", abaData.phone);
      addField("req_time", abaData.req_time);
      addField("merchant_id", abaData.merchantId);
      addField("return_url", abaData.return_url);
      addField("continue_success_url", abaData.continue_success_url);
      addField("payment_option", abaData.payment_option);
      addField("type", abaData.type);

      document.body.appendChild(form);
      form.submit();
      
      toast.success("Redirecting to ABA PayWay...");
      setShowModal(false);
      navigate("/app/orders");
    });
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
            text: `PAY $${totalPrice.toFixed(2)} (${formatKHR(totalPrice)}) VIA ABA`,
            backgroundColor: '#0054a6',
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
            placeholder="Try code SIK10"
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
            <FaCheck /> Active Code: {promoCode} applied!
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
          placeholder="Enter phone number..."
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Payment Selection */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FaRegCreditCard className="text-[#0054a6] text-sm" /> Payment Method
          </h3>
          <span className="text-[10px] bg-[#0054a6]/20 text-[#0054a6] font-extrabold px-2.5 py-0.5 rounded-full border border-[#0054a6]/30">
            ABA PAYWAY ⚡
          </span>
        </div>

        {/* ABA Option Box */}
        <div className="p-3 bg-slate-950 border-2 border-[#0054a6]/60 rounded-xl flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#0054a6] to-[#00b0e3] text-white text-lg font-black rounded-xl flex items-center justify-center shadow-md">
              KH
            </div>
            <div>
              <p className="text-xs font-black text-white">ABA PayWay Checkout</p>
              <p className="text-[10px] text-slate-400">Secure payment via ABA App</p>
            </div>
          </div>
          <span className="text-xs text-[#00b0e3] font-extrabold flex items-center gap-1">
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
            <span>Discount Applied</span>
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
        className="w-full py-3.5 bg-gradient-to-r from-[#0054a6] to-[#00b0e3] hover:from-[#00428a] hover:to-[#008fbc] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#0054a6]/30 active:scale-[0.99] transition-all"
      >
        <FaRegCreditCard className="text-lg" />
        Pay ${totalPrice.toFixed(2)} ({formatKHR(totalPrice)}) via ABA <FaArrowRight className="text-xs" />
      </button>

      {/* ABA Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#0054a6] text-white text-base">
                  <FaRegCreditCard />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">ABA PayWay Checkout</h3>
                  <p className="text-[10px] text-slate-400">Pay securely via ABA Bank</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            {/* Total Amount Badge */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-0.5">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">
                {isVerifying ? "Verifying Transaction..." : "Total Amount Payable"}
              </p>
              <p className="text-2xl font-black text-white font-mono">${totalPrice.toFixed(2)}</p>
              <p className="text-xs font-black text-emerald-400 font-mono">{formatKHR(totalPrice)}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-white text-xs font-bold mb-2">
                <FaRegCreditCard className="text-lg text-[#00b0e3]" /> Official ABA PayWay
              </div>
              
              <div className="flex flex-col gap-3">
                {abaData ? (
                  <>
                    <button
                      onClick={submitAbaForm}
                      className="w-full py-3.5 bg-[#0054a6] hover:bg-[#00428a] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-all active:scale-95"
                    >
                      Continue to ABA App
                    </button>
                    {abaData.deeplink && (
                      <button
                        onClick={() => {
                          placeOrder("ABA", phone).then(() => {
                            window.open(abaData.deeplink, "_blank");
                            setShowModal(false);
                            navigate("/app/orders");
                          });
                        }}
                        className="w-full py-3 border border-[#0054a6] text-[#00b0e3] font-bold text-xs rounded-xl hover:bg-[#0054a6]/10 transition-colors"
                      >
                        Open ABA Mobile (Deep Link)
                      </button>
                    )}
                  </>
                ) : (
                  <div className="py-4 text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
                    <span className="animate-spin text-lg">⏳</span> Generating ABA Payment...
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Automatic Key Delivery upon Payment ⚡</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
