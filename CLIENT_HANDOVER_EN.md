# Project Handover Guide (Client Independence)

This document is delivered to the client with the repository so the project does not depend on the developer.

## 1) What is in this project
- Frontend (Vite + React): project root
- Backend (Express + SQLite): `server/`
- Admin panel: `http://<frontend-domain>/admin`

## 2) What the client must do on their side
1. Create and own their own GitHub repository.
2. Deploy frontend and backend on their own servers/accounts.
3. Connect their own domain and DNS.
4. Configure their own environment variables (see below).
5. Change admin password after first login.

## 3) Environment variables

### Frontend (`.env`)
```env
VITE_API_BASE_URL=https://api.your-domain.com
```

### Backend (`server/.env`)
```env
PORT=4000
CLIENT_ORIGIN=https://your-domain.com

# Stripe (leave empty if not used)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# SMTP (leave empty if not used)
SMTP_HOST=
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Shop Notifications <no-reply@yourdomain.com>
ORDER_NOTIFY_EMAIL=

OTP_TTL_MINUTES=10
OTP_ATTEMPTS=5

ADMIN_TOKEN=
ADMIN_USER=admin
ADMIN_PASSWORD=change_this_password
ADMIN_JWT_SECRET=change_this_jwt_secret
```

## 4) Local run

### Backend
```bash
cd <project-folder>/server
npm install
npm run dev
```

### Frontend
```bash
cd <project-folder>
npm install
npm run dev
```

## 5) Production run
- Backend: run with PM2 / Docker / systemd.
- Frontend: `npm run build` and serve static files (Vercel/Netlify/Nginx).
- HTTPS is required.

## 6) Admin panel
- URL: `https://your-domain.com/admin`
- Username: `ADMIN_USER`
- Password: `ADMIN_PASSWORD`
- After first login, change `ADMIN_PASSWORD` and `ADMIN_JWT_SECRET`.

## 7) Database
- Engine: SQLite (already configured in backend code).
- DB file: `server/orders.db` (auto-created on first backend start).
- To migrate existing data: copy old `orders.db` into `server/` before starting backend.
- Backup policy: backup `server/orders.db` daily, keep at least 7 days.

## 8) What to hand over to the client
1. Repository link.
2. This file `CLIENT_HANDOVER_EN.md`.
3. `.env.example` templates.
4. (Optional) current `orders.db` if existing products/orders must be preserved.

## 9) Independence checklist
Client must be able to do this without developer access:
1. Deploy project on their own server.
2. Login to admin panel.
3. Add/edit product.
4. Create test order.
5. Confirm everything works without developer accounts.
