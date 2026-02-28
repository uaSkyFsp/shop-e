# Valencia Premium Store

Premium storefront built with React (Vite), Tailwind, Framer Motion, and a Node/Express backend.

## What Is Implemented
- Catalog management from admin panel (create/edit/delete products)
- Product variants (flavors/colors)
- Stock status and stock quantity (`stockQty`)
- Pickup checkout flow with OTP email verification
- Payment type selection (`Online` / `In store`) and method (`Apple Pay` / `Google Pay`) stored in order
- Order email confirmation
- Admin order status updates
- EN/ES language toggle (core components + checkout)
- Legal pages (`/legal/privacy`, `/legal/terms`, `/legal/refund`, `/legal/shipping`, `/legal/age`, `/legal/cookies`)

## Prerequisites
- Node.js 18+
- Gmail account with App Password for OTP/order emails

## Frontend Setup
```bash
cd /Applications/сайт
cp .env.example .env
npm install
npm run dev
```
Frontend: `http://localhost:5173`

## Backend Setup
```bash
cd /Applications/сайт/server
cp .env.example .env
npm install
npm run dev
```
Backend: `http://localhost:4000`

## Required Backend Env (`/Applications/сайт/server/.env`)
- `CLIENT_ORIGIN=http://localhost:5173`
- `SMTP_HOST=...`
- `SMTP_PORT=...`
- `SMTP_SECURE=true|false`
- `SMTP_USER=...`
- `SMTP_PASS=...`
- `SMTP_FROM=Valencia Premium Store <ops@yourdomain.com>`
- `ORDER_NOTIFY_EMAIL=sales@yourdomain.com` (optional)
- `ADMIN_USER=admin`
- `ADMIN_PASSWORD=...`
- `ADMIN_JWT_SECRET=...`
- `ADMIN_TOKEN=...` (legacy fallback)

## Admin Access
- Open `http://localhost:5173/admin`
- Preferred: login with `ADMIN_USER` + `ADMIN_PASSWORD`
- Legacy fallback: `ADMIN_TOKEN`

## Important Notes
- `Apple Pay` / `Google Pay` are currently checkout options stored in order metadata.
- Real wallet charging requires full payment gateway integration in production.

## Production Checklist
- Real payment gateway implementation and payment confirmation webhooks
- HTTPS + real domain
- Secure secret storage
- Monitoring/logging and backups
- Final legal text review by legal counsel
