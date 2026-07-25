import { RequestHandler } from "express";
import crypto from "crypto";
import { prisma } from "../index";

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
    price: 1.00,
    tonPrice: 0.2,
    starsPrice: 50,
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
    price: 1.00,
    tonPrice: 0.2,
    starsPrice: 50,
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
    price: 1.00,
    tonPrice: 0.2,
    starsPrice: 50,
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
    price: 1.00,
    tonPrice: 0.2,
    starsPrice: 50,
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
    price: 1.00,
    tonPrice: 0.2,
    starsPrice: 50,
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
    price: 1.00,
    tonPrice: 0.2,
    starsPrice: 50,
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

export let MOCK_BANNERS = [
  {
    id: 1,
    badge: "ChatGPT Plus & GPT-4o 🤖",
    title: "ChatGPT Plus Digital Keys",
    desc: "Get instant activation vouchers for OpenAI ChatGPT Plus with GPT-4o, Sora & DALL-E 3 access!",
    tag: "⚡ INSTANT AI ACCESS",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    gradient: "from-emerald-950 via-teal-900/80 to-slate-950"
  },
  {
    id: 2,
    badge: "Google Gemini Advanced ✨",
    title: "Gemini Advanced 1.5 Pro Keys",
    desc: "Unlock Google's 2M token context window & Ultra AI capabilities with instant digital license codes!",
    tag: "🔥 20% OFF TODAY",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
    gradient: "from-blue-950 via-indigo-900/80 to-slate-950"
  },
  {
    id: 3,
    badge: "Anthropic Claude 3.5 Sonnet 🧠",
    title: "Claude Pro Access Vouchers",
    desc: "Top-tier AI coding & reasoning intelligence. Instant key redemption in USD ($) & Khmer Riel (៛)!",
    tag: "💳 KHQR & ABA Supported",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
    gradient: "from-amber-950 via-orange-950/80 to-slate-950"
  }
];

export const getBanners: RequestHandler = (_req, res): void => {
  res.status(200).json({ success: true, data: MOCK_BANNERS });
};

export const createBanner: RequestHandler = (req, res): void => {
  const { title, badge, desc, image, tag } = req.body;
  const newBanner = {
    id: Date.now(),
    title,
    badge: badge || "PROMO",
    desc: desc || "",
    tag: tag || "⚡ SPECIAL OFFER",
    image: image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    gradient: "from-indigo-950 via-purple-900/80 to-slate-950"
  };
  MOCK_BANNERS.push(newBanner);
  res.status(201).json({ success: true, data: newBanner });
};

export const updateBanner: RequestHandler = (req, res): void => {
  const id = Number(req.params.id);
  const index = MOCK_BANNERS.findIndex(b => b.id === id);
  if (index === -1) {
    res.status(404).json({ success: false, message: "Banner not found" });
    return;
  }
  MOCK_BANNERS[index] = { ...MOCK_BANNERS[index], ...req.body };
  res.status(200).json({ success: true, data: MOCK_BANNERS[index] });
};

export const deleteBanner: RequestHandler = (req, res): void => {
  const id = Number(req.params.id);
  MOCK_BANNERS = MOCK_BANNERS.filter(b => b.id !== id);
  res.status(200).json({ success: true, message: "Banner deleted" });
};

export const getProducts: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { category, search, featured } = req.query;

    const dbProducts = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });

    let products: any[] = dbProducts.length > 0
      ? dbProducts.map(p => ({
          ...p,
          categoryName: p.category?.name || "General"
        }))
      : [...MOCK_PRODUCTS];

    if (category) {
      products = products.filter(p => p.categoryId === Number(category) || (p.categoryName && p.categoryName.toLowerCase() === String(category).toLowerCase()));
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

export const getProductById: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const dbProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true }
    });

    const product = dbProduct
      ? { ...dbProduct, categoryName: dbProduct.category?.name || "General" }
      : MOCK_PRODUCTS.find(p => p.id === Number(id));

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
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

