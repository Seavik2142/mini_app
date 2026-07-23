import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaKey } from 'react-icons/fa';

const Header = () => {
    const { totalItems } = useCart();
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-xl">
            {/* App Branding */}
            <div 
                onClick={() => navigate('/app')}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
                <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2 rounded-xl text-slate-950 shadow-md shadow-amber-500/20">
                    <FaKey className="text-xl" />
                </div>
                <div>
                    <h1 className="font-black text-sm tracking-wide bg-gradient-to-r from-amber-300 via-white to-sky-300 bg-clip-text text-transparent">
                        Key Vault Store
                    </h1>
                    <p className="text-[9px] text-amber-400 font-extrabold tracking-wider uppercase">
                        ABA & Bakong KHQR Checkout
                    </p>
                </div>
            </div>

            {/* Header Right Action: Cart Button */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => navigate('/app/cart')}
                    className="relative p-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-xl border border-slate-800 transition-all text-white"
                    aria-label="View Cart"
                >
                    <FaShoppingBag className="text-base text-amber-400" />
                    {totalItems > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md shadow-rose-500/40">
                            {totalItems}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;