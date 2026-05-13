"use client";

import { useState } from "react";
import { FeaturedBarbershopService } from "../../../modules/barbershop/domain/entities/BarbershopSiteProfile";

interface AppointmentBookingFormProps {
  tenantId: string;
  tenantSlug: string;
  businessHours: string;
  services: FeaturedBarbershopService[];
}

interface SubmitState {
  kind: "idle" | "success" | "error";
  message?: string;
  appointmentId?: string;
  errors?: string[];
}

function buildInitialStartsAt(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  date.setHours(15);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AppointmentBookingForm({
  tenantId,
  tenantSlug,
  businessHours,
  services,
}: AppointmentBookingFormProps): React.JSX.Element {
  const [selectedServiceName, setSelectedServiceName] = useState<string>(services[0]?.name ?? "");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService =
    services.find((service) => service.name === selectedServiceName) ?? services[0];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const customerFullName = `${formData.get("customerFullName") || ""}`.trim();
    const customerPhoneNumber = `${formData.get("customerPhoneNumber") || ""}`.trim();
    const startsAt = `${formData.get("startsAt") || ""}`;
    const notes = `${formData.get("notes") || ""}`.trim();

    if (!selectedService) {
      setSubmitState({ kind: "error", message: "No hay servicios configurados para este tenant." });
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
          customerPhoneNumber,
          barberId: `${tenantSlug}-main-barber`,
          serviceCode: selectedService.name.toLowerCase().replace(/\s+/g, "-"),
          startsAt: new Date(startsAt).toISOString(),
          durationInMinutes: selectedService.durationInMinutes,
          notes: notes || undefined,
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

      event.currentTarget.reset();
      setSelectedServiceName(services[0]?.name ?? "");
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
      <p className="eyebrow">Reserva online</p>
      <h2>Pedí tu turno desde la web</h2>
      <p>
        Este formulario usa el endpoint real de turnos. Horario de referencia: {businessHours}.
      </p>

      <form className="booking-form" onSubmit={handleSubmit}>
        <label className="booking-field">
          <span>Nombre completo</span>
          <input name="customerFullName" type="text" maxLength={120} required />
        </label>

        <label className="booking-field">
          <span>Celular</span>
          <input
            name="customerPhoneNumber"
            type="tel"
            inputMode="tel"
            placeholder="+5491122334455"
            pattern="^\+?[0-9]{8,15}$"
            required
          />
        </label>

        <label className="booking-field">
          <span>Servicio</span>
          <select
            name="serviceName"
            value={selectedServiceName}
            onChange={(event) => setSelectedServiceName(event.target.value)}
            required
          >
            {services.map((service) => (
              <option key={service.name} value={service.name}>
                {service.name} · {service.durationInMinutes} min · ${service.priceInArs.toLocaleString("es-AR")}
              </option>
            ))}
          </select>
        </label>

        <label className="booking-field">
          <span>Fecha y hora</span>
          <input name="startsAt" type="datetime-local" defaultValue={buildInitialStartsAt()} required />
        </label>

        <label className="booking-field booking-field--full">
          <span>Notas</span>
          <textarea name="notes" rows={4} maxLength={300} placeholder="Opcional: preferencia, aclaración o detalle breve" />
        </label>

        <div className="booking-summary booking-field--full">
          <strong>{selectedService?.name ?? "Servicio"}</strong>
          <span>{selectedService?.durationInMinutes ?? 0} min</span>
        </div>

        <button className="button booking-submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Reservando..." : "Reservar turno"}
        </button>
      </form>

      {submitState.kind === "success" ? (
        <div className="booking-feedback booking-feedback--success">
          <strong>{submitState.message}</strong>
          <span>ID: {submitState.appointmentId}</span>
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