import React, { useEffect } from "react";
import PageWrapper from "../components/PageWrapper.jsx";
import Button from "../components/Button.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import ProductCard from "../components/ProductCard.jsx";
import TestimonialSlider from "../components/TestimonialSlider.jsx";
import InstagramGrid from "../components/InstagramGrid.jsx";
import { testimonials, instagramShots } from "../data/content.js";
import { Link } from "react-router-dom";
import useProducts from "../hooks/useProducts.js";

export default function Home() {
  const { products } = useProducts();

  useEffect(() => {
    document.title = "Valencia Premium Store | Premium Product Experience";
  }, []);

  return (
    <PageWrapper>
      <section className="relative overflow-hidden bg-hero-gradient py-20">
        <div className="section-padding grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-aurora-500">Valencia</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              Premium Product Experience in Valencia
            </h1>
            <p className="mt-4 max-w-xl text-base text-ink/70">
              Expert consultation, curated catalog, and the best prices on top-tier products. Discover a
              premium shopping experience tailored for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop">
                <Button>Shop Now</Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary">Visit Store</Button>
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { label: "Top Brands", value: "40+" },
                { label: "Product Options", value: "120" },
                { label: "Happy Customers", value: "9.6k" }
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/70 p-4 shadow-soft">
                  <p className="text-2xl font-semibold text-ink">{stat.value}</p>
                  <p className="text-xs text-ink/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-blush-300 opacity-60 blur-orb" />
            <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-ocean-300 opacity-60 blur-orb" />
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
              alt="Premium product"
              className="relative z-10 h-[420px] w-full rounded-[2rem] object-cover shadow-card"
            />
          </div>
        </div>
      </section>

      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="Featured"
          title="Curated essentials for every mood"
          subtitle="Explore our handpicked selection with premium quality and modern design finishes."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="Why Choose Us"
          title="A team that treats every session like a ritual"
          subtitle="We match you with the right product and a service experience that feels truly premium."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Expert Advice",
              text: "Personalized guidance from certified specialists."
            },
            {
              title: "Big Selection",
              text: "Wide product catalog ready to explore."
            },
            {
              title: "Friendly Staff",
              text: "Warm, welcoming service every single visit."
            },
            {
              title: "Fast Service",
              text: "Quick consultations with no compromise on care."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-white/70 p-6 shadow-soft">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionTitle
              eyebrow="Testimonials"
              title="Loved by Valencia's shopping community"
              subtitle="Great service, standout products, and a team that genuinely cares."
            />
          </div>
          <TestimonialSlider testimonials={testimonials} />
        </div>
      </section>

      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="Instagram"
          title="Follow the glow"
          subtitle="A peek at the latest drops, store moments, and curated setups."
        />
        <InstagramGrid images={instagramShots} />
      </section>

      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="Visit"
          title="Find us in the heart of Valencia"
          subtitle="Drop by for an in-person consultation and exclusive drops."
        />
        <div className="overflow-hidden rounded-2xl shadow-soft">
          <iframe
            title="Valencia Premium Store map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3080.102924437118!2d-0.3773936846560591!3d39.46880117948571!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd604f4c7f2b54b3%3A0x345b0375b0213a1c!2sCarrer%20de%20Col%C3%B3n%2C%20101%2C%20Valencia!5e0!3m2!1sen!2ses!4v1700000000000"
            width="100%"
            height="360"
            loading="lazy"
            className="border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </PageWrapper>
  );
}
