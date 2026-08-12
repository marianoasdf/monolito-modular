import { PaymentReturnView } from "../PaymentReturnView";

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BarbershopPaymentReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string; paymentResult: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { tenantSlug, paymentResult } = await params;
  const query = await searchParams;
  return (
    <PaymentReturnView
      tenantSlug={tenantSlug}
      paymentResult={paymentResult}
      appointmentId={readParam(query.appointmentId)}
    />
  );
}
