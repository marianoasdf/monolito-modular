import Link from "next/link";
import { AppointmentBookingForm } from "./AppointmentBookingForm";
import { BarbershopSiteProfile } from "../../../modules/barbershop/domain/entities/BarbershopSiteProfile";

export function BarbershopTenantView({ site }: { site: BarbershopSiteProfile }): React.JSX.Element {
  return (
    <>
      <section className="agenda-shell">
        <article className="agenda-intro">
          <p className="eyebrow">{site.todayLabel}</p>
          <h1 className="display-title">{site.name}</h1>
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