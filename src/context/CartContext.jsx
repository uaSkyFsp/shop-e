import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();
const STORAGE_KEY = "valencia_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (error) {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1, flavor = null, color = null) => {
    setItems((prev) => {
      const matchIndex = prev.findIndex(
        (item) => item.id === product.id && item.flavor === flavor && item.color === color
      );
      if (matchIndex >= 0) {
        const updated = [...prev];
        updated[matchIndex] = {
          ...updated[matchIndex],
          qty: updated[matchIndex].qty + qty
        };
        return updated;
      }
      return [...prev, { ...product, qty, flavor, color }];
    });
    setIsOpen(true);
  };

  const updateQty = (id, qty, flavor = null, color = null) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.flavor === flavor && item.color === color
          ? { ...item, qty }
          : item
      )
    );
  };

  const removeItem = (id, flavor = null, color = null) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.flavor === flavor && item.color === color))
    );
  };

  const clearCart = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items]
  );

  const value = {
    items,
    total,
    isOpen,
    setIsOpen,
    addItem,
    updateQty,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
