import Link from "next/link";
import { AppointmentBookingForm } from "./AppointmentBookingForm";
import { BarbershopSiteProfile } from "../../../modules/barbershop/domain/entities/BarbershopSiteProfile";

export function BarbershopTenantView({ site }: { site: BarbershopSiteProfile }): React.JSX.Element {
  return (
    <>
      <section className="agenda-shell">
        <article className="agenda-intro">
          <h1 className="display-title">{site.name}</h1>
          {site.description ? <p className="lead">{site.description}</p> : null}
          {site.mapsUrl ? (
            <a
              className="button-secondary"
              href={site.mapsUrl}
              rel="noreferrer"
              target="_blank"
            >
              Cómo llegar
            </a>
          ) : null}
        </article>

        <AppointmentBookingForm
          tenantId={site.tenantId}
          tenantSlug={site.tenantSlug}
          services={site.featuredServices}
          todayLabel={site.todayLabel}
          todaySlots={site.todaySlots}
          whatsAppUrl={site.whatsAppUrl}
        />
      </section>

      <footer className="tenant-footer">
        <Link className="tenant-footer__link" href="/privacy">
          Política de privacidad
        </Link>
        <Link className="tenant-footer__link" href="/terms">
          Términos y condiciones
        </Link>
      </footer>
    </>
  );
}