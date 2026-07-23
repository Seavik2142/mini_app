import React, { useState } from "react";
import { FaWallet, FaShareAlt, FaCopy, FaCheck, FaShieldAlt, FaMoneyBillWave, FaGift, FaTag } from "react-icons/fa";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";

const Profile: React.FC = () => {
  const { walletBalance, formatKHR, redeemPromoCode, telegramUser } = useCart();
  const [copied, setCopied] = useState(false);
  const [promoInput, setPromoInput] = useState("");

  const { id: tgId, firstName, lastName, username, photoUrl } = telegramUser;

  const referralLink = `https://t.me/Sik_mybot/shop?startapp=ref_${tgId}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (redeemPromoCode(promoInput)) {
      setPromoInput("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">My Profile</h1>
        <p className="text-xs text-slate-400">Telegram Account & Wallet Balances</p>
      </div>

      {/* Real Telegram User Card */}
      <div className="p-4 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl flex items-center gap-3.5 shadow-lg">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={firstName}
            className="w-14 h-14 rounded-2xl object-cover border border-amber-400/40 shadow-md shadow-amber-500/20"
          />
        ) : (
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-slate-950 text-xl font-black shadow-md shadow-amber-500/30 border border-white/20">
            {firstName?.charAt(0) || "T"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-sm text-white truncate">
            {firstName} {lastName}
          </h2>
          <p className="text-xs text-amber-400 font-medium">@{username}</p>
          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
            <FaShieldAlt className="text-amber-400 text-[9px]" /> Telegram ID: {tgId}
          </div>
        </div>
      </div>

      {/* Real Wallet Money Balances ($ USD & Riel Khmer) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>USD Balance</span>
            <FaWallet />
          </div>
          <p className="text-2xl font-black text-white font-mono">${walletBalance.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">Available USD Money</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span>Riel Khmer</span>
            <FaMoneyBillWave />
          </div>
          <p className="text-xl font-black text-emerald-400 font-mono">{formatKHR(walletBalance)}</p>
          <p className="text-[10px] text-slate-400">Rate: $1 = 4,000 ៛</p>
        </div>
      </div>

      {/* Redeem Promo Code Card */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <FaGift className="text-amber-400 text-sm" /> Redeem Promo Code
          </h3>
          <span className="text-[10px] text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            Instant Wallet Bonus
          </span>
        </div>

        <form onSubmit={handleRedeem} className="flex gap-2">
          <div className="relative flex-1">
            <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Enter Promo Code (e.g. WELCOME50)"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            Redeem
          </button>
        </form>

        {/* Quick Promo Chips */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] text-slate-400 font-medium">Try active promo codes:</p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setPromoInput("WELCOME50")}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold rounded-lg whitespace-nowrap"
            >
              WELCOME50 (+$50.00)
            </button>
            <button
              type="button"
              onClick={() => setPromoInput("TELEGRAM10")}
              className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] font-mono font-bold rounded-lg whitespace-nowrap"
            >
              TELEGRAM10 (+$15.00 & 15% OFF)
            </button>
            <button
              type="button"
              onClick={() => setPromoInput("PROMO100")}
              className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold rounded-lg whitespace-nowrap"
            >
              PROMO100 (+$100.00 VIP)
            </button>
          </div>
        </div>
      </div>

      {/* Real Telegram Referral Link */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <FaShareAlt className="text-amber-400" /> Invite Friends & Earn 10% Cash
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Share your referral link to earn 10% instant commission in USD ($) or Riel Khmer (៛) on every digital key your friends purchase!
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono truncate"
          />
          <button
            onClick={copyReferral}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-amber-500/20"
          >
            {copied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
