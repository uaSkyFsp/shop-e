import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../context/CartContext.jsx";
import Button from "./Button.jsx";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

const copy = {
  en: {
    title: "Your Cart",
    close: "Close",
    empty: "Your cart is empty.",
    remove: "Remove",
    total: "Total",
    checkout: "Checkout",
    clear: "Clear"
  },
  es: {
    title: "Tu carrito",
    close: "Cerrar",
    empty: "Tu carrito está vacío.",
    remove: "Eliminar",
    total: "Total",
    checkout: "Finalizar compra",
    clear: "Vaciar"
  }
};

export default function CartDrawer() {
  const { items, total, isOpen, setIsOpen, updateQty, removeItem, clearCart } = useCart();
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            className="h-full w-full max-w-md bg-white p-6"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.title}</h3>
              <button onClick={() => setIsOpen(false)} className="text-sm text-ink/60">
                {t.close}
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {items.length === 0 && <p className="text-sm text-ink/60">{t.empty}</p>}
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.flavor || "default"}-${item.color || "default"}`}
                  className="flex gap-4"
                >
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.name}</p>
                    {(item.flavor || item.color) && (
                      <p className="text-xs text-ink/60">
                        {[item.flavor, item.color].filter(Boolean).join(" / ")}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(event) =>
                          updateQty(item.id, Number(event.target.value), item.flavor, item.color)
                        }
                        className="w-16 rounded-xl border border-ink/10 text-sm"
                      />
                      <button
                        onClick={() => removeItem(item.id, item.flavor, item.color)}
                        className="text-xs text-ink/60"
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">EUR {(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div className="mt-6 border-t border-ink/10 pt-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{t.total}</span>
                  <span>EUR {total.toFixed(2)}</span>
                </div>
                <div className="mt-4 flex gap-3">
                  <Link to="/checkout" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">{t.checkout}</Button>
                  </Link>
                  <Button variant="secondary" className="flex-1" onClick={clearCart}>
                    {t.clear}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
