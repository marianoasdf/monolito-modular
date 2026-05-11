export interface PaymentChargeRequest {
  tenantId: string;
  amountInCents: number;
  currency: string;
  sourceToken: string;
  description: string;
}

export interface PaymentChargeResult {
  paymentId: string;
  status: "approved" | "pending" | "rejected";
}

export interface PaymentGateway {
  charge(input: PaymentChargeRequest): Promise<PaymentChargeResult>;
}