import React from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const copy = {
  en: {
    home: "Home",
    shop: "Shop",
    about: "About",
    contact: "Contact",
    cart: "Cart"
  },
  es: {
    home: "Inicio",
    shop: "Tienda",
    about: "Nosotros",
    contact: "Contacto",
    cart: "Carrito"
  }
};

export default function Navbar() {
  const { items, setIsOpen } = useCart();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const { lang, setLang } = useLanguage();
  const t = copy[lang];

  const links = [
    { to: "/", label: t.home },
    { to: "/shop", label: t.shop },
    { to: "/about", label: t.about },
    { to: "/contact", label: t.contact }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg shadow-[0_10px_40px_-35px_rgba(15,23,42,0.5)] dark:bg-[#111527]/80">
      <div className="section-padding flex h-20 items-center justify-between">
        <NavLink to="/" className="text-lg font-semibold tracking-tight">
          Valencia Vape Atelier
        </NavLink>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "text-aurora-600" : "text-ink/70 hover:text-ink")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-xs font-semibold text-ink shadow-soft dark:bg-white/10 dark:text-white"
          >
            {lang === "en" ? "ES" : "EN"}
          </button>
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(true)}
            className="relative rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-ink shadow-soft dark:bg-white/10 dark:text-white"
          >
            {t.cart}
            {count > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-aurora-500 text-[11px] text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 pb-4 text-sm font-medium md:hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? "text-aurora-600" : "text-ink/70")}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
