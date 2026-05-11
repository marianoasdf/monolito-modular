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