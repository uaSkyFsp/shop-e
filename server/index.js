import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import db from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);
const OTP_ATTEMPTS = Number(process.env.OTP_ATTEMPTS || 5);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const ADMIN_USER = process.env.ADMIN_USER || "admin1";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change_me_admin_password";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "change_me_admin_jwt_secret";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true") === "true";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const ORDER_NOTIFY_EMAIL = process.env.ORDER_NOTIFY_EMAIL || "";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400
  })
);

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;
    if (orderId) {
      db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(orderId);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;
    if (orderId) {
      db.prepare("UPDATE orders SET status = 'failed' WHERE id = ?").run(orderId);
    }
  }

  res.json({ received: true });
});

app.use(express.json({ limit: "1mb" }));

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

const hashCode = (code) =>
  crypto.createHash("sha256").update(code).digest("hex");

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const now = () => Date.now();

const requireEnv = (key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is required`);
  }
};

const requireEmailEnv = () => {
  requireEnv("SMTP_HOST");
  requireEnv("SMTP_USER");
  requireEnv("SMTP_PASS");
  requireEnv("SMTP_FROM");
};

const requireAdminToken = (req, res) => {
  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (bearer) {
    try {
      const payload = jwt.verify(bearer, ADMIN_JWT_SECRET);
      if (payload?.role === "admin") return true;
    } catch {
      res.status(401).json({ error: "Unauthorized" });
      return false;
    }
  }

  const token = req.headers["x-admin-token"];
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
};

const parseJsonArray = (value, fallback = []) => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const mapProductRow = (row) => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  description: row.description,
  category: row.category,
  brand: row.brand,
  images: parseJsonArray(row.images_json),
  stock: Boolean(row.stock),
  stockQty: Number(row.stock_qty || 0),
  specs: parseJsonArray(row.specs_json),
  flavors: parseJsonArray(row.flavors_json),
  colors: parseJsonArray(row.colors_json),
  created_at: row.created_at,
  updated_at: row.updated_at
});

const normalizeList = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [];

const parseStockQty = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : NaN;
};

app.post(
  "/api/admin/login",
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20
  }),
  (req, res) => {
    const { username, password } = req.body || {};
    if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ role: "admin", username }, ADMIN_JWT_SECRET, {
      expiresIn: "12h"
    });
    res.json({ token });
  }
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", (req, res) => {
  const rows = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
  res.json({ products: rows.map(mapProductRow) });
});

app.get("/api/products/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Product not found" });
  res.json({ product: mapProductRow(row) });
});

app.get("/api/admin/orders", (req, res) => {
  if (!requireAdminToken(req, res)) return;

  const rows = db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC")
    .all()
    .map((row) => ({
      ...row,
      address: JSON.parse(row.address_json),
      items: JSON.parse(row.items_json)
    }));

  res.json({ orders: rows });
});

app.post("/api/place-order", async (req, res) => {
  try {
    const { order, fulfillmentType } = req.body || {};
    if (!order || !fulfillmentType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const allowedFulfillment = ["pickup"];
    if (!allowedFulfillment.includes(fulfillmentType)) {
      return res.status(400).json({ error: "Invalid fulfillment type" });
    }

    if (!order.email || !order.name || !Array.isArray(order.items) || order.items.length === 0) {
      return res.status(400).json({ error: "Invalid order payload" });
    }

    const paymentMethod = "pay_in_store";
    const orderId = crypto.randomUUID();
    const amount = Math.round(Number(order.amount || 0) * 100);
    const currency = order.currency || "eur";
    const createdAt = now();
    const storedAddress = {
      ...order.address,
      fulfillmentType
    };

    const placeTransaction = db.transaction(() => {
      for (const item of order.items) {
        const row = db
          .prepare("SELECT id, name, stock_qty FROM products WHERE id = ?")
          .get(item.id);
        if (!row) throw new Error(`Product not found: ${item.id}`);
        const requestedQty = Number(item.qty || 0);
        if (requestedQty < 1) throw new Error(`Invalid quantity for ${item.id}`);
        if (Number(row.stock_qty || 0) < requestedQty) {
          throw new Error(`Not enough stock for ${row.name}`);
        }
      }

      for (const item of order.items) {
        const requestedQty = Number(item.qty || 0);
        db.prepare(
          `UPDATE products
           SET stock_qty = stock_qty - ?, stock = CASE WHEN stock_qty - ? > 0 THEN 1 ELSE 0 END, updated_at = ?
           WHERE id = ?`
        ).run(requestedQty, requestedQty, now(), item.id);
      }

      db.prepare(
        `INSERT INTO orders
          (id, email, name, phone, address_json, items_json, amount, currency, status, payment_method, fulfillment_type, stripe_payment_intent_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        orderId,
        order.email,
        order.name,
        order.phone || "",
        JSON.stringify(storedAddress),
        JSON.stringify(order.items),
        amount,
        currency,
        "pending",
        paymentMethod,
        fulfillmentType,
        null,
        createdAt
      );
    });
    placeTransaction();

    res.json({ orderId });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ error: error.message || "Failed to place order" });
  }
});

