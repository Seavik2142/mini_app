import { miniApp } from "@telegram-apps/sdk";
import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import BottomDock from "../components/bottomDock";
import Header from "../components/header";
import { Toaster } from "sonner";
import { FaTelegram, FaUserShield, FaCommentDots, FaTimes, FaRobot } from "react-icons/fa";

const FloatingButtons = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [pos, setPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth - 70 : 300, y: typeof window !== 'undefined' ? window.innerHeight - 180 : 600 });
    const [isSnapping, setIsSnapping] = useState(false);
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, moved: false });

    useEffect(() => {
        // Safe check for window
        if (typeof window === 'undefined') return;
        const bottomLimit = window.innerHeight - 120;
        setPos({ x: window.innerWidth - 70, y: bottomLimit });
        
        const move = (e: MouseEvent | TouchEvent) => {
            if (!dragRef.current.isDragging) return;
            if (e.cancelable) e.preventDefault();
            setIsSnapping(false);
            
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            
            let newX = clientX - dragRef.current.startX;
            let newY = clientY - dragRef.current.startY;
            const bottomLimit = window.innerHeight - 120;
            
            newX = Math.max(10, Math.min(newX, window.innerWidth - 66));
            newY = Math.max(10, Math.min(newY, bottomLimit));
            
            dragRef.current.moved = true;
            setPos({ x: newX, y: newY });
        };
        const up = () => {
            if (dragRef.current.isDragging && dragRef.current.moved) {
                setIsSnapping(true);
                setPos(prev => {
                    const snapX = prev.x < window.innerWidth / 2 ? 10 : window.innerWidth - 66;
                    return { ...prev, x: snapX };
                });
            }
            dragRef.current.isDragging = false; 
        };

        window.addEventListener('mousemove', move, { passive: false });
        window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('mouseup', up);
        window.addEventListener('touchend', up);

        return () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchend', up);
        };
    }, []);

    const down = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        dragRef.current = {
            isDragging: true,
            moved: false,
            startX: clientX - pos.x,
            startY: clientY - pos.y
        };
    };

    const handleClick = () => {
        if (!dragRef.current.moved) {
            setIsOpen(!isOpen);
        }
        dragRef.current.moved = false; // Reset for next click
    };

    const isLeftEdge = pos.x < (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);

    return (
        <div 
            className={`fixed z-[60] flex flex-col gap-3 ${isLeftEdge ? 'items-start' : 'items-end'}`}
            style={{ 
                left: `${pos.x}px`, 
                top: `${pos.y}px`,
                transition: isSnapping ? 'left 0.3s ease-out, top 0.3s ease-out' : 'none'
            }}
        >
            {/* Expanded Menu */}
            <div className={`absolute bottom-[120%] flex flex-col gap-3 transition-all duration-300 ${isLeftEdge ? 'left-0 items-start origin-bottom-left' : 'right-0 items-end origin-bottom-right'} ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
                <button
                    onClick={() => { setIsOpen(false); window.open('https://t.me/BoomBaya_ik', '_blank'); }}
                    className={`flex items-center gap-3 group active:scale-95 transition-transform w-max ${isLeftEdge ? 'flex-row-reverse' : ''}`}
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
                    onClick={() => { setIsOpen(false); window.open('https://t.me/MGDigitalKeys', '_blank'); }}
                    className={`flex items-center gap-3 group active:scale-95 transition-transform w-max ${isLeftEdge ? 'flex-row-reverse' : ''}`}
                    aria-label="Telegram Channel"
                >
                    <span className="bg-slate-900/95 backdrop-blur-sm text-xs font-bold text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg">
                        Join Channel
                    </span>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border border-blue-400/30">
                        <FaTelegram className="text-2xl" />
                    </div>
                </button>
                <button
                    onClick={() => { setIsOpen(false); window.open('https://t.me/Sik_mybot', '_blank'); }}
                    className={`flex items-center gap-3 group active:scale-95 transition-transform w-max ${isLeftEdge ? 'flex-row-reverse' : ''}`}
                    aria-label="Telegram Bot"
                >
                    <span className="bg-slate-900/95 backdrop-blur-sm text-xs font-bold text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg">
                        Open Bot
                    </span>
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-lime-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 border border-emerald-400/30">
                        <FaRobot className="text-xl" />
                    </div>
                </button>
            </div>

            {/* Main Toggle Button */}
            <button
                onMouseDown={down}
                onTouchStart={down}
                onClick={handleClick}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 z-50 relative cursor-grab active:cursor-grabbing ${isOpen ? 'bg-slate-800 border border-slate-700 shadow-slate-900/50 rotate-90' : 'bg-gradient-to-tr from-fuchsia-600 to-orange-500 shadow-fuchsia-600/40 border border-fuchsia-400/30 rotate-0'}`}
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