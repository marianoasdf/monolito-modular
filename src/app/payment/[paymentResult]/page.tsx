import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { resolvePublicTenantByHost } from "../../publicTenantHosts";
import { PaymentReturnView } from "../../[tenantSlug]/barbershop/payment/PaymentReturnView";

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PublicBarbershopPaymentReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ paymentResult: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { paymentResult } = await params;
  const query = await searchParams;
  const headersList = await headers();
  const publicTenant = resolvePublicTenantByHost(headersList.get("host"));

  if (!publicTenant || publicTenant.vertical !== "barbershop") {
    notFound();
  }

  return (
    <PaymentReturnView
      tenantSlug={publicTenant.slug}
      paymentResult={paymentResult}
      appointmentId={readParam(query.appointmentId)}
    />
  );
}
