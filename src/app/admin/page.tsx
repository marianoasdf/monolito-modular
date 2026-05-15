import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../core/shared/infra/prisma/prismaClient";
import {
  createDefaultWeeklySchedule,
  DEFAULT_EXPRESS_BOOKING_SLOTS,
  resolveExpressSlots,
  resolveWeeklySchedule,
  WEEKDAY_FIELDS,
} from "../../modules/barbershop/infra/settings/barbershopTenantSettings";
import { loginAdminAction, logoutAdminAction, saveAdminSettingsAction } from "./actions";
import { getAdminAccessPassword, isAdminAuthenticated } from "./auth";

function getMessage(error: string | undefined): string | null {
  if (error === "invalid-password") {
    return "Clave incorrecta.";
  }

  if (error === "no-password") {
    return "Falta configurar ADMIN_ACCESS_PASSWORD en el entorno.";
  }

  if (error === "phone") {
    return "El celular admin no es valido.";
  }

  if (error === "tenant") {
    return "No se encontro el tenant mgbarber.";
  }

  if (error === "auth") {
    return "Volve a iniciar sesion.";
  }

  return null;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const query = await searchParams;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const saved = Array.isArray(query.saved) ? query.saved[0] : query.saved;
  const authenticated = await isAdminAuthenticated();
  const configuredPassword = getAdminAccessPassword();
  const message = getMessage(error);

  if (!authenticated) {
    return (
      <section className="admin-shell">
        <article className="tenant-card admin-card admin-card--compact">
          <p className="eyebrow">Admin MG Barber</p>
          <h1 className="display-title admin-title">Entrar</h1>
          <p className="lead admin-lead">Usa esta pantalla para cambiar nombre, horarios, WhatsApp y anticipacion.</p>

          {message ? <div className="booking-feedback booking-feedback--error"><strong>{message}</strong></div> : null}
          {!configuredPassword ? (
            <div className="booking-feedback booking-feedback--error">
              <strong>Configura ADMIN_ACCESS_PASSWORD antes de usar el panel.</strong>
            </div>
          ) : process.env.NODE_ENV !== "production" && configuredPassword === "admin-local" ? (
            <div className="booking-feedback booking-feedback--success">
              <strong>Clave local: admin-local</strong>
            </div>
          ) : null}

          <form action={loginAdminAction} className="admin-login-form">
            <label className="booking-field booking-field--full">
              <span className="sr-only">Clave admin</span>
              <input name="password" placeholder="Clave admin" required type="password" />
            </label>
            <button className="button booking-submit" type="submit">
              Entrar al panel
            </button>
          </form>
        </article>
      </section>
    );
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: "mgbarber" },
    include: { settings: true },
  });

  if (!tenant) {
    notFound();
  }

  const weeklySchedule = tenant.settings?.weeklySchedule
    ? resolveWeeklySchedule(tenant.settings.weeklySchedule)
    : createDefaultWeeklySchedule();
  const expressSlots = tenant.settings?.expressSlots
    ? resolveExpressSlots(tenant.settings.expressSlots)
    : [...DEFAULT_EXPRESS_BOOKING_SLOTS];

  return (
    <section className="admin-shell">
      <article className="tenant-card admin-card">
        <div className="admin-topbar">
          <div>
            <p className="eyebrow">Admin MG Barber</p>
            <h1 className="display-title admin-title">Panel rapido</h1>
          </div>

          <div className="admin-actions">
            <Link className="button-secondary" href="/mgbarber/barbershop">
              Ver sitio
            </Link>
            <form action={logoutAdminAction}>
              <button className="button-secondary" type="submit">
                Salir
              </button>
            </form>
          </div>
        </div>

        {message ? <div className="booking-feedback booking-feedback--error"><strong>{message}</strong></div> : null}
        {saved === "1" ? (
          <div className="booking-feedback booking-feedback--success">
            <strong>Cambios guardados.</strong>
          </div>
        ) : null}

        <form action={saveAdminSettingsAction} className="admin-form">
          <input name="tenantSlug" type="hidden" value="mgbarber" />

          <div className="admin-grid">
            <label className="booking-field">
              <span>Nombre publico</span>
              <input defaultValue={tenant.settings?.publicName ?? tenant.name} name="publicName" required type="text" />
            </label>

            <label className="booking-field">
              <span>WhatsApp</span>
              <input defaultValue={tenant.settings?.phone ?? "+5493454200683"} name="phone" required type="tel" />
            </label>

            <label className="booking-field booking-field--full">
              <span>Texto corto</span>
              <input
                defaultValue={tenant.settings?.description ?? "Toca un cuadrado verde y listo."}
                maxLength={120}
                name="description"
                required
                type="text"
              />
            </label>

            <label className="booking-field booking-field--full">
              <span>Horarios con 30 minutos de anticipacion</span>
              <input defaultValue={expressSlots.join(", ")} name="expressSlots" placeholder="13:00, 19:00" type="text" />
            </label>
          </div>

          <section className="admin-schedule-grid">
            {WEEKDAY_FIELDS.map(({ fieldName, label, weekday }) => (
              <label key={fieldName} className="booking-field admin-day-field">
                <span>{label}</span>
                <textarea
                  defaultValue={(weeklySchedule[weekday] ?? []).join(", ")}
                  name={fieldName}
                  placeholder="10:00, 11:00, 12:00"
                  rows={3}
                />
              </label>
            ))}
          </section>

          <div className="booking-summary booking-field--full">
            <strong>Resto de horarios</strong>
            <span>piden 1 hora de anticipacion</span>
          </div>

          <button className="button booking-submit" type="submit">
            Guardar cambios
          </button>
        </form>
      </article>
    </section>
  );
}