import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import Button from "../components/Button.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";
import useProducts from "../hooks/useProducts.js";

export default function Product() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((item) => item.id === id);
  const { addItem } = useCart();
  const [selected, setSelected] = useState(product?.images?.[0]);
  const [flavor, setFlavor] = useState(product?.flavors?.[0] || null);
  const [color, setColor] = useState(product?.colors?.[0] || null);
  const isAvailable = Boolean(product?.stock) && Number(product?.stockQty ?? 0) > 0;

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Valencia Vape Atelier`;
      setSelected(product.images?.[0]);
      setFlavor(product.flavors?.[0] || null);
      setColor(product.colors?.[0] || null);
    }
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((item) => item.category === product.category && item.id !== product.id);
  }, [product]);

  if (!product) {
    if (loading) {
      return (
        <PageWrapper>
          <section className="section-padding py-20">
            <p className="text-sm text-ink/60">Loading product...</p>
          </section>
        </PageWrapper>
      );
    }

    return (
      <PageWrapper>
        <section className="section-padding py-20">
          <p className="text-sm text-ink/60">Product not found.</p>
          <Link to="/shop" className="mt-4 inline-block text-sm text-aurora-500">
            Back to shop
          </Link>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="section-padding py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <img
              src={selected}
              alt={product.name}
              className="h-[420px] w-full rounded-[2rem] object-cover shadow-card"
            />
            <div className="mt-4 flex gap-3">
              {product.images.map((img) => (
                <button
                  key={img}
                  onClick={() => setSelected(img)}
                  className={`overflow-hidden rounded-2xl border ${selected === img ? "border-aurora-500" : "border-transparent"}`}
                >
                  <img src={img} alt={product.name} className="h-16 w-20 object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-aurora-500">{product.brand}</p>
            <h1 className="mt-3 text-3xl font-semibold">{product.name}</h1>
            <p className="mt-4 text-lg font-semibold">€{product.price.toFixed(2)}</p>
            <p className={`mt-2 text-sm ${isAvailable ? "text-emerald-500" : "text-rose-500"}`}>
              {isAvailable ? "In Stock" : "Out of Stock"}
            </p>
            <p className="mt-4 text-sm text-ink/70">{product.description}</p>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">Flavor</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {(product.flavors || []).map((option) => (
                  <button
                    key={option}
                    onClick={() => setFlavor(option)}
                    className={`rounded-2xl border px-4 py-2 text-xs font-semibold ${
                      flavor === option
                        ? "border-aurora-500 bg-aurora-500 text-white"
                        : "border-ink/10 bg-white/60"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            {product.colors?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">Color</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.colors.map((option) => (
                    <button
                      key={option}
                      onClick={() => setColor(option)}
                      className={`rounded-2xl border px-4 py-2 text-xs font-semibold ${
                        color === option
                          ? "border-aurora-500 bg-aurora-500 text-white"
                          : "border-ink/10 bg-white/60"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button onClick={() => addItem(product, 1, flavor, color)} disabled={!isAvailable}>
                {isAvailable ? "Add to Cart" : "Unavailable"}
              </Button>
              <Button variant="secondary">Book Consultation</Button>
            </div>
            <div className="mt-8">
              <p className="text-sm font-semibold">Specifications</p>
              <ul className="mt-3 space-y-2 text-sm text-ink/70">
                {product.specs.map((spec) => (
                  <li key={spec}>• {spec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="Related"
          title="More from this collection"
          subtitle="Complement your setup with these curated picks."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}
