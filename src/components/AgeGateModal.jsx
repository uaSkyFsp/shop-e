import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const copy = {
  en: {
    title: "Age Verification",
    subtitle: "You must be 18+ to enter Valencia Vape Atelier. Please confirm your age.",
    confirm: "I am 18+",
    exit: "Exit"
  },
  es: {
    title: "Verificación de edad",
    subtitle: "Debes tener 18+ para entrar a Valencia Vape Atelier. Confirma tu edad.",
    confirm: "Tengo 18+",
    exit: "Salir"
  }
};

export default function AgeGateModal({ isOpen, onConfirm }) {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
          >
            <h2 className="text-xl font-semibold">{t.title}</h2>
            <p className="mt-3 text-sm text-ink/70">{t.subtitle}</p>
            <div className="mt-6 flex gap-3">
              <Button className="flex-1" onClick={onConfirm}>
                {t.confirm}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => window.location.replace("https://google.com")}
              >
                {t.exit}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
