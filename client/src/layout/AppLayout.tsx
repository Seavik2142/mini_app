import { miniApp } from "@telegram-apps/sdk";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import BottomDock from "../components/bottomDock";
import Header from "../components/header";
import { Toaster } from "sonner";
import { FaTelegram, FaUserShield, FaCommentDots, FaTimes } from "react-icons/fa";

const FloatingButtons = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-28 right-4 z-50 flex flex-col items-end gap-3">
            {/* Expanded Menu */}
            <div className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8 pointer-events-none'}`}>
                <button
                    onClick={() => { setIsOpen(false); window.open('https://t.me/your_admin', '_blank'); }}
                    className="flex items-center gap-3 group active:scale-95 transition-transform"
                    aria-label="Contact Admin"
                >
                    <span className="bg-slate-900/95 backdrop-blur-sm text-xs font-bold text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg">
                        Contact Admin
                    </span>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-600/40 border border-orange-400/30">
                        <FaUserShield className="text-xl" />
                    </div>
                </button>
                <button
                    onClick={() => { setIsOpen(false); window.open('https://t.me/your_channel', '_blank'); }}
                    className="flex items-center gap-3 group active:scale-95 transition-transform"
                    aria-label="Telegram Channel"
                >
                    <span className="bg-slate-900/95 backdrop-blur-sm text-xs font-bold text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg">
                        Join Channel
                    </span>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border border-blue-400/30">
                        <FaTelegram className="text-2xl" />
                    </div>
                </button>
            </div>

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 z-50 relative ${isOpen ? 'bg-slate-800 border border-slate-700 shadow-slate-900/50 rotate-90' : 'bg-gradient-to-tr from-fuchsia-600 to-orange-500 shadow-fuchsia-600/40 border border-fuchsia-400/30 rotate-0'}`}
                aria-label="Support Menu"
            >
                {isOpen ? <FaTimes className="text-2xl text-slate-400" /> : <FaCommentDots className="text-2xl text-white" />}
                
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-[#0b0f17]"></span>
                    </span>
                )}
            </button>
        </div>
    );
};

const MainContent = () => {
    return (
        <div className="relative z-10">
            <Header />
            <main className="px-3 pt-3 max-w-md mx-auto">
                <Outlet />
            </main>
            <FloatingButtons />
            <BottomDock />
            <Toaster position="top-center" richColors theme="dark" />
        </div>
    );
};

const AppLayout = () => {
    useEffect(() => {
        try {
            if (miniApp.mountSync.isAvailable() && !miniApp.isMounted()) {
                miniApp.mountSync();
            }
            if (miniApp.setHeaderColor.isAvailable()) {
                miniApp.setHeaderColor('#0b0f17');
            }
            if (miniApp.setBottomBarColor.isAvailable()) {
                miniApp.setBottomBarColor('#0b0f17');
            }
        } catch (e) {
            console.log("Telegram Mini App SDK environment check:", e);
        }
    }, []);

    return (
        <div data-theme="dark" className="min-h-screen bg-[#0b0f17] text-slate-100 font-sans relative pb-24 selection:bg-fuchsia-500 selection:text-white">
            {/* Background Ambient Radial Glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-fuchsia-600/10 blur-[130px] rounded-full pointer-events-none z-0" />
            <div className="fixed bottom-20 right-0 w-72 h-72 bg-orange-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
            <div className="fixed top-1/3 left-0 w-64 h-64 bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none z-0" />

            <MainContent />
        </div>
    );
};

export default AppLayout;