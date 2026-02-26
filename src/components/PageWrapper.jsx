import React from "react";
import { motion } from "framer-motion";

export default function PageWrapper({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {children}
    </motion.main>
  );
}
