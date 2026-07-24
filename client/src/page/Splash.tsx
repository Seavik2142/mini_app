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
                miniApp.setHeaderColor('#0b0f17');
            }
            if (miniApp.setBottomBarColor.isAvailable()) {
                miniApp.setBottomBarColor('#0b0f17');
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
        <div data-theme="dark" className="h-screen overflow-hidden relative bg-[#0b0f17] text-white flex flex-col items-center justify-center">
            <img
                className="absolute inset-0 z-0 opacity-15 blur-xs w-full h-full object-cover"
                src={money_flying}
                alt="money flying from sky" />

            <img
                className="absolute top-10 left-10 size-16 z-0 blur-xs opacity-30"
                src={who_care_emoji}
                alt="i don't care emoji" />

            <img
                className="absolute bottom-10 left-5 size-12 z-0 blur-xs opacity-30"
                src={who_care_emoji}
                alt="i don't care emoji" />

            <img
                className="absolute bottom-20 right-5 size-12 z-0 blur-xs opacity-30"
                src={silent_emoji}
                alt="silent emoji" />

            <div className="bg-gradient-to-b z-10 from-transparent via-[#0b0f17]/90 to-[#0b0f17] w-full h-screen absolute"></div>

            <div className="bg-indigo-500 size-60 z-20 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] blur-[130px] opacity-25"></div>

            <div className="z-40 flex items-center justify-center flex-col space-y-4 px-6 text-center max-w-sm">
                <img
                    className="w-56 drop-shadow-2xl"
                    src={mr_cool}
                    draggable={false}
                    alt="the cool guy" />

                <h1 className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-300 via-white to-violet-300 bg-clip-text text-transparent">
                    Telegram Digital Store
                </h1>

                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" /> Loading Mini App...
                </div>
            </div>
        </div>
    );
};

export default Splash;