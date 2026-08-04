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
  {
    id: "tenant_rufianbarbershop_001",
    slug: "rufianbarbershop",
    name: "Rufian Barbershop",
    customers: [],
  },
];

const defaultBarbershopSchedule = {
  0: [],
  1: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
  2: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
  3: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
  4: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
  5: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
  6: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00"],
};

const barbershopSettingsBySlug = {
  mgbarber: {
    publicName: "MG Barber",
    description: "Toca un cuadrado verde y listo.",
    phone: "+5493454200683",
    weeklySchedule: defaultBarbershopSchedule,
    expressSlots: ["13:00", "19:00"],
  },
  rufianbarbershop: {
    publicName: "Rufian Barbershop",
    description: "Toca un cuadrado verde y listo.",
    phone: "+5493454758631",
    weeklySchedule: defaultBarbershopSchedule,
    expressSlots: ["13:00", "19:00"],
  },
};

const rotisserieTenant = {
  id: "tenant_lafamilia_001",
  slug: "lafamilia",
  name: "La Familia Rotisería y Viandas",
};

// Carta real relevada del cartel del local (precios en centavos de ARS).
// Ver src/modules/rotisserie/BUSINESS-CONTEXT.md
const rotisserieCatalog = [
  {
    id: "rotcat_lafamilia_menu_dia",
    name: "Menú del día",
    sortOrder: 1,
    products: [
      {
        id: "rotprod_lafamilia_menu_dia",
        name: "Menú del día",
        description: "Plato del día (cambia diariamente) + entrada. Consultá el menú de hoy.",
        priceInCents: 500000,
        sortOrder: 1,
      },
    ],
  },
  {
    id: "rotcat_lafamilia_pizzas",
    name: "Pizzas",
    sortOrder: 2,
    products: [
      { id: "rotprod_lafamilia_pizza_muzzarella", name: "Muzzarella", priceInCents: 900000, sortOrder: 1 },
      { id: "rotprod_lafamilia_pizza_napolitana", name: "Napolitana", priceInCents: 1200000, sortOrder: 2 },
      { id: "rotprod_lafamilia_pizza_fugazza", name: "Fugazza", priceInCents: 1100000, sortOrder: 3 },
      { id: "rotprod_lafamilia_pizza_provenzal", name: "Provenzal", priceInCents: 1100000, sortOrder: 4 },
      { id: "rotprod_lafamilia_pizza_jamon_huevo", name: "Jamón y huevo", priceInCents: 1250000, sortOrder: 5 },
      { id: "rotprod_lafamilia_pizza_a_caballo", name: "A caballo", priceInCents: 1500000, sortOrder: 6 },
      { id: "rotprod_lafamilia_pizza_alemana", name: "Alemana", priceInCents: 1500000, sortOrder: 7 },
    ],
  },
  {
    id: "rotcat_lafamilia_empanadas",
    name: "Empanadas",
    sortOrder: 3,
    products: [
      {
        id: "rotprod_lafamilia_empanada_unidad",
        name: "Empanada (unidad)",
        description: "Jamón y queso, verdura, choclo, cebolla y queso (consultar stock).",
        priceInCents: 250000,
        sortOrder: 1,
      },
      { id: "rotprod_lafamilia_empanadas_media_docena", name: "Media docena (6)", priceInCents: 1500000, sortOrder: 2 },
      { id: "rotprod_lafamilia_empanadas_docena", name: "Docena (12)", priceInCents: 2800000, sortOrder: 3 },
    ],
  },
  {
    id: "rotcat_lafamilia_hamburguesas",
    name: "Hamburguesas",
    sortOrder: 4,
    products: [
      { id: "rotprod_lafamilia_hamb_completa", name: "Completa", description: "Sale con papas.", priceInCents: 1050000, sortOrder: 1 },
      { id: "rotprod_lafamilia_hamb_doble_carne", name: "Doble carne", description: "Sale con papas.", priceInCents: 1250000, sortOrder: 2 },
      { id: "rotprod_lafamilia_hamb_doble_cheddar", name: "Doble cheddar", description: "Sale con papas.", priceInCents: 1450000, sortOrder: 3 },
    ],
  },
  {
    id: "rotcat_lafamilia_hamburpizza",
    name: "Hamburpizza",
    sortOrder: 5,
    products: [
      { id: "rotprod_lafamilia_hamburpizza", name: "Hamburpizza", description: "Sale con papas. Rinde dos personas.", priceInCents: 2800000, sortOrder: 1 },
      { id: "rotprod_lafamilia_media_hamburpizza", name: "1/2 Hamburpizza", description: "Sale con papas.", priceInCents: 1800000, sortOrder: 2 },
    ],
  },
  {
    id: "rotcat_lafamilia_tartas",
    name: "Tartas",
    sortOrder: 6,
    products: [
      { id: "rotprod_lafamilia_tarta_jamon_queso", name: "Jamón y queso", description: "Consultar stock.", priceInCents: 1000000, sortOrder: 1 },
      { id: "rotprod_lafamilia_tarta_verdura", name: "Verdura", description: "Consultar stock.", priceInCents: 900000, sortOrder: 2 },
      { id: "rotprod_lafamilia_media_tarta", name: "1/2 tarta", priceInCents: 600000, sortOrder: 3 },
      { id: "rotprod_lafamilia_mini_tarta", name: "Mini tarta", priceInCents: 300000, sortOrder: 4 },
    ],
  },
  {
    id: "rotcat_lafamilia_comida_plato",
    name: "Comida al plato",
    sortOrder: 7,
    products: [
      { id: "rotprod_lafamilia_tortilla_simple", name: "Tortilla de papa simple", priceInCents: 700000, sortOrder: 1 },
      { id: "rotprod_lafamilia_tortilla_rellena", name: "Tortilla de papa rellena", priceInCents: 900000, sortOrder: 2 },
    ],
  },
  {
    id: "rotcat_lafamilia_pastas",
    name: "Pastas",
    sortOrder: 8,
    products: [
      { id: "rotprod_lafamilia_tallarines", name: "Tallarines caseros al huevo", description: "Salsas: fileto, blanca o bolognesa.", priceInCents: 700000, sortOrder: 1 },
      { id: "rotprod_lafamilia_ravioles", name: "Ravioles de verdura", description: "Salsas: fileto, blanca o bolognesa.", priceInCents: 700000, sortOrder: 2 },
      { id: "rotprod_lafamilia_noquis", name: "Ñoquis", description: "Salsas: fileto, blanca o bolognesa.", priceInCents: 700000, sortOrder: 3 },
      { id: "rotprod_lafamilia_sorrentinos", name: "Sorrentinos", description: "Salsas: fileto, blanca o bolognesa.", priceInCents: 700000, sortOrder: 4 },
    ],
  },
  {
    id: "rotcat_lafamilia_papas",
    name: "Papas",
    sortOrder: 9,
    products: [
      { id: "rotprod_lafamilia_papas_fritas", name: "Papas fritas", priceInCents: 500000, sortOrder: 1 },
      { id: "rotprod_lafamilia_papas_cheddar_verdeo", name: "Papas con cheddar y verdeo", priceInCents: 700000, sortOrder: 2 },
    ],
  },
];

