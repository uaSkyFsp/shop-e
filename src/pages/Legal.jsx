import React from "react";
import { Link, useParams } from "react-router-dom";
import PageWrapper from "../components/PageWrapper.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const pages = {
  privacy: {
    en: { title: "Privacy Policy", body: "We process customer data only for order fulfillment, support, fraud prevention and legal compliance." },
    es: { title: "Política de Privacidad", body: "Procesamos datos de clientes solo para gestión de pedidos, soporte, prevención de fraude y cumplimiento legal." }
  },
  terms: {
    en: { title: "Terms and Conditions", body: "By placing an order, you confirm legal age, accept our policies and agree to order processing terms." },
    es: { title: "Términos y Condiciones", body: "Al realizar un pedido, confirmas mayoría de edad, aceptas nuestras políticas y condiciones de procesamiento." }
  },
  refund: {
    en: { title: "Refund and Returns", body: "Sealed and unused products may be eligible for return within the legal period, subject to inspection." },
    es: { title: "Devoluciones y Reembolsos", body: "Los productos sellados y sin uso pueden devolverse dentro del periodo legal, sujeto a revisión." }
  },
  shipping: {
    en: { title: "Shipping and Pickup", body: "Orders are currently available for store pickup. Pickup location and instructions are sent by email." },
    es: { title: "Envío y Recogida", body: "Los pedidos actualmente están disponibles para recogida en tienda. Enviamos instrucciones por email." }
  },
  age: {
    en: { title: "Age Policy", body: "Products are intended for adults only. You must be 18+ to access and purchase from this store." },
    es: { title: "Política de Edad", body: "Los productos son solo para adultos. Debes tener 18+ para acceder y comprar en esta tienda." }
  },
  cookies: {
    en: { title: "Cookie Policy", body: "We use essential and analytics cookies to improve performance and user experience." },
    es: { title: "Política de Cookies", body: "Usamos cookies esenciales y de analítica para mejorar el rendimiento y la experiencia de usuario." }
  }
};

export default function Legal() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const page = pages[slug]?.[lang] || pages.privacy[lang];

  return (
    <PageWrapper>
      <section className="section-padding py-16">
        <h1 className="text-3xl font-semibold">{page.title}</h1>
        <p className="mt-4 max-w-3xl text-sm text-ink/70">{page.body}</p>
        <p className="mt-4 text-sm text-ink/50">Last updated: February 26, 2026</p>
        <Link to="/" className="mt-6 inline-block text-sm text-aurora-500">Back to home</Link>
      </section>
    </PageWrapper>
  );
}
