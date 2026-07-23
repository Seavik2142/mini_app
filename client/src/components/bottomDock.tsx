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
            icon: <FaKey className="text-lg text-amber-400" />
        },
        {
            href: "/app/cart",
            title: "Cart",
            badge: totalItems,
            icon: <FaShoppingCart className="text-lg" />
        },
        {
            href: "/app/orders",
            title: "Vault",
            icon: <FaShieldAlt className="text-lg text-sky-400" />
        },
        {
            href: "/app/profile",
            title: "Profile",
            icon: <FaUser className="text-lg" />
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 shadow-2xl">
            <div className="flex items-center justify-around max-w-md mx-auto">
                {dock.map((item, i) => {
                    const isActive = location.pathname === item.href || (item.href === "/app" && location.pathname === "/app/");
                    return (
                        <button
                            onClick={() => navigate(item.href)}
                            type="button"
                            key={i}
                            className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all duration-200 ${
                                isActive
                                    ? 'text-amber-400 font-extrabold scale-105 bg-amber-500/10 border border-amber-500/20 shadow-md'
                                    : 'text-slate-400 hover:text-slate-200 opacity-75'
                            }`}
                        >
                            <div className="relative">
                                {item.icon}
                                {item.badge && item.badge > 0 ? (
                                    <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
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