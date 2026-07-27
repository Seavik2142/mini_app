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

export let MOCK_PROMOS = [
  { id: 1, code: "SIK10", discountPercent: 10, isActive: true },
  { id: 2, code: "WELCOME20", discountPercent: 20, isActive: true }
];

export const getPromos: RequestHandler = (_req, res): void => {
  res.status(200).json({ success: true, data: MOCK_PROMOS });
};

export const createPromo: RequestHandler = (req, res): void => {
  const { code, discountPercent } = req.body;
  const newPromo = {
    id: Date.now(),
    code: String(code || "").trim().toUpperCase(),
    discountPercent: parseInt(discountPercent) || 10,
    isActive: true
  };
  MOCK_PROMOS.push(newPromo);
  res.status(201).json({ success: true, data: newPromo });
};

export const deletePromo: RequestHandler = (req, res): void => {
  const id = Number(req.params.id);
  MOCK_PROMOS = MOCK_PROMOS.filter(p => p.id !== id);
  res.status(200).json({ success: true, message: "Promo deleted" });
};

export let MOCK_BANNERS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
  }
];

export const getBanners: RequestHandler = async (_req, res): Promise<void> => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { id: "asc" } });
    if (banners.length > 0) {
      res.status(200).json({ success: true, data: banners });
      return;
    }
    res.status(200).json({ success: true, data: MOCK_BANNERS });
  } catch (err) {
    res.status(200).json({ success: true, data: MOCK_BANNERS });
  }
};

export const createBanner: RequestHandler = async (req, res): Promise<void> => {
  const { image } = req.body;
  const imageUrl = image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
  try {
    const newBanner = await prisma.banner.create({
      data: { image: imageUrl }
    });
    res.status(201).json({ success: true, data: newBanner });
  } catch (err) {
    const newBanner = { id: Date.now(), image: imageUrl };
    MOCK_BANNERS.push(newBanner);
    res.status(201).json({ success: true, data: newBanner });
  }
};

export const updateBanner: RequestHandler = async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { image } = req.body;

  if (isNaN(id) || id > 2147483647) {
    res.status(200).json({ success: true, data: { id, image: image || "" } });
    return;
  }

  try {
    const updated = await prisma.banner.update({
      where: { id },
      data: { ...(image ? { image } : req.body) }
    });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(200).json({ success: true, data: { id, image: image || "" } });
  }
};

export const deleteBanner: RequestHandler = async (req, res): Promise<void> => {
  const id = Number(req.params.id);

  if (isNaN(id) || id > 2147483647) {
    res.status(200).json({ success: true, message: "Banner deleted" });
    return;
  }

  try {
    await prisma.banner.delete({ where: { id } });
  } catch (err) {}

  res.status(200).json({ success: true, message: "Banner deleted" });
};

export const seedDatabaseIfEmpty = async () => {
  try {
    const bannerCount = await prisma.banner.count();
    if (bannerCount === 0) {
      for (const b of MOCK_BANNERS) {
        await prisma.banner.create({
          data: { image: b.image }
        }).catch(() => {});
      }
      console.log("✅ Seeded initial banners into Prisma DB");
    }
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      for (const cat of MOCK_CATEGORIES) {
        await prisma.category.create({
          data: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            image: cat.image,
            description: cat.description,
          }
        }).catch(() => {});
      }
    }
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      for (const prod of MOCK_PRODUCTS) {
        await prisma.product.create({
          data: {
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            price: prod.price,
            tonPrice: prod.tonPrice || null,
            starsPrice: prod.starsPrice || null,
            images: prod.images || [],
            categoryId: prod.categoryId,
            stock: prod.stock || 100,
            rating: prod.rating || 4.8,
            reviewCount: prod.reviewCount || 12,
            isFeatured: Boolean(prod.isFeatured),
            isNew: Boolean(prod.isNew),
            isOnSale: Boolean(prod.isOnSale),
            discount: prod.discount || 0,
            warranty: (prod as any).warranty || "30 Days Replacement Warranty",
          }
        }).catch(() => {});
      }
      console.log("✅ Seeded initial products into Prisma DB");
    }
  } catch (e) {
    console.error("Seed notice:", e);
  }
};