async function seedRotisserie() {
  await prisma.tenant.upsert({
    where: { slug: rotisserieTenant.slug },
    update: {},
    create: {
      id: rotisserieTenant.id,
      slug: rotisserieTenant.slug,
      name: rotisserieTenant.name,
    },
  });

  for (const category of rotisserieCatalog) {
    await prisma.rotisserieCategory.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        tenantId: rotisserieTenant.id,
        name: category.name,
        sortOrder: category.sortOrder,
      },
    });

    for (const product of category.products) {
      await prisma.rotisserieProduct.upsert({
        where: { id: product.id },
        update: {},
        create: {
          id: product.id,
          tenantId: rotisserieTenant.id,
          categoryId: category.id,
          name: product.name,
          description: product.description,
          priceInCents: product.priceInCents,
          sortOrder: product.sortOrder,
        },
      });
    }
  }
}

const yoni247Tenant = {
  id: "tenant_yoni247_001",
  slug: "yoni247",
  name: "Yoni 24/7",
};

// Carta relevada jul 2026 (precios en centavos de ARS). El cliente avisó que están desactualizados.
const yoni247Catalog = [
  {
    id: "rotcat_yoni247_pizzas",
    name: "Pizzas",
    sortOrder: 1,
    products: [
      { id: "rotprod_yoni247_pizza_muzza", name: "Pizza muzza", priceInCents: 750000, sortOrder: 1 },
      { id: "rotprod_yoni247_pizza_napolitana", name: "Pizza napolitana", priceInCents: 1200000, sortOrder: 2 },
      { id: "rotprod_yoni247_pizza_primavera", name: "Pizza primavera", priceInCents: 1200000, sortOrder: 3 },
      { id: "rotprod_yoni247_pizza_caballo", name: "Pizza caballo", priceInCents: 1500000, sortOrder: 4 },
      { id: "rotprod_yoni247_pizza_calabaza", name: "Pizza calabresa", priceInCents: 1400000, sortOrder: 5 },
      { id: "rotprod_yoni247_pizza_jamon_morron", name: "Pizza jamón morrón", priceInCents: 1400000, sortOrder: 6 },
    ],
  },
  {
    id: "rotcat_yoni247_hamb_milas",
    name: "Hamburguesas y Milanesas",
    sortOrder: 2,
    products: [
      { id: "rotprod_yoni247_hamb_completa", name: "Hamburguesa completa", description: "Sale con papas.", priceInCents: 750000, sortOrder: 1 },
      { id: "rotprod_yoni247_sandwid_mila_completa", name: "Sandwid Mila completa", description: "Sale con papas.", priceInCents: 950000, sortOrder: 2 },
      { id: "rotprod_yoni247_mila_napo", name: "Mila Napo", description: "Sale con papas.", priceInCents: 1000000, sortOrder: 3 },
      { id: "rotprod_yoni247_primo_muzza", name: "Promo muzza", description: "Sale con papas.", priceInCents: 1400000, sortOrder: 4 },
      { id: "rotprod_yoni247_mila_napo_dos", name: "Mila Napo para dos", priceInCents: 1500000, sortOrder: 5 },
    ],
  },
  {
    id: "rotcat_yoni247_papas",
    name: "Papas",
    sortOrder: 3,
    products: [
      { id: "rotprod_yoni247_bandeja_papas", name: "Bandeja de papas", priceInCents: 750000, sortOrder: 1 },
      { id: "rotprod_yoni247_bandeja_papas_cheddar", name: "Bandeja papas con cheddar", priceInCents: 900000, sortOrder: 2 },
      { id: "rotprod_yoni247_bandeja_papas_panceta", name: "Bandeja papas panceta verdeo cheddar", priceInCents: 1300000, sortOrder: 3 },
      { id: "rotprod_yoni247_salchipapas", name: "Bandeja de salchipapas", priceInCents: 1200000, sortOrder: 4 },
    ],
  },
];

