import React from "react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/34600123456"
      className="fixed bottom-6 right-6 z-40 rounded-full bg-aurora-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-1"
      aria-label="Chat on WhatsApp"
    >
      WhatsApp
    </a>
  );
}
