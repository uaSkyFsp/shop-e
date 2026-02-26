import React, { useEffect, useState } from "react";
import Button from "./Button.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const STORAGE_KEY = "valencia_cookie_consent";

const copy = {
  en: {
    text: "We use cookies to improve your experience and analyze traffic. By continuing, you agree to our cookie policy.",
    accept: "Accept"
  },
  es: {
    text: "Usamos cookies para mejorar tu experiencia y analizar el tráfico. Al continuar, aceptas nuestra política de cookies.",
    accept: "Aceptar"
  }
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { lang } = useLanguage();
  const t = copy[lang];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 w-[95%] max-w-3xl -translate-x-1/2 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-ink/70">{t.text}</p>
        <Button onClick={accept}>{t.accept}</Button>
      </div>
    </div>
  );
}
