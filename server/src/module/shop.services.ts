import { RequestHandler } from "express";

export const MOCK_CATEGORIES = [
  { id: 1, name: "Telegram & Bot Keys", slug: "telegram-bot-keys", icon: "🔑", description: "Telegram Premium, Bot API keys & VIP Access", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Gaming & Gift Cards", slug: "gaming-gift-cards", icon: "🎮", description: "Steam, Xbox, PlayStation & game keys", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Software & VPN Licenses", slug: "software-vpn", icon: "🛡️", description: "VPN Pro, Windows & Antivirus license keys", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Crypto & AI Subscriptions", slug: "crypto-ai-sub", icon: "⚡", description: "Trading bot keys, AI access & node passes", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80" },
];

export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Telegram Premium 1-Year Key",
    slug: "telegram-premium-1-year-key",
    description: "Instant redeemable activation key for 1 year of Telegram Premium. Unlock 4GB uploads, faster downloads, badges, and custom emojis.",
    price: 34.99,
    tonPrice: 6.5,
    starsPrice: 1750,
    images: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"],
    categoryId: 1,
    categoryName: "Telegram & Bot Keys",
    stock: 120,
    rating: 4.9,
    reviewCount: 340,
    isFeatured: true,
    isNew: true,
    isOnSale: true,
    discount: 15,
    isDigital: true,
    keyFormat: "TGPM-XXXX-XXXX-XXXX",
    activationInstructions: "Open Telegram Settings -> Premium -> Redeem Key, or activate directly in bot."
  },
  {
    id: 2,
    name: "Steam $50 Digital Gift Card Key",
    slug: "steam-50-digital-gift-card-key",
    description: "Global Steam Wallet activation code. Instantly adds $50 USD to your Steam account balance.",
    price: 49.99,
    tonPrice: 9.5,
    starsPrice: 2500,
    images: ["https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"],
    categoryId: 2,
    categoryName: "Gaming & Gift Cards",
    stock: 85,
    rating: 4.9,
    reviewCount: 512,
    isFeatured: true,
    isNew: false,
    isOnSale: false,
    discount: 0,
    isDigital: true,
    keyFormat: "STEAM-XXXX-XXXX-XXXX",
    activationInstructions: "Go to store.steampowered.com/account/redeemwalletcode and enter your digital key."
  },
  {
    id: 3,
    name: "Express VPN Pro 1-Year License Key",
    slug: "express-vpn-pro-1-year-key",
    description: "High-speed encrypted VPN activation serial key. Supports 8 devices concurrently with unlimited bandwidth.",
    price: 29.99,
    tonPrice: 5.8,
    starsPrice: 1500,
    images: ["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80"],
    categoryId: 3,
    categoryName: "Software & VPN Licenses",
    stock: 50,
    rating: 4.8,
    reviewCount: 198,
    isFeatured: true,
    isNew: false,
    isOnSale: true,
    discount: 25,
    isDigital: true,
    keyFormat: "VPNP-XXXX-XXXX-XXXX",
    activationInstructions: "Enter key into Express VPN client under Account -> Enter Activation Code."
  },
  {
    id: 4,
    name: "SiamDev VIP Trading Bot API Key",
    slug: "siamdev-vip-trading-bot-key",
    description: "Lifetime API access license key for SiamDev Automated Telegram Trading & Alert Bot.",
    price: 199.99,
    tonPrice: 38.0,
    starsPrice: 10000,
    images: ["https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80"],
    categoryId: 4,
    categoryName: "Crypto & AI Subscriptions",
    stock: 15,
    rating: 5.0,
    reviewCount: 88,
    isFeatured: true,
    isNew: true,
    isOnSale: true,
    discount: 20,
    isDigital: true,
    keyFormat: "SIAM-API-XXXX-XXXX-XXXX",
    activationInstructions: "Paste API Key into @SiamDevBot via /license command."
  },
  {
    id: 5,
    name: "Windows 11 Pro Retail License Key",
    slug: "windows-11-pro-retail-key",
    description: "Original 100% genuine retail activation key for Windows 11 Professional (32/64-bit).",
    price: 19.99,
    tonPrice: 3.8,
    starsPrice: 1000,
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80"],
    categoryId: 3,
    categoryName: "Software & VPN Licenses",
    stock: 200,
    rating: 4.9,
    reviewCount: 620,
    isFeatured: false,
    isNew: false,
    isOnSale: true,
    discount: 30,
    isDigital: true,
    keyFormat: "W11P-XXXXX-XXXXX-XXXXX-XXXXX",
    activationInstructions: "Go to Settings -> System -> Activation -> Change Product Key."
  },
  {
    id: 6,
    name: "ChatGPT Plus 1-Month Access Key",
    slug: "chatgpt-plus-1-month-key",
    description: "Digital activation voucher for 1 month of ChatGPT Plus (GPT-4o, DALL-E 3, Sora access).",
    price: 18.50,
    tonPrice: 3.5,
    starsPrice: 925,
    images: ["https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80"],
    categoryId: 4,
    categoryName: "Crypto & AI Subscriptions",
    stock: 40,
    rating: 4.8,
    reviewCount: 145,
    isFeatured: true,
    isNew: true,
    isOnSale: false,
    discount: 0,
    isDigital: true,
    keyFormat: "GPT4-XXXX-XXXX-XXXX",
    activationInstructions: "Redeem voucher code at chatgpt.com/redeem."
  }
];

// Key generator helper function
const generateRandomKey = (prefix: string = "KEY") => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part3 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}-${part1}-${part2}-${part3}`;
};

export const getProducts: RequestHandler = (req, res): void => {
  try {
    const { category, search, featured } = req.query;
    let products = [...MOCK_PRODUCTS];

    if (category) {
      products = products.filter(p => p.categoryId === Number(category) || p.categoryName.toLowerCase() === String(category).toLowerCase());
    }

    if (featured === 'true') {
      products = products.filter(p => p.isFeatured);
    }

    if (search) {
      const q = String(search).toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories: RequestHandler = (_req, res): void => {
  res.status(200).json({
    success: true,
    data: MOCK_CATEGORIES
  });
};

export const getProductById: RequestHandler = (req, res): void => {
  const { id } = req.params;
  const product = MOCK_PRODUCTS.find(p => p.id === Number(id));
  if (!product) {
    res.status(404).json({ success: false, message: "Product not found" });
    return;
  }
  res.status(200).json({ success: true, data: product });
};

export const createOrder: RequestHandler = (req, res): void => {
  try {
    const { items, totalAmount, paymentMethod, contactPhone } = req.body;
    const orderNumber = "KEY-" + Math.floor(100000 + Math.random() * 900000);
    
    const processedItems = (items || []).map((item: any) => {
      const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
      const prefix = product?.slug.substring(0, 4).toUpperCase() || "KEY";
      const digitalKeys = Array.from({ length: item.quantity || 1 }, () => generateRandomKey(prefix));
      
      return {
        ...item,
        digitalKeys,
        activationInstructions: product?.activationInstructions || "Redeem inside app or service."
      };
    });

    const newOrder = {
      id: Math.floor(Math.random() * 10000),
      orderNumber,
      totalAmount: totalAmount || 0,
      currency: paymentMethod === 'TON' ? 'TON' : paymentMethod === 'STARS' ? 'STARS' : 'USD',
      paymentMethod: paymentMethod || 'TON',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      contactPhone: contactPhone || 'Telegram User',
      createdAt: new Date().toISOString(),
      items: processedItems
    };

    res.status(201).json({
      success: true,
      message: "Digital keys generated & delivered successfully!",
      data: newOrder
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
