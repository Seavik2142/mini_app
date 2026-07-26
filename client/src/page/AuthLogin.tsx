import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaLock, FaShieldAlt, FaCheck, FaTelegram, FaExternalLinkAlt, FaRedo, FaRocket } from "react-icons/fa";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import logoImg from "../assets/logo.jpeg";

import { openTelegramLink } from "@telegram-apps/sdk";

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:3000"
    : "https://mini-app-mzu6.onrender.com");

const AuthLogin: React.FC = () => {
  const navigate = useNavigate();
  const { isPhoneVerified, verifiedPhone, updateVerifiedPhone } = useCart();

  // Step: "REQUEST" → "WAITING" → "CODE" → "VERIFIED_SUCCESS"
  const [step, setStep] = useState<"REQUEST" | "WAITING" | "CODE" | "VERIFIED_SUCCESS">(() => {
    return localStorage.getItem("mini_app_otp_session_id") ? "CODE" : "REQUEST";
  });
  const [phone, setPhone] = useState(verifiedPhone || "");
  const [sessionId, setSessionId] = useState(() => localStorage.getItem("mini_app_otp_session_id") || "");
  const [deepLink, setDeepLink] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(180); // 3 min
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPhoneVerified && step !== "VERIFIED_SUCCESS") {
      navigate("/app", { replace: true });
    }
  }, [isPhoneVerified, navigate, step]);

  // Countdown timer when waiting for user to open Telegram
  useEffect(() => {
    if (step === "WAITING" || step === "CODE") {
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            toast.error("Code expired. Please request a new one.");
            localStorage.removeItem("mini_app_otp_session_id");
            setStep("REQUEST");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Step 1: Request OTP — get sessionId + deepLink from backend
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setSessionId(data.sessionId);
        localStorage.setItem("mini_app_otp_session_id", data.sessionId);
        setDeepLink(data.deepLink);
        setCountdown(data.expiresInSeconds || 180);
        setStep("WAITING");
        toast.success("✅ Link ready! Open Telegram bot to get your code.");
      } else {
        toast.error(data.message || "Failed to create session. Try again.");
      }
    } catch {
      toast.error("Server offline. Please start the server and try again.");
    }
    setIsLoading(false);
  };

  // Open the Telegram deep link
  const handleOpenBot = () => {
    const targetUrl = deepLink || "https://t.me/Sik_mybot";
    try {
      if (openTelegramLink.isAvailable()) {
        openTelegramLink(targetUrl);
      } else {
        window.location.href = targetUrl;
      }
    } catch {
      window.location.href = targetUrl;
    }
    setTimeout(() => setStep("CODE"), 800);
  };

  // Step 2: Verify OTP — send sessionId + code to backend
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      toast.error("Please enter the 6-digit code from Telegram");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/otp/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, code: otpCode.trim(), phone: phone.trim() })
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        clearInterval(timerRef.current!);
        localStorage.removeItem("mini_app_otp_session_id");
        updateVerifiedPhone(data.verifiedPhone || phone, data.user);
        toast.success("🎉 Code Verified! Account Activated!");
        setStep("VERIFIED_SUCCESS");
      } else {
        toast.error(data.message || "Invalid code. Please try again.");
      }
    } catch (err: any) {
      setIsLoading(false);
      console.error("OTP Verification Error:", err);
      toast.error(err.message || "Connection error. Please try again.");
    }
  };

  const handleRestart = () => {
    clearInterval(timerRef.current!);
    localStorage.removeItem("mini_app_otp_session_id");
    setStep("REQUEST");
    setOtpCode("");
    setSessionId("");
    setDeepLink("");
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-600/15 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <img src={logoImg} alt="Logo" className="w-20 h-20 rounded-3xl object-cover border-2 border-indigo-500/50 shadow-2xl mx-auto shadow-indigo-600/30" />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-[#0b0f17] text-xs font-black shadow">
              <FaShieldAlt />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white">Sign In</h1>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
              Verify via Telegram Bot — no SMS cost, instant delivery.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-5">

          {/* Step indicator */}
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            {(["REQUEST", "WAITING", "CODE", "VERIFIED_SUCCESS"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                  step === s ? "bg-indigo-600 border-indigo-400 text-white" :
                  (["REQUEST", "WAITING", "CODE", "VERIFIED_SUCCESS"].indexOf(step) > i) ? "bg-emerald-500 border-emerald-400 text-slate-950" :
                  "bg-slate-800 border-slate-700 text-slate-500"
                }`}>
                  {(["REQUEST", "WAITING", "CODE", "VERIFIED_SUCCESS"].indexOf(step) > i) ? <FaCheck /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold hidden sm:block ${step === s ? "text-white" : "text-slate-500"}`}>
                  {s === "REQUEST" ? "Request" : s === "WAITING" ? "Open Bot" : s === "CODE" ? "Enter Code" : "Done"}
                </span>
                {i < 3 && <div className="w-3 h-px bg-slate-700 mx-0.5" />}
              </div>
            ))}
            {(step === "WAITING" || step === "CODE") && (
              <span className="ml-auto text-[10px] font-mono text-amber-400 font-bold">{formatTime(countdown)}</span>
            )}
          </div>

          {/* ── STEP 1: Enter phone & Request ── */}
          {step === "REQUEST" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FaPhoneAlt className="text-indigo-400 text-xs" /> Phone Number (optional)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+855 12 345 678"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-inner"
                />
                <p className="text-[10px] text-slate-400">
                  Your phone number is optional. The code is sent via Telegram.
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? "Creating session..." : <><FaTelegram /> Get Verification Code</>}
              </button>
            </form>
          )}

          {/* ── STEP 2: Open Telegram Bot ── */}
          {step === "WAITING" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-2xl mx-auto">
                  <FaTelegram />
                </div>
                <p className="text-sm font-black text-white">Open Telegram Bot</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tap the button below to open <span className="text-blue-300 font-bold">@Sik_mybot</span>.
                  The bot will send your 6-digit code immediately.
                </p>
              </div>

              <button
                onClick={handleOpenBot}
                className="w-full py-3.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <FaTelegram className="text-lg" />
                Open @Sik_mybot in Telegram
                <FaExternalLinkAlt className="text-xs opacity-70" />
              </button>

              <button
                onClick={() => setStep("CODE")}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                I already received the code →
              </button>

              <button onClick={handleRestart} className="w-full text-[10px] text-slate-500 hover:text-slate-300 transition-all text-center">
                <FaRedo className="inline mr-1" /> Request new code
              </button>
            </div>
          )}

          {/* ── STEP 3: Enter 6-digit code ── */}
          {step === "CODE" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2 text-center">
                <p className="text-xs text-slate-400">
                  Enter the 6-digit code sent to you by <span className="text-blue-300 font-bold">@Sik_mybot</span>
                </p>
                <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl space-y-1">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">
                    <FaLock className="inline mr-1" /> 6-Digit Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    autoFocus
                    className="w-full text-center text-3xl font-mono font-black tracking-[0.4em] bg-transparent text-white focus:outline-none placeholder:text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : <><FaCheck /> Verify & Login</>}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("WAITING")}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
                >
                  <FaRedo className="text-[10px]" /> New Code
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 4: Success Screen — Open Bot & Start Key ── */}
          {step === "VERIFIED_SUCCESS" && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center text-3xl mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                  <FaCheck />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Account Verified!</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Your account is now active. Tap below to start your bot key or enter the store.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    const botUrl = "https://t.me/Sik_mybot?start=vault";
                    try {
                      if (openTelegramLink.isAvailable()) {
                        openTelegramLink(botUrl);
                      } else {
                        window.location.href = botUrl;
                      }
                    } catch {
                      window.location.href = botUrl;
                    }
                  }}
                  className="w-full py-3.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <FaTelegram className="text-lg" />
                  Open @Sik_mybot to Start Key
                  <FaExternalLinkAlt className="text-xs opacity-70" />
                </button>

                <button
                  onClick={() => navigate("/app", { replace: true })}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <FaRocket /> Continue to Web App
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1 pt-1 border-t border-slate-800">
            <FaShieldAlt className="text-emerald-500" />
            Secured · Telegram Bot Verification · No SMS Cost
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
