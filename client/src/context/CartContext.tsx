import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, Order } from "../type";
import { toast } from "sonner";
import { initData } from "@telegram-apps/sdk";

interface CartContextType {
  cart: CartItem[];
  orders: Order[];
  walletBalance: number;
  walletRiel: number;
  telegramUser: {
    id?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
  };
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  placeOrder: (paymentMethod: 'USD' | 'KHR', address: string, phone: string) => Promise<Order | null>;
  totalItems: number;
  subtotal: number;
  discount: number;
  applyPromoCode: (code: string) => boolean;
  redeemPromoCode: (code: string) => boolean;
  promoCode: string;
  totalPrice: number;
  totalRiel: number;
  formatKHR: (usdAmount: number) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const KHR_RATE = 4000;
const API_BASE_URL = "http://localhost:3000";

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
  // Extract Real Telegram User Data
  const realTgUser = initData.user?.();
  const telegramUser = {
    id: realTgUser?.id || 778192031,
    firstName: realTgUser?.first_name || "Alex",
    lastName: realTgUser?.last_name || "",
    username: realTgUser?.username || "TelegramUser",
    photoUrl: realTgUser?.photo_url || ""
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("mini_app_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("mini_app_orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem("mini_app_wallet_balance");
    return saved ? Number(saved) : 250.00;
  });

  const [redeemedCodes, setRedeemedCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem("mini_app_redeemed_codes");
    return saved ? JSON.parse(saved) : [];
  });

  const [promoCode, setPromoCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem("mini_app_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("mini_app_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("mini_app_wallet_balance", String(walletBalance));
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem("mini_app_redeemed_codes", JSON.stringify(redeemedCodes));
  }, [redeemedCodes]);

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
    if (clean === "TELEGRAM10" || clean === "SIAMDEV" || clean === "KEY15" || clean === "WELCOME50" || clean === "BONUS10") {
      setPromoCode(clean);
      setDiscountPercent(15);
      toast.success("Promo code applied! 15% OFF 🎉");
      return true;
    } else {
      toast.error("Invalid promo code");
      return false;
    }
  };

  const redeemPromoCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      toast.error("Please enter a promo code");
      return false;
    }

    if (redeemedCodes.includes(clean)) {
      toast.error("You have already redeemed this code!");
      return false;
    }

    let bonusAmount = 0;
    if (clean === "WELCOME50") {
      bonusAmount = 50.0;
    } else if (clean === "BONUS10" || clean === "KEY10") {
      bonusAmount = 10.0;
    } else if (clean === "TELEGRAM10" || clean === "SIAMDEV") {
      bonusAmount = 15.0;
      setPromoCode(clean);
      setDiscountPercent(15);
    } else if (clean === "PROMO100" || clean === "VIP100") {
      bonusAmount = 100.0;
    } else {
      toast.error("Invalid or expired promo code");
      return false;
    }

    setWalletBalance((prev) => prev + bonusAmount);
    setRedeemedCodes((prev) => [...prev, clean]);
    toast.success(`🎉 Code '${clean}' redeemed! +$${bonusAmount.toFixed(2)} (${formatKHR(bonusAmount)}) added to wallet!`);
    return true;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = (subtotal * discountPercent) / 100;
  const totalPrice = Math.max(0, subtotal - discount);

  const walletRiel = walletBalance * KHR_RATE;
  const totalRiel = totalPrice * KHR_RATE;

  const placeOrder = async (paymentMethod: 'USD' | 'KHR', _address: string, phone: string): Promise<Order | null> => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return null;
    }

    if (walletBalance < totalPrice) {
      toast.error(`Insufficient balance. Required: $${totalPrice.toFixed(2)} (${formatKHR(totalPrice)})`);
      return null;
    }

    // Deduct balance
    setWalletBalance((prev) => Math.max(0, prev - totalPrice));

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
      currency: paymentMethod,
      paymentMethod,
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      contactPhone: phone || 'Telegram Shopper',
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
    toast.success("🎉 Digital Key delivered! Check your Orders Vault");
    return localOrder;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        walletBalance,
        walletRiel,
        telegramUser,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        totalItems,
        subtotal,
        discount,
        applyPromoCode,
        redeemPromoCode,
        promoCode,
        totalPrice,
        totalRiel,
        formatKHR
      }}
    >
      {children}
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
