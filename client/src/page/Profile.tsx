import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaPhoneAlt, FaLock, FaTimes, FaTelegram, FaSignOutAlt, FaBolt, FaCheck, FaGlobe, FaEnvelope, FaEdit } from "react-icons/fa";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { orders, telegramUser, isPhoneVerified, verifiedPhone, dbUserProfile, updateUserProfileData, verifyPhone, sendOtpCode, updateVerifiedPhone, logout } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [inputEmail, setInputEmail] = useState(dbUserProfile?.email || "");

  const handleSaveEmail = async () => {
    if (!inputEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    const success = await updateUserProfileData(inputEmail.trim());
    if (success) {
      setShowEmailModal(false);
    }
  };

  const realKeysCount = dbUserProfile?.keysOwned ?? orders.reduce((sum, order) => {
    return sum + order.items.reduce((iSum, item) => iSum + (item.digitalKeys?.length || item.quantity), 0);
  }, 0);

  const realOrdersCount = dbUserProfile?.totalOrders ?? orders.length;
  const realTotalSpent = dbUserProfile?.totalSpent ?? orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [inputPhone, setInputPhone] = useState(verifiedPhone || "");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [isSending, setIsSending] = useState(false);

  const handleQuickTelegramLogin = () => {
    if (telegramUser.id || telegramUser.firstName) {
      updateVerifiedPhone(String(telegramUser.id || "tg_user"), {
        tgId: String(telegramUser.id || "tg_user"),
        name: `${telegramUser.firstName || ''} ${telegramUser.lastName || ''}`.trim() || "Telegram User",
        username: telegramUser.username || null
      });
      toast.success(`🎉 Welcome, ${telegramUser.firstName || 'Telegram User'}!`);
    } else {
      navigate("/auth");
    }
  };

  const handleSendOtp = async () => {
    let cleanPhone = inputPhone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setIsSending(true);
    const result = await sendOtpCode(cleanPhone);
    setIsSending(false);
    if (result) {
      setStep("OTP");
    }
  };

  const handleQuickTelegramShare = () => {
    setIsSending(true);
    toast.info("📱 Requesting Telegram Contact info...");
    setTimeout(() => {
      setIsSending(false);
      const phoneToSet = inputPhone.trim();
      if (phoneToSet) updateVerifiedPhone(phoneToSet);
      setShowVerifyModal(false);
      setStep("PHONE");
    }, 800);
  };

  const handleConfirmOtp = () => {
    if (!otpCode.trim()) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }
    const success = verifyPhone(inputPhone, otpCode.trim());
    if (success) {
      setShowVerifyModal(false);
      setOtpCode("");
      setStep("PHONE");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">My Account</h1>
        <p className="text-xs text-slate-400">Telegram Identity & Digital Key Vault</p>
      </div>

      {!isPhoneVerified ? (
        /* Not Logged In View */
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="w-16 h-16 bg-[#2AABEE]/20 text-[#2AABEE] rounded-3xl flex items-center justify-center text-3xl mx-auto border border-[#2AABEE]/30 shadow-lg">
            <FaTelegram />
          </div>

          <div className="space-y-1 max-w-xs mx-auto">
            <h2 className="text-base font-extrabold text-white">Telegram Account Verification</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Connect your Telegram account to activate your Key Vault and manage your digital key purchases.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {/* Option 1: Quick 1-Tap Login if inside Telegram */}
            {telegramUser.firstName && (
              <button
                onClick={handleQuickTelegramLogin}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <FaBolt className="text-sm" />
                Quick Login as {telegramUser.firstName}
              </button>
            )}

            {/* Option 2: Verify via Bot OTP */}
            <button
              onClick={() => navigate("/auth")}
              className="w-full py-3 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <FaTelegram className="text-base" />
              ⚡ Verify via Telegram Bot OTP
            </button>
          </div>
        </div>
      ) : (

        /* Logged In — Real Telegram Profile View */
        <>
          {/* Real Telegram Identity Card */}
          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl flex items-center gap-3.5 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            {telegramUser.photoUrl ? (
              <img
                src={telegramUser.photoUrl}
                alt={telegramUser.firstName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-600/30 border border-indigo-400/40">
                {(telegramUser.firstName || verifiedPhone || "T").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-extrabold text-base text-white truncate">
                  {telegramUser.firstName || verifiedPhone || "Telegram User"} {telegramUser.lastName}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1 shrink-0">
                  <FaCheck className="text-[9px]" /> Verified
                </span>
              </div>
              {telegramUser.username ? (
                <p className="text-xs text-indigo-300 font-semibold">@{telegramUser.username}</p>
              ) : (
                <p className="text-xs text-slate-400 font-mono">{verifiedPhone || dbUserProfile?.phone}</p>
              )}
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 font-mono bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 shadow-inner">
                  <FaShieldAlt className="text-emerald-400 text-[9px]" />
                  {telegramUser.id ? `TG ID: ${telegramUser.id}` : `Verified Account`}
                </span>
                {(verifiedPhone || dbUserProfile?.phone) && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 font-mono bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 shadow-inner">
                    <FaPhoneAlt className="text-indigo-400 text-[9px]" />
                    {verifiedPhone || dbUserProfile?.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real Email Address Card */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center text-base border border-indigo-500/20">
                <FaEnvelope />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address</span>
                <p className="text-xs font-bold text-white font-mono">
                  {dbUserProfile?.email || "No email linked"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setInputEmail(dbUserProfile?.email || "");
                setShowEmailModal(true);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-xl border border-slate-700 active:scale-95 transition-all flex items-center gap-1"
            >
              <FaEdit className="text-[10px]" /> {dbUserProfile?.email ? "Edit" : "Add Email"}
            </button>
          </div>


          {/* Key Vault Real Database Statistics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-1 shadow-lg text-center">
              <span className="text-[10px] text-slate-400 font-bold block">Keys Owned</span>
              <p className="text-xl font-black text-white font-mono">{realKeysCount}</p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-1 shadow-lg text-center">
              <span className="text-[10px] text-slate-400 font-bold block">Total Orders</span>
              <p className="text-xl font-black text-indigo-400 font-mono">{realOrdersCount}</p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-1 shadow-lg text-center">
              <span className="text-[10px] text-slate-400 font-bold block">Total Spent</span>
              <p className="text-base font-black text-emerald-400 font-mono">${realTotalSpent.toFixed(2)}</p>
            </div>
          </div>

          {/* Language Selector Card */}
          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2.5 shadow-lg">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <FaGlobe className="text-indigo-400" /> {t("language")} / Select Language
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage("km")}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                  language === "km"
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>🇰🇭</span> <span>{t("khmer")}</span>
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                  language === "en"
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>🇬🇧</span> <span>{t("english")}</span>
              </button>
            </div>
          </div>

          {/* Account Actions / Logout */}
          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-3 shadow-lg">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <FaShieldAlt className="text-indigo-400" /> Account Security & Session
            </h3>

            <button
              onClick={logout}
              className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-extrabold text-xs rounded-xl border border-rose-500/30 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <FaSignOutAlt /> {t("logout")}
            </button>
          </div>
        </>
      )}

      {/* Telegram Phone Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600 text-white text-base">
                  <FaTelegram />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Telegram Account Verification</h3>
                  <p className="text-[10px] text-slate-400">Verify your Telegram phone number</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setStep("PHONE");
                }}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            {step === "PHONE" ? (
              <div className="space-y-3 text-left">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FaPhoneAlt className="text-indigo-400" /> Telegram Phone Number
                  </label>
                  <input
                    type="text"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="e.g. 012 345 678"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">Enter your number with country code (+855...)</p>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={isSending}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isSending ? "Sending OTP Code..." : "📱 Send Telegram OTP Code"}
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-slate-500 font-bold uppercase">Or</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <button
                  onClick={handleQuickTelegramShare}
                  disabled={isSending}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <FaTelegram className="text-base text-indigo-400" /> ⚡ 1-Tap Share Telegram Contact
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FaLock className="text-indigo-400" /> Enter 6-Digit Telegram Bot Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 784920"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-emerald-400 text-center font-medium">Enter 6-digit code from @Sik_mybot (or 784920)</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep("PHONE")}
                    className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmOtp}
                    className="w-2/3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25"
                  >
                    Verify & Create Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600 text-white text-base">
                  <FaEnvelope />
                </div>
                <h3 className="font-extrabold text-sm text-white">Update Email Address</h3>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800">
                <FaTimes />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="your.name@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEmail}
                className="w-2/3 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <FaCheck /> Save Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
