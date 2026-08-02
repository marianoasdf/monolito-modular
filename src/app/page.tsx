import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarbershopTenantView } from "./[tenantSlug]/barbershop/BarbershopTenantView";
import { OrderExperience } from "./[tenantSlug]/rotisserie/OrderExperience";
import { resolvePublicTenantByHost } from "./publicTenantHosts";
import { buildGetBarbershopSiteProfileService } from "../modules/barbershop/infra/container/buildGetBarbershopSiteProfileService";
import { buildGetCatalogService } from "../modules/rotisserie/infra/container/buildGetCatalogService";
import { resolveTenantContextBySlug } from "../core/tenancy/infra/resolveTenantContextBySlug";

const realTenants = [
  {
    slug: "mgbarber",
    name: "MG Barber",
    city: "Tu barbería",
    focus: "tenant real para operar y personalizar",
  },
  {
    slug: "rufianbarbershop",
    name: "Rufian Barbershop",
    city: "Tu barbería",
    focus: "tenant real para operar y personalizar",
  },
];

const demoTenants = [
  {
    slug: "crown",
    name: "Crown Barbers",
    city: "CABA",
    focus: "turnos y experiencia premium",
  },
  {
    slug: "heritage",
    name: "Heritage Cuts",
    city: "Rosario",
    focus: "equipo, membresías y recompra",
  },
  {
    slug: "northline",
    name: "Northline Studio",
    city: "Córdoba",
    focus: "operación compacta para una sucursal",
  },
];

export default async function HomePage(): Promise<React.JSX.Element> {
  const headersList = await headers();
  const host = headersList.get("host");
  const publicTenant = resolvePublicTenantByHost(host);

  if (publicTenant?.vertical === "barbershop") {
    const service = buildGetBarbershopSiteProfileService();
    const site = await service.execute({ tenantSlug: publicTenant.slug });

    if (!site) {
      notFound();
    }

    return <BarbershopTenantView site={site} />;
  }

  if (publicTenant?.vertical === "rotisserie") {
    const tenantContext = await resolveTenantContextBySlug(publicTenant.slug);
    if (!tenantContext) {
      notFound();
    }
    const catalog = await buildGetCatalogService().execute({ tenantId: tenantContext.tenantId });

    return (
      <>
        <section className="agenda-intro" style={{ marginBottom: "1.5rem" }}>
          <p className="eyebrow">Carta y pedidos</p>
          <h1 className="display-title">Hacé tu pedido</h1>
        </section>
        {catalog.length === 0 ? (
          <article className="panel" style={{ padding: "1.6rem" }}>
            <p className="muted">Todavía no hay productos cargados.</p>
          </article>
        ) : (
          <OrderExperience tenantSlug={publicTenant.slug} catalog={catalog} orderBasePath="/order" />
        )}
        <footer className="tenant-footer">
          <Link className="tenant-footer__link" href="/privacy">
            Política de privacidad
          </Link>
          <Link className="tenant-footer__link" href="/terms">
            Términos y condiciones
          </Link>
        </footer>
      </>
    );
  }

  return (
    <>
      <section className="hero">
        <article className="hero-card">
          <p className="eyebrow">Monolito modular para barberías multi-tenant</p>
          <h1 className="display-title">Una base Next.js lista para crecer sin mezclar capas.</h1>
          <p className="lead">
            Esta shell te deja avanzar con una barbería tenant-aware hoy y seguir mañana con Prisma,
            pagos y notificaciones sin tirar la estructura.
          </p>

          <div className="hero-actions">
            <Link className="button" href="/mgbarber/barbershop">
              Ver tenant real
            </Link>
            <Link className="button-secondary" href="#tenants">
              Explorar estructura
            </Link>
          </div>
        </article>

        <aside className="hero-card">
          <ul className="hero-stat-list">
            <li>
              <span className="stat-label">Shell de frontend</span>
              <span className="stat-value">Next.js App Router</span>
            </li>
            <li>
              <span className="stat-label">Aislamiento por vertical</span>
              <span className="stat-value">src/modules/barbershop</span>
            </li>
            <li>
              <span className="stat-label">Escalado futuro</span>
              <span className="stat-value">Repositorios migrables</span>
            </li>
            <li>
              <span className="stat-label">Contexto tenant</span>
              <span className="stat-value">slug y tenantId explícitos</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="section-heading" id="tenants">
        <div>
          <h2>Tenant real</h2>
          <p>Tu barbería ya puede convivir con tenants demo sin mezclarse con ellos.</p>
        </div>
      </section>

      <section className="card-grid">
        {realTenants.map((tenant) => (
          <article key={tenant.slug} className="feature-card">
            <p className="eyebrow">/{tenant.slug}/barbershop</p>
            <h3>{tenant.name}</h3>
            <p className="muted">
              {tenant.city} · foco en {tenant.focus}
            </p>
            <div className="hero-actions">
              <Link className="button" href={`/${tenant.slug}/barbershop`}>
                Abrir tenant real
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="section-heading">
        <div>
          <h2>Rotisería y viandas</h2>
          <p>Un nuevo vertical sobre la misma base modular, con su propia carta tenant-aware.</p>
        </div>
      </section>

      <section className="card-grid">
        <article className="feature-card">
          <p className="eyebrow">/lafamilia/rotisserie/carta</p>
          <h3>La Familia Rotisería y Viandas</h3>
          <p className="muted">Carta completa de viandas y rotisería, servida desde la base de datos.</p>
          <div className="hero-actions">
            <Link className="button" href="/lafamilia/rotisserie/carta">
              Ver carta
            </Link>
          </div>
        </article>
        <article className="feature-card">
          <p className="eyebrow">/yoni247/rotisserie/carta</p>
          <h3>Yoni 24/7</h3>
          <p className="muted">Rotisería con notificaciones WhatsApp automáticas al cliente y al negocio.</p>
          <div className="hero-actions">
            <Link className="button" href="/yoni247/rotisserie/carta">
              Ver carta
            </Link>
          </div>
        </article>
      </section>

      <section className="section-heading">
        <div>
          <h2>Tenants demo</h2>
          <p>Cada tenant puede tener branding, servicios y disponibilidad distinta sin salir del mismo código.</p>
        </div>
      </section>

      <section className="card-grid">
        {demoTenants.map((tenant) => (
          <article key={tenant.slug} className="feature-card">
            <p className="eyebrow">/{tenant.slug}/barbershop</p>
            <h3>{tenant.name}</h3>
            <p className="muted">
              {tenant.city} · foco en {tenant.focus}
            </p>
            <div className="hero-actions">
              <Link className="button" href={`/${tenant.slug}/barbershop`}>
                Abrir tenant
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="section-heading">
        <div>
          <h2>Cómo queda ordenado</h2>
          <p>La UI llama a servicios del módulo; los servicios llaman a contratos; la persistencia sigue reemplazable.</p>
        </div>
      </section>

      <section className="feature-strip">
        <article className="feature-card">
          <h3>app como shell</h3>
          <p className="muted">Rutas, layouts y composición visual. Sin reglas de negocio fuertes.</p>
        </article>
        <article className="feature-card">
          <h3>módulo barbería</h3>
          <p className="muted">Turnos, servicios, slots y contenido comercial viven dentro de su vertical.</p>
        </article>
        <article className="feature-card">
          <h3>core compartido</h3>
          <p className="muted">Usuarios, pagos, notificaciones y tenancy siguen reutilizables para otros SaaS.</p>
        </article>
      </section>
    </>
  );
}