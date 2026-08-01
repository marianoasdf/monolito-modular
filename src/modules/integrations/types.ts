import { EncryptedValue } from "../../core/crypto/crypto-utils";

export interface WhatsAppConfig {
  phoneNumberId: string;
  apiToken: EncryptedValue;
  recipientPhone?: string;
  recipientPhones?: string[];
  webhookVerifyToken: string;
}

export interface MercadoPagoConfig {
  accessToken: EncryptedValue;
  publicKey: string;
}

export function isWhatsAppConfig(value: unknown): value is WhatsAppConfig {
  if (typeof value !== "object" || value === null) return false;
  const config = value as Record<string, unknown>;
  const hasPhoneNumberId = typeof config.phoneNumberId === "string";
  const hasApiToken =
    typeof config.apiToken === "object" &&
    config.apiToken !== null &&
    typeof (config.apiToken as EncryptedValue).encrypted === "string" &&
    typeof (config.apiToken as EncryptedValue).iv === "string" &&
    typeof (config.apiToken as EncryptedValue).authTag === "string";
  const hasRecipient =
    typeof config.recipientPhone === "string" ||
    (Array.isArray(config.recipientPhones) && (config.recipientPhones as unknown[]).length > 0);
  const hasWebhookVerifyToken = typeof config.webhookVerifyToken === "string";
  return hasPhoneNumberId && hasApiToken && hasRecipient && hasWebhookVerifyToken;
}

export function resolveRecipientPhones(config: WhatsAppConfig): string[] {
  if (config.recipientPhones && config.recipientPhones.length > 0) {
    return config.recipientPhones;
  }
  if (config.recipientPhone) {
    return [config.recipientPhone];
  }
  return [];
}
