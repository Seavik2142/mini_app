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
    price: 34.99,
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
  const { addToCart, formatKHR } = useCart();
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-indigo-600 to-sky-600 p-5 text-white shadow-xl border border-white/10">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 text-amber-300 text-xs font-bold backdrop-blur-md border border-amber-400/20">
            <FaBolt className="animate-pulse" /> Instant Key Delivery ⚡
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Digital Keys & License Store
          </h2>
          <p className="text-xs text-amber-100 max-w-[85%] leading-relaxed">
            Telegram Premium, Steam Gift Cards, VPN & Software License keys in <span className="font-bold text-amber-300">USD ($)</span> & <span className="font-bold text-emerald-300">Khmer Riel (៛)</span>!
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search keys, Steam, Telegram Premium, VPN..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
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
            className="group bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-lg"
          >
            <div
              className="relative aspect-square overflow-hidden cursor-pointer bg-slate-950"
              onClick={() => setSelectedProduct(product)}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                  <FaKey className="text-[9px]" /> INSTANT
                </span>
                {product.isOnSale && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-amber-400 font-bold flex items-center gap-1 border border-white/10">
                <FaStar className="text-[9px]" /> {product.rating}
              </div>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-semibold uppercase text-amber-400 tracking-wider">
                  {product.categoryName}
                </span>
                <h3
                  onClick={() => setSelectedProduct(product)}
                  className="font-bold text-xs line-clamp-1 text-slate-100 cursor-pointer hover:text-amber-300 transition-colors"
                >
                  {product.name}
                </h3>
              </div>

              <div className="space-y-1.5">
                <div>
                  <span className="text-sm font-black text-white">${product.price.toFixed(2)}</span>
                  <span className="text-[11px] text-emerald-400 font-extrabold block">
                    {formatKHR(product.price)}
                  </span>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-[0.98] text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <FaShieldAlt /> {selectedProduct.categoryName}
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-white">{selectedProduct.name}</h2>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-1 rounded-lg">
                  <FaStar /> {selectedProduct.rating} ({selectedProduct.reviewCount})
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{selectedProduct.description}</p>

              {selectedProduct.keyFormat && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Key Format Preview:</span>
                  <p className="font-mono text-amber-400 font-bold">{selectedProduct.keyFormat}</p>
                </div>
              )}

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
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
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
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