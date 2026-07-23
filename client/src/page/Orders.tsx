import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { FaKey, FaCopy, FaCheck, FaEye, FaEyeSlash, FaInfoCircle, FaShieldAlt } from "react-icons/fa";
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
            <FaKey className="text-amber-400" /> Digital Key Vault
          </h1>
          <p className="text-xs text-slate-400">Your purchased license keys & activation codes</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-600 text-3xl mx-auto border border-slate-800">
            <FaKey />
          </div>
          <p className="text-sm font-bold text-slate-300">No Digital Keys Purchased Yet</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Purchase Telegram Premium, Steam Gift Cards, VPN passes, or Bot License keys to store them in your vault.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="font-black text-xs text-amber-400 font-mono tracking-wider flex items-center gap-1.5">
                    <FaShieldAlt /> {order.orderNumber}
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
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  ⚡ Key Delivered
                </span>
              </div>

              {/* Items & Keys */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-950 border border-slate-800"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.productName}</p>
                        <p className="text-[10px] text-slate-400">
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
                              className="flex items-center justify-between p-2 bg-slate-900 border border-amber-500/30 rounded-xl font-mono text-xs"
                            >
                              <span className="font-extrabold text-amber-300 tracking-wider pl-1">
                                {isRevealed ? digitalKey : "••••-••••-••••-••••"}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleReveal(digitalKey)}
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                                  title={isRevealed ? "Hide Key" : "Reveal Key"}
                                >
                                  {isRevealed ? <FaEyeSlash /> : <FaEye />}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(digitalKey)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg flex items-center gap-1 shadow"
                                >
                                  {copiedKey === digitalKey ? <FaCheck /> : <FaCopy />}
                                  {copiedKey === digitalKey ? "Copied" : "Copy"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {item.activationInstructions && (
                      <p className="text-[10px] text-sky-400 bg-sky-950/30 border border-sky-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <FaInfoCircle className="shrink-0" /> {item.activationInstructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Payment via {order.paymentMethod}</span>
                <span className="font-black text-amber-400 text-sm">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
