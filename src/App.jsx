import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import AgeGateModal from "./components/AgeGateModal.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import Product from "./pages/Product.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Checkout from "./pages/Checkout.jsx";
import Admin from "./pages/Admin.jsx";
import Legal from "./pages/Legal.jsx";

const AGE_KEY = "valencia_age_verified";

export default function App() {
  const location = useLocation();
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(AGE_KEY);
    if (stored === "true") {
      setAgeVerified(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(AGE_KEY, "true");
    setAgeVerified(true);
  };

  return (
    <div className="min-h-screen bg-pearl text-ink dark:bg-[#0c0f1c] dark:text-white">
      <AgeGateModal isOpen={!ageVerified} onConfirm={handleConfirm} />
      <Navbar />
      <CartDrawer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<Product />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/legal/:slug" element={<Legal />} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <CookieBanner />
      <WhatsAppButton />
    </div>
  );
}
