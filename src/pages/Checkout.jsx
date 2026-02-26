import React, { useEffect, useMemo, useState } from "react";
import PageWrapper from "../components/PageWrapper.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import Button from "../components/Button.jsx";
import { useCart } from "../context/CartContext.jsx";
import { Link } from "react-router-dom";
import API_BASE from "../lib/apiBase.js";
import { useLanguage } from "../context/LanguageContext.jsx";

const copy = {
  en: {
    eyebrow: "Checkout",
    title: "Reserve your items",
    subtitle: "Fill your details, confirm the code from email, and reserve products for pickup.",
    doneTitle: "Reservation created",
    doneText: "Reservation ID: #{id}. We sent instructions to {email}.",
    continue: "Continue shopping",
    details: "Reservation details",
    email: "Email address",
    name: "Full name",
    phone: "Phone",
    pickupLabel: "Fulfillment",
    pickupValue: "Pickup only",
    pickupAddress: "Pickup at: Carrer de Colon 101, Valencia.",
    paymentInfo: "Payment in store",
    paymentHint: "You will pay in the store when collecting your reservation.",
    sendCode: "Send code",
    openConfirm: "Open reservation confirmation",
    summary: "Reservation summary",
    qty: "Qty",
    total: "Total",
    otpTitle: "Code verification",
    otpText: "Enter the code sent to your email.",
    otpPlaceholder: "Code from email",
    resend: "Send again",
    verify: "Verify code",
    confirmTitle: "Confirm reservation",
    pickup: "Pickup",
    amount: "Estimated total",
    confirmText:
      "After clicking reserve, your items are reserved. Please come to the store within 7 days to pay and collect.",
    reserve: "Reserve",
    reserving: "Reserving...",
    close: "Close",
    empty: "Your cart is empty.",
    backShop: "Back to shop"
  },
  es: {
    eyebrow: "Checkout",
    title: "Reservar productos",
    subtitle: "Completa tus datos, confirma el código por email y reserva para recogida.",
    doneTitle: "Reserva creada",
    doneText: "ID de reserva: #{id}. Enviamos instrucciones a {email}.",
    continue: "Seguir comprando",
    details: "Datos de reserva",
    email: "Correo electrónico",
    name: "Nombre completo",
    phone: "Teléfono",
    pickupLabel: "Entrega",
    pickupValue: "Solo recogida",
    pickupAddress: "Recogida en: Carrer de Colon 101, Valencia.",
    paymentInfo: "Pago en tienda",
    paymentHint: "Pagarás en la tienda al recoger la reserva.",
    sendCode: "Enviar código",
    openConfirm: "Abrir confirmación de reserva",
    summary: "Resumen de reserva",
    qty: "Cant.",
    total: "Total",
    otpTitle: "Verificación de código",
    otpText: "Introduce el código enviado a tu correo.",
    otpPlaceholder: "Código del email",
    resend: "Reenviar",
    verify: "Verificar código",
    confirmTitle: "Confirmar reserva",
    pickup: "Recogida",
    amount: "Total estimado",
    confirmText:
      "Al pulsar reservar, los productos quedan apartados. Ven a la tienda en un plazo de 7 días para pagar y recoger.",
    reserve: "Reservar",
    reserving: "Reservando...",
    close: "Cerrar",
    empty: "Tu carrito está vacío.",
    backShop: "Volver a la tienda"
  }
};

const parseApiResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return { error: text.slice(0, 200) || "Non-JSON response from server" };
};

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { lang } = useLanguage();
  const t = copy[lang];

  const [email, setEmail] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpStatus, setOtpStatus] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  useEffect(() => {
    document.title = "Checkout | Valencia Vape Atelier";
  }, []);

  const order = useMemo(
    () => ({
      name: customer.name,
      email,
      phone: customer.phone,
      address: {
        pickupLocation: "Carrer de Colon 101, Valencia"
      },
      items,
      amount: total,
      currency: "eur"
    }),
    [customer, email, items, total]
  );

  const canRequestOtp = Boolean(email) && Boolean(customer.name) && Boolean(customer.phone);

  const requestOtp = async () => {
    setOtpStatus("Sending code...");
    const response = await fetch(`${API_BASE}/api/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await parseApiResponse(response);
    if (response.ok) {
      setVerificationId(data.verificationId);
      setOtpStatus("Code sent to your email.");
      setShowOtpModal(true);
    } else {
      setOtpStatus(data.error || "Failed to send code.");
    }
  };

  const verifyOtp = async () => {
    setOtpStatus("Verifying...");
    const response = await fetch(`${API_BASE}/api/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationId, code: otp })
    });
    const data = await parseApiResponse(response);
    if (response.ok) {
      setOtpToken(data.otpToken);
      setOtpStatus("Email verified.");
      setShowOtpModal(false);
      setShowReserveModal(true);
    } else {
      setOtpStatus(data.error || "Invalid code.");
    }
  };

  const placeReservation = async () => {
    if (!otpToken) return;

    setReserving(true);
    setOrderStatus("Creating reservation...");

    try {
      const response = await fetch(`${API_BASE}/api/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otpToken,
          order,
          fulfillmentType: "pickup"
        })
      });
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.error || "Failed to create reservation");

      setOrderId(data.orderId);
      setShowReserveModal(false);
      setOrderStatus("Reservation created successfully.");
      clearCart();
    } catch (error) {
      setOrderStatus(error.message);
    } finally {
      setReserving(false);
    }
  };

  if (items.length === 0 && !orderId) {
    return (
      <PageWrapper>
        <section className="section-padding py-20">
          <p className="text-sm text-ink/60">{t.empty}</p>
          <Link to="/shop" className="mt-4 inline-block text-sm text-aurora-500">
            {t.backShop}
          </Link>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="section-padding py-16">
        <SectionTitle eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

        {orderId ? (
          <div className="rounded-2xl bg-white/70 p-6 shadow-soft">
            <h3 className="text-lg font-semibold">{t.doneTitle}</h3>
            <p className="mt-2 text-sm text-ink/70">
              {t.doneText.replace("{id}", orderId).replace("{email}", email)}
            </p>
            <Link to="/shop" className="mt-4 inline-block text-sm text-aurora-500">
              {t.continue}
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-2xl bg-white/70 p-6 shadow-soft">
                <p className="text-sm font-semibold">{t.details}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-2xl border border-ink/10 md:col-span-2"
                    placeholder={t.email}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <input
                    className="rounded-2xl border border-ink/10"
                    placeholder={t.name}
                    value={customer.name}
                    onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                  />
                  <input
                    className="rounded-2xl border border-ink/10"
                    placeholder={t.phone}
                    value={customer.phone}
                    onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                  />
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">{t.pickupLabel}</p>
                  <p className="mt-3 text-sm text-ink/70">{t.pickupValue}</p>
                  <p className="mt-2 text-sm text-ink/70">{t.pickupAddress}</p>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">{t.paymentInfo}</p>
                  <p className="mt-2 text-sm text-ink/70">{t.paymentHint}</p>
                </div>

                <div className="mt-6">
                  {!otpToken && (
                    <Button className="w-full" onClick={requestOtp} disabled={!canRequestOtp}>
                      {t.sendCode}
                    </Button>
                  )}
                  {otpToken && (
                    <Button className="w-full" onClick={() => setShowReserveModal(true)}>
                      {t.openConfirm}
                    </Button>
                  )}
                  {(otpStatus || orderStatus) && (
                    <p className="mt-3 text-xs text-ink/60">{orderStatus || otpStatus}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-6 shadow-soft">
              <p className="text-sm font-semibold">{t.summary}</p>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.flavor || ""}-${item.color || ""}`}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-ink/60">
                        {t.qty} {item.qty}
                        {(item.flavor || item.color) &&
                          ` • ${[item.flavor, item.color].filter(Boolean).join(" / ")}`}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">EUR {(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4 text-sm font-semibold">
                <span>{t.total}</span>
                <span>EUR {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.otpTitle}</h3>
              <button onClick={() => setShowOtpModal(false)} className="text-sm text-ink/60">
                {t.close}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-ink/70">{t.otpText}</p>
              <input
                className="w-full rounded-2xl border border-ink/10"
                placeholder={t.otpPlaceholder}
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
              />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={requestOtp}>
                  {t.resend}
                </Button>
                <Button onClick={verifyOtp} disabled={!verificationId || !otp}>
                  {t.verify}
                </Button>
              </div>
              {otpStatus && <p className="text-xs text-ink/60">{otpStatus}</p>}
            </div>
          </div>
        </div>
      )}

      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.confirmTitle}</h3>
              <button onClick={() => setShowReserveModal(false)} className="text-sm text-ink/60">
                {t.close}
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-ink/70">
              <p>{t.pickup}: Carrer de Colon 101, Valencia</p>
              <p>
                {t.amount}: EUR {total.toFixed(2)}
              </p>
              <p>{t.confirmText}</p>
            </div>
            <Button className="mt-6 w-full" onClick={placeReservation} disabled={!otpToken || reserving}>
              {reserving ? t.reserving : t.reserve}
            </Button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
