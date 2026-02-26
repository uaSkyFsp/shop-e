import React from "react";

export default function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aurora-500">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 max-w-2xl text-sm text-ink/60">{subtitle}</p>}
    </div>
  );
}
