import Link from "next/link";

const realTenants = [
  {
    slug: "mgbarber",
    name: "MG Barber",
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

export default function HomePage(): React.JSX.Element {
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
            <Link className="button" href="/crown/barbershop">
              Ver demo tenant
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