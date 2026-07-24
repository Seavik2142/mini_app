import React, { useState } from "react";
import {
  FaChartLine,
  FaBoxOpen,
  FaImage,
  FaUsers,
  FaTicketAlt,
  FaCreditCard,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaExchangeAlt,
  FaUserShield,
  FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const KHR_RATE = 4000;

interface ProductItem {
  id: number;
  name: string;
  price: number;
  description: string;
  categoryName: string;
  stock: number;
  images: string[];
  isOnSale?: boolean;
  discount?: number;
  isFeatured?: boolean;
}

interface BannerSlide {
  id: number;
  badge: string;
  title: string;
  desc: string;
  tag: string;
  image: string;
  gradient: string;
}

interface AdminUser {
  id: number;
  name: string;
  username?: string;
  tgId: string;
  phone?: string;
  role: "ADMIN" | "USER";
  joinedAt: string;
  isBlock: boolean;
}

interface PromoCode {
  id: number;
  code: string;
  discountPercent: number;
  isActive: boolean;
}

interface OrderRecord {
  id: number;
  orderNumber: string;
  userName: string;
  tgId: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  createdAt: string;
}

const DEFAULT_BANNERS: BannerSlide[] = [
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
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80",
    gradient: "from-blue-950 via-indigo-900/80 to-slate-950"
  },
  {
    id: 3,
    badge: "Anthropic Claude 3.5 Sonnet 🧠",
    title: "Claude Pro Access Vouchers",
    desc: "Top-tier AI coding & reasoning intelligence. Instant key redemption in USD ($) & Khmer Riel (៛)!",
    tag: "💳 KHQR & ABA Supported",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
    gradient: "from-amber-950 via-orange-950/80 to-slate-950"
  }
];

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: "Telegram Premium 1-Year Key",
    price: 1.00,
    description: "Instant redeemable activation key for 1 year of Telegram Premium.",
    categoryName: "Telegram & Bot Keys",
    stock: 120,
    images: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"],
    isOnSale: true,
    discount: 15,
    isFeatured: true
  },
  {
    id: 2,
    name: "Steam $50 Digital Gift Card Key",
    price: 1.00,
    description: "Global Steam Wallet activation code. Instantly adds $50 USD to balance.",
    categoryName: "Gaming & Gift Cards",
    stock: 85,
    images: ["https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"],
    isOnSale: false,
    discount: 0,
    isFeatured: true
  }
];

const INITIAL_USERS: AdminUser[] = [
  { id: 1, name: "Seavik Mao", username: "BoomBaya_ik", tgId: "5326192741", phone: "088499478", role: "ADMIN", joinedAt: "2026-07-20", isBlock: false },
  { id: 2, name: "Alex Johnson", username: "alex_j", tgId: "982736154", phone: "096123456", role: "USER", joinedAt: "2026-07-22", isBlock: false }
];

const INITIAL_PROMOS: PromoCode[] = [
  { id: 1, code: "SIK10", discountPercent: 10, isActive: true },
  { id: 2, code: "WELCOME20", discountPercent: 20, isActive: true }
];

const INITIAL_ORDERS: OrderRecord[] = [
  { id: 101, orderNumber: "ORD-99812", userName: "Seavik Mao", tgId: "5326192741", totalAmount: 1.00, currency: "USD", paymentMethod: "KHQR Bakong", paymentStatus: "PAID", createdAt: "2026-07-24 14:22" },
  { id: 102, orderNumber: "ORD-99813", userName: "Alex Johnson", tgId: "982736154", totalAmount: 2.00, currency: "USD", paymentMethod: "TON Connect", paymentStatus: "PAID", createdAt: "2026-07-24 16:45" }
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "PRODUCTS" | "BANNERS" | "USERS" | "PROMOS" | "PAYMENTS">("OVERVIEW");

  // State Stores
  const [productsList, setProductsList] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [bannerList, setBannerList] = useState<BannerSlide[]>(DEFAULT_BANNERS);
  const [usersList, setUsersList] = useState<AdminUser[]>(INITIAL_USERS);
  const [promosList, setPromosList] = useState<PromoCode[]>(INITIAL_PROMOS);
  const [ordersList] = useState<OrderRecord[]>(INITIAL_ORDERS);

  // Modals & Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodPriceUsd, setProdPriceUsd] = useState<number>(1.00);
  const [prodDesc, setProdDesc] = useState("");
  const [prodCategory, setProdCategory] = useState("Telegram & Bot Keys");
  const [prodStock, setProdStock] = useState(100);
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodDiscount, setProdDiscount] = useState(0);
  const [prodIsSale, setProdIsSale] = useState(false);

  // Banner edit modal state
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [bannerBadge, setBannerBadge] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDesc, setBannerDesc] = useState("");
  const [bannerTag, setBannerTag] = useState("");
  const [bannerImage, setBannerImage] = useState("");

  // Promo Code Modal
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState(10);

  // Open Product Modal
  const handleOpenProductModal = (prod?: ProductItem) => {
    if (prod) {
      setEditingProductId(prod.id);
      setProdName(prod.name);
      setProdPriceUsd(prod.price);
      setProdDesc(prod.description);
      setProdCategory(prod.categoryName);
      setProdStock(prod.stock);
      setProdImageUrl(prod.images[0] || "");
      setProdDiscount(prod.discount || 0);
      setProdIsSale(!!prod.isOnSale);
    } else {
      setEditingProductId(null);
      setProdName("");
      setProdPriceUsd(1.00);
      setProdDesc("");
      setProdCategory("Telegram & Bot Keys");
      setProdStock(100);
      setProdImageUrl("");
      setProdDiscount(0);
      setProdIsSale(false);
    }
    setShowProductModal(true);
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (editingProductId) {
      setProductsList(prev =>
        prev.map(p =>
          p.id === editingProductId
            ? {
                ...p,
                name: prodName,
                price: prodPriceUsd,
                description: prodDesc,
                categoryName: prodCategory,
                stock: prodStock,
                images: [prodImageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"],
                discount: prodDiscount,
                isOnSale: prodIsSale
              }
            : p
        )
      );
      toast.success("✅ Product updated successfully!");
    } else {
      const newProd: ProductItem = {
        id: Date.now(),
        name: prodName,
        price: prodPriceUsd,
        description: prodDesc,
        categoryName: prodCategory,
        stock: prodStock,
        images: [prodImageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"],
        discount: prodDiscount,
        isOnSale: prodIsSale,
        isFeatured: true
      };
      setProductsList(prev => [newProd, ...prev]);
      toast.success("🎉 New product added!");
    }
    setShowProductModal(false);
  };

  // Delete Product
  const handleDeleteProduct = (id: number) => {
    setProductsList(prev => prev.filter(p => p.id !== id));
    toast.success("Product removed");
  };

  // Save Banner Edit
  const handleSaveBanner = (id: number) => {
    setBannerList(prev =>
      prev.map(b =>
        b.id === id
          ? {
              ...b,
              badge: bannerBadge || b.badge,
              title: bannerTitle || b.title,
              desc: bannerDesc || b.desc,
              tag: bannerTag || b.tag,
              image: bannerImage || b.image
            }
          : b
      )
    );
    setEditingBannerId(null);
    toast.success("✅ Banner slide updated!");
  };

  // Toggle Admin Role
  const handleToggleAdminRole = (userId: number) => {
    setUsersList(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, role: u.role === "ADMIN" ? "USER" : "ADMIN" }
          : u
      )
    );
    toast.success("User role updated");
  };

  // Add Promo Code
  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    const newP: PromoCode = {
      id: Date.now(),
      code: newPromoCode.trim().toUpperCase(),
      discountPercent: newPromoDiscount,
      isActive: true
    };
    setPromosList(prev => [newP, ...prev]);
    setNewPromoCode("");
    toast.success(`Promo code ${newP.code} added!`);
  };

  const totalRevenueUsd = ordersList.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRevenueKhr = Math.round(totalRevenueUsd * KHR_RATE);

  return (
    <div data-theme="dark" className="min-h-screen bg-[#0b0f17] text-slate-100 p-4 md:p-8 font-sans pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/app")}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
              <FaShieldAlt /> Admin Management Panel
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Mini App Control Center</h1>
          </div>
        </div>

        <button
          onClick={() => handleOpenProductModal()}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <FaPlus /> Add New Product
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/80 no-scrollbar">
        {[
          { id: "OVERVIEW", label: "📊 Overview", icon: FaChartLine },
          { id: "PRODUCTS", label: "🛍️ Products", icon: FaBoxOpen },
          { id: "BANNERS", label: "🖼️ Banners", icon: FaImage },
          { id: "USERS", label: "👥 Users & Roles", icon: FaUsers },
          { id: "PROMOS", label: "🎟️ Promo Codes", icon: FaTicketAlt },
          { id: "PAYMENTS", label: "💳 Orders & Payments", icon: FaCreditCard }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────
          TAB 1: OVERVIEW & ANALYTICS
      ────────────────────────────────────────────────── */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6 pt-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2 relative overflow-hidden">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">Total Revenue</span>
              <div className="text-2xl font-black text-emerald-400">${totalRevenueUsd.toFixed(2)}</div>
              <div className="text-xs text-indigo-300 font-bold flex items-center gap-1">
                <FaExchangeAlt /> {totalRevenueKhr.toLocaleString()} ៛
              </div>
            </div>

            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">Total Orders</span>
              <div className="text-2xl font-black text-white">{ordersList.length}</div>
              <div className="text-xs text-slate-400 font-medium">Completed Payments</div>
            </div>

            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">Active Products</span>
              <div className="text-2xl font-black text-amber-300">{productsList.length}</div>
              <div className="text-xs text-slate-400 font-medium">Digital Keys in Stock</div>
            </div>

            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">Registered Users</span>
              <div className="text-2xl font-black text-purple-400">{usersList.length}</div>
              <div className="text-xs text-slate-400 font-medium">Telegram Accounts</div>
            </div>
          </div>

          {/* Quick Recent Activity */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FaCreditCard className="text-indigo-400" /> Recent Payment Transactions
            </h3>
            <div className="space-y-2">
              {ordersList.map((ord) => (
                <div key={ord.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-extrabold text-white">{ord.orderNumber} — {ord.userName}</div>
                    <div className="text-[10px] text-slate-400">{ord.paymentMethod} • {ord.createdAt}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400">${ord.totalAmount.toFixed(2)}</div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {ord.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          TAB 2: PRODUCTS MANAGEMENT
      ────────────────────────────────────────────────── */}
      {activeTab === "PRODUCTS" && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">Product Catalog Management</h2>
            <button
              onClick={() => handleOpenProductModal()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <FaPlus /> Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productsList.map((prod) => (
              <div key={prod.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex gap-4 items-center justify-between">
                <img src={prod.images[0]} alt={prod.name} className="w-16 h-16 object-cover rounded-xl border border-slate-700/80" />
                <div className="flex-1 space-y-1">
                  <div className="font-extrabold text-white text-sm">{prod.name}</div>
                  <div className="text-xs font-black text-emerald-400">
                    ${prod.price.toFixed(2)} <span className="text-[10px] text-slate-400 font-medium">({(prod.price * KHR_RATE).toLocaleString()} ៛)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Stock: <span className="font-bold text-amber-300">{prod.stock}</span> • {prod.categoryName}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenProductModal(prod)}
                    className="p-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          TAB 3: BANNERS MANAGEMENT
      ────────────────────────────────────────────────── */}
      {activeTab === "BANNERS" && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-extrabold text-white">Hero Banner Carousel Controls</h2>
          <div className="space-y-4">
            {bannerList.map((banner) => (
              <div key={banner.id} className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">Slide #{banner.id}</span>
                  {editingBannerId === banner.id ? (
                    <button
                      onClick={() => handleSaveBanner(banner.id)}
                      className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1"
                    >
                      <FaCheck /> Save Slide
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingBannerId(banner.id);
                        setBannerBadge(banner.badge);
                        setBannerTitle(banner.title);
                        setBannerDesc(banner.desc);
                        setBannerTag(banner.tag);
                        setBannerImage(banner.image);
                      }}
                      className="px-3 py-1 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1"
                    >
                      <FaEdit /> Edit Text & Image
                    </button>
                  )}
                </div>

                {editingBannerId === banner.id ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Badge Text</label>
                      <input
                        type="text"
                        value={bannerBadge}
                        onChange={e => setBannerBadge(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Title</label>
                      <input
                        type="text"
                        value={bannerTitle}
                        onChange={e => setBannerTitle(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                      <textarea
                        value={bannerDesc}
                        onChange={e => setBannerDesc(e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Image URL</label>
                      <input
                        type="text"
                        value={bannerImage}
                        onChange={e => setBannerImage(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center">
                    <img src={banner.image} alt={banner.title} className="w-24 h-16 object-cover rounded-xl border border-slate-700" />
                    <div className="space-y-1">
                      <div className="text-xs font-black text-indigo-300">{banner.badge}</div>
                      <div className="text-sm font-extrabold text-white">{banner.title}</div>
                      <div className="text-xs text-slate-400">{banner.desc}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          TAB 4: USERS & ROLES
      ────────────────────────────────────────────────── */}
      {activeTab === "USERS" && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-extrabold text-white">Registered Users & Admin Roles</h2>
          <div className="space-y-3">
            {usersList.map((usr) => (
              <div key={usr.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="font-extrabold text-white flex items-center gap-2">
                    {usr.name} {usr.username && <span className="text-indigo-400 font-normal">@{usr.username}</span>}
                  </div>
                  <div className="text-[10px] text-slate-400">TG ID: {usr.tgId} • Joined: {usr.joinedAt}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${usr.role === "ADMIN" ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" : "bg-slate-800 text-slate-400"}`}>
                    {usr.role}
                  </span>
                  <button
                    onClick={() => handleToggleAdminRole(usr.id)}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <FaUserShield /> Toggle Role
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          TAB 5: PROMO CODES
      ────────────────────────────────────────────────── */}
      {activeTab === "PROMOS" && (
        <div className="space-y-6 pt-6">
          <form onSubmit={handleAddPromo} className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-extrabold text-white">Create New Discount Promo Code</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Promo Code</label>
                <input
                  type="text"
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value)}
                  placeholder="e.g. SIK10"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Discount (%)</label>
                <input
                  type="number"
                  value={newPromoDiscount}
                  onChange={e => setNewPromoDiscount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
                />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md">
              + Add Promo Code
            </button>
          </form>

          <div className="space-y-2">
            {promosList.map((pr) => (
              <div key={pr.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="font-mono font-extrabold text-amber-300 text-sm tracking-wider">{pr.code}</div>
                <div className="text-emerald-400 font-black">{pr.discountPercent}% OFF</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          TAB 6: PAYMENTS & ORDERS HISTORY
      ────────────────────────────────────────────────── */}
      {activeTab === "PAYMENTS" && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-extrabold text-white">Payment Transactions & Order History</h2>
          <div className="space-y-3">
            {ordersList.map((ord) => (
              <div key={ord.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-white">{ord.orderNumber} — {ord.userName}</div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30">
                    {ord.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <div>TG ID: {ord.tgId} • Method: <span className="text-indigo-300 font-bold">{ord.paymentMethod}</span></div>
                  <div className="text-emerald-400 font-black text-sm">${ord.totalAmount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          PRODUCT MODAL (ADD / EDIT)
      ────────────────────────────────────────────────── */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <FaTimes />
            </button>
            <h3 className="text-base font-extrabold text-white">
              {editingProductId ? "Edit Product" : "Add New Digital Key Product"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Product Name</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="e.g. Telegram Premium 1-Year Key"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>

              {/* Price USD & Auto Khmer Riel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Price in USD ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPriceUsd}
                    onChange={e => setProdPriceUsd(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-indigo-400 uppercase">Auto Khmer Riel (៛)</label>
                  <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-indigo-300 font-extrabold">
                    {(prodPriceUsd * KHR_RATE).toLocaleString()} ៛
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  >
                    <option value="Telegram & Bot Keys">Telegram & Bot Keys</option>
                    <option value="Gaming & Gift Cards">Gaming & Gift Cards</option>
                    <option value="Software & VPN Licenses">Software & VPN Licenses</option>
                    <option value="Crypto & AI Subscriptions">Crypto & AI Subscriptions</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Image URL</label>
                <input
                  type="text"
                  value={prodImageUrl}
                  onChange={e => setProdImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsSale}
                    onChange={e => setProdIsSale(e.target.checked)}
                    className="checkbox checkbox-xs checkbox-primary"
                  />
                  <span>On Sale</span>
                </label>
                {prodIsSale && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold">Discount %:</span>
                    <input
                      type="number"
                      value={prodDiscount}
                      onChange={e => setProdDiscount(Number(e.target.value))}
                      className="w-16 p-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all mt-2"
              >
                {editingProductId ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
