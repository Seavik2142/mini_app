import { miniApp } from "@telegram-apps/sdk";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import BottomDock from "../components/bottomDock";
import Header from "../components/header";
import { CartProvider } from "../context/CartContext";
import { Toaster } from "sonner";

const AppLayout = () => {
    useEffect(() => {
        try {
            if (miniApp.mountSync.isAvailable() && !miniApp.isMounted()) {
                miniApp.mountSync();
            }
            if (miniApp.setHeaderColor.isAvailable()) {
                miniApp.setHeaderColor('#0f172a');
            }
            if (miniApp.setBottomBarColor.isAvailable()) {
                miniApp.setBottomBarColor('#020617');
            }
        } catch (e) {
            console.log("Telegram Mini App SDK environment check:", e);
        }
    }, []);

    return (
        <CartProvider>
            <div data-theme="dark" className="min-h-screen bg-slate-950 text-slate-100 font-sans relative pb-24 selection:bg-sky-500 selection:text-white">
                <Header />
                <main className="px-3 pt-3 max-w-md mx-auto">
                    <Outlet />
                </main>
                <BottomDock />
                <Toaster position="top-center" richColors theme="dark" />
            </div>
        </CartProvider>
    );
};

export default AppLayout;