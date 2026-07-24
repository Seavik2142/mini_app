import React, { useState, useEffect } from "react";
import { FaSearch, FaStar, FaKey, FaBolt, FaTimes, FaShieldAlt } from "react-icons/fa";
import { Product } from "../type";
import { useCart } from "../context/CartContext";

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Telegram Premium 1-Year Key",
    slug: "telegram-premium-1-year-key",
    description: "Instant redeemable activation key for 1 year of Telegram Premium. Unlock 4GB uploads, faster downloads, badges, and custom emojis.",
    price: 1.00,
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

const Home: React.FC = () => {
  const { addToCart, formatKHR, requireAuth } = useCart();
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/shop/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      })
      .catch(() => {
        // Fallback to default products
      });
  }, []);

  const filteredProducts = products.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/90 via-purple-950/80 to-slate-950 p-5 text-white shadow-xl border border-indigo-500/30">
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold backdrop-blur-md border border-indigo-400/30 shadow-inner">
            <FaBolt className="animate-pulse text-amber-300" /> Instant Digital Delivery ⚡
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Digital Keys & License Store
          </h2>
          <p className="text-xs text-slate-300 max-w-[88%] leading-relaxed font-medium">
            Telegram Premium, Steam Gift Cards, VPN & Software License keys instantly in <span className="font-bold text-emerald-400">USD ($)</span> & <span className="font-bold text-indigo-300">Khmer Riel (៛)</span>!
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-10 top-0 w-24 h-24 bg-violet-500/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search keys, Steam, Telegram Premium, VPN..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-950/30 transition-all duration-300 flex flex-col justify-between"
          >
            <div
              className="relative aspect-square overflow-hidden cursor-pointer bg-slate-950"
              onClick={() => setSelectedProduct(product)}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className="bg-emerald-500/90 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md backdrop-blur-md flex items-center gap-1">
                  <FaKey className="text-[9px]" /> INSTANT
                </span>
                {product.isOnSale && (
                  <span className="bg-rose-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-amber-300 font-bold flex items-center gap-1 border border-slate-800">
                <FaStar className="text-[9px] text-amber-400" /> {product.rating}
              </div>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider block mb-0.5">
                  {product.categoryName}
                </span>
                <h3
                  onClick={() => setSelectedProduct(product)}
                  className="font-bold text-xs line-clamp-1 text-slate-100 cursor-pointer hover:text-indigo-300 transition-colors"
                >
                  {product.name}
                </h3>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-base font-black text-white">${product.price.toFixed(2)}</span>
                  <span className="text-[11px] text-emerald-400 font-extrabold block">
                    {formatKHR(product.price)}
                  </span>
                </div>

                <button
                  onClick={() => requireAuth(() => addToCart(product))}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                >
                  <FaKey className="text-xs" /> Buy Key
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <FaShieldAlt /> {selectedProduct.categoryName}
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80"
              >
                <FaTimes />
              </button>
            </div>

            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-white">{selectedProduct.name}</h2>
                <div className="flex items-center gap-1 text-amber-300 text-xs font-bold bg-slate-800/80 border border-slate-700/80 px-2 py-1 rounded-lg">
                  <FaStar className="text-amber-400" /> {selectedProduct.rating} ({selectedProduct.reviewCount})
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">{selectedProduct.description}</p>

              {selectedProduct.keyFormat && (
                <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30 text-xs space-y-1">
                  <span className="text-[10px] text-indigo-400 uppercase font-semibold">Key Format Preview:</span>
                  <p className="font-mono text-indigo-300 font-bold">{selectedProduct.keyFormat}</p>
                </div>
              )}

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Price in USD</p>
                  <p className="text-lg font-black text-white">${selectedProduct.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium">Price in Riel Khmer</p>
                  <p className="text-base font-black text-emerald-400 font-mono">
                    {formatKHR(selectedProduct.price)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  requireAuth(() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  });
                }}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <FaKey /> Add Key to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;