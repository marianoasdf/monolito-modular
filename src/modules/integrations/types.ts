import { EncryptedValue } from "../../core/crypto/crypto-utils";

export interface WhatsAppConfig {
  phoneNumberId: string;
  apiToken: EncryptedValue;
  recipientPhone: string;
  webhookVerifyToken: string;
}

export interface MercadoPagoConfig {
  accessToken: EncryptedValue;
  publicKey: string;
}

export function isWhatsAppConfig(value: unknown): value is WhatsAppConfig {
  if (typeof value !== "object" || value === null) return false;
  const config = value as Record<string, unknown>;
  return (
    typeof config.phoneNumberId === "string" &&
    typeof config.apiToken === "object" &&
    config.apiToken !== null &&
    typeof (config.apiToken as EncryptedValue).encrypted === "string" &&
    typeof (config.apiToken as EncryptedValue).iv === "string" &&
    typeof (config.apiToken as EncryptedValue).authTag === "string" &&
    typeof config.recipientPhone === "string" &&
    typeof config.webhookVerifyToken === "string"
  );
}
