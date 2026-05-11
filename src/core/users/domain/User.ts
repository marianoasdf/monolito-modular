export interface User {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: "owner" | "manager" | "staff" | "customer";
}