import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { FaKey, FaCopy, FaCheck, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { toast } from "sonner";

const Orders: React.FC = () => {
  const { orders } = useCart();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<{ [key: string]: boolean }>({});

  const copyToClipboard = (keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKey(keyStr);
    toast.success("Digital Key copied to clipboard! 📋");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (keyStr: string) => {
    setRevealedKeys((prev) => ({ ...prev, [keyStr]: !prev[keyStr] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FaKey className="text-indigo-400" /> Digital Key Vault
          </h1>
          <p className="text-xs text-slate-400">Your purchased license keys & activation codes</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-indigo-400 text-3xl mx-auto border border-slate-800">
            <FaKey />
          </div>
          <p className="text-sm font-bold text-slate-200">No Digital Keys Purchased Yet</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Purchase Telegram Premium, Steam Gift Cards, VPN passes, or Bot License keys to store them in your vault.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-3 shadow-lg hover:border-slate-700/80 transition-all"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="font-black text-xs text-white font-mono tracking-wider flex items-center gap-1.5">
                    <FaShieldAlt className="text-indigo-400" /> {order.orderNumber}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  ⚡ Key Delivered
                </span>
              </div>

              {/* Items & Keys */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-slate-800"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.productName}</p>
                        <p className="text-[10px] text-emerald-400 font-extrabold">
                          Price: ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Render Keys */}
                    {item.digitalKeys && item.digitalKeys.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {item.digitalKeys.map((digitalKey, kIdx) => {
                          const isRevealed = revealedKeys[digitalKey];
                          return (
                            <div
                              key={kIdx}
                              className="flex items-center justify-between p-2.5 bg-slate-900 border border-indigo-500/30 rounded-xl font-mono text-xs shadow-inner"
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <FaKey className="text-indigo-400 text-xs shrink-0" />
                                <span className="font-bold text-white tracking-wide">
                                  {isRevealed ? digitalKey : digitalKey.replace(/.[^--]/g, "*")}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => toggleReveal(digitalKey)}
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 transition-colors"
                                  title="Toggle Reveal"
                                >
                                  {isRevealed ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(digitalKey)}
                                  className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 shadow-md transition-all"
                                >
                                  {copiedKey === digitalKey ? <FaCheck /> : <FaCopy />} Copy
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer Total */}
              <div className="pt-1 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Total Paid</span>
                <span className="font-black text-emerald-400 font-mono text-sm">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;