async function seedYoni247() {
  await prisma.tenant.upsert({
    where: { slug: yoni247Tenant.slug },
    update: {},
    create: {
      id: yoni247Tenant.id,
      slug: yoni247Tenant.slug,
      name: yoni247Tenant.name,
    },
  });

  for (const category of yoni247Catalog) {
    await prisma.rotisserieCategory.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        tenantId: yoni247Tenant.id,
        name: category.name,
        sortOrder: category.sortOrder,
      },
    });

    for (const product of category.products) {
      await prisma.rotisserieProduct.upsert({
        where: { id: product.id },
        update: {
          categoryId: category.id,
          name: product.name,
          description: product.description,
          priceInCents: product.priceInCents,
          sortOrder: product.sortOrder,
        },
        create: {
          id: product.id,
          tenantId: yoni247Tenant.id,
          categoryId: category.id,
          name: product.name,
          description: product.description,
          priceInCents: product.priceInCents,
          sortOrder: product.sortOrder,
        },
      });
    }
  }
}

async function main() {
  for (const tenant of tenants) {
    await prisma.tenant.upsert({
      where: { slug: tenant.slug },
      update: {},
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

    const barbershopSettings = barbershopSettingsBySlug[tenant.slug];

    if (barbershopSettings) {
      await prisma.barbershopTenantSettings.upsert({
        where: { tenantId: tenant.id },
        update: {},
        create: {
          tenantId: tenant.id,
          publicName: barbershopSettings.publicName,
          description: barbershopSettings.description,
          phone: barbershopSettings.phone,
          weeklySchedule: barbershopSettings.weeklySchedule,
          expressSlots: barbershopSettings.expressSlots,
        },
      });
    }
  }

  await seedRotisserie();
  await seedYoni247();
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