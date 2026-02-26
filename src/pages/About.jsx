import React, { useEffect } from "react";
import PageWrapper from "../components/PageWrapper.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { team } from "../data/content.js";

export default function About() {
  useEffect(() => {
    document.title = "About | Valencia Vape Atelier";
  }, []);

  return (
    <PageWrapper>
      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="About"
          title="Professional consultation with a personal touch"
          subtitle="We believe every customer deserves a curated experience. Our team listens, guides, and helps you discover the right fit."
        />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl bg-white/70 p-6 shadow-soft">
            <p className="text-sm text-ink/70">
              Valencia Vape Atelier is a premium boutique focused on refined service, clean aesthetics, and the
              best devices available. We keep our selection tight and thoughtful so every recommendation feels
              right. Whether you are starting your journey or upgrading your setup, our specialists curate a
              personalized ritual.
            </p>
            <p className="mt-4 text-sm text-ink/70">
              Our Valencia store is designed to feel calm and elevated. Expect a relaxed lounge atmosphere,
              clear guidance, and a team that remembers your preferences.
            </p>
          </div>
          <div className="rounded-2xl bg-hero-gradient p-6 shadow-soft">
            <h3 className="text-lg font-semibold">Our Promise</h3>
            <ul className="mt-4 space-y-2 text-sm text-ink/70">
              <li>• Honest recommendations</li>
              <li>• Consistent quality checks</li>
              <li>• Premium brands only</li>
              <li>• A welcoming, safe environment</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="Team"
          title="Meet the atelier specialists"
          subtitle="Your experience is guided by experts who know the craft intimately."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div key={member.name} className="rounded-2xl bg-white/70 p-6 shadow-soft">
              <img
                src={member.photo}
                alt={member.name}
                className="h-56 w-full rounded-2xl object-cover"
              />
              <p className="mt-4 text-lg font-semibold">{member.name}</p>
              <p className="text-sm text-ink/60">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}
