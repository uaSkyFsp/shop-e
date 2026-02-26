/** @type {import('tailwindcss').Config} */
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: "#0c0f1c",
        pearl: "#f8f9ff",
        aurora: {
          50: "#f4f5ff",
          100: "#eef0ff",
          200: "#dfe4ff",
          300: "#c7ceff",
          400: "#a1aaff",
          500: "#7a7fff",
          600: "#5a55f2",
          700: "#4541c8",
          800: "#343398",
          900: "#24246b"
        },
        blush: {
          200: "#ffd5e7",
          300: "#ffb3d1",
          400: "#ff8bb9",
          500: "#ff6aa4"
        },
        ocean: {
          200: "#bfe9ff",
          300: "#94d5ff",
          400: "#68bfff",
          500: "#4ea3ff"
        }
      },
      borderRadius: {
        "2xl": "1.5rem"
      },
      boxShadow: {
        card: "0 25px 60px -40px rgba(30, 64, 175, 0.45)",
        soft: "0 20px 50px -30px rgba(30, 64, 175, 0.35)",
        glow: "0 20px 60px -35px rgba(255, 106, 164, 0.6)"
      },
      fontFamily: {
        sans: ["SF Pro Display", "Sora", "ui-sans-serif", "system-ui"],
        display: ["Sora", "SF Pro Display", "ui-sans-serif", "system-ui"]
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at top left, rgba(122, 127, 255, 0.45), transparent 55%), radial-gradient(circle at 20% 40%, rgba(255, 106, 164, 0.35), transparent 50%), radial-gradient(circle at 80% 20%, rgba(78, 163, 255, 0.45), transparent 45%)",
        "soft-gradient": "linear-gradient(135deg, rgba(244, 245, 255, 0.9), rgba(248, 249, 255, 0.6))"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: [forms, typography]
};
