import React from "react";

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-aurora-400";

  const variants = {
    primary: "bg-aurora-500 text-white shadow-glow hover:-translate-y-0.5 hover:bg-aurora-400",
    secondary:
      "bg-white/80 text-ink shadow-soft border border-white/60 hover:-translate-y-0.5 hover:bg-white",
    ghost: "text-ink/70 hover:text-ink hover:bg-white/70"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
