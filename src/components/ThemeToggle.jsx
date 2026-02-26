import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-xs font-semibold text-ink shadow-soft dark:bg-white/10 dark:text-white"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
