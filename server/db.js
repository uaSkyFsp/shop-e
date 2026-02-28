import Database from "better-sqlite3";
import { products as seedProducts } from "../src/data/products.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "orders.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

const init = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_requests (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      verified INTEGER NOT NULL DEFAULT 0,
      token TEXT,
      token_expires_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      address_json TEXT NOT NULL,
      items_json TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      payment_method TEXT,
      fulfillment_type TEXT,
      stripe_payment_intent_id TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      images_json TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 1,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      specs_json TEXT NOT NULL,
      flavors_json TEXT NOT NULL,
      colors_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
};

init();

const migrate = () => {
  const columns = db.prepare("PRAGMA table_info(orders)").all();
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("payment_method")) {
    db.prepare("ALTER TABLE orders ADD COLUMN payment_method TEXT").run();
  }
  if (!names.has("fulfillment_type")) {
    db.prepare("ALTER TABLE orders ADD COLUMN fulfillment_type TEXT").run();
  }

  const productColumns = db.prepare("PRAGMA table_info(products)").all();
  const productNames = new Set(productColumns.map((column) => column.name));
  if (!productNames.has("stock_qty")) {
    db.prepare("ALTER TABLE products ADD COLUMN stock_qty INTEGER NOT NULL DEFAULT 0").run();
    db.prepare("UPDATE products SET stock_qty = CASE WHEN stock = 1 THEN 10 ELSE 0 END").run();
  }
};

migrate();

const seedDefaultProducts = () => {
  const countRow = db.prepare("SELECT COUNT(1) AS count FROM products").get();
  if (countRow?.count > 0) return;

  const now = Date.now();
  const insert = db.prepare(
    `INSERT INTO products
      (id, name, price, description, category, brand, images_json, stock, stock_qty, specs_json, flavors_json, colors_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const transaction = db.transaction((items) => {
    for (const product of items) {
      insert.run(
        product.id,
        product.name,
        product.price,
        product.description,
        product.category,
        product.brand,
        JSON.stringify(product.images || []),
        product.stock ? 1 : 0,
        typeof product.stockQty === "number" ? product.stockQty : product.stock ? 10 : 0,
        JSON.stringify(product.specs || []),
        JSON.stringify(product.flavors || [product.flavor].filter(Boolean)),
        JSON.stringify(product.colors || []),
        now,
        now
      );
    }
  });

  transaction(seedProducts);
};

seedDefaultProducts();

export default db;
