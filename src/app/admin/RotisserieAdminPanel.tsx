import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../core/shared/infra/prisma/prismaClient";
import { loginAdminAction, logoutAdminAction, saveRotisserieAdminAction } from "./actions";
import { isAdminAuthenticated } from "./auth";

type AdminQuery = Record<string, string | string[] | undefined>;

function formatArs(priceInCents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInCents / 100);
}

function readQuery(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function RotisserieAdminPanel({
  tenantSlug,
  basePath,
  query,
}: {
  tenantSlug: string;
  basePath: string;
  query: AdminQuery;
}): Promise<React.JSX.Element> {
  const authenticated = await isAdminAuthenticated(tenantSlug);
  const error = readQuery(query.error);
  const saved = readQuery(query.saved);

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: {
      rotisserieSettings: true,
      rotisserieProducts: {
        include: { category: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  const productsByCategory = tenant.rotisserieProducts.reduce(
    (groups, product) => {
      const current = groups.get(product.category.id) ?? {
        id: product.category.id,
        name: product.category.name,
        products: [],
      };
      current.products.push(product);
      groups.set(product.category.id, current);
      return groups;
    },
    new Map<
      string,
      {
        id: string;
        name: string;
        products: typeof tenant.rotisserieProducts;
      }
    >(),
  );
  const productCategories = [...productsByCategory.values()];

  if (!authenticated) {
    return (
      <section className="admin-shell">
        <article className="tenant-card admin-card admin-card--compact">
          <p className="eyebrow">Admin {tenant.name}</p>
          <h1 className="display-title admin-title">Entrar</h1>
          <p className="lead admin-lead">Controlá stock, precios y valor de envío.</p>
          {error === "invalid-password" ? <div className="booking-feedback booking-feedback--error"><strong>Clave incorrecta.</strong></div> : null}
          {process.env.NODE_ENV !== "production" ? <div className="booking-feedback booking-feedback--success"><strong>Clave local: admin-local</strong></div> : null}
          <form action={loginAdminAction} className="admin-login-form">
            <input name="basePath" type="hidden" value={basePath} />
            <input name="tenantSlug" type="hidden" value={tenantSlug} />
            <input aria-hidden="true" autoComplete="username" defaultValue={`${tenantSlug}-admin`} name="username" readOnly tabIndex={-1} type="text" style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />
            <label className="booking-field booking-field--full">
              <span className="sr-only">Clave admin</span>
              <input autoComplete="current-password" name="password" placeholder="Clave admin" required type="password" />
            </label>
            <button className="button booking-submit" type="submit">Entrar al panel</button>
          </form>
        </article>
      </section>
    );
  }

  return (
    <section className="admin-shell">
      <article className="tenant-card admin-card">
        <div className="admin-topbar">
          <div>
            <p className="eyebrow">Admin {tenant.name}</p>
            <h1 className="display-title admin-title">Rotisería</h1>
          </div>
          <div className="admin-actions">
            <Link className="button-secondary" href={basePath === "/admin" ? "/" : `/${tenantSlug}/rotisserie/carta`}>Ver carta</Link>
            <form action={logoutAdminAction}>
              <input name="basePath" type="hidden" value={basePath} />
              <input name="tenantSlug" type="hidden" value={tenantSlug} />
              <button className="button" type="submit">Salir</button>
            </form>
          </div>
        </div>

        {error === "auth" ? <div className="booking-feedback booking-feedback--error"><strong>Volvé a iniciar sesión.</strong></div> : null}
        {saved === "1" ? <div className="booking-feedback booking-feedback--success"><strong>Cambios guardados.</strong></div> : null}

        <form action={saveRotisserieAdminAction} className="admin-form">
          <input name="tenantSlug" type="hidden" value={tenantSlug} />
          <input name="basePath" type="hidden" value={basePath} />

          <label className="booking-field">
            <span>Valor de envío</span>
            <input name="deliveryFeeInPesos" type="number" min="0" step="100" defaultValue={(tenant.rotisserieSettings?.deliveryFeeInCents ?? 250000) / 100} />
          </label>

          <section className="admin-appointments">
            <h2 className="admin-section-title">Productos</h2>
            <div className="rotisserie-admin-category-list">
              {productCategories.map((category) => (
                <article key={category.id} className="rotisserie-admin-category">
                  <h3>{category.name}</h3>
                  <div className="admin-appointments-list">
                    {category.products.map((product) => (
                      <div key={product.id} className="admin-appointment-card rotisserie-admin-product-card">
                        <div className="admin-appointment-info">
                          <strong>{product.name}</strong>
                          <span>{formatArs(product.priceInCents)}</span>
                        </div>
                        <input name={`productId:${product.id}`} type="hidden" value={product.id} />
                        <label className="booking-field">
                          <span>Precio</span>
                          <input name={`price:${product.id}`} type="number" min="0" step="100" defaultValue={product.priceInCents / 100} />
                        </label>
                        <label className="booking-field">
                          <span>Stock</span>
                          <input name={`stock:${product.id}`} type="number" min="0" placeholder="Sin límite" defaultValue={product.stockQuantity ?? ""} />
                        </label>
                        <label className="booking-field">
                          <span>Disponible</span>
                          <select name={`available:${product.id}`} defaultValue={product.isAvailable ? "yes" : "no"}>
                            <option value="yes">Sí</option>
                            <option value="no">No</option>
                          </select>
                        </label>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <button className="button booking-submit" type="submit">Guardar cambios</button>
        </form>
      </article>
    </section>
  );
}
