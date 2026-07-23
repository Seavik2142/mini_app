import React, { useState } from "react";
import { FaUser, FaWallet, FaShareAlt, FaCopy, FaCheck, FaShieldAlt, FaMoneyBillWave } from "react-icons/fa";
import { initData } from "@telegram-apps/sdk";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";

const Profile: React.FC = () => {
  const { walletBalance, formatKHR } = useCart();
  const [copied, setCopied] = useState(false);

  // Extract Telegram User if inside Telegram environment
  const user = initData.user?.();
  const username = user?.username || "TelegramUser";
  const firstName = user?.firstName || "Alex";
  const lastName = user?.lastName || "";
  const tgId = user?.id || 778192031;

  const referralLink = `https://t.me/SiamDevBot/mini_app?startapp=ref_${tgId}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">My Profile</h1>
        <p className="text-xs text-slate-400">Telegram Account & Wallet Balances</p>
      </div>

      {/* User Card */}
      <div className="p-4 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl flex items-center gap-3.5 shadow-lg">
        <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-slate-950 text-xl font-black shadow-md shadow-amber-500/30 border border-white/20">
          {firstName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-sm text-white truncate">
            {firstName} {lastName}
          </h2>
          <p className="text-xs text-amber-400 font-medium">@{username}</p>
          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
            <FaShieldAlt className="text-amber-400 text-[9px]" /> ID: {tgId}
          </div>
        </div>
      </div>

      {/* Wallet Money Balances ($ USD & Riel Khmer) */}
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

      {/* Referral Link */}
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