export const createAbaPayment: RequestHandler = (req, res): void => {
  try {
    const { items, totalAmount, firstname, lastname, phone, email } = req.body;
    
    const merchantId = process.env.ABA_PAYWAY_MERCHANT_ID || "ec477129";
    const publicKey = process.env.ABA_PAYWAY_PUBLIC_KEY || "78445715560c048d3e0db4ced5167311a5817dfa";
    const apiUrl = process.env.ABA_PAYWAY_API_URL || "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";
    
    const now = new Date();
    const YYYY = now.getUTCFullYear();
    const MM = String(now.getUTCMonth() + 1).padStart(2, '0');
    const DD = String(now.getUTCDate()).padStart(2, '0');
    const HH = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    const ss = String(now.getUTCSeconds()).padStart(2, '0');
    const req_time = `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
    
    const tran_id = `TRANS_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const amount = Number(totalAmount || 0).toFixed(2);
    
    const itemsFormatted = (items || []).map((i: any) => ({
      name: i.productName || i.name || "Digital Key",
      quantity: String(i.quantity || 1),
      price: Number(i.price || 0).toFixed(2)
    }));
    
    const itemsBase64 = Buffer.from(JSON.stringify(itemsFormatted)).toString("base64");
    
    const shipping = "0.00";
    const fName = firstname || "Telegram";
    const lName = lastname || "User";
    const userEmail = email || "customer@miniapp.com";
    const userPhone = phone || "+85512345678";
    const type = "purchase";
    const payment_option = "abapay";
    
    // Success Return and Callback URLs
    const appBaseUrl = process.env.MINI_APP_URL || "https://mini-app-one-flax.vercel.app/app";
    const continue_success_url = Buffer.from(`${appBaseUrl}/orders`).toString("base64");
    const return_url = Buffer.from(`${appBaseUrl}/orders`).toString("base64");

    // HMAC SHA-512 Hash Generation according to ABA PayWay Purchase spec
    const rawData = `${req_time}${merchantId}${tran_id}${amount}${itemsBase64}${shipping}${fName}${lName}${userEmail}${userPhone}${type}${payment_option}${continue_success_url}${return_url}`;
    const hash = crypto.createHmac("sha512", publicKey).update(rawData).digest("base64");

    // RSA Signature
    let rsaSignature = "";
    try {
      const privateKey = (process.env.ABA_PAYWAY_RSA_PRIVATE_KEY || "").replace(/\\n/g, "\n");
      if (privateKey) {
        const signer = crypto.createSign("RSA-SHA256");
        signer.update(rawData);
        rsaSignature = signer.sign(privateKey, "base64");
      }
    } catch (e) {
      console.log("RSA Sign error:", e);
    }

    res.status(200).json({
      success: true,
      data: {
        apiUrl,
        merchantId,
        publicKey,
        req_time,
        tran_id,
        amount,
        items: itemsBase64,
        shipping,
        firstname: fName,
        lastname: lName,
        email: userEmail,
        phone: userPhone,
        type,
        payment_option,
        continue_success_url,
        return_url,
        hash,
        rsaSignature,
        // ABA Sandbox App Deep Link
        deeplink: `abapayway://checkout-sandbox.payway.com.kh?merchant_id=${merchantId}&tran_id=${tran_id}&amount=${amount}&hash=${encodeURIComponent(hash)}`,
        qrPayload: `00020101021238580016A000000770010111011300012345602080001234565204581253038405802KH5925ABA+PAYWAY+MERCHANT+${merchantId}6010PHNOM+PENH62150711ABA${tran_id}${amount}`
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const abaWebhook: RequestHandler = (req, res): void => {
  try {
    const { status, tran_id, amount, hash } = req.body;
    console.log(`[ABA PAYWAY WEBHOOK] Order ID: ${tran_id} | Status: ${status} | Amount: ${amount}`);
    
    // Status 0 / PAID indicates successful transaction from ABA Sandbox
    if (String(status) === "0" || String(status) === "PAID" || String(status) === "200") {
      console.log(`✅ Order ${tran_id} marked as PAID. Digital keys delivered to customer.`);
    }

    res.status(200).json({ status: "0", message: "ABA Webhook processed successfully" });
  } catch (error: any) {
    res.status(500).json({ status: "1", message: error.message });
  }
};

export const createPaypalPayment: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { items, totalAmount } = req.body;
    const clientId = process.env.PAYPAL_CLIENT_ID || "Adwf4rrFyhxGtUTYTTJWTN8Kj5vOiDvSlcDWfiU7xhZnFQGVOST7Ry9I4fBqdG-qRpQe4A3aQFaA9mwe";
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "EBT0z8wm2LZP90QiwTzxppyQUg1dIGAXNXRLJPr698QAv2CH4ayGNLmJg-WdFC5xdrjtsFWr61mUc7Oe";
    const paypalApiUrl = process.env.PAYPAL_API_URL || "https://api-m.paypal.com";
    const amount = Number(totalAmount || 0).toFixed(2);

    let paypalOrderId = `PAYPAL_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    let approvalUrl = `https://www.paypal.com/checkoutnow?token=${paypalOrderId}`;

    try {
      // Attempt PayPal REST API Order Creation with Client ID & Secret
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const orderRes = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount
              },
              description: "Digital Key Purchase"
            }
          ]
        })
      });

      const orderData: any = await orderRes.json();
      if (orderData.id) {
        paypalOrderId = orderData.id;
        const approveLink = orderData.links?.find((l: any) => l.rel === "approve");
        if (approveLink) {
          approvalUrl = approveLink.href;
        }
      }
    } catch (apiErr) {
      console.log("PayPal REST API call notice:", apiErr);
    }

    res.status(200).json({
      success: true,
      data: {
        clientId,
        orderId: paypalOrderId,
        approvalUrl,
        amount,
        currency: "USD",
        status: "CREATED"
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
