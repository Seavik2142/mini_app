import { FaKey, FaShoppingCart, FaShieldAlt, FaUser } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const BottomDock = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { totalItems } = useCart();

    const dock = [
        {
            href: "/app",
            title: "Keys",
            icon: <FaKey className="text-base" />
        },
        {
            href: "/app/cart",
            title: "Cart",
            badge: totalItems,
            icon: <FaShoppingCart className="text-base" />
        },
        {
            href: "/app/orders",
            title: "Vault",
            icon: <FaShieldAlt className="text-base" />
        },
        {
            href: "/app/profile",
            title: "Profile",
            icon: <FaUser className="text-base" />
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b0f17]/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 shadow-2xl shadow-black">
            <div className="flex items-center justify-around max-w-md mx-auto">
                {dock.map((item, i) => {
                    const isActive = location.pathname === item.href || (item.href === "/app" && location.pathname === "/app/");
                    return (
                        <button
                            onClick={() => navigate(item.href)}
                            type="button"
                            key={i}
                            className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-200 ${
                                isActive
                                    ? 'text-white font-extrabold scale-105 bg-gradient-to-r from-indigo-600/90 to-violet-600/90 border border-indigo-500/50 shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                            }`}
                        >
                            <div className="relative">
                                {item.icon}
                                {item.badge && item.badge > 0 ? (
                                    <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-emerald-500/30 ring-1 ring-[#0b0f17]">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </div>
                            <span className="text-[11px] mt-1 font-semibold tracking-tight">{item.title}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomDock;