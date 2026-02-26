import React, { useMemo, useState } from "react";
import PageWrapper from "../components/PageWrapper.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import Button from "../components/Button.jsx";
import API_BASE from "../lib/apiBase.js";
import { useLanguage } from "../context/LanguageContext.jsx";

const JWT_KEY = "valencia_admin_jwt";

const emptyProduct = {
  id: "",
  name: "",
  price: "",
  description: "",
  category: "",
  brand: "",
  images: "",
  specs: "",
  flavors: "",
  colors: "",
  stock: true,
  stockQty: "0"
};

const parseList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseApiResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return { error: text.slice(0, 200) || "Server returned non-JSON response" };
};

export default function Admin() {
  const { lang } = useLanguage();
  const [legacyToken, setLegacyToken] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [jwtToken, setJwtToken] = useState(localStorage.getItem(JWT_KEY) || "");

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("");
  const [savingId, setSavingId] = useState("");
  const [tab, setTab] = useState("orders");
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState("");

  const authHeaders = useMemo(() => {
    if (jwtToken) {
      return { Authorization: `Bearer ${jwtToken}`, "Content-Type": "application/json" };
    }
    return { "x-admin-token": legacyToken, "Content-Type": "application/json" };
  }, [jwtToken, legacyToken]);

  const hasAnyAuth = Boolean(jwtToken || legacyToken);

  const login = async () => {
    setStatus("Signing in...");
    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.error || "Login failed");
      setJwtToken(data.token);
      localStorage.setItem(JWT_KEY, data.token);
      setStatus("Signed in");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const logout = () => {
    setJwtToken("");
    localStorage.removeItem(JWT_KEY);
    setStatus("Signed out");
  };

  const fetchOrders = async () => {
    const response = await fetch(`${API_BASE}/api/admin/orders`, {
      headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : { "x-admin-token": legacyToken }
    });
    const data = await parseApiResponse(response);
    if (!response.ok) throw new Error(data.error || "Failed to load orders");
    setOrders(data.orders || []);
  };

  const fetchProducts = async () => {
    const response = await fetch(`${API_BASE}/api/products`);
    const data = await parseApiResponse(response);
    if (!response.ok) throw new Error(data.error || "Failed to load products");
    setProducts(data.products || []);
  };

  const loadDashboard = async () => {
    if (!hasAnyAuth) return;
    setStatus("Loading...");
    try {
      await Promise.all([fetchOrders(), fetchProducts()]);
      setStatus("");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const completeOrder = async (orderId) => {
    setSavingId(orderId);
    try {
      const response = await fetch(`${API_BASE}/api/admin/orders/${orderId}/complete`, {
        method: "POST",
        headers: jwtToken
          ? { Authorization: `Bearer ${jwtToken}` }
          : { "x-admin-token": legacyToken }
      });
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.error || "Failed to complete order");
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setStatus(lang === "es" ? "Pedido completado y eliminado" : "Order completed and removed");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSavingId("");
    }
  };

  const resetProductForm = () => {
    setEditingId("");
    setProductForm(emptyProduct);
  };

  const startEditProduct = (product) => {
    setEditingId(product.id);
    setProductForm({
      id: product.id,
      name: product.name,
      price: String(product.price),
      description: product.description,
      category: product.category,
      brand: product.brand,
      images: (product.images || []).join(", "),
      specs: (product.specs || []).join(", "),
      flavors: (product.flavors || []).join(", "),
      colors: (product.colors || []).join(", "),
      stock: Boolean(product.stock),
      stockQty: String(product.stockQty ?? 0)
    });
    setTab("products");
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    if (!hasAnyAuth) return;

    setStatus("Saving product...");
    try {
      const payload = {
        id: productForm.id || undefined,
        name: productForm.name.trim(),
        price: Number(productForm.price),
        description: productForm.description.trim(),
        category: productForm.category.trim(),
        brand: productForm.brand.trim(),
        images: parseList(productForm.images),
        specs: parseList(productForm.specs),
        flavors: parseList(productForm.flavors),
        colors: parseList(productForm.colors),
        stock: Boolean(productForm.stock),
        stockQty: Number(productForm.stockQty || 0)
      };

      const isEdit = Boolean(editingId);
      const targetId = editingId || productForm.id;
      const response = await fetch(
        isEdit ? `${API_BASE}/api/admin/products/${targetId}` : `${API_BASE}/api/admin/products`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: authHeaders,
          body: JSON.stringify(payload)
        }
      );
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.error || "Failed to save product");

      await fetchProducts();
      resetProductForm();
      setStatus("Product saved");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const removeProduct = async (id) => {
    if (!hasAnyAuth) return;
    if (!window.confirm("Delete this product?")) return;

    setStatus("Deleting product...");
    try {
      const response = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: "DELETE",
        headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : { "x-admin-token": legacyToken }
      });
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.error || "Failed to delete product");
      await fetchProducts();
      if (editingId === id) resetProductForm();
      setStatus("");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const toggleStock = async (product) => {
    if (!hasAnyAuth) return;
    setStatus("Updating stock...");
    try {
      const response = await fetch(`${API_BASE}/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ stock: !product.stock })
      });
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.error || "Failed to update stock");
      await fetchProducts();
      setStatus("");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <PageWrapper>
      <section className="section-padding py-16">
        <SectionTitle
          eyebrow="Admin"
          title="Orders and products"
          subtitle="Manage orders, statuses, products and stock quantity."
        />

        <div className="rounded-2xl bg-white/70 p-6 shadow-soft">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              className="rounded-2xl border border-ink/10 px-4"
              placeholder="admin username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              className="rounded-2xl border border-ink/10 px-4"
              placeholder="admin password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button onClick={login}>Login</Button>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              className="rounded-2xl border border-ink/10 px-4"
              placeholder="legacy admin token (optional)"
              type="password"
              value={legacyToken}
              onChange={(event) => setLegacyToken(event.target.value)}
            />
            <Button onClick={loadDashboard} disabled={!hasAnyAuth}>
              Load admin data
            </Button>
            <Button variant="secondary" onClick={() => setTab("orders")}>Orders</Button>
            <Button variant="secondary" onClick={() => setTab("products")}>Products</Button>
          </div>
          {status && <p className="mt-3 text-sm text-rose-500">{status}</p>}
        </div>

        {tab === "orders" && (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-white/70 p-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">Order #{order.id}</p>
                    <p className="text-xs text-ink/60">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => completeOrder(order.id)}
                    disabled={!hasAnyAuth || savingId === order.id}
                  >
                    {lang === "es" ? "Completado" : "Completed"}
                  </Button>
                </div>
                <p className="mt-3 text-sm text-ink/70">{order.name} • {order.email} • {order.phone}</p>
                <p className="text-sm text-ink/70">Payment: {order.payment_method || "-"}</p>
                <p className="text-sm text-ink/70">Fulfillment: {order.fulfillment_type || "-"}</p>
                <p className="mt-3 text-sm font-semibold">Total EUR {(order.amount / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "products" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <form onSubmit={submitProduct} className="rounded-2xl bg-white/70 p-6 shadow-soft">
              <p className="text-sm font-semibold">{editingId ? "Edit product" : "Create product"}</p>
              <div className="mt-4 grid gap-3">
                {!editingId && (
                  <input
                    className="rounded-2xl border border-ink/10"
                    placeholder="Product ID (optional)"
                    value={productForm.id}
                    onChange={(event) => setProductForm({ ...productForm, id: event.target.value })}
                  />
                )}
                <input className="rounded-2xl border border-ink/10" placeholder="Name" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required />
                <input className="rounded-2xl border border-ink/10" placeholder="Price" type="number" step="0.01" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required />
                <input className="rounded-2xl border border-ink/10" placeholder="Stock Qty" type="number" min="0" value={productForm.stockQty} onChange={(event) => setProductForm({ ...productForm, stockQty: event.target.value })} required />
                <input className="rounded-2xl border border-ink/10" placeholder="Category" value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} required />
                <input className="rounded-2xl border border-ink/10" placeholder="Brand" value={productForm.brand} onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })} required />
                <textarea className="rounded-2xl border border-ink/10" rows="3" placeholder="Description" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required />
                <input className="rounded-2xl border border-ink/10" placeholder="Images (comma separated URLs)" value={productForm.images} onChange={(event) => setProductForm({ ...productForm, images: event.target.value })} />
                <input className="rounded-2xl border border-ink/10" placeholder="Specs (comma separated)" value={productForm.specs} onChange={(event) => setProductForm({ ...productForm, specs: event.target.value })} />
                <input className="rounded-2xl border border-ink/10" placeholder="Flavors (comma separated)" value={productForm.flavors} onChange={(event) => setProductForm({ ...productForm, flavors: event.target.value })} />
                <input className="rounded-2xl border border-ink/10" placeholder="Colors (comma separated)" value={productForm.colors} onChange={(event) => setProductForm({ ...productForm, colors: event.target.value })} />
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input type="checkbox" checked={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.checked })} />
                  In stock
                </label>
              </div>
              <div className="mt-4 flex gap-3">
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
                <Button type="button" variant="secondary" onClick={resetProductForm}>Reset</Button>
              </div>
            </form>

            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="rounded-2xl bg-white/70 p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{product.name}</p>
                      <p className="text-xs text-ink/60">{product.category} • {product.brand} • EUR {product.price.toFixed(2)}</p>
                      <p className="text-xs text-ink/60">Stock Qty: {product.stockQty}</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={Boolean(product.stock)} onChange={() => toggleStock(product)} disabled={!hasAnyAuth} />
                      In stock
                    </label>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => startEditProduct(product)}>Edit</Button>
                    <Button type="button" onClick={() => removeProduct(product.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </PageWrapper>
  );
}
