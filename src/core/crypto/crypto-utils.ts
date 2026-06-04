import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");

if (keyBuffer.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
}

export interface EncryptedValue {
  encrypted: string;
  iv: string;
  authTag: string;
  [key: string]: string; // Index signature para compatibilidad con Prisma Json
}

export function encrypt(text: string): EncryptedValue {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

export function decrypt(encrypted: string, iv: string, authTag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    keyBuffer,
    Buffer.from(iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
