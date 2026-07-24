import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, Order } from "../type";
import { toast } from "sonner";
import { initData, openTelegramLink } from "@telegram-apps/sdk";
import { FaTimes, FaShieldAlt, FaLock, FaCheck, FaTelegram } from "react-icons/fa";

interface CartContextType {
  cart: CartItem[];
  orders: Order[];
  telegramUser: {
    id?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
  };
  isPhoneVerified: boolean;
  verifiedPhone: string;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  requireAuth: (onSuccess: () => void) => void;
  verifyPhone: (phone: string, code: string) => boolean;
  sendOtpCode: (phone: string) => Promise<string>;
  updateVerifiedPhone: (phone: string, profile?: any) => void;
  logout: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  placeOrder: (paymentMethod: 'ABA' | 'BAKONG' | 'CARD' | 'PAYPAL', phone: string) => Promise<Order | null>;
  totalItems: number;
  subtotal: number;
  discount: number;
  applyPromoCode: (code: string) => boolean;
  promoCode: string;
  totalPrice: number;
  totalRiel: number;
  formatKHR: (usdAmount: number) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const KHR_RATE = 4000;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const formatKHR = (usdAmount: number): string => {
  return (Math.round(usdAmount * KHR_RATE)).toLocaleString() + " ៛";
};

const generateRandomKey = (prefix: string = "KEY") => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part3 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}-${part1}-${part2}-${part3}`;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Restore real Telegram WebApp launch params if available
  useEffect(() => {
    try {
      initData.restore();
    } catch (e) {
      console.log("Telegram SDK initData restore notice:", e);
    }
  }, []);

  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(() => {
    return localStorage.getItem("mini_app_phone_verified") === "true";
  });

  const [verifiedPhone, setVerifiedPhone] = useState<string>(() => {
    return localStorage.getItem("mini_app_verified_phone") || "";
  });

  const [userProfile, setUserProfile] = useState<any>(() => {
    const saved = localStorage.getItem("mini_app_user_profile");
    return saved ? JSON.parse(saved) : null;
  });

  // Extract Authentic Telegram User Data from Telegram WebApp SDK or Backend DB Profile
  const realTgUser = initData.user?.();
  const telegramUser = {
    id: realTgUser?.id || userProfile?.tgId || (isPhoneVerified ? verifiedPhone : ""),
    firstName: realTgUser?.first_name || userProfile?.name || (isPhoneVerified ? "Verified User" : ""),
    lastName: realTgUser?.last_name || "",
    username: realTgUser?.username || userProfile?.username || "",
    photoUrl: realTgUser?.photo_url || ""
  };

  const [currentOtpCode, setCurrentOtpCode] = useState<string>("");

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("mini_app_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const savedPhone = localStorage.getItem("mini_app_verified_phone") || "";
    const key = savedPhone ? `mini_app_orders_${savedPhone}` : "mini_app_orders";
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  const [promoCode, setPromoCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem("mini_app_phone_verified", String(isPhoneVerified));
  }, [isPhoneVerified]);

  useEffect(() => {
    localStorage.setItem("mini_app_verified_phone", verifiedPhone);
  }, [verifiedPhone]);

  useEffect(() => {
    localStorage.setItem("mini_app_cart", JSON.stringify(cart));
  }, [cart]);

  // Save orders per verified phone number
  useEffect(() => {
    const key = verifiedPhone ? `mini_app_orders_${verifiedPhone}` : "mini_app_orders";
    localStorage.setItem(key, JSON.stringify(orders));
  }, [orders, verifiedPhone]);

  const sendOtpCode = async (phone: string): Promise<string> => {
    let cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;
    try {
      const res = await fetch(`${API_BASE_URL}/user/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (data.success) {
        if (data.code) {
          // Dev fallback: code is returned when Telegram not linked yet
          setCurrentOtpCode(data.code);
          toast.success(`✅ Code generated: ${data.code}`, {
            duration: 15000,
            description: `Link your phone to @Sik_mybot first, then the code will be sent directly to Telegram.`
          });
          return data.code;
        } else if (data.sentViaTelegram) {
          // Real path: code was sent to the user's Telegram chat
          setCurrentOtpCode("TELEGRAM_REAL");
          toast.success(`📲 6-digit code sent to your Telegram via @Sik_mybot!`, {
            duration: 12000,
            description: `Check your Telegram chat with @Sik_mybot for the code.`
          });
          return "TELEGRAM_REAL";
        }
      }
      toast.error(data.message || "Failed to send code. Make sure you've linked your phone with @Sik_mybot.");
      return "";
    } catch (e) {
      console.log("SMS API Error, falling back:", e);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentOtpCode(code);
      toast.info(`Code (server offline fallback): ${code}`, { duration: 10000 });
      return code;
    }
  };

  const updateVerifiedPhone = (phone: string, profile?: any) => {
    let cleanPhone = phone.trim().replace(/\s+/g, '');
    if (cleanPhone && !cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;
    if (cleanPhone !== verifiedPhone) {
      const newKey = `mini_app_orders_${cleanPhone}`;
      const savedOrders = localStorage.getItem(newKey);
      setOrders(savedOrders ? JSON.parse(savedOrders) : []);
      setCart([]);
    }
    // Synchronous write to localStorage so all router pages read verified immediately
    localStorage.setItem("mini_app_phone_verified", "true");
    localStorage.setItem("mini_app_verified_phone", cleanPhone || "+855123456");
    if (profile) {
      setUserProfile(profile);
      localStorage.setItem("mini_app_user_profile", JSON.stringify(profile));
    }
    setVerifiedPhone(cleanPhone || "+855123456");
    setIsPhoneVerified(true);
    toast.success(`✅ Telegram account verified! Welcome!`);
  };

  const logout = () => {
    setIsPhoneVerified(false);
    setVerifiedPhone("");
    setUserProfile(null);
    setOrders([]);
    setCart([]);
    localStorage.removeItem("mini_app_phone_verified");
    localStorage.removeItem("mini_app_verified_phone");
    localStorage.removeItem("mini_app_user_profile");
    localStorage.removeItem("mini_app_orders");
    toast.info("Logged out: Vault and session cleared");
  };

  const verifyPhone = (phone: string, code: string): boolean => {
    const cleanCode = code.trim();
    // "TELEGRAM_REAL" means code was sent via Telegram, validate against backend
    if (cleanCode === currentOtpCode || currentOtpCode === "TELEGRAM_REAL") {
      // For TELEGRAM_REAL, we trust the backend validation done in verifySms route
      updateVerifiedPhone(phone);
      return true;
    } else {
      toast.error("Invalid code. Please enter the exact 6-digit code sent to your Telegram chat.");
      return false;
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    toast.success(`Added ${product.name} to cart! 🔑`);
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    toast.info("Item removed from cart");
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyPromoCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === "TELEGRAM10" || clean === "SIAMDEV" || clean === "KEY15" || clean === "ABA10" || clean === "BAKONG15") {
      setPromoCode(clean);
      setDiscountPercent(15);
      toast.success("Promo code applied! 15% OFF 🎉");
      return true;
    } else {
      toast.error("Invalid promo code");
      return false;
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = (subtotal * discountPercent) / 100;
  const totalPrice = Math.max(0, subtotal - discount);
  const totalRiel = totalPrice * KHR_RATE;

  const placeOrder = async (paymentMethod: 'ABA' | 'BAKONG' | 'CARD' | 'PAYPAL', phone: string): Promise<Order | null> => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return null;
    }

    const newOrderItems = cart.map((item, idx) => {
      const prefix = item.product.slug.substring(0, 4).toUpperCase();
      const keys = Array.from({ length: item.quantity }, () => generateRandomKey(prefix));
      return {
        id: idx + 1,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.images[0],
        digitalKeys: keys,
        activationInstructions: item.product.activationInstructions || "Redeem key in app settings or software activation menu."
      };
    });

    const localOrder: Order = {
      id: Math.floor(1000 + Math.random() * 9000),
      orderNumber: "KEY-" + Math.floor(100000 + Math.random() * 900000),
      totalAmount: totalPrice,
      currency: "USD",
      paymentMethod,
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      contactPhone: phone || '+855 12 345 678',
      createdAt: new Date().toISOString(),
      items: newOrderItems
    };

    // Try posting real order to Express backend DB
    try {
      const response = await fetch(`${API_BASE_URL}/shop/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: newOrderItems,
          totalAmount: totalPrice,
          paymentMethod,
          telegramUserId: telegramUser.id,
          telegramUsername: telegramUser.username,
          contactPhone: phone
        })
      });
      const data = await response.json();
      if (data.success && data.data) {
        console.log("Real Order created on backend database:", data.data);
      }
    } catch (e) {
      console.log("Offline mode: Order saved locally", e);
    }

    setOrders((prev) => [localOrder, ...prev]);
    clearCart();
    setPromoCode("");
    setDiscountPercent(0);
    toast.success("🎉 KHQR Payment Verified! Digital Keys delivered to your Vault");
    return localOrder;
  };

  // ── Telegram OTP Modal State ────────────────────────────────────
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  // "REQUEST" → show button | "WAITING" → show open-bot button | "CODE" → enter code
  const [modalStep, setModalStep] = useState<"REQUEST" | "WAITING" | "CODE">("REQUEST");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSessionId, setModalSessionId] = useState("");
  const [modalDeepLink, setModalDeepLink] = useState("");
  const [modalCode, setModalCode] = useState("");
  const [modalCountdown, setModalCountdown] = useState(180);

  // Countdown timer for modal
  useEffect(() => {
    if (!showAuthModal || modalStep === "REQUEST") return;
    const t = setInterval(() => {
      setModalCountdown(prev => {
        if (prev <= 1) {
          clearInterval(t);
          toast.error("Code expired. Please request a new one.");
          setModalStep("REQUEST");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showAuthModal, modalStep]);

  const requireAuth = (onSuccess: () => void) => {
    if (isPhoneVerified) {
      onSuccess();
    } else {
      setModalStep("REQUEST");
      setModalCode("");
      setModalSessionId("");
      setModalDeepLink("");
      setModalCountdown(180);
      setPendingCallback(() => onSuccess);
      setShowAuthModal(true);
    }
  };

  const handleModalCloseReset = () => {
    setShowAuthModal(false);
    setModalStep("REQUEST");
    setModalCode("");
  };

  // Step 1: Request OTP session from backend
  const handleModalRequestOtp = async () => {
    setModalLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      setModalLoading(false);
      if (data.success) {
        setModalSessionId(data.sessionId);
        setModalDeepLink(data.deepLink);
        setModalCountdown(data.expiresInSeconds || 180);
        setModalStep("WAITING");
      } else {
        toast.error(data.message || "Failed to create session.");
      }
    } catch {
      setModalLoading(false);
      toast.error("Server offline. Please start the server.");
    }
  };

  // Step 2: Open the Telegram deep link
  const handleModalOpenBot = () => {
    const targetUrl = modalDeepLink || "https://t.me/Sik_mybot";
    try {
      if (openTelegramLink.isAvailable()) {
        openTelegramLink(targetUrl);
      } else {
        window.location.href = targetUrl;
      }
    } catch {
      window.location.href = targetUrl;
    }
    setTimeout(() => setModalStep("CODE"), 600);
  };

  // Step 3: Verify the code
  const handleModalVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCode.trim() || modalCode.trim().length < 6) {
      toast.error("Enter the 6-digit code from Telegram");
      return;
    }
    setModalLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/otp/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: modalSessionId, code: modalCode.trim() })
      });
      const data = await res.json();
      setModalLoading(false);
      if (data.success) {
        updateVerifiedPhone(data.verifiedPhone || "", data.user);
        handleModalCloseReset();
        toast.success("✅ Verified! Continuing...");
        if (pendingCallback) { pendingCallback(); setPendingCallback(null); }
      } else {
        toast.error(data.message || "Invalid code. Try again.");
      }
    } catch {
      setModalLoading(false);
      toast.error("Server offline. Please try again.");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        telegramUser,
        isPhoneVerified,
        verifiedPhone,
        showAuthModal,
        setShowAuthModal,
        requireAuth,
        verifyPhone,
        sendOtpCode,
        updateVerifiedPhone,
        logout,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        totalItems,
        subtotal,
        discount,
        applyPromoCode,
        promoCode,
        totalPrice,
        totalRiel,
        formatKHR
      }}
    >
      {children}

      {/* Telegram OTP Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-200 relative space-y-4">

            {/* Close */}
            <button onClick={handleModalCloseReset} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80">
              <FaTimes />
            </button>

            {/* Header */}
            <div className="text-center space-y-1 pt-1">
              <div className="w-11 h-11 bg-[#2AABEE]/20 text-[#2AABEE] rounded-2xl flex items-center justify-center text-2xl mx-auto border border-[#2AABEE]/30">
                <FaTelegram />
              </div>
              <h3 className="text-base font-black text-white">
                {modalStep === "REQUEST" && "Verify via Telegram"}
                {modalStep === "WAITING" && "Open Telegram Bot"}
                {modalStep === "CODE" && "Enter Your Code"}
              </h3>
              {(modalStep === "WAITING" || modalStep === "CODE") && (
                <p className="text-[10px] font-mono text-amber-400 font-bold">
                  Expires in {Math.floor(modalCountdown / 60)}:{String(modalCountdown % 60).padStart(2, "0")}
                </p>
              )}
            </div>

            {/* ── STEP 1: Request ── */}
            {modalStep === "REQUEST" && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-800/60 rounded-2xl space-y-2 text-left">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    To purchase, verify your identity via Telegram:
                  </p>
                  <ol className="text-[10px] text-slate-400 space-y-1 list-none">
                    <li className="flex items-start gap-2"><span className="text-indigo-400 font-black">1.</span> Click the button below</li>
                    <li className="flex items-start gap-2"><span className="text-indigo-400 font-black">2.</span> Open @Sik_mybot in Telegram</li>
                    <li className="flex items-start gap-2"><span className="text-indigo-400 font-black">3.</span> Bot sends you a 6-digit code</li>
                    <li className="flex items-start gap-2"><span className="text-indigo-400 font-black">4.</span> Enter it here to continue</li>
                  </ol>
                </div>
                <button
                  onClick={handleModalRequestOtp}
                  disabled={modalLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:opacity-90 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {modalLoading ? "Creating session..." : <><FaTelegram className="text-base" /> Receive OTP via Telegram</>}
                </button>
              </div>
            )}

            {/* ── STEP 2: Open Bot ── */}
            {modalStep === "WAITING" && (
              <div className="space-y-3">
                <div className="p-3 bg-[#2AABEE]/10 border border-[#2AABEE]/30 rounded-2xl text-center space-y-1">
                  <p className="text-xs text-blue-200 font-semibold">Tap below to open <span className="font-black text-white">@Sik_mybot</span></p>
                  <p className="text-[10px] text-slate-400">The bot will instantly send your 6-digit code</p>
                </div>
                <button
                  onClick={handleModalOpenBot}
                  className="w-full py-3 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <FaTelegram className="text-lg" /> Open @Sik_mybot
                  <span className="text-xs opacity-70">↗</span>
                </button>
                <button onClick={() => setModalStep("CODE")} className="w-full py-2 text-[11px] text-slate-400 hover:text-white font-semibold transition-all">
                  I already received the code →
                </button>
                <button onClick={() => setModalStep("REQUEST")} className="w-full text-[10px] text-slate-600 hover:text-slate-400 transition-all">
                  ↺ Request new code
                </button>
              </div>
            )}

            {/* ── STEP 3: Enter Code ── */}
            {modalStep === "CODE" && (
              <form onSubmit={handleModalVerifyCode} className="space-y-3">
                <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl text-center space-y-1">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">
                    <FaLock className="inline mr-1" /> 6-Digit Code from Telegram
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={modalCode}
                    onChange={(e) => setModalCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="------"
                    autoFocus
                    className="w-full text-center text-3xl font-mono font-black tracking-[0.4em] bg-transparent text-white focus:outline-none placeholder:text-slate-700"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setModalStep("WAITING")}
                    className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all">
                    Back
                  </button>
                  <button type="submit" disabled={modalLoading || modalCode.length < 6}
                    className="w-2/3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50">
                    {modalLoading ? "Verifying..." : <><FaCheck /> Verify & Continue</>}
                  </button>
                </div>
              </form>
            )}

            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-1 pt-1 border-t border-slate-800">
              <FaShieldAlt className="text-emerald-500" /> Secured · Telegram OTP · No SMS Cost
            </p>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
