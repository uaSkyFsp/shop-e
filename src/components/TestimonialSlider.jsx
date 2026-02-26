import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TestimonialSlider({ testimonials }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/70 p-8 shadow-soft">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-lg font-medium text-ink/80">“{testimonials[index].quote}”</p>
          <p className="mt-4 text-sm font-semibold">{testimonials[index].name}</p>
          <p className="text-xs text-ink/60">{testimonials[index].title}</p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex gap-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`h-2 w-2 rounded-full ${idx === index ? "bg-aurora-500" : "bg-ink/20"}`}
            aria-label={`View testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
