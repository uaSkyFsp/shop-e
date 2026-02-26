import React from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { Link } from "react-router-dom";

const copy = {
  en: {
    description:
      "Premium vape shop in Valencia with curated products, expert consultations, and friendly service.",
    contact: "Contact",
    follow: "Follow",
    rights: "© 2026 Valencia Vape Atelier. All rights reserved.",
    legal: "Legal"
  },
  es: {
    description:
      "Tienda premium de vapeo en Valencia con productos seleccionados, asesoramiento experto y servicio cercano.",
    contact: "Contacto",
    follow: "Síguenos",
    rights: "© 2026 Valencia Vape Atelier. Todos los derechos reservados.",
    legal: "Legal"
  }
};

export default function Footer() {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <footer className="section-padding mt-20 border-t border-white/50 bg-white/60 py-12 dark:bg-white/5">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">Valencia Vape Atelier</p>
          <p className="mt-3 text-sm text-ink/70">{t.description}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">{t.contact}</p>
          <p className="mt-3 text-sm text-ink/70">Carrer de Colon 101, Valencia</p>
          <p className="text-sm text-ink/70">+34 600 123 456</p>
          <p className="text-sm text-ink/70">hello@valenciavape.com</p>
        </div>
        <div>
          <p className="text-sm font-semibold">{t.follow}</p>
          <div className="mt-3 flex gap-4 text-sm text-ink/70">
            <a href="#" className="hover:text-ink">
              Instagram
            </a>
            <a href="#" className="hover:text-ink">
              TikTok
            </a>
            <a href="#" className="hover:text-ink">
              Facebook
            </a>
          </div>
          <p className="mt-6 text-xs text-ink/50">{t.rights}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink/60">
            <Link to="/legal/privacy">Privacy</Link>
            <Link to="/legal/terms">Terms</Link>
            <Link to="/legal/refund">Refund</Link>
            <Link to="/legal/shipping">Shipping</Link>
            <Link to="/legal/age">18+</Link>
            <Link to="/legal/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
