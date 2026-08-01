# Contexto del agente para el monolito modular

> Este documento reemplaza a `.cursor/rules/tenant-provisioning.mdc` como instrucciones de contexto para agentes de IA en este proyecto.

## Safe Tenant Provisioning

- Tenant creation must be non-destructive by default.
- It is acceptable to add new tenants to `prisma/seed.js` when the seed uses create-only behavior for existing records.
- Use `upsert` with `update: {}` or explicit skip logic for existing tenants/settings.
- Seeds should:
  - create the tenant if it does not exist;
  - create module settings if they do not exist;
  - skip updates when records already exist unless the user explicitly asks to migrate or overwrite.
- Do not overwrite another tenant's `BarbershopTenantSettings`, integrations, auth, schedules, phone, branding, or business configuration while creating a new tenant.
- Use dedicated migration/provisioning scripts only when a change needs custom production behavior that should not live in the general seed.
- Domain-to-tenant routing belongs in `src/app/publicTenantHosts.ts`, not in one-off helpers per tenant.