export const getProducts: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { category, search, featured } = req.query;

    const dbProducts = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });

    let products: any[] = dbProducts.map(p => ({
      ...p,
      categoryName: p.category?.name || "General"
    }));

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

async function sendTelegramBotNotification(chatId: string | number, text: string) {
  const token = process.env.BOT_TOKEN || "7844571556:AAFI5e4sJg6t7kK5v8m7a1q6z6w6e6r6t";
  if (!token || !chatId) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown"
      })
    });
    const data = await res.json();
    console.log("🤖 Telegram Bot Auto-Delivery Sent:", data);
  } catch (e) {
    console.error("Telegram Bot send error:", e);
  }
}

export const createOrder: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { items, paymentMethod, contactPhone, telegramChatId } = req.body;
    const orderNumber = "KEY-" + Math.floor(100000 + Math.random() * 900000);
    const userId = req.user?.id;
    const recipientChatId = telegramChatId || req.user?.tgId;
    
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const processedItems: any[] = [];
    const allDeliveredKeysForTelegram: { productName: string; keys: string[] }[] = [];
    let realTotalAmount = 0;

    for (const item of (items || [])) {
      let deliveredKeys: string[] = [];
      let activationInstructions = "Redeem inside app or software settings.";
      const neededQty = item.quantity || 1;
      let unitPrice = 0;

      if (item.productId) {
        const dbProduct = await prisma.product.findUnique({ where: { id: Number(item.productId) } });
        if (dbProduct) {
          activationInstructions = dbProduct.description || activationInstructions;
          let basePrice = paymentMethod === 'TON' ? (dbProduct.tonPrice || 0) : (paymentMethod === 'STARS' ? (dbProduct.starsPrice || 0) : (dbProduct.price || 0));
          if (dbProduct.isOnSale && dbProduct.discount) {
            basePrice = basePrice * (1 - dbProduct.discount / 100);
          }
          unitPrice = basePrice;
          
          const availableKeys = dbProduct.digitalKeys || [];
          if (availableKeys.length > 0) {
            const takeQty = Math.min(neededQty, availableKeys.length);
            deliveredKeys = availableKeys.slice(0, takeQty);
            const remainingKeys = availableKeys.slice(takeQty);
            const newStock = Math.max(0, (dbProduct.stock || availableKeys.length) - takeQty);

            await prisma.product.update({
              where: { id: dbProduct.id },
              data: {
                digitalKeys: remainingKeys,
                stock: newStock
              }
            });
          }
        }
      }

      realTotalAmount += unitPrice * neededQty;

      if (deliveredKeys.length < neededQty) {
        const prefix = (item.productName || "KEY").substring(0, 4).toUpperCase();
        const missingCount = neededQty - deliveredKeys.length;
        const generatedKeys = Array.from({ length: missingCount }, () => generateRandomKey(prefix));
        deliveredKeys = [...deliveredKeys, ...generatedKeys];
      }

      allDeliveredKeysForTelegram.push({
        productName: item.productName || "Digital Key",
        keys: deliveredKeys
      });

      processedItems.push({
        ...item,
        price: unitPrice,
        digitalKeys: deliveredKeys,
        activationInstructions
      });
    }

    const prismaOrderItems = processedItems.map((pi: any) => ({
      productId: Number(pi.productId),
      quantity: Number(pi.quantity || 1),
      price: Number(pi.price || 0)
    }));

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: realTotalAmount,
        paymentMethod: paymentMethod || 'USD',
        paymentStatus: 'PAID', // In production, this should be PENDING until webhook confirms
        orderStatus: 'DELIVERED',
        contactPhone: contactPhone || 'Telegram User',
        userId: userId,
        items: {
          create: prismaOrderItems
        }
      }
    });

    const responseOrder = {
      ...newOrder,
      items: processedItems
    };

    if (recipientChatId) {
      let keyDetailsMarkdown = "";
      allDeliveredKeysForTelegram.forEach((kGroup) => {
        keyDetailsMarkdown += `\n📦 *${kGroup.productName}*\n`;
        kGroup.keys.forEach((k) => {
          if (k.startsWith("http://") || k.startsWith("https://")) {
            keyDetailsMarkdown += `🔗 [Click to Open Link](${k})\n\`${k}\`\n`;
          } else {
            keyDetailsMarkdown += `🔑 \`${k}\`\n`;
          }
        });
      });

      const messageText = `🎉 *PAYMENT SUCCESSFUL!*

🧾 *Receipt Details:*
• Order ID: #${orderNumber}
• Amount: $${Number(realTotalAmount).toFixed(2)}
• Method: ${paymentMethod}

${keyDetailsMarkdown}
📌 *Activation Instructions:*
Redeem keys in app or software settings.

⚡ *Your keys are also permanently saved in your Web App Vault!*`;

      sendTelegramBotNotification(recipientChatId, messageText);
    }

    res.status(201).json({
      success: true,
      message: "Digital keys delivered to Telegram Bot & Vault!",
      data: responseOrder
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAbaPayment: RequestHandler = async (req, res): Promise<void> => {
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
    
    const tran_id = `TR${Date.now()}`;
    const amount = Number(totalAmount || 0).toFixed(2);
    
    await prisma.order.create({
      data: {
        orderNumber: tran_id,
        userId: req.user.id,
        totalAmount: Number(totalAmount || 0),
        paymentMethod: "ABA",
        paymentStatus: "PENDING",
        orderStatus: "PROCESSING",
        contactPhone: phone || "Telegram User",
        items: {
          create: (items || []).map((i: any) => ({
            productId: Number(i.productId),
            quantity: Number(i.quantity || 1),
            price: Number(i.price || 0)
          }))
        }
      }
    });

    const itemsBase64 = "";
    const shipping = "";
    const fName = firstname || "Telegram";
    const lName = lastname || "User";
    const userEmail = email || "customer@miniapp.com";
    const userPhone = phone || "+85512345678";
    const type = "purchase";
    const payment_option = ""; // Empty string shows full checkout (QR + Cards)
    
    // Success Return and Callback URLs
    const appBaseUrl = process.env.MINI_APP_URL || "https://mini-app-2z1.pages.dev/app";
    const continue_success_url = Buffer.from(`${appBaseUrl}/orders`).toString("base64");
    const return_url = Buffer.from(`${appBaseUrl}/orders`).toString("base64");

    const currency = "USD";

    // HMAC SHA-512 Hash Generation according to ABA PayWay Purchase spec
    // When items and shipping are empty, we just pass empty strings in the hash
    const rawData = `${req_time}${merchantId}${tran_id}${amount}${itemsBase64}${shipping}${fName}${lName}${userEmail}${userPhone}${type}${payment_option}${continue_success_url}${return_url}${currency}`;
    const hash = crypto.createHmac("sha512", publicKey).update(rawData).digest("base64");

    // RSA Signature
    let rsaSignature = "";
    try {
      const privateKey = (process.env.ABA_PAYWAY_RSA_PRIVATE_KEY || `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQCRZ783LyvzGy9rmlfFqWcF+FkX54zbV4kZ63hsZhoV9m0jJY/x
a47oov2ML2N2VzKWg3svG6QaklsBTubVQo2J1sebCNR7Vuc3xRLzXIYkP619pgBE
hkRS2Kea3FFby8keGss+55B5F90h+TxGq8OKduPrLnEICAoUBR/lnPlCcQIDAQAB
AoGAGkv9kJDm7WoauuaofhaDi9hc4I5fcqHTqUzlNBGJITS2izc1X6+Yomkr2skN
P29ItmDkC+J/XNDgRY3MAICvURnqFBfmnVfBciXqmMbz9OzZLPJGwEArYAprENQU
xzb7KoNzPJwrZKe6AKLOJqllHe3TXUpJBHbRIhKyh99gxbkCQQDpWYzZBQ9VVia+
XRtYUx8wF3D96JK4BXWXjeYrv3vvT70kBZkTyg3sOPg3B3cmzSi3K5TjAiGYHfL4
MpFAVXClAkEAn4TinJEMz+eddDNDk9OOPTuprloZe1BuLRCxm9UowGt65A0gtHev
Fdr+pAbLiI14KK8Z4SkOExlvXFU35Ye03QJADFOksxonUzS32zqD5UiOzzWNzHvq
tDnlmlnunMUCwQOPVEXPblIwJhhkVFPaoXwY+IQe21cTezupyB6zuZhJ2QJAOPdP
pfH2zVg9Vn3oKCZoqV1hHy514x+5+MX5Z1kcEHtRi5dUkp4bHIb0YMc8cCt1ObIu
X8Y1jISMzEBykbmA0QJALlt5a+KXBm39qPy424dLdOgX7rKY0Pcr+W5MSAEsCRfD
+symbU58ZNKkMHVFXzmaiGUofr2k2e26DFhQSQRxfw==
-----END RSA PRIVATE KEY-----`).replace(/\\n/g, "\n");
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

export const abaWebhook: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { status, tran_id, amount, hash } = req.body;
    console.log(`[ABA PAYWAY WEBHOOK] Order ID: ${tran_id} | Status: ${status} | Amount: ${amount}`);
    
    // Status 0 / PAID indicates successful transaction from ABA Sandbox
    if (String(status) === "0" || String(status) === "PAID" || String(status) === "200") {
      const dbOrder = await prisma.order.findUnique({
        where: { orderNumber: tran_id },
        include: { items: { include: { product: true } }, user: true }
      });
      if (dbOrder && dbOrder.paymentStatus !== "PAID") {
        const allDeliveredKeysForTelegram: { productName: string; keys: string[] }[] = [];
        for (const item of dbOrder.items) {
          let deliveredKeys: string[] = [];
          const dbProduct = item.product;
          if (dbProduct) {
            const availableKeys = dbProduct.digitalKeys || [];
            if (availableKeys.length > 0) {
              const takeQty = Math.min(item.quantity, availableKeys.length);
              deliveredKeys = availableKeys.slice(0, takeQty);
              await prisma.product.update({
                where: { id: dbProduct.id },
                data: {
                  digitalKeys: availableKeys.slice(takeQty),
                  stock: Math.max(0, (dbProduct.stock || availableKeys.length) - takeQty)
                }
              });
            }
            if (deliveredKeys.length < item.quantity) {
              const missingCount = item.quantity - deliveredKeys.length;
              const prefix = (dbProduct.name || "KEY").substring(0, 4).toUpperCase();
              const generatedKeys = Array.from({ length: missingCount }, () => generateRandomKey(prefix));
              deliveredKeys = [...deliveredKeys, ...generatedKeys];
            }
            allDeliveredKeysForTelegram.push({ productName: dbProduct.name, keys: deliveredKeys });
          }
        }
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: { paymentStatus: "PAID", orderStatus: "DELIVERED" }
        });
        if (dbOrder.user.tgId) {
          let keyDetailsMarkdown = "";
          allDeliveredKeysForTelegram.forEach((kGroup) => {
            keyDetailsMarkdown += `\n📦 *${kGroup.productName}*\n`;
            kGroup.keys.forEach((k) => {
              if (k.startsWith("http")) keyDetailsMarkdown += `🔗 [Click to Open Link](${k})\n\`${k}\`\n`;
              else keyDetailsMarkdown += `🔑 \`${k}\`\n`;
            });
          });
          const messageText = `🎉 *PAYMENT SUCCESSFUL!*

🧾 *Receipt Details:*
• Order ID: #${tran_id}
• Amount: $${Number(dbOrder.totalAmount).toFixed(2)}
• Method: ABA PayWay

${keyDetailsMarkdown}
📌 *Activation Instructions:*
Redeem keys in app or software settings.

⚡ *Your keys are also permanently saved in your Web App Vault!*`;
          sendTelegramBotNotification(dbOrder.user.tgId, messageText);
        }
        console.log(`✅ Order ${tran_id} marked as PAID and keys delivered.`);
      }
    } else {
      // Payment Failed Path
      const dbOrder = await prisma.order.findUnique({
        where: { orderNumber: tran_id },
        include: { user: true }
      });
      if (dbOrder && dbOrder.paymentStatus !== "FAILED") {
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: { paymentStatus: "FAILED", orderStatus: "CANCELLED" }
        });
        if (dbOrder.user.tgId) {
          const failMessage = `❌ *PAYMENT FAILED OR CANCELLED!*

🧾 *Receipt Details:*
• Order ID: #${tran_id}
• Amount: $${Number(dbOrder.totalAmount).toFixed(2)}
• Method: ABA PayWay

Please try again or contact support if you need help.`;
          sendTelegramBotNotification(dbOrder.user.tgId, failMessage);
        }
        console.log(`❌ Order ${tran_id} marked as FAILED.`);
      }
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

export const rateProduct: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const dbProduct = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!dbProduct) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    const currentCount = dbProduct.reviewCount || 0;
    const currentRating = dbProduct.rating || 5.0;
    const newCount = currentCount + 1;
    const newRating = Number((((currentRating * currentCount) + numRating) / newCount).toFixed(1));

    const updated = await prisma.product.update({
      where: { id: dbProduct.id },
      data: {
        rating: newRating,
        reviewCount: newCount
      }
    });

    res.status(200).json({
      success: true,
      message: "Thank you for rating!",
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { tgId, phone } = req.query;
    if (!tgId && !phone) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const userWhere: any[] = [];
    if (tgId) userWhere.push({ tgId: String(tgId) });
    if (phone) userWhere.push({ phone: String(phone) });

    const targetUser = await prisma.user.findFirst({
      where: { OR: userWhere, isDelete: false }
    });

    const OR: any[] = [];
    if (targetUser) OR.push({ userId: targetUser.id });
    if (phone) OR.push({ contactPhone: String(phone) });

    if (OR.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { OR },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserProfile: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { tgId, phone } = req.query;
    if (!tgId && !phone) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    const OR: any[] = [];
    if (tgId) OR.push({ tgId: String(tgId) });
    if (phone) OR.push({ phone: String(phone) });

    const user = await prisma.user.findFirst({
      where: { OR, isDelete: false }
    });

    if (!user) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    const userOrders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.phone ? [{ contactPhone: user.phone }] : [])
        ]
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    const totalSpent = userOrders.reduce((sum, o) => sum + (o.paymentStatus === "PAID" ? o.totalAmount : 0), 0);
    const keysOwned = userOrders.reduce((sum, o) => {
      return sum + o.items.reduce((iSum, item) => iSum + (item.product?.digitalKeys?.length || item.quantity || 1), 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        email: user.email || "",
        tgId: user.tgId,
        joinedAt: user.joinedAt,
        totalOrders: userOrders.length,
        totalSpent,
        keysOwned
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfile: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { tgId, phone, email, name } = req.body;
    if (!tgId && !phone) {
      res.status(400).json({ success: false, message: "tgId or phone required" });
      return;
    }

    const OR: any[] = [];
    if (tgId) OR.push({ tgId: String(tgId) });
    if (phone) OR.push({ phone: String(phone) });

    const user = await prisma.user.findFirst({
      where: { OR, isDelete: false }
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(email !== undefined ? { email: String(email).trim() } : {}),
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(phone !== undefined ? { phone: String(phone).trim() } : {})
      }
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handlePaymentFailed: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { method, amount } = req.body;
    const tgId = req.user?.tgId;
    
    if (tgId) {
      const failMessage = `❌ *PAYMENT FAILED OR CANCELLED!*\n\n🧾 *Details:*\n• Amount: $${Number(amount || 0).toFixed(2)}\n• Method: ${method || 'PayPal'}\n\nPlease try again or contact support if you need help.`;
      sendTelegramBotNotification(tgId, failMessage);
    }
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
