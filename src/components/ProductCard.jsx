import React from "react";
import { motion } from "framer-motion";
import Button from "./Button.jsx";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const defaultFlavor = product.flavors?.[0] || product.flavor || null;
  const defaultColor = product.colors?.[0] || null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group rounded-2xl bg-white/80 p-5 shadow-card transition"
    >
      <Link to={`/shop/${product.id}`} className="block">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="h-48 w-full rounded-2xl object-cover"
        />
        <div className="mt-4">
          <p className="text-sm text-ink/60">{product.category}</p>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="mt-2 text-sm text-ink/70">{product.description}</p>
        </div>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-semibold">€{product.price.toFixed(2)}</p>
        <Button onClick={() => addItem(product, 1, defaultFlavor, defaultColor)}>Add to Cart</Button>
      </div>
    </motion.div>
  );
}
