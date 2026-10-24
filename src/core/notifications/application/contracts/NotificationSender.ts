export interface NotificationMessage {
  tenantId: string;
  recipient: string;
  subject: string;
  body: string;
  metadata?: {
    customerName?: string;
    customerPhoneNumber?: string;
    serviceName?: string;
    startsAtIso?: string;
    notes?: string;
    itemsSummary?: string;
    totalFormatted?: string;
    fulfillmentType?: string;
    paymentMethod?: string;
    deliveryAddress?: string;
  };
}

export interface NotificationSender {
  send(message: NotificationMessage): Promise<void>;
}