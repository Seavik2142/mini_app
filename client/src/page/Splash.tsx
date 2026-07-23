import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { miniApp } from "@telegram-apps/sdk";
import mr_cool from "../assets/mr_cool.gif";
import money_flying from "../assets/money_flying.webp";
import who_care_emoji from "../assets/who_care_emoji.webp";
import silent_emoji from "../assets/silent_emoji.webp";

const Splash = () => {
    const navigate = useNavigate();

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
            console.log("Telegram SDK check:", e);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/app", { replace: true });
        }, 1200);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div data-theme="dark" className="h-screen overflow-hidden relative bg-slate-950 text-white flex flex-col items-center justify-center">
            <img
                className="absolute inset-0 z-0 opacity-40 blur-xs w-full h-full object-cover"
                src={money_flying}
                alt="money flying from sky" />

            <img
                className="absolute top-10 left-10 size-16 z-0 blur-xs opacity-60"
                src={who_care_emoji}
                alt="i don't care emoji" />

            <img
                className="absolute bottom-10 left-5 size-12 z-0 blur-xs opacity-60"
                src={who_care_emoji}
                alt="i don't care emoji" />

            <img
                className="absolute bottom-20 right-5 size-12 z-0 blur-xs opacity-60"
                src={silent_emoji}
                alt="silent emoji" />

            <div className="bg-gradient-to-b z-10 from-transparent via-slate-950/80 to-slate-950 w-full h-screen absolute"></div>

            <div className="bg-gradient-to-br from-sky-500 to-indigo-600 size-60 z-20 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] blur-[120px] opacity-40"></div>

            <div className="z-40 flex items-center justify-center flex-col space-y-4 px-6 text-center max-w-sm">
                <img
                    className="w-56 drop-shadow-2xl"
                    src={mr_cool}
                    draggable={false}
                    alt="the cool guy" />

                <h1 className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                    Telegram E-Commerce Store
                </h1>

                <div className="flex items-center gap-2 text-sky-400 font-medium text-xs">
                    <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" /> Loading Mini App...
                </div>
            </div>
        </div>
    );
};

export default Splash;