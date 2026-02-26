import React, { useEffect, useMemo, useState } from "react";
import PageWrapper from "../components/PageWrapper.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import FilterBar from "../components/FilterBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import useProducts from "../hooks/useProducts.js";

export default function Shop() {
  const { products, loading, error } = useProducts();
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    flavor: "",
    price: ""
  });
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    document.title = "Shop | Valencia Vape Atelier";
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (filters.category) {
      result = result.filter((item) => item.category === filters.category);
    }
    if (filters.brand) {
      result = result.filter((item) => item.brand === filters.brand);
    }
    if (filters.flavor) {
      result = result.filter((item) => (item.flavors || []).includes(filters.flavor));
    }
    if (filters.price) {
      const [min, max] = filters.price.split("-").map(Number);
      result = result.filter((item) => item.price >= min && item.price <= max);
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, filters, sort]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((item) => item.category))).filter(Boolean),
    [products]
  );
  const brands = useMemo(
    () => Array.from(new Set(products.map((item) => item.brand))).filter(Boolean),
    [products]
  );
  const flavors = useMemo(
    () =>
      Array.from(new Set(products.flatMap((item) => item.flavors || []))).filter(
        (value) => Boolean(value)
      ),
    [products]
  );

  return (
    <PageWrapper>
      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="Shop"
          title="Choose your signature glow"
          subtitle="Pods, liquids, disposables, and accessories curated for a premium daily ritual."
        />
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          sort={sort}
          setSort={setSort}
          categories={categories}
          brands={brands}
          flavors={flavors}
        />
        {loading && <p className="mt-6 text-sm text-ink/60">Loading products...</p>}
        {error && <p className="mt-6 text-sm text-rose-500">{error}</p>}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {!loading && !error && filteredProducts.length === 0 && (
          <p className="mt-6 text-sm text-ink/60">No products match the selected filters.</p>
        )}
      </section>
    </PageWrapper>
  );
}
