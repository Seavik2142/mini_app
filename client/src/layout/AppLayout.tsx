import { miniApp } from "@telegram-apps/sdk";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import BottomDock from "../components/bottomDock";
import Header from "../components/header";
import { Toaster } from "sonner";
import { FaTelegram, FaUserShield } from "react-icons/fa";

const FloatingButtons = () => {
    return (
        <div className="fixed bottom-28 right-4 z-50 flex flex-col gap-3">
            <button
                onClick={() => window.open('https://t.me/your_admin', '_blank')}
                className="w-12 h-12 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-600/40 border border-orange-400/30 transition-all active:scale-90 group relative"
                aria-label="Contact Admin"
            >
                <FaUserShield className="text-xl" />
            </button>
            <button
                onClick={() => window.open('https://t.me/your_channel', '_blank')}
                className="w-12 h-12 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border border-blue-400/30 transition-all active:scale-90 group relative"
                aria-label="Telegram Channel"
            >
                <FaTelegram className="text-2xl" />
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