import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaPhoneAlt, FaLock, FaTimes, FaTelegram, FaSignOutAlt, FaCheck, FaGlobe } from "react-icons/fa";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { type Language, useLanguage } from "../context/LanguageContext";

const PROFILE_LANGUAGE_OPTIONS: Array<{
  value: Language;
  flag: string;
  shortCode: string;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    value: "km",
    flag: "🇰🇭",
    shortCode: "KM",
    labelKey: "khmer",
    descriptionKey: "khmerDescription"
  },
  {
    value: "en",
    flag: "🇬🇧",
    shortCode: "EN",
    labelKey: "english",
    descriptionKey: "englishDescription"
  }
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { orders, telegramUser, isPhoneVerified, verifiedPhone, dbUserProfile, verifyPhone, sendOtpCode, logout } = useCart();
  const { language, setLanguage, t } = useLanguage();

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


  const activeLanguage = PROFILE_LANGUAGE_OPTIONS.find((option) => option.value === language) ?? PROFILE_LANGUAGE_OPTIONS[0];

  const handleLanguageChange = (nextLanguage: Language) => {
    if (nextLanguage === language) return;

    setLanguage(nextLanguage);
    toast.success(nextLanguage === "km" ? t("languageUpdatedKm") : t("languageUpdatedEn"));
  };


  const handleSendOtp = async () => {
    const cleanPhone = inputPhone.trim().replace(/\s+/g, '');
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

  const languagePreferenceCard = (
    <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 flex items-center justify-center shrink-0">
            <FaGlobe className="text-lg" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-white">{t("languageSettings")}</h3>
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium mt-0.5">
              {t("languageSettingsDescription")}
            </p>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-300">
          <span>{activeLanguage.flag}</span>
          {activeLanguage.shortCode}
        </span>
      </div>

      <div className="grid gap-2">
        {PROFILE_LANGUAGE_OPTIONS.map((option) => {
          const isActive = language === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleLanguageChange(option.value)}
              aria-pressed={isActive}
              className={`w-full min-h-[72px] rounded-2xl border px-3 py-3 text-left transition-all active:scale-[0.99] ${
                isActive
                  ? "bg-gradient-to-r from-fuchsia-600/25 to-orange-500/15 border-fuchsia-400/60 shadow-md shadow-fuchsia-950/40"
                  : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl border shrink-0 ${
                    isActive
                      ? "bg-white/10 border-white/15"
                      : "bg-slate-900 border-slate-800"
                  }`}>
                    {option.flag}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white truncate">{t(option.labelKey)}</span>
                      <span className="rounded-md bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-black text-slate-300">
                        {option.shortCode}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-slate-400 font-medium">
                      {t(option.descriptionKey)}
                    </span>
                  </span>
                </div>
                <span className={`h-7 min-w-[86px] rounded-xl border px-2.5 text-[10px] font-black flex items-center justify-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}>
                  {isActive ? (
                    <>
                      <FaCheck className="text-[9px]" />
                      {t("selectedLanguage")}
                    </>
                  ) : (
                    t("selectLanguage")
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] leading-relaxed text-slate-500 font-semibold border-t border-slate-800/80 pt-3">
        {t("languageSavedHint")}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">My Account</h1>
        <p className="text-xs text-slate-400">Telegram Identity & Digital Keys</p>
      </div>

      {!isPhoneVerified ? (
        /* Not Logged In View */
        <>
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl relative overflow-hidden">
            <div className="w-16 h-16 bg-[#2AABEE]/20 text-[#2AABEE] rounded-3xl flex items-center justify-center text-3xl mx-auto border border-[#2AABEE]/30 shadow-lg">
              <FaTelegram />
            </div>

            <div className="space-y-1 max-w-xs mx-auto">
              <h2 className="text-base font-extrabold text-white">Telegram Account Verification</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Connect your Telegram account to activate your Digital Keys and manage your digital key purchases.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {/* Verify via Bot OTP */}
              <button
                onClick={() => navigate("/auth")}
                className="w-full py-3 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <FaTelegram className="text-base" />
                ⚡ Verify via Telegram Bot OTP
              </button>
            </div>
          </div>
          {languagePreferenceCard}
        </>
      ) : (

        /* Logged In — Real Telegram Profile View */
        <>
          {/* Real Telegram Identity Card */}
          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl flex items-center gap-3.5 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />
            {telegramUser.photoUrl ? (
              <img
                src={telegramUser.photoUrl}
                alt={telegramUser.firstName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-fuchsia-500/50 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-tr from-fuchsia-600 to-orange-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-fuchsia-600/30 border border-fuchsia-400/40">
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
                <p className="text-xs text-fuchsia-300 font-semibold">@{telegramUser.username}</p>
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
                    <FaPhoneAlt className="text-fuchsia-400 text-[9px]" />
                    {verifiedPhone || dbUserProfile?.phone}
                  </span>
                )}
              </div>
            </div>
          </div>


          {/* Digital Keys Real Database Statistics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-1 shadow-lg text-center">
              <span className="text-[10px] text-slate-400 font-bold block">Keys Owned</span>
              <p className="text-xl font-black text-white font-mono">{realKeysCount}</p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-1 shadow-lg text-center">
              <span className="text-[10px] text-slate-400 font-bold block">Total Orders</span>
              <p className="text-xl font-black text-fuchsia-400 font-mono">{realOrdersCount}</p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-1 shadow-lg text-center">
              <span className="text-[10px] text-slate-400 font-bold block">Total Spent</span>
              <p className="text-base font-black text-emerald-400 font-mono">${realTotalSpent.toFixed(2)}</p>
            </div>
          </div>

          {languagePreferenceCard}

          {/* Community & Support */}
          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-3 shadow-lg">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <FaTelegram className="text-fuchsia-400" /> Community & Support
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.open('https://t.me/your_channel', '_blank')}
                  className="w-full py-2.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 font-extrabold text-xs rounded-xl border border-fuchsia-500/30 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <FaTelegram className="text-sm" /> Channel
                </button>
                <button
                  onClick={() => window.open('https://t.me/your_admin', '_blank')}
                  className="w-full py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 font-extrabold text-xs rounded-xl border border-orange-500/30 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <FaPhoneAlt className="text-sm" /> Admin
                </button>
            </div>
          </div>

          {/* Account Actions / Logout */}
          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-3 shadow-lg">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <FaShieldAlt className="text-fuchsia-400" /> Account Security & Session
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
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-fuchsia-600 text-white text-base">
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
                    <FaPhoneAlt className="text-fuchsia-400" /> Telegram Phone Number
                  </label>
                  <input
                    type="text"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="e.g. 012 345 678"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-fuchsia-500"
                  />
                  <p className="text-[10px] text-slate-400">Enter your number with country code (+855...)</p>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={isSending}
                  className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-orange-600 hover:from-fuchsia-500 hover:to-orange-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-fuchsia-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isSending ? "Sending OTP Code..." : "📱 Send Telegram OTP Code"}
                </button>


              </div>
            ) : (
              <div className="space-y-3 text-left">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FaLock className="text-fuchsia-400" /> Enter 6-Digit Telegram Bot Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 784920"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-fuchsia-500"
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
    </div>
  );
};

export default Profile;
