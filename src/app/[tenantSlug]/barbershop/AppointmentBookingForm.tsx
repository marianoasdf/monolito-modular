"use client";

import { useRef, useState } from "react";
import {
  BarbershopAgendaSlot,
  FeaturedBarbershopService,
} from "../../../modules/barbershop/domain/entities/BarbershopSiteProfile";
import { normalizeBarbershopPhoneNumber } from "../../../modules/barbershop/domain/value-objects/normalizeBarbershopPhoneNumber";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatServiceLabel(service: FeaturedBarbershopService): string {
  return `${service.name.toLowerCase()} · ${formatDuration(service.durationInMinutes)} · ${service.priceInArs}$`;
}

interface AppointmentBookingFormProps {
  tenantId: string;
  tenantSlug: string;
  services: FeaturedBarbershopService[];
  todayLabel: string;
  todaySlots: BarbershopAgendaSlot[];
  whatsAppUrl: string;
}

interface SubmitState {
  kind: "idle" | "success" | "error";
  message?: string;
  appointmentId?: string;
  errors?: string[];
}

export function AppointmentBookingForm({
  tenantId,
  tenantSlug,
  services,
  todayLabel,
  todaySlots,
  whatsAppUrl,
}: AppointmentBookingFormProps): React.JSX.Element {
  const [selectedServiceName, setSelectedServiceName] = useState<string>(services[0]?.name ?? "");
  const [selectedSlotStartsAt, setSelectedSlotStartsAt] = useState<string>("");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slots, setSlots] = useState<BarbershopAgendaSlot[]>(todaySlots);
  const bookingSummaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const selectedService =
    services.find((service) => service.name === selectedServiceName) ?? services[0];
  const selectedSlot = slots.find((slot) => slot.startsAt === selectedSlotStartsAt);

  if (slots.length === 0) {
    return (
      <article className="tenant-card booking-card booking-card--empty">
        <a className="button booking-whatsapp" href={whatsAppUrl} rel="noreferrer" target="_blank">
          Pedir turno por WhatsApp
        </a>
      </article>
    );
  }

  function scrollToBookingSummary(): void {
    if (typeof window === "undefined") {
      return;
    }

    const isMobileViewport = window.matchMedia("(max-width: 640px)").matches;

    if (!isMobileViewport) {
      return;
    }

    window.requestAnimationFrame(() => {
      bookingSummaryRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  function handleSlotSelection(slotStartsAt: string): void {
    setSelectedSlotStartsAt(slotStartsAt);
    setSubmitState({ kind: "idle" });
    scrollToBookingSummary();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const customerFullName = `${formData.get("customerFullName") || ""}`.trim();
    const customerPhoneNumber = `${formData.get("customerPhoneNumber") || ""}`.trim();

    if (!selectedService) {
      setSubmitState({ kind: "error", message: "No hay servicios configurados para este tenant." });
      return;
    }

    if (!selectedSlot) {
      setSubmitState({ kind: "error", message: "Tocá un horario verde para reservar." });
      return;
    }

    const normalizedPhoneNumber = normalizeBarbershopPhoneNumber(customerPhoneNumber);

    if (!normalizedPhoneNumber) {
      setSubmitState({
        kind: "error",
        message: "Ingresá un celular válido. Ejemplos: 3454200683, 3454 15 200683 o +5493454200683.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ kind: "idle" });

    try {
      const response = await fetch("/api/barbershop/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          customerFullName,
          customerPhoneNumber: normalizedPhoneNumber,
          barberId: `${tenantSlug}-main-barber`,
          serviceCode: selectedService.name.toLowerCase().replace(/\s+/g, "-"),
          serviceName: selectedService.name,
          startsAt: selectedSlot.startsAt,
          durationInMinutes: selectedService.durationInMinutes,
          notes: formData.get("notes") || undefined,
        }),
      });

      const responseBody = (await response.json()) as {
        message?: string;
        appointmentId?: string;
        errors?: string[];
      };

      if (!response.ok) {
        setSubmitState({
          kind: "error",
          message: responseBody.message || "No se pudo reservar el turno.",
          errors: responseBody.errors,
        });
        return;
      }

      setSubmitState({
        kind: "success",
        message: "Turno reservado correctamente.",
        appointmentId: responseBody.appointmentId,
      });

      const reservedStartsAt = selectedSlot.startsAt;
      setSlots((previousSlots) =>
        previousSlots.map((slot) =>
          slot.startsAt === reservedStartsAt ? { ...slot, status: "occupied" } : slot,
        ),
      );

      form.reset();
      setSelectedServiceName(services[0]?.name ?? "");
      setSelectedSlotStartsAt("");

      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } catch {
      setSubmitState({
        kind: "error",
        message: "No se pudo conectar con la API. Probá de nuevo en unos segundos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="tenant-card booking-card">
      <div className="booking-head">
        <h2>{todayLabel}</h2>
      </div>

      <div
        className="agenda-grid"
        aria-label="Turnos del día"
      >
        {slots.map((slot) => {
          const isSelected = slot.startsAt === selectedSlotStartsAt;
          const isAvailable = slot.status === "available";
          const slotVariantClass =
            slot.status === "available"
              ? "agenda-slot--available"
              : slot.status === "occupied"
                ? "agenda-slot--occupied"
                : "agenda-slot--closed";
          const slotLabel =
            slot.status === "occupied"
              ? `${slot.label} ocupado`
              : slot.status === "closed"
                ? `${slot.label} no disponible por anticipación`
                : `${slot.label} disponible`;

          return (
            <button
              key={slot.startsAt}
              className={[
                "agenda-slot",
                slotVariantClass,
                isSelected ? "agenda-slot--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={slotLabel}
              data-slot-starts-at={slot.startsAt}
              disabled={!isAvailable || isSubmitting}
              onClick={() => handleSlotSelection(slot.startsAt)}
              type="button"
            >
              <span>{slot.label}</span>
            </button>
          );
        })}
      </div>

      <div className="booking-actions-row">
        <a className="button-secondary booking-contact" href={whatsAppUrl} rel="noreferrer" target="_blank">
          WhatsApp
        </a>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <label className="booking-field">
          <span className="sr-only">Nombre</span>
          <input name="customerFullName" type="text" maxLength={120} placeholder="Tu nombre" required />
        </label>

        <label className="booking-field">
          <span className="sr-only">Celular</span>
          <input
            name="customerPhoneNumber"
            type="tel"
            inputMode="tel"
            placeholder="Tu celular"
            pattern="^[0-9+()\s-]{8,20}$"
            title="Podés escribirlo como 3454200683, 3454 15 200683 o +5493454200683"
            required
          />
        </label>

        {services.length > 1 ? (
          <label className="booking-field booking-field--full">
            <span className="sr-only">Servicio</span>
            <select
              name="serviceName"
              value={selectedServiceName}
              onChange={(event) => setSelectedServiceName(event.target.value)}
              required
            >
              {services.map((service) => (
                <option key={service.name} value={service.name}>
                  {formatServiceLabel(service)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div
          ref={bookingSummaryRef}
          className={[
            "booking-summary",
            "booking-field--full",
            selectedSlot ? "booking-summary--selected" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-live="polite"
        >
          <strong>{selectedSlot ? selectedSlot.label : "Tocá un cuadrado verde"}</strong>
          <span>{selectedService ? formatDuration(selectedService.durationInMinutes) : "Seleccioná un servicio"}</span>
        </div>

        <label className="booking-field booking-field--full">
          <span className="sr-only">Nota (opcional)</span>
          <textarea
            name="notes"
            maxLength={300}
            placeholder="Nota opcional (ej: urgente, corte con máquina, etc.)"
            rows={3}
          />
        </label>

        <button className="button booking-submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Reservando..." : "Reservar"}
        </button>
      </form>

      {submitState.kind === "success" ? (
        <div ref={successRef} className="booking-feedback booking-feedback--success">
          <strong>Turno reservado correctamente.</strong>
          <span>Gracias por reservar, nos vemos en tu horario.</span>
        </div>
      ) : null}

      {submitState.kind === "error" ? (
        <div className="booking-feedback booking-feedback--error">
          <strong>{submitState.message}</strong>
          {submitState.errors && submitState.errors.length > 0 ? (
            <ul className="booking-errors">
              {submitState.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}