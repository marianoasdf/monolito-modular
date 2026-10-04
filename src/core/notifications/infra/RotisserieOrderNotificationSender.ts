import {
  NotificationMessage,
  NotificationSender,
} from "../application/contracts/NotificationSender";
import { sanitizeTemplateTextParameter } from "./sanitizeTemplateTextParameter";

const ROTISSERIE_ORDER_TEMPLATE_NAME = "rotisserie_new_order";
const ROTISSERIE_ORDER_RECEIVED_TEMPLATE_NAME = "rotisserie_order_received";

export class RotisserieOrderNotificationSender implements NotificationSender {
  constructor(
    private readonly phoneNumberId: string,
    private readonly apiToken: string,
    private readonly recipientPhones: string[],
  ) {}

  private async sendTemplate(
    to: string,
    templateName: string,
    parameters: { type: string; text: string }[],
  ): Promise<void> {
    const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template" as const,
      template: {
        name: templateName,
        language: { code: "es_AR" },
        components: [
          {
            type: "body" as const,
            parameters,
          },
        ],
      },
    };

    console.log(
      "Enviando mensaje WhatsApp...",
      JSON.stringify({ to, template: templateName }, null, 2),
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
        errorText = "<no-body>";
      }
      console.error(`WhatsApp API error (${to}): ${response.status} - ${errorText}`);
      throw new Error(`WhatsApp notification failed for ${to} with status ${response.status}`);
    }

    console.log(`Mensaje enviado exitosamente a ${to}`);
  }

  async send(message: NotificationMessage): Promise<void> {
    if (!this.phoneNumberId || !this.apiToken || this.recipientPhones.length === 0) {
      console.warn("RotisserieOrderNotificationSender: credenciales no configuradas. Skipping.");
      return;
    }

    const customerName = sanitizeTemplateTextParameter(message.metadata?.customerName ?? "Cliente");
    const customerPhone = message.metadata?.customerPhoneNumber ?? "N/A";
    const fulfillmentType = message.metadata?.fulfillmentType ?? "N/A";
    const paymentMethod = message.metadata?.paymentMethod ?? "N/A";
    const itemsSummary = message.metadata?.itemsSummary ?? "N/A";
    const totalFormatted = message.metadata?.totalFormatted ?? "N/A";
    const notes = sanitizeTemplateTextParameter(message.metadata?.notes ?? "Sin nota");

    // Notificación a los dueños
    for (const recipient of this.recipientPhones) {
      try {
        await this.sendTemplate(recipient, ROTISSERIE_ORDER_TEMPLATE_NAME, [
          { type: "text", text: customerName },
          { type: "text", text: customerPhone },
          { type: "text", text: fulfillmentType },
          { type: "text", text: paymentMethod },
          { type: "text", text: itemsSummary },
          { type: "text", text: totalFormatted },
          { type: "text", text: notes },
        ]);
      } catch (error) {
        console.error(`Error enviando notificación al dueño (${recipient})`, error);
        throw error;
      }
    }

    // Confirmación automática al cliente
    if (message.recipient) {
      try {
        await this.sendTemplate(message.recipient, ROTISSERIE_ORDER_RECEIVED_TEMPLATE_NAME, [
          { type: "text", text: customerName },
          { type: "text", text: itemsSummary },
          { type: "text", text: totalFormatted },
        ]);
      } catch (error) {
        console.error(`Error enviando confirmación al cliente (${message.recipient})`, error);
      }
    }
  }
}
