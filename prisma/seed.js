const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const tenants = [
  {
    id: "tenant_crown_001",
    slug: "crown",
    name: "Crown Barbers",
    customers: [
      {
        id: "cust_crown_001",
        fullName: "Mariano López",
        phoneNumber: "+5491122334455",
      },
      {
        id: "cust_crown_002",
        fullName: "Lucía Herrera",
        phoneNumber: "+5491166677788",
      },
    ],
  },
  {
    id: "tenant_heritage_001",
    slug: "heritage",
    name: "Heritage Cuts",
    customers: [
      {
        id: "cust_heritage_001",
        fullName: "Pedro Sosa",
        phoneNumber: "+5493414455667",
      },
    ],
  },
  {
    id: "tenant_northline_001",
    slug: "northline",
    name: "Northline Studio",
    customers: [
      {
        id: "cust_northline_001",
        fullName: "Carla Medina",
        phoneNumber: "+5493515566778",
      },
    ],
  },
  {
    id: "tenant_mgbarber_001",
    slug: "mgbarber",
    name: "MG Barber",
    customers: [
      {
        id: "cust_mgbarber_001",
        fullName: "Mariano Galli",
        phoneNumber: "+5491123456789",
      },
    ],
  },
];

async function main() {
  for (const tenant of tenants) {
    await prisma.tenant.upsert({
      where: { slug: tenant.slug },
      update: {
        name: tenant.name,
      },
      create: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
    });

    for (const customer of tenant.customers) {
      const existingCustomer = await prisma.barbershopCustomer.findFirst({
        where: {
          tenantId: tenant.id,
          phoneNumber: customer.phoneNumber,
        },
      });

      if (existingCustomer) {
        await prisma.barbershopCustomer.update({
          where: { id: existingCustomer.id },
          data: {
            fullName: customer.fullName,
            phoneNumber: customer.phoneNumber,
          },
        });
        continue;
      }

      await prisma.barbershopCustomer.create({
        data: {
          id: customer.id,
          tenantId: tenant.id,
          fullName: customer.fullName,
          phoneNumber: customer.phoneNumber,
        },
      });
    }

    if (tenant.slug === "mgbarber") {
      await prisma.barbershopTenantSettings.upsert({
        where: { tenantId: tenant.id },
        update: {
          publicName: "MG Barber",
          description: "Toca un cuadrado verde y listo.",
          phone: "+5493454200683",
          weeklySchedule: {
            0: [],
            1: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
            2: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
            3: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
            4: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
            5: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
            6: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00"],
          },
          expressSlots: ["13:00", "19:00"],
        },
        create: {
          tenantId: tenant.id,
          publicName: "MG Barber",
          description: "Toca un cuadrado verde y listo.",
          phone: "+5493454200683",
          weeklySchedule: {
            0: [],
            1: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
            2: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
            3: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
            4: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
            5: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
            6: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00"],
          },
          expressSlots: ["13:00", "19:00"],
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });