import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../core/shared/infra/prisma/prismaClient";
import {
  resolveWeeklyMenu,
  rotisserieSettingsSelect,
  tenantUsesWeeklyMenu,
  WEEKLY_MENU_DAYS,
} from "../../modules/rotisserie/infra/settings/rotisserieWeeklyMenu";
import { AdminItemActions } from "./AdminItemActions";
import { ChangeAdminPasswordForm } from "./ChangeAdminPasswordForm";
import {
  createRotisserieCategoryAction,
  createRotisserieProductAction,
  deleteRotisserieCategoryAction,
  deleteRotisserieProductAction,
  loginAdminAction,
  logoutAdminAction,
  moveRotisserieProductAction,
  reorderRotisserieCategoryAction,
  reorderRotisserieProductAction,
  saveRotisserieAdminAction,
  toggleRotisserieCategoryVisibilityAction,
  toggleRotisserieProductVisibilityAction,
} from "./actions";
import { isAdminAuthenticated } from "./auth";

type AdminQuery = Record<string, string | string[] | undefined>;

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
  const moved = readQuery(query.moved);
  const passwordSaved = readQuery(query.password);

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: {
      auth: { select: { adminPasswordHash: true, supportPasswordHash: true } },
      rotisserieSettings: {
        select: rotisserieSettingsSelect(tenantSlug),
      },
      rotisserieCategories: {
        include: {
          products: {
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  const productCategories = tenant.rotisserieCategories;
  const usesWeeklyMenu = tenantUsesWeeklyMenu(tenantSlug);
  const weeklyMenu = usesWeeklyMenu
    ? resolveWeeklyMenu(tenant.rotisserieSettings?.weeklyMenu)
    : null;
  const errorMessages: Record<string, string> = {
    "category-limit": "No podés crear más de 30 categorías en la carta.",
    "category-not-empty": "No se puede eliminar una categoría con productos. Primero mové o eliminá sus productos.",
    "category-product-limit": "No podés crear más de 50 productos en una misma categoría.",
    "duplicate-catalog-name": "Ya existe un producto o una categoría con ese nombre.",
    "invalid-amount": "Revisá precios, stock y valor de envío. Usá números como 2500 o 7.500.",
    "product-limit": "No podés tener más de 300 productos en la carta.",
    "weekly-menu-too-long": "Cada día del menú semanal puede tener hasta 500 caracteres.",
    save: "No se pudieron guardar los cambios. Probá de nuevo.",
    "password-wrong": "La clave actual no coincide.",
    "password-short": "La clave nueva tiene que tener al menos 8 caracteres.",
    "password-mismatch": "La clave nueva y la repetición no coinciden.",
    "password-missing": "Este negocio todavía no tiene una clave propia. Se carga con el script de alta.",
  };

  if (!authenticated) {
    return (
      <section className="admin-shell">
        <article className="tenant-card admin-card admin-card--compact">
          <p className="eyebrow">Admin {tenant.name}</p>
          <h1 className="display-title admin-title">Entrar</h1>
          <p className="lead admin-lead">Controlá stock, precios y valor de envío.</p>
          {error === "invalid-password" ? <div className="booking-feedback booking-feedback--error"><strong>Clave incorrecta.</strong></div> : null}
          {process.env.NODE_ENV !== "production" && !tenant.auth?.adminPasswordHash && !tenant.auth?.supportPasswordHash ? <div className="booking-feedback booking-feedback--success"><strong>Clave local: admin-local</strong></div> : null}
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
        {error && errorMessages[error] ? <div className="booking-feedback booking-feedback--error"><strong>{errorMessages[error]}</strong></div> : null}
        {saved === "1" ? <div className="booking-feedback booking-feedback--success"><strong>Cambios guardados.</strong></div> : null}
        {passwordSaved === "1" ? <div className="booking-feedback booking-feedback--success"><strong>Clave actualizada.</strong></div> : null}
        {moved ? <div className="booking-feedback booking-feedback--success"><strong>{`Producto movido a ${moved}.`}</strong></div> : null}

        <form action={saveRotisserieAdminAction} className="admin-form">
          <input name="tenantSlug" type="hidden" value={tenantSlug} />
          <input name="basePath" type="hidden" value={basePath} />

          <label className="booking-field">
            <span>Valor de envío</span>
            <input name="deliveryFeeInPesos" inputMode="decimal" defaultValue={(tenant.rotisserieSettings?.deliveryFeeInCents ?? 250000) / 100} />
          </label>

          {weeklyMenu ? (
            <section className="admin-appointments">
              <h2 className="admin-section-title">Menú semanal</h2>
              <p className="muted">Escribí el plato de cada día. Los días vacíos se mostrarán como “Consultar”.</p>
              <div className="admin-grid">
                {WEEKLY_MENU_DAYS.map(({ key, label, fieldName }) => (
                  <label className="booking-field admin-day-field" key={key}>
                    <span>{label}</span>
                    <textarea
                      defaultValue={weeklyMenu[key]}
                      maxLength={500}
                      name={fieldName}
                      placeholder="Ej.: Pollo al horno con papas y ensalada"
                      rows={3}
                    />
                  </label>
                ))}
              </div>
            </section>
          ) : null}

          <section className="admin-appointments">
            <h2 className="admin-section-title">Categorías y productos</h2>
            <div className="rotisserie-admin-category-list">
              {productCategories.map((category, categoryIndex) => (
                <article key={category.id} className="rotisserie-admin-category">
                  <input name={`categoryId:${category.id}`} type="hidden" value={category.id} />
                  <div className="rotisserie-admin-item rotisserie-admin-item--category">
                    <div className="rotisserie-admin-item-header">
                      <div className="rotisserie-admin-item-title">
                        <input
                          aria-label="Nombre de la categoría"
                          className="rotisserie-admin-title-input"
                          defaultValue={category.name}
                          maxLength={120}
                          name={`categoryName:${category.id}`}
                          required
                          type="text"
                        />
                        <span>{category._count.products === 1 ? "1 producto" : `${category._count.products} productos`}</span>
                      </div>
                      <div className="rotisserie-admin-item-actions">
                        <input name={`categorySort:${category.id}`} type="hidden" value={category.sortOrder} />
                        <div className="rotisserie-admin-reorder">
                          <button
                            aria-label="Subir categoría"
                            disabled={categoryIndex === 0}
                            formAction={reorderRotisserieCategoryAction.bind(null, category.id, "up")}
                            type="submit"
                          >
                            ↑
                          </button>
                          <button
                            aria-label="Bajar categoría"
                            disabled={categoryIndex === productCategories.length - 1}
                            formAction={reorderRotisserieCategoryAction.bind(null, category.id, "down")}
                            type="submit"
                          >
                            ↓
                          </button>
                        </div>
                        <span className="rotisserie-admin-switch-label">Visible en carta</span>
                        <input name={`categoryAvailable:${category.id}`} type="hidden" value={category.isAvailable ? "yes" : "no"} />
                        <button
                          aria-pressed={category.isAvailable}
                          className={`rotisserie-admin-switch ${category.isAvailable ? "rotisserie-admin-switch--on" : ""}`}
                          formAction={toggleRotisserieCategoryVisibilityAction.bind(null, category.id)}
                          type="submit"
                        >
                          <span>{category.isAvailable ? "Sí" : "No"}</span>
                        </button>
                        <AdminItemActions
                          deleteAction={deleteRotisserieCategoryAction.bind(null, category.id)}
                          deleteBlockedReason={category._count.products > 0 ? "Esta categoría todavía tiene productos. Primero movélos o eliminálos." : undefined}
                          deleteMessage="Se elimina la categoría de la carta."
                          deleteWarning="Esta acción no se puede deshacer."
                          itemLabel="categoría"
                          itemName={category.name}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="admin-appointments-list">
                    {category.products.map((product, productIndex) => (
                      <div key={product.id} className="rotisserie-admin-item">
                        <div className="rotisserie-admin-item-header">
                          <div className="rotisserie-admin-item-title">
                            <input
                              aria-label="Nombre del producto"
                              className="rotisserie-admin-title-input"
                              defaultValue={product.name}
                              maxLength={160}
                              name={`name:${product.id}`}
                              required
                              type="text"
                            />
                            <div className="rotisserie-admin-title-meta">
                              <div className="rotisserie-admin-price">
                                <span>$</span>
                                <input
                                  aria-label="Precio"
                                  defaultValue={product.priceInCents / 100}
                                  inputMode="decimal"
                                  name={`price:${product.id}`}
                                />
                              </div>
                              <span className="rotisserie-admin-meta-sep">·</span>
                              <div className="rotisserie-admin-inline-field" title="Vacío = sin límite de stock">
                                <input
                                  aria-label="Stock"
                                  defaultValue={product.stockQuantity ?? ""}
                                  inputMode="numeric"
                                  name={`stock:${product.id}`}
                                  placeholder="∞"
                                />
                                <span>en stock</span>
                              </div>
                              {product.stockQuantity === 0 ? <span className="rotisserie-admin-chip">Sin stock</span> : null}
                            </div>
                          </div>
                          <div className="rotisserie-admin-item-actions">
                            <input name={`sort:${product.id}`} type="hidden" value={product.sortOrder} />
                            <div className="rotisserie-admin-reorder">
                              <button
                                aria-label="Subir producto"
                                disabled={productIndex === 0}
                                formAction={reorderRotisserieProductAction.bind(null, product.id, "up")}
                                type="submit"
                              >
                                ↑
                              </button>
                              <button
                                aria-label="Bajar producto"
                                disabled={productIndex === category.products.length - 1}
                                formAction={reorderRotisserieProductAction.bind(null, product.id, "down")}
                                type="submit"
                              >
                                ↓
                              </button>
                            </div>
                            <span className="rotisserie-admin-switch-label">Visible en carta</span>
                            <input name={`available:${product.id}`} type="hidden" value={product.isAvailable ? "yes" : "no"} />
                            <button
                              aria-pressed={product.isAvailable}
                              className={`rotisserie-admin-switch ${product.isAvailable ? "rotisserie-admin-switch--on" : ""}`}
                              formAction={toggleRotisserieProductVisibilityAction.bind(null, product.id)}
                              type="submit"
                            >
                              <span>{product.isAvailable ? "Sí" : "No"}</span>
                            </button>
                            <AdminItemActions
                              deleteAction={deleteRotisserieProductAction.bind(null, product.id)}
                              deleteMessage="Perdés el precio y el stock configurados."
                              deleteWarning="Esta acción no se puede deshacer."
                              itemLabel="producto"
                              itemName={product.name}
                              move={{
                                action: moveRotisserieProductAction.bind(null, product.id),
                                currentId: product.categoryId,
                                fieldName: `moveCategory:${product.id}`,
                                options: productCategories.map((option) => ({ id: option.id, name: option.name })),
                              }}
                            />
                          </div>
                        </div>
                        <input name={`productId:${product.id}`} type="hidden" value={product.id} />
                        <input name={`category:${product.id}`} type="hidden" value={product.categoryId} />
                        <div className="rotisserie-admin-fields">
                          <label className="booking-field rotisserie-admin-field--wide">
                            <span>Descripción</span>
                            <input name={`description:${product.id}`} type="text" maxLength={240} defaultValue={product.description ?? ""} />
                          </label>
                        </div>
                      </div>
                    ))}
                    <div className="rotisserie-admin-item rotisserie-admin-item--new" key={`new-product-${category.id}-${category.products.length}`}>
                      <div className="rotisserie-admin-item-header">
                        <div className="rotisserie-admin-item-title">
                          <input
                            aria-label="Nombre del producto"
                            autoComplete="off"
                            className="rotisserie-admin-title-input"
                            defaultValue=""
                            maxLength={160}
                            name={`newProductName:${category.id}`}
                            placeholder="Nuevo producto"
                            type="text"
                          />
                          <div className="rotisserie-admin-title-meta">
                            <div className="rotisserie-admin-price">
                              <span>$</span>
                              <input aria-label="Precio" autoComplete="off" defaultValue="" inputMode="decimal" name={`newProductPrice:${category.id}`} />
                            </div>
                            <span className="rotisserie-admin-meta-sep">·</span>
                            <div className="rotisserie-admin-inline-field" title="Vacío = sin límite de stock">
                              <input aria-label="Stock" autoComplete="off" defaultValue="" inputMode="numeric" name={`newProductStock:${category.id}`} placeholder="∞" />
                              <span>en stock</span>
                            </div>
                          </div>
                        </div>
                        <div className="rotisserie-admin-item-actions">
                          <button
                            className="button rotisserie-admin-add-button"
                            formAction={createRotisserieProductAction.bind(null, category.id)}
                            type="submit"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                      <div className="rotisserie-admin-fields">
                        <label className="booking-field rotisserie-admin-field--wide">
                          <span>Descripción</span>
                          <input autoComplete="off" defaultValue="" name={`newProductDescription:${category.id}`} type="text" maxLength={240} />
                        </label>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              <article className="rotisserie-admin-category" key={`new-category-${productCategories.length}`}>
                <div className="rotisserie-admin-item rotisserie-admin-item--new">
                  <input name="newCategorySort" type="hidden" value={productCategories.length + 1} />
                  <div className="rotisserie-admin-item-header">
                    <div className="rotisserie-admin-item-title">
                      <input
                        aria-label="Nombre de la categoría"
                        autoComplete="off"
                        className="rotisserie-admin-title-input"
                        defaultValue=""
                        maxLength={120}
                        name="newCategoryName"
                        placeholder="Nueva categoría"
                        type="text"
                      />
                    </div>
                    <div className="rotisserie-admin-item-actions">
                      <button
                        className="button rotisserie-admin-add-button"
                        formAction={createRotisserieCategoryAction}
                        type="submit"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <button className="button booking-submit" type="submit">Guardar cambios</button>
        </form>

        <ChangeAdminPasswordForm
          basePath={basePath}
          open={Boolean(error?.startsWith("password-"))}
          tenantSlug={tenantSlug}
        />
      </article>
    </section>
  );
}
