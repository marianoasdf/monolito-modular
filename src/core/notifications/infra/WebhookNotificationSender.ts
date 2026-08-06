import {
  NotificationMessage,
  NotificationSender,
} from "../application/contracts/NotificationSender";

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

function formatAppointmentDateTime(isoDate: string | undefined): string | null {
  if (!isoDate) {
    return null;
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: ARGENTINA_TIME_ZONE,
  }).format(date);
}

export class WebhookNotificationSender implements NotificationSender {
  constructor(
    private readonly phoneNumberId: string,
    private readonly apiToken: string,
    private readonly recipientPhoneNumber: string,
  ) {}

  async send(message: NotificationMessage): Promise<void> {
    if (!this.phoneNumberId || !this.apiToken || !this.recipientPhoneNumber) {
      console.warn("WhatsApp credentials not configured. Skipping notification.");
      return;
    }

    const customerName = message.metadata?.customerName || "Cliente";
    const serviceName = message.metadata?.serviceName || "Servicio";
    const appointmentDateTime =
      formatAppointmentDateTime(message.metadata?.startsAtIso) || "Fecha no disponible";
    const notes = message.metadata?.notes || "Sin nota";
    const customerPhone = message.metadata?.customerPhoneNumber || "N/A";

    const results = await Promise.allSettled([
      this.sendTemplate(this.recipientPhoneNumber, "barbershop_appointment", [
        customerName,
        serviceName,
        appointmentDateTime,
        customerPhone,
        notes,
      ]),
      this.sendTemplate(message.recipient, "confirmacion_reserva_barberia", [
        customerName,
        serviceName,
        appointmentDateTime,
        this.recipientPhoneNumber,
      ]),
    ]);

    const rejectedResult = results.find((result) => result.status === "rejected");

    if (rejectedResult) {
      throw rejectedResult.reason;
    }
  }

  private async sendTemplate(
    recipientPhoneNumber: string,
    templateName: string,
    parameters: string[],
  ): Promise<void> {
    const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to: recipientPhoneNumber,
      type: "template" as const,
      template: {
        name: templateName,
        language: { code: "es_AR" },
        components: [
          {
            type: "body" as const,
            parameters: parameters.map((text) => ({ type: "text" as const, text })),
          },
        ],
      },
    };

    try {
      console.log(
        "Sending WhatsApp template...",
        JSON.stringify({ to: payload.to, template: payload.template.name }, null, 2),
      );

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorText: string;
        try {
          errorText = await response.text();
        } catch {
          errorText = `<no-body>`;
        }
        console.error(`WhatsApp API error: ${response.status} - ${errorText}`);
        throw new Error(`WhatsApp notification failed with status ${response.status}`);
      }

      console.log("WhatsApp message sent successfully");
    } catch (error) {
      console.error("Failed to send WhatsApp notification", error);
      throw error;
    }
  }
}