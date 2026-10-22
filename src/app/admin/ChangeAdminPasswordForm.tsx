import { changeAdminPasswordAction } from "./actions";

export function ChangeAdminPasswordForm({
  tenantSlug,
  basePath,
  open = false,
}: {
  tenantSlug: string;
  basePath: string;
  open?: boolean;
}): React.JSX.Element {
  return (
    <details className="admin-password-details" {...(open ? { open: true } : {})}>
      <summary>Cambiar clave</summary>
      <form action={changeAdminPasswordAction} className="admin-form">
        <input name="tenantSlug" type="hidden" value={tenantSlug} />
        <input name="basePath" type="hidden" value={basePath} />
        <label className="booking-field">
          <span>Clave actual</span>
          <input autoComplete="current-password" name="currentPassword" required type="password" />
        </label>
        <label className="booking-field">
          <span>Clave nueva</span>
          <input autoComplete="new-password" minLength={8} name="nextPassword" required type="password" />
        </label>
        <label className="booking-field">
          <span>Repetir clave nueva</span>
          <input autoComplete="new-password" minLength={8} name="confirmPassword" required type="password" />
        </label>
        <button className="button" type="submit">
          Cambiar clave
        </button>
      </form>
    </details>
  );
}
