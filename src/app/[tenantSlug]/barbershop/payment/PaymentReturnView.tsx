import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenantContextBySlug } from "../../../../core/tenancy/infra/resolveTenantContextBySlug";
import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { buildGetBarbershopSiteProfileService } from "../../../../modules/barbershop/infra/container/buildGetBarbershopSiteProfileService";
import { resolvePublicTenantByHost } from "../../../publicTenantHosts";
import { MercadoPagoPaymentBrick } from "../MercadoPagoPaymentBrick";

const RESULT_COPY: Record<string, { eyebrow: string; title: string; message: string }> = {
  success: {
    eyebrow: "Pago aprobado",
    title: "Tu turno quedó confirmado.",
    message: "Ya quedó registrado el pago por Mercado Pago. Gracias por reservar.",
  },
  pending: {
    eyebrow: "Pago pendiente",
    title: "Tu turno quedó reservado.",
    message: "Mercado Pago todavía está confirmando el pago. Cuando se apruebe, el turno queda confirmado.",
  },
  failure: {
    eyebrow: "Pago no confirmado",
    title: "El pago no se pudo confirmar.",
    message: "Tu turno quedó anotado, pero el pago no fue aprobado. Podés intentar pagar de nuevo el mismo turno.",
  },
};

interface PaymentReturnViewProps {
  tenantSlug: string;
  paymentResult: string;
  appointmentId?: string;
}

export async function PaymentReturnView({
  tenantSlug,
  paymentResult,
  appointmentId,
}: PaymentReturnViewProps): Promise<React.JSX.Element> {
  const tenant = await resolveTenantContextBySlug(tenantSlug);
  const copy = RESULT_COPY[paymentResult];

  if (!tenant || !copy) {
    notFound();
  }

  const headersList = await headers();
  const publicTenant = resolvePublicTenantByHost(headersList.get("host"));
  const homeHref = publicTenant?.slug === tenantSlug ? "/" : `/${tenantSlug}/barbershop`;
  let retryPayment: { appointmentId: string; serviceName: string; priceInArs: number } | null = null;

  if (paymentResult === "failure" && appointmentId) {
    const appointment = await prisma.barbershopAppointment.findFirst({
      where: {
        id: appointmentId,
        tenantId: tenant.tenantId,
        paymentMethod: "mercadopago",
      },
      select: { id: true, serviceCode: true },
    });
    const site = appointment ? await buildGetBarbershopSiteProfileService().execute({ tenantSlug }) : null;
    const service = site?.featuredServices.find((item) => item.name === appointment?.serviceCode);

    if (appointment && service) {
      retryPayment = {
        appointmentId: appointment.id,
        serviceName: service.name,
        priceInArs: service.priceInArs,
      };
    }
  }

  return (
    <section className="privacy-page">
      <article className="privacy-card payment-return-card">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.message}</p>
        {retryPayment ? (
          <MercadoPagoPaymentBrick
            tenantId={tenant.tenantId}
            tenantSlug={tenantSlug}
            appointmentId={retryPayment.appointmentId}
            serviceName={retryPayment.serviceName}
            priceInArs={retryPayment.priceInArs}
          />
        ) : null}
        <Link className="button" href={homeHref}>
          Volver al inicio
        </Link>
      </article>
    </section>
  );
}
