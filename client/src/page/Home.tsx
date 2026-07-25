import React, { useState, useEffect } from "react";
import { FaSearch, FaStar, FaKey, FaTimes, FaShieldAlt } from "react-icons/fa";
import { Product } from "../type";
import { useCart } from "../context/CartContext";

import chatGptImg from "../assets/ChatGPT.jpg";
import geminiImg from "../assets/gemini.jpeg";
import claudeImg from "../assets/claude.jpg";

const BANNER_SLIDES = [
  { id: 1, image: chatGptImg },
  { id: 2, image: geminiImg },
  { id: 3, image: claudeImg }
];


const Home: React.FC = () => {
  const { products, bannerSlides, addToCart, formatKHR, requireAuth } = useCart();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reset modal quantity whenever product changes
  useEffect(() => {
    setModalQuantity(1);
  }, [selectedProduct]);

  const activeSlides = bannerSlides && bannerSlides.length > 0 ? bannerSlides : BANNER_SLIDES;

  // Smooth Auto Scroll Animation every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const activeSlide = activeSlides[currentSlide] || activeSlides[0];

  const filteredProducts = products.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      {/* Original Size Hero Banner Carousel (Zero Text Overlays in Front) */}
      <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl border border-indigo-500/30 bg-slate-950 aspect-[21/9] sm:aspect-[24/9] min-h-[170px]">
        {/* Full Image Slide in Original Hero Size */}
        <img
          src={activeSlide.image}
          alt={`Hero Banner ${currentSlide + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
        />

        {/* Minimal Floating Indicator Dots at Bottom Edge */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-950/75 backdrop-blur-md rounded-full border border-white/15 shadow-xl pointer-events-auto">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? "w-5 bg-indigo-400 shadow-sm shadow-indigo-500/50"
                    : "w-1.5 bg-slate-500 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>
        )}
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
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 pb-24 sm:pb-5 space-y-4 max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl relative">
            <div className="flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 py-1 -mt-1">
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <FaShieldAlt /> {selectedProduct.categoryName}
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 active:scale-95 transition-all"
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

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                  <FaShieldAlt /> {selectedProduct.warranty || "30 Days Replacement Warranty"}
                </span>
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
                  <p className="text-[10px] text-slate-400 font-medium">Price per Key</p>
                  <p className="text-lg font-black text-white">${selectedProduct.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium">Price in Riel Khmer</p>
                  <p className="text-base font-black text-emerald-400 font-mono">
                    {formatKHR(selectedProduct.price)}
                  </p>
                </div>
              </div>

              {/* Interactive Quantity Controller (- Qty +) */}
              <div className="p-3 bg-slate-950/90 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-300 block">Select Quantity:</span>
                  <span className="text-xs text-indigo-400 font-extrabold">
                    Total: ${(selectedProduct.price * modalQuantity).toFixed(2)} USD ({formatKHR(selectedProduct.price * modalQuantity)})
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-2 py-1 rounded-xl">
                  <button
                    onClick={() => setModalQuantity(prev => Math.max(1, prev - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm active:scale-95 transition-all"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-white text-sm font-mono">
                    {modalQuantity}
                  </span>
                  <button
                    onClick={() => setModalQuantity(prev => Math.min(100, prev + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm active:scale-95 transition-all shadow"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md pt-2 pb-1 -mb-1 z-10 border-t border-slate-800/80">
              <button
                onClick={() => {
                  requireAuth(() => {
                    addToCart(selectedProduct, modalQuantity);
                    setSelectedProduct(null);
                  });
                }}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all"
              >
                <FaKey /> Add {modalQuantity > 1 ? `${modalQuantity} Keys` : "Key"} to Cart (${(selectedProduct.price * modalQuantity).toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;