import React from "react";

export default function FilterBar({
  filters,
  setFilters,
  sort,
  setSort,
  categories = [],
  brands = [],
  flavors = []
}) {
  return (
    <div className="grid gap-4 rounded-2xl bg-white/70 p-4 shadow-soft md:grid-cols-5">
      <select
        value={filters.category}
        onChange={(event) => setFilters({ ...filters, category: event.target.value })}
        className="rounded-2xl border border-ink/10 text-sm"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <select
        value={filters.brand}
        onChange={(event) => setFilters({ ...filters, brand: event.target.value })}
        className="rounded-2xl border border-ink/10 text-sm"
      >
        <option value="">All Brands</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
      <select
        value={filters.flavor}
        onChange={(event) => setFilters({ ...filters, flavor: event.target.value })}
        className="rounded-2xl border border-ink/10 text-sm"
      >
        <option value="">All Flavors</option>
        {flavors.map((flavor) => (
          <option key={flavor} value={flavor}>
            {flavor}
          </option>
        ))}
      </select>
      <select
        value={filters.price}
        onChange={(event) => setFilters({ ...filters, price: event.target.value })}
        className="rounded-2xl border border-ink/10 text-sm"
      >
        <option value="">Any Price</option>
        <option value="0-15">Under €15</option>
        <option value="15-30">€15 to €30</option>
        <option value="30-60">€30 to €60</option>
      </select>
      <select
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        className="rounded-2xl border border-ink/10 text-sm"
      >
        <option value="newest">Newest</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
  );
}
