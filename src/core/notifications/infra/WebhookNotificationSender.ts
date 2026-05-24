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
    dateStyle: "short",
    timeStyle: "short",
    timeZone: ARGENTINA_TIME_ZONE,
  }).format(date);
}

export class WebhookNotificationSender implements NotificationSender {
  constructor(
    private readonly phoneNumberId: string = process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    private readonly apiToken: string = process.env.WHATSAPP_API_TOKEN || "",
    private readonly recipientPhoneNumber: string = process.env.WHATSAPP_RECIPIENT_PHONE_NUMBER || "",
  ) {}

  async send(message: NotificationMessage): Promise<void> {
    if (!this.phoneNumberId || !this.apiToken || !this.recipientPhoneNumber) {
      console.warn("WhatsApp credentials not configured. Skipping notification.");
      return;
    }

    const customerName = message.metadata?.customerName || "Cliente";
    const serviceName = message.metadata?.serviceName || "Servicio";
    const appointmentDateTime = formatAppointmentDateTime(message.metadata?.startsAtIso) || "Fecha no disponible";
    const notes = message.metadata?.notes || "Sin nota";

    const templateUrl = `https://graph.instagram.com/v19.0/${this.phoneNumberId}/messages`;

    try {
      const response = await fetch(templateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: this.recipientPhoneNumber,
          type: "template",
          template: {
            name: "barbershop_appointment",
            language: {
              code: "es_AR",
            },
            parameters: {
              body: {
                parameters: [customerName, serviceName, appointmentDateTime, message.metadata?.customerPhoneNumber || "N/A", notes],
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`WhatsApp API error: ${response.status} - ${errorData}`);
        throw new Error(`WhatsApp notification failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to send WhatsApp notification", error);
      throw error;
    }
  }
}