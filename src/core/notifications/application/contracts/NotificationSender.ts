export interface NotificationMessage {
  tenantId: string;
  recipient: string;
  subject: string;
  body: string;
}

export interface NotificationSender {
  send(message: NotificationMessage): Promise<void>;
}