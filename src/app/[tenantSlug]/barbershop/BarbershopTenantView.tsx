import Link from "next/link";
import { AppointmentBookingForm } from "./AppointmentBookingForm";
import { BarbershopSiteProfile } from "../../../modules/barbershop/domain/entities/BarbershopSiteProfile";

export function BarbershopTenantView({ site }: { site: BarbershopSiteProfile }): React.JSX.Element {
  return (
    <>
      <section className="tenant-hero">
        <article className="tenant-card">
          <p className="eyebrow">{site.city} · {site.tagline}</p>
          <h1 className="display-title">{site.name}</h1>
          <p className="lead">{site.description}</p>

          <div className="tenant-actions">
            <a className="button" href={`tel:${site.phone}`}>
              Reservar por teléfono
            </a>
            <Link className="button-secondary" href="/api/barbershop/appointments">
              Ver API base
            </Link>
          </div>
        </article>

        <aside className="tenant-summary">
          <div className="summary-row">
            <span className="stat-label">TenantId</span>
            <strong>{site.tenantId}</strong>
          </div>
          <div className="summary-row">
            <span className="stat-label">Horarios</span>
            <strong>{site.businessHours}</strong>
          </div>
          <div className="summary-row">
            <span className="stat-label">Barrio</span>
            <strong>{site.neighborhood}</strong>
          </div>
          <div className="summary-row">
            <span className="stat-label">Especialidad</span>
            <strong>{site.specialty}</strong>
          </div>
        </aside>
      </section>

      <section className="tenant-panels">
        <AppointmentBookingForm
          tenantId={site.tenantId}
          tenantSlug={site.tenantSlug}
          businessHours={site.businessHours}
          services={site.featuredServices}
        />

        <article className="tenant-card">
          <p className="eyebrow">Servicios</p>
          <h2>Catálogo visible por tenant</h2>
          <ul className="service-list">
            {site.featuredServices.map((service) => (
              <li key={service.name}>
                <div>
                  <strong>{service.name}</strong>
                  <div className="muted">{service.durationInMinutes} min</div>
                </div>
                <span className="price">${service.priceInArs.toLocaleString("es-AR")}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="tenant-card">
          <p className="eyebrow">Slots sugeridos</p>
          <h2>Disponibilidad inicial</h2>
          <ul className="slot-list">
            {site.highlightedSlots.map((slot) => (
              <li key={slot}>
                <span>{slot}</span>
                <span className="pill">Libre</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="tenant-card">
          <p className="eyebrow">Contexto técnico</p>
          <h2>Qué valida esta pantalla</h2>
          <ul className="feature-list">
            <li>El tenant se resuelve por slug o por host sin cambiar la UI.</li>
            <li>El contenido sale del módulo, no del page component.</li>
            <li>La reserva ya usa la API real y normaliza teléfonos locales.</li>
          </ul>
        </article>
      </section>

      <section className="cta-card">
        <p className="eyebrow">Siguiente paso natural</p>
        <h2>La web ya puede reservar turnos sobre la API real.</h2>
        <p>
          El siguiente refinamiento lógico es mejorar UX, validación del lado cliente y personalización visual por tenant.
        </p>
      </section>
    </>
  );
}