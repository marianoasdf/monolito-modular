import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { resolvePublicTenantByHost } from "../publicTenantHosts";

async function getPublicTenantName(): Promise<string> {
  const headersList = await headers();
  const publicTenant = resolvePublicTenantByHost(headersList.get("host"));

  return publicTenant?.name || "MG Barber";
}

export async function generateMetadata(): Promise<Metadata> {
  const tenantName = await getPublicTenantName();

  return {
    title: `Politica de privacidad | ${tenantName}`,
    description: `Politica de privacidad simple de ${tenantName} para reservas y contacto por WhatsApp.`,
  };
}

export default async function MgBarberPrivacyPage(): Promise<React.JSX.Element> {
  const tenantName = await getPublicTenantName();

  return (
    <section className="privacy-page">
      <article className="privacy-card">
        <p className="eyebrow">{tenantName}</p>
        <h1>Politica de privacidad</h1>
        <p className="lead">
          En {tenantName} cuidamos la informacion que nos compartis al contactarnos o reservar un
          turno.
        </p>

        <div className="privacy-content">
          <section>
            <h2>Informacion que recopilamos</h2>
            <p>
              Podemos recibir tu nombre, numero de telefono, mensajes enviados por WhatsApp y datos
              necesarios para coordinar una reserva, como fecha, horario y servicio solicitado.
            </p>
          </section>

          <section>
            <h2>Como usamos la informacion</h2>
            <p>
              Usamos esos datos solo para responder consultas, confirmar turnos, enviar recordatorios
              relacionados con la reserva y mejorar la atencion de la barberia.
            </p>
          </section>

          <section>
            <h2>Con quien compartimos datos</h2>
            <p>
              No vendemos ni alquilamos tu informacion personal. Solo podemos compartirla con
              proveedores necesarios para prestar el servicio, como WhatsApp/Meta o herramientas de
              gestion de reservas.
            </p>
          </section>

          <section>
            <h2>Conservacion y baja</h2>
            <p>
              Conservamos la informacion mientras sea necesaria para gestionar la relacion con el
              cliente. Podes pedir que dejemos de contactarte o que eliminemos tus datos escribiendo
              por WhatsApp a {tenantName}.
            </p>
          </section>

          <section>
            <h2>Contacto</h2>
            <p>
              Para consultas sobre esta politica o sobre tus datos personales, escribinos por
              WhatsApp desde el sitio oficial de {tenantName}.
            </p>
          </section>
        </div>

        <p className="privacy-updated">Ultima actualizacion: 14 de junio de 2026.</p>

        <Link className="button" href="/">
          Volver al inicio
        </Link>
      </article>
    </section>
  );
}
