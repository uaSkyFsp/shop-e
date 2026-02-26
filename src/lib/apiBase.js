const raw = (import.meta.env.VITE_API_BASE_URL || "").trim();
const normalized = raw.replace(/\/$/, "");

const API_BASE =
  normalized && !normalized.includes(":5173") && !normalized.includes("localhost:3000")
    ? normalized
    : "http://localhost:4000";

export default API_BASE;
