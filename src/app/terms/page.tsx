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
    title: `Terminos y condiciones | ${tenantName}`,
    description: `Terminos y condiciones simples de ${tenantName} para reservas y atencion.`,
  };
}

export default async function MgBarberTermsPage(): Promise<React.JSX.Element> {
  const tenantName = await getPublicTenantName();

  return (
    <section className="privacy-page">
      <article className="privacy-card">
        <p className="eyebrow">{tenantName}</p>
        <h1>Terminos y condiciones</h1>
        <p className="lead">
          Estos terminos regulan el uso del sitio de {tenantName} y la solicitud de turnos por canales
          digitales.
        </p>

        <div className="privacy-content">
          <section>
            <h2>Reservas</h2>
            <p>
              Las reservas quedan sujetas a disponibilidad. {tenantName} puede confirmar, reprogramar o
              cancelar un turno cuando sea necesario por razones operativas.
            </p>
          </section>

          <section>
            <h2>Puntualidad y cancelaciones</h2>
            <p>
              Te pedimos asistir en el horario acordado. Si necesitas cancelar o modificar tu turno,
              avisanos con la mayor anticipacion posible por WhatsApp.
            </p>
          </section>

          <section>
            <h2>Precios y servicios</h2>
            <p>
              Los precios, servicios y duraciones publicados pueden cambiar sin aviso previo. El
              precio final se confirma al momento de la atencion o por el canal oficial de contacto.
            </p>
          </section>

          <section>
            <h2>Uso del sitio</h2>
            <p>
              El sitio debe usarse solo para consultar informacion y solicitar turnos reales.{" "}
              {tenantName} puede bloquear solicitudes abusivas, falsas o que afecten el
              funcionamiento del servicio.
            </p>
          </section>

          <section>
            <h2>Contacto</h2>
            <p>
              Para consultas sobre estos terminos, reservas o cambios de turno, escribinos por
              WhatsApp desde el sitio oficial de {tenantName}.
            </p>
          </section>
        </div>

        <p className="privacy-updated">Ultima actualizacion: 15 de junio de 2026.</p>

        <Link className="button" href="/">
          Volver al inicio
        </Link>
      </article>
    </section>
  );
}
