import React, { useState } from "react";
import { FaShareAlt, FaCopy, FaCheck, FaShieldAlt, FaKey, FaQrcode } from "react-icons/fa";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";

const Profile: React.FC = () => {
  const { orders, telegramUser } = useCart();
  const [copied, setCopied] = useState(false);

  const { id: tgId, firstName, lastName, username, photoUrl } = telegramUser;

  const referralLink = `https://t.me/Sik_mybot/shop?startapp=ref_${tgId}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const totalKeysOwned = orders.reduce((sum, order) => {
    return sum + order.items.reduce((iSum, item) => iSum + (item.digitalKeys?.length || item.quantity), 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">My Account</h1>
        <p className="text-xs text-slate-400">Telegram Identity & Digital Key Vault</p>
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

      {/* Key Vault Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>Keys Owned</span>
            <FaKey />
          </div>
          <p className="text-2xl font-black text-white font-mono">{totalKeysOwned}</p>
          <p className="text-[10px] text-slate-400">Total Digital Keys</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-xs text-rose-400 font-bold">
            <span>Payment Method</span>
            <FaQrcode />
          </div>
          <p className="text-sm font-extrabold text-white mt-1">ABA & Bakong KHQR</p>
          <p className="text-[10px] text-slate-400">Direct KHQR Pay</p>
        </div>
      </div>

      {/* Real Telegram Referral Link */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <FaShareAlt className="text-amber-400" /> Invite Friends & Earn Rewards
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Share your referral link with friends to gift them 15% discount on digital key purchases!
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