app.patch("/api/admin/orders/:id", (req, res) => {
  if (!requireAdminToken(req, res)) return;

  const { status } = req.body;
  const allowed = ["pending", "paid", "processing", "shipped", "completed", "cancelled", "failed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const { id } = req.params;
  const result = db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json({ ok: true });
});

app.post("/api/admin/orders/:id/complete", async (req, res) => {
  if (!requireAdminToken(req, res)) return;

  const { id } = req.params;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  try {
    db.prepare("DELETE FROM orders WHERE id = ?").run(id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to complete order" });
  }
});

app.post("/api/admin/products", (req, res) => {
  if (!requireAdminToken(req, res)) return;

  const payload = req.body || {};
  const requiredFields = ["name", "description", "category", "brand"];
  const missing = requiredFields.find((field) => !String(payload[field] || "").trim());
  if (missing) {
    return res.status(400).json({ error: `${missing} is required` });
  }
  const parsedPrice = Number(payload.price);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "price must be a valid number" });
  }
  const parsedStockQty = parseStockQty(payload.stockQty, 0);
  if (Number.isNaN(parsedStockQty)) {
    return res.status(400).json({ error: "stockQty must be a non-negative number" });
  }

  const id = payload.id || crypto.randomUUID();
  const timestamp = now();
  const product = {
    id,
    name: String(payload.name).trim(),
    price: parsedPrice,
    description: String(payload.description).trim(),
    category: String(payload.category).trim(),
    brand: String(payload.brand).trim(),
    images: normalizeList(payload.images),
    stock: Boolean(payload.stock),
    stockQty: parsedStockQty,
    specs: normalizeList(payload.specs),
    flavors: normalizeList(payload.flavors),
    colors: normalizeList(payload.colors)
  };

  try {
    db.prepare(
      `INSERT INTO products
        (id, name, price, description, category, brand, images_json, stock, stock_qty, specs_json, flavors_json, colors_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      product.id,
      product.name,
      product.price,
      product.description,
      product.category,
      product.brand,
      JSON.stringify(product.images),
      product.stock ? 1 : 0,
      product.stockQty,
      JSON.stringify(product.specs),
      JSON.stringify(product.flavors),
      JSON.stringify(product.colors),
      timestamp,
      timestamp
    );
  } catch {
    return res.status(409).json({ error: "Product ID already exists" });
  }

  res.json({ product: { ...product, created_at: timestamp, updated_at: timestamp } });
});

app.patch("/api/admin/products/:id", (req, res) => {
  if (!requireAdminToken(req, res)) return;

  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Product not found" });

  const payload = req.body || {};
  const parsedPrice =
    payload.price !== undefined ? Number(payload.price) : Number(existing.price);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "price must be a valid number" });
  }
  const parsedStockQty = parseStockQty(payload.stockQty, Number(existing.stock_qty || 0));
  if (Number.isNaN(parsedStockQty)) {
    return res.status(400).json({ error: "stockQty must be a non-negative number" });
  }

  const nextName = String(payload.name ?? existing.name).trim();
  const nextDescription = String(payload.description ?? existing.description).trim();
  const nextCategory = String(payload.category ?? existing.category).trim();
  const nextBrand = String(payload.brand ?? existing.brand).trim();
  if (!nextName || !nextDescription || !nextCategory || !nextBrand) {
    return res.status(400).json({ error: "name, description, category and brand are required" });
  }

  const next = {
    name: nextName,
    price: parsedPrice,
    description: nextDescription,
    category: nextCategory,
    brand: nextBrand,
    images:
      payload.images !== undefined
        ? normalizeList(payload.images)
        : parseJsonArray(existing.images_json),
    stock: typeof payload.stock === "boolean" ? payload.stock : Boolean(existing.stock),
    stockQty: parsedStockQty,
    specs:
      payload.specs !== undefined ? normalizeList(payload.specs) : parseJsonArray(existing.specs_json),
    flavors:
      payload.flavors !== undefined
        ? normalizeList(payload.flavors)
        : parseJsonArray(existing.flavors_json),
    colors:
      payload.colors !== undefined
        ? normalizeList(payload.colors)
        : parseJsonArray(existing.colors_json),
    updatedAt: now()
  };

  try {
    db.prepare(
      `UPDATE products
        SET name = ?, price = ?, description = ?, category = ?, brand = ?, images_json = ?, stock = ?, stock_qty = ?, specs_json = ?, flavors_json = ?, colors_json = ?, updated_at = ?
        WHERE id = ?`
    ).run(
      next.name,
      next.price,
      next.description,
      next.category,
      next.brand,
      JSON.stringify(next.images),
      next.stock ? 1 : 0,
      next.stockQty,
      JSON.stringify(next.specs),
      JSON.stringify(next.flavors),
      JSON.stringify(next.colors),
      next.updatedAt,
      req.params.id
    );
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update product" });
  }

  res.json({
    product: {
      id: req.params.id,
      name: next.name,
      price: Number(next.price),
      description: next.description,
      category: next.category,
      brand: next.brand,
      images: next.images,
      stock: next.stock,
      stockQty: next.stockQty,
      specs: next.specs,
      flavors: next.flavors,
      colors: next.colors,
      created_at: existing.created_at,
      updated_at: next.updatedAt
    }
  });
});

app.delete("/api/admin/products/:id", (req, res) => {
  if (!requireAdminToken(req, res)) return;

  const result = db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({ ok: true });
});

app.post("/api/otp/request", async (req, res) => {
  try {
    requireEmailEnv();

    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });

    const code = generateCode();
    const id = crypto.randomUUID();
    const expiresAt = now() + OTP_TTL_MINUTES * 60 * 1000;

    db.prepare(
      `INSERT INTO otp_requests (id, email, code_hash, expires_at) VALUES (?, ?, ?, ?)`
    ).run(id, email, hashCode(code), expiresAt);

    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Your one-time verification code",
      text: `Your verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`
    });

    console.log(`OTP sent to ${email}`);
    res.json({ verificationId: id });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ error: error.message || "Failed to send code" });
  }
});

app.post("/api/otp/verify", (req, res) => {
  const { verificationId, code } = req.body;
  if (!verificationId || !code) {
    return res.status(400).json({ error: "Verification ID and code required" });
  }

  const record = db
    .prepare("SELECT * FROM otp_requests WHERE id = ?")
    .get(verificationId);

  if (!record) return res.status(404).json({ error: "Code not found" });
  if (record.verified) return res.json({ otpToken: record.token });
  if (record.attempts >= OTP_ATTEMPTS) {
    return res.status(429).json({ error: "Too many attempts" });
  }
  if (record.expires_at < now()) {
    return res.status(410).json({ error: "Code expired" });
  }

  const matches = hashCode(code) === record.code_hash;
  if (!matches) {
    db.prepare("UPDATE otp_requests SET attempts = attempts + 1 WHERE id = ?").run(
      verificationId
    );
    return res.status(401).json({ error: "Invalid code" });
  }

  const token = crypto.randomUUID();
  const tokenExpires = now() + 30 * 60 * 1000;

  db.prepare(
    "UPDATE otp_requests SET verified = 1, token = ?, token_expires_at = ? WHERE id = ?"
  ).run(token, tokenExpires, verificationId);

  res.json({ otpToken: token });
});

app.post("/api/create-payment-intent", async (req, res) => {
  try {
    requireEnv("STRIPE_SECRET_KEY");
    const { otpToken, order } = req.body;

    if (!otpToken || !order) {
      return res.status(400).json({ error: "OTP token and order are required" });
    }

    const otpRecord = db
      .prepare("SELECT * FROM otp_requests WHERE token = ?")
      .get(otpToken);

    if (!otpRecord || otpRecord.token_expires_at < now()) {
      return res.status(403).json({ error: "OTP verification required" });
    }

    const orderId = crypto.randomUUID();
    const amount = Math.round(order.amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: order.currency || "eur",
      metadata: {
        orderId
      },
      receipt_email: order.email
    });

    db.prepare(
      `INSERT INTO orders
        (id, email, name, phone, address_json, items_json, amount, currency, status, stripe_payment_intent_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      orderId,
      order.email,
      order.name,
      order.phone || "",
      JSON.stringify(order.address),
      JSON.stringify(order.items),
      amount,
      order.currency || "eur",
      "pending",
      paymentIntent.id,
      now()
    );

    res.json({ clientSecret: paymentIntent.client_secret, orderId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment" });
  }
});

 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Route ready: POST /api/place-order");
});
