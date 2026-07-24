import { miniApp } from "@telegram-apps/sdk";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import BottomDock from "../components/bottomDock";
import Header from "../components/header";
import { Toaster } from "sonner";

const MainContent = () => {
    return (
        <div className="relative z-10">
            <Header />
            <main className="px-3 pt-3 max-w-md mx-auto">
                <Outlet />
            </main>
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
        <div data-theme="dark" className="min-h-screen bg-[#0b0f17] text-slate-100 font-sans relative pb-24 selection:bg-indigo-500 selection:text-white">
            {/* Background Ambient Radial Glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none z-0" />
            <div className="fixed bottom-20 right-0 w-72 h-72 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
            <div className="fixed top-1/3 left-0 w-64 h-64 bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none z-0" />

            <MainContent />
        </div>
    );
};

export default AppLayout;