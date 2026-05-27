import { PrismaClient } from "@prisma/client";
import { BarbershopCustomer } from "../../../domain/entities/BarbershopCustomer";
import { BarbershopCustomerRepository } from "../../../domain/repositories/BarbershopCustomerRepository";

function toDomain(record: {
  id: string;
  tenantId: string;
  fullName: string;
  phoneNumber: string;
}): BarbershopCustomer {
  return BarbershopCustomer.create({
    id: record.id,
    tenantId: record.tenantId,
    fullName: record.fullName,
    phoneNumber: record.phoneNumber,
  });
}

export class PrismaBarbershopCustomerRepository implements BarbershopCustomerRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async findById(input: {
    tenantId: string;
    customerId: string;
  }): Promise<BarbershopCustomer | null> {
    const customer = await this.prismaClient.barbershopCustomer.findFirst({
      where: {
        id: input.customerId,
        tenantId: input.tenantId,
      },
    });

    return customer ? toDomain(customer) : null;
  }

  async findByPhoneNumber(input: {
    tenantId: string;
    phoneNumber: string;
  }): Promise<BarbershopCustomer | null> {
    const customer = await this.prismaClient.barbershopCustomer.findFirst({
      where: {
        tenantId: input.tenantId,
        phoneNumber: input.phoneNumber,
      },
      orderBy: { createdAt: "asc" },
    });

    return customer ? toDomain(customer) : null;
  }

  async save(customer: BarbershopCustomer): Promise<void> {
    const props = customer.toPrimitives();

    await this.prismaClient.barbershopCustomer.upsert({
      where: { id: props.id },
      update: {
        fullName: props.fullName,
        phoneNumber: props.phoneNumber,
      },
      create: {
        id: props.id,
        tenantId: props.tenantId,
        fullName: props.fullName,
        phoneNumber: props.phoneNumber,
      },
    });
  }
}