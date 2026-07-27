import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaTag, FaCheck, FaArrowRight, FaShoppingBag, FaTimes, FaPhoneAlt, FaRegCreditCard, FaPaypal } from "react-icons/fa";
import abaLogo from "../assets/aba-icon.svg";
import { mainButton } from "@telegram-apps/sdk";
import { toast } from "sonner";
import { getApiBaseUrl } from "../Baseapi";

const API_BASE_URL = getApiBaseUrl();

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
    clearCart,
  } = useCart();

  const navigate = useNavigate();
  const [inputCode, setInputCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ABA" | "PAYPAL">("ABA");
  const [phone, setPhone] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [abaData, setAbaData] = useState<any>(null);
  const [paypalData, setPaypalData] = useState<any>(null);
  const [abaQrResponse, setAbaQrResponse] = useState<any>(null);

  const handleOpenPayment = async () => {
    requireAuth(async () => {
      if (cart.length === 0) return;
      setIsVerifying(true);
      setShowModal(true);
      
      setAbaData(null);
      setPaypalData(null);
      setAbaQrResponse(null);

      try {
        const endpoint = paymentMethod === "ABA" ? "/shop/aba-checkout" : "/shop/paypal-checkout";
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          },
          body: JSON.stringify({
            items: cart.map(i => ({ productId: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price })),
            totalAmount: totalPrice,
            phone: phone
          })
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          if (paymentMethod === "ABA") {
            setAbaData(data.data);
          } else {
            setPaypalData(data.data);
          }
        } else {
          toast.error(`Failed to initialize ${paymentMethod} checkout.`);
          setShowModal(false);
        }
      } catch (e) {
        console.log(`${paymentMethod} Checkout API error:`, e);
        toast.error(`An error occurred connecting to ${paymentMethod}.`);
        setShowModal(false);
      } finally {
        setIsVerifying(false);
      }
    });
  };

  const submitAbaForm = async () => {
    if (!abaData) return;
    setIsVerifying(true);
    
    const form = new FormData();
    form.append("hash", abaData.hash);
    form.append("tran_id", abaData.tran_id);
    form.append("amount", abaData.amount);
    form.append("currency", "USD");
    if (abaData.items) form.append("items", abaData.items);
    if (abaData.shipping) form.append("shipping", abaData.shipping);
    form.append("firstname", abaData.firstname);
    form.append("lastname", abaData.lastname);
    form.append("email", abaData.email);
    form.append("phone", abaData.phone);
    form.append("req_time", abaData.req_time);
    form.append("merchant_id", abaData.merchantId);
    form.append("return_url", abaData.return_url);
    form.append("continue_success_url", abaData.continue_success_url);
    if (abaData.payment_option) form.append("payment_option", abaData.payment_option);
    form.append("type", abaData.type);

    try {
      const res = await fetch(abaData.apiUrl, {
        method: "POST",
        body: form
      });
      const data = await res.json();
      
      if (data && data.qrImage) {
        setAbaQrResponse(data);
        setIsVerifying(false);
      } else {
        toast.error("Failed to generate ABA QR Code");
        setShowModal(false);
      }
    } catch (err) {
      toast.error("Error connecting to ABA PayWay");
      setShowModal(false);
    }
  };

  // Script Injection for PayPal
  useEffect(() => {
    // PayPal Script
    if (showModal && paymentMethod === "PAYPAL") {
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
                setShowModal(false);
                if (order) {
                  navigate("/app/orders");
                }
              },
              onCancel: async () => {
                toast.error("PayPal Payment Cancelled");
                try {
                  await fetch(`${import.meta.env.VITE_API_URL || "https://mini-app-mzu6.onrender.com"}/shop/payment-failed`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ method: "PayPal", amount: totalPrice.toFixed(2) }),
                    credentials: "include"
                  });
                } catch (e) {}
              },
              onError: async () => {
                toast.error("PayPal Payment Failed");
                try {
                  await fetch(`${import.meta.env.VITE_API_URL || "https://mini-app-mzu6.onrender.com"}/shop/payment-failed`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ method: "PayPal", amount: totalPrice.toFixed(2) }),
                    credentials: "include"
                  });
                } catch (e) {}
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
  }, [showModal, paymentMethod, paypalData, totalPrice]);

  // Telegram Native MainButton integration
  useEffect(() => {
    try {
      if (cart.length > 0) {
        const mb = mainButton as any;
        if (mb.mount?.isAvailable && !mb.isMounted?.()) {
          mb.mount();
        }
        if (mb.setParams?.isAvailable) {
          const isAba = paymentMethod === "ABA";
          mb.setParams({
            text: `PAY $${totalPrice.toFixed(2)} (${formatKHR(totalPrice)}) VIA ${paymentMethod}`,
            backgroundColor: isAba ? '#0054a6' : '#0070ba',
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
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto text-fuchsia-400 text-3xl shadow-xl">
          <FaShoppingBag />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400">Select digital keys to add them to your cart.</p>
        </div>
        <button
          onClick={() => navigate("/app")}
          className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-orange-600 hover:from-fuchsia-500 hover:to-orange-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-fuchsia-600/30 transition-all"
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
          <FaTag className="text-fuchsia-400" /> Promo Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Try code SIK10"
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase tracking-wider focus:outline-none focus:border-fuchsia-500"
          />
          <button
            onClick={() => applyPromoCode(inputCode)}
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-orange-600 hover:from-fuchsia-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
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
          <FaPhoneAlt className="text-fuchsia-400" /> Telegram / Phone Number
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number..."
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-fuchsia-500"
        />
      </div>

      {/* Payment Selection */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FaRegCreditCard className="text-slate-400 text-sm" /> Payment Method
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* ABA Option */}
          <button
            onClick={() => setPaymentMethod("ABA")}
            className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
              paymentMethod === "ABA"
                ? "bg-[#0054a6]/10 border-[#0054a6]"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md overflow-hidden ${
              paymentMethod === "ABA" ? "bg-[#0054a6] text-white" : "bg-slate-800 text-slate-500"
            }`}>
              <img src={abaLogo} alt="ABA" className="w-full h-full object-cover" />
            </div>
            <span className={`text-xs font-bold ${paymentMethod === "ABA" ? "text-white" : "text-slate-400"}`}>ABA PayWay</span>
          </button>

          {/* PayPal Option */}
          <button
            onClick={() => setPaymentMethod("PAYPAL")}
            className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
              paymentMethod === "PAYPAL"
                ? "bg-fuchsia-500/10 border-fuchsia-500"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md ${
              paymentMethod === "PAYPAL" ? "bg-gradient-to-tr from-fuchsia-600 to-orange-600 text-white" : "bg-slate-800 text-slate-500"
            }`}>
              <FaPaypal />
            </div>
            <span className={`text-xs font-bold ${paymentMethod === "PAYPAL" ? "text-white" : "text-slate-400"}`}>PayPal</span>
          </button>
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
        className={`w-full py-3.5 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-[0.99] transition-all ${
          paymentMethod === "ABA"
            ? "bg-gradient-to-r from-[#0054a6] to-[#00b0e3] hover:from-[#00428a] hover:to-[#008fbc] shadow-[#0054a6]/30"
            : "bg-gradient-to-r from-fuchsia-600 to-orange-600 hover:from-fuchsia-500 hover:to-orange-500 shadow-fuchsia-600/30"
        }`}
      >
        {paymentMethod === "ABA" ? <img src={abaLogo} className="w-5 h-5 rounded-md" alt="ABA" /> : <FaPaypal className="text-lg" />}
        Pay ${totalPrice.toFixed(2)} ({formatKHR(totalPrice)}) via {paymentMethod === "ABA" ? "ABA" : "PayPal"} <FaArrowRight className="text-xs" />
      </button>

      {/* Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-base overflow-hidden ${
                  paymentMethod === "ABA" ? "bg-[#0054a6]" : "bg-fuchsia-600"
                }`}>
                  {paymentMethod === "ABA" ? <img src={abaLogo} className="w-full h-full object-cover" alt="ABA" /> : <FaPaypal />}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {paymentMethod === "ABA" ? "ABA PayWay Checkout" : "PayPal Express Checkout"}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {paymentMethod === "ABA" ? "Pay securely via ABA Bank" : "Pay via PayPal Gateway"}
                  </p>
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
                {paymentMethod === "ABA" ? (
                  <><img src={abaLogo} className="w-6 h-6 rounded-md shadow" alt="ABA" /> Official ABA PayWay</>
                ) : (
                  <><FaPaypal className="text-lg text-fuchsia-400" /> Official PayPal Checkout</>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                {paymentMethod === "ABA" ? (
                  abaData ? (
                    <>
                      {abaQrResponse ? (
                        <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
                          <p className="text-[10px] text-slate-400 font-medium">Scan this QR Code using ABA Mobile</p>
                          <div className="bg-white p-3 rounded-2xl shadow-xl w-60 h-60 flex items-center justify-center mx-auto">
                            <img src={abaQrResponse.qrImage} alt="ABA KHQR" className="w-full h-full object-contain" />
                          </div>
                          {abaQrResponse.abapay_deeplink && (
                            <a
                              href={abaQrResponse.abapay_deeplink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                placeOrder("ABA", phone);
                                setShowModal(false);
                                clearCart();
                                navigate("/app/orders");
                              }}
                              className="w-full py-3.5 bg-[#0054a6] hover:bg-[#00428a] text-white font-black text-xs rounded-xl flex items-center justify-center shadow transition-all active:scale-95"
                            >
                              Pay with ABA Mobile App
                            </a>
                          )}
                          <button
                            onClick={() => {
                              placeOrder("ABA", phone);
                              setShowModal(false);
                              clearCart();
                              navigate("/app/orders");
                            }}
                            className="w-full py-2.5 border border-slate-700 text-slate-400 hover:bg-slate-800 font-bold text-xs rounded-xl transition-colors"
                          >
                            I have already paid
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={submitAbaForm}
                          disabled={isVerifying}
                          className="w-full py-3.5 bg-[#0054a6] hover:bg-[#00428a] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isVerifying ? "Generating QR..." : "Generate ABA QR Code"}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="py-4 text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
                      <span className="animate-spin text-lg">⏳</span> Generating ABA Payment...
                    </div>
                  )
                ) : (
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
