"use client";

import { loadMercadoPago } from "@mercadopago/sdk-js";
import { useEffect, useRef, useState } from "react";

interface MercadoPagoPaymentBrickProps {
  tenantId: string;
  tenantSlug: string;
  appointmentId: string;
  serviceName: string;
  priceInArs: number;
}

type MercadoPagoBricksBuilder = {
  create: (
    brick: "payment",
    containerId: string,
    settings: {
      initialization: { amount: number; preferenceId?: string };
      customization?: {
        paymentMethods?: { mercadoPago?: "all"; creditCard?: "all"; debitCard?: "all" };
        visual?: {
          style?: {
            theme?: "default" | "dark" | "bootstrap" | "flat";
            customVariables?: Record<string, string>;
          };
        };
      };
      callbacks: {
        onReady: () => void;
        onSubmit: (formData: Record<string, unknown>) => Promise<void>;
        onError: (error: unknown) => void;
      };
    },
  ) => Promise<{ unmount?: () => void }>;
};

type MercadoPagoConstructor = new (publicKey: string, options: { locale: string }) => {
  bricks: () => MercadoPagoBricksBuilder;
};

declare global {
  interface Window {
    MercadoPago?: MercadoPagoConstructor;
  }
}

export function MercadoPagoPaymentBrick({
  tenantId,
  tenantSlug,
  appointmentId,
  serviceName,
  priceInArs,
}: MercadoPagoPaymentBrickProps): React.JSX.Element {
  const controllerRef = useRef<{ unmount?: () => void } | null>(null);
  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const containerId = `mercadopago-payment-brick-${appointmentId}`;

  useEffect(() => {
    let cancelled = false;

    async function renderBrick(): Promise<void> {
      try {
        setIsLoading(true);
        setMessage(undefined);

        const configResponse = await fetch(`/api/barbershop/payments/config?tenantId=${encodeURIComponent(tenantId)}`);
        const config = (await configResponse.json()) as { publicKey?: string; message?: string };

        if (!configResponse.ok || !config.publicKey) {
          throw new Error(config.message || "Mercado Pago no está configurado.");
        }

        const preferenceResponse = await fetch("/api/barbershop/payments/preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            tenantSlug,
            appointmentId,
            title: `Turno barbería - ${serviceName}`,
            unitPrice: priceInArs,
          }),
        });
        const preference = (await preferenceResponse.json()) as { preferenceId?: string; message?: string };

        if (!preferenceResponse.ok || !preference.preferenceId) {
          throw new Error(preference.message || "No se pudo preparar Mercado Pago.");
        }

        await loadMercadoPago();

        if (cancelled || !window.MercadoPago) return;

        const mercadoPago = new window.MercadoPago(config.publicKey, { locale: "es-AR" });
        const bricksBuilder = mercadoPago.bricks();

        controllerRef.current?.unmount?.();
        controllerRef.current = await bricksBuilder.create("payment", containerId, {
          initialization: {
            amount: priceInArs,
            preferenceId: preference.preferenceId,
          },
          customization: {
            paymentMethods: {
              mercadoPago: "all",
              creditCard: "all",
              debitCard: "all",
            },
            visual: {
              style: {
                theme: "default",
                ...(window.matchMedia("(max-width: 640px)").matches
                  ? {
                      customVariables: {
                        fontSizeExtraExtraLarge: "17px",
                        fontSizeExtraLarge: "15px",
                        fontSizeLarge: "14px",
                        fontSizeMedium: "13px",
                        fontSizeSmall: "12px",
                        formPadding: "12px",
                      },
                    }
                  : {}),
              },
            },
          },
          callbacks: {
            onReady: () => {
              setIsLoading(false);
              setMessage(undefined);
            },
            onSubmit: async (formData) => {
              const paymentResponse = await fetch("/api/barbershop/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tenantId,
                  appointmentId,
                  ...formData,
                }),
              });
              const payment = (await paymentResponse.json().catch(() => ({}))) as { message?: string };

              if (!paymentResponse.ok) {
                throw new Error(payment.message || "No se pudo procesar el pago.");
              }

              const host = window.location.hostname;
              const isLocalHost = ["localhost", "127.0.0.1"].includes(host) || host.startsWith("192.168.");
              const returnBasePath = isLocalHost ? `/${tenantSlug}/barbershop/payment` : "/payment";
              window.location.href = `${returnBasePath}/success?appointmentId=${encodeURIComponent(appointmentId)}`;
            },
            onError: () => {
              setIsLoading(false);
              setMessage("No pudimos cargar Mercado Pago. Probá de nuevo en unos segundos.");
            },
          },
        });
      } catch (error) {
        if (!cancelled) {
          setIsLoading(false);
          setMessage(error instanceof Error ? error.message : "No pudimos cargar Mercado Pago.");
        }
      }
    }

    void renderBrick();

    return () => {
      cancelled = true;
      controllerRef.current?.unmount?.();
      controllerRef.current = null;
    };
  }, [appointmentId, priceInArs, serviceName, tenantId, tenantSlug]);

  return (
    <div className="mercadopago-brick-wrapper">
      {isLoading ? <span className="mercadopago-brick-status">Preparando Mercado Pago...</span> : null}
      <div id={containerId} />
      {message ? <span className="mercadopago-brick-status">{message}</span> : null}
    </div>
  );
}
