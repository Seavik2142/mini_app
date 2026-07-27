import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import logoImg from '../assets/logo.jpg';
import { useState, useRef, useEffect } from 'react';

const Header = () => {
    const { totalItems } = useCart();
    const { language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const [isMuted, setIsMuted] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const playAudio = () => {
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
            }
            document.removeEventListener('click', playAudio);
        };
        document.addEventListener('click', playAudio);
        
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(() => {});
        }

        return () => {
            document.removeEventListener('click', playAudio);
        };
    }, []);

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
            setIsMuted(audioRef.current.muted);
            if (!audioRef.current.muted) {
                audioRef.current.play().catch(e => console.log(e));
            }
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-[#0b0f17]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-lg shadow-black/20">
            {/* Hidden Audio Player */}
            <audio ref={audioRef} src="/song.webm" loop muted={isMuted} />
            
            {/* App Branding */}
            <div 
                onClick={() => navigate('/app')}
                className="flex items-center gap-2.5 cursor-pointer group"
            >
                <div className="relative">
                    <img 
                        src={logoImg} 
                        alt="Logo" 
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700/80 shadow-md group-hover:scale-105 transition-transform duration-200" 
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-fuchsia-500/40 pointer-events-none" />
                </div>
                <div className="flex flex-col">
                    <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-fuchsia-300 transition-colors flex items-center gap-1">
                        Digital Keys <span className="bg-fuchsia-500/20 text-fuchsia-400 text-[10px] px-1.5 py-0.2 rounded border border-fuchsia-500/30">PRO</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Digital Keys & Licenses</span>
                </div>
            </div>

            {/* Header Right Actions: Sound, Language Switcher & Cart */}
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleMute}
                    className="p-2.5 bg-slate-900/90 hover:bg-slate-800 active:scale-95 rounded-xl border border-slate-800 hover:border-fuchsia-500/50 transition-all text-slate-200 hover:text-white shadow-sm"
                    aria-label="Toggle Sound"
                >
                    {isMuted ? <FaVolumeMute className="text-base text-slate-400" /> : <FaVolumeUp className="text-base text-fuchsia-400" />}
                </button>

                <button
                    onClick={toggleLanguage}
                    className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 active:scale-95 rounded-xl border border-slate-800 hover:border-fuchsia-500/50 transition-all text-xs font-bold text-slate-200 flex items-center gap-1 shadow-sm"
                    aria-label="Change Language"
                >
                    <span className="text-sm">{language === 'km' ? '🇰🇭' : '🇬🇧'}</span>
                    <span className="hidden sm:inline">{language === 'km' ? 'ខ្មែរ' : 'EN'}</span>
                </button>

                <button 
                    onClick={() => navigate('/app/cart')}
                    className="relative p-2.5 bg-slate-900/90 hover:bg-slate-800 active:scale-95 rounded-xl border border-slate-800 hover:border-fuchsia-500/50 transition-all text-slate-200 hover:text-white shadow-sm"
                    aria-label="View Cart"
                >
                    <FaShoppingBag className="text-base text-fuchsia-400" />
                    {totalItems > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-fuchsia-500 to-orange-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md shadow-fuchsia-500/40 ring-2 ring-[#0b0f17]">
                            {totalItems}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;