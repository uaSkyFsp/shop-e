import React, { useEffect } from "react";
import PageWrapper from "../components/PageWrapper.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import Button from "../components/Button.jsx";

export default function Contact() {
  useEffect(() => {
    document.title = "Contact | Valencia Premium Store";
  }, []);

  return (
    <PageWrapper>
      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="Contact"
          title="Let us curate your perfect setup"
          subtitle="Visit the boutique or send us a message for personal recommendations."
        />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl shadow-soft">
            <iframe
              title="Valencia Premium Store"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3080.102924437118!2d-0.3773936846560591!3d39.46880117948571!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd604f4c7f2b54b3%3A0x345b0375b0213a1c!2sCarrer%20de%20Col%C3%B3n%2C%20101%2C%20Valencia!5e0!3m2!1sen!2ses!4v1700000000000"
              width="100%"
              height="360"
              loading="lazy"
              className="border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="rounded-2xl bg-white/70 p-6 shadow-soft">
            <p className="text-sm font-semibold">Store Info</p>
            <p className="mt-3 text-sm text-ink/70">Carrer de Colon 101, Valencia</p>
            <p className="text-sm text-ink/70">+34 600 123 456</p>
            <p className="text-sm text-ink/70">hello@valenciastore.com</p>
            <div className="mt-6">
              <p className="text-sm font-semibold">Opening Hours</p>
              <p className="mt-2 text-sm text-ink/70">Mon - Fri: 10:00 - 20:00</p>
              <p className="text-sm text-ink/70">Sat: 11:00 - 19:00</p>
              <p className="text-sm text-ink/70">Sun: 12:00 - 18:00</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="Message"
          title="Send a quick note"
          subtitle="We reply within a few hours and are happy to schedule a consultation."
        />
        <form className="grid gap-4 rounded-2xl bg-white/70 p-6 shadow-soft md:grid-cols-2">
          <input className="rounded-2xl border border-ink/10" placeholder="Full name" />
          <input className="rounded-2xl border border-ink/10" placeholder="Email address" />
          <input className="rounded-2xl border border-ink/10 md:col-span-2" placeholder="Subject" />
          <textarea
            className="rounded-2xl border border-ink/10 md:col-span-2"
            rows="5"
            placeholder="Tell us about your preferences"
          />
          <Button className="md:col-span-2">Send Message</Button>
        </form>
      </section>
    </PageWrapper>
  );
}
