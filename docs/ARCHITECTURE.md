# Arquitectura actual

Un proceso Next.js, un `PrismaClient` y una base PostgreSQL. Los módulos no tienen base ni deploy propios. La separación es de carpetas y de quién puede importar a quién.

## Mapa

```text
src/app/                  shell: páginas, layouts, route handlers, server actions
  publicTenantHosts.ts    dominio público → slug y vertical
  page.tsx                home de plataforma, o el sitio del tenant si el host matchea
  platform/               panel de plataforma: directorio de tenants y componentes (Tailwind)
  platform/               panel de plataforma: directorio de tenants y componentes (Tailwind)
  admin/                  login y paneles (barbería y rotisería)
  api/barbershop/         alta de turno y Mercado Pago
  api/rotisserie/orders/  alta de pedido
  [tenantSlug]/           páginas por slug
src/modules/barbershop/   turnos
src/modules/rotisserie/   carta y pedidos
src/modules/integrations/ tipos de config WhatsApp y Mercado Pago
src/core/                 tenancy, Prisma, notificaciones y crypto
prisma/                   schema, migraciones, seed
scripts/                  provisioning puntual (no corre en el request path)
```

No existen los route groups `(public)` / `(tenant)`, ni `src/app/api/gym`, ni `src/app/api/core`. Esas carpetas estaban en una guía anterior y no se implementaron.

Dentro de un módulo vertical la intención es:

- `domain`: entidades, value objects, contratos de repositorio. Sin Next, Prisma ni `fetch`.
- `application`: casos de uso (`*Service`) y DTOs (`Command` / `Query`).
- `interface/http`: controllers y validación del body.
- `infra`: repositorios Prisma, composición (`infra/container/build*`) y settings.

`src/app` debería limitarse a traducir HTTP/UI. En la práctica también concentra el admin, Mercado Pago y parte del cableado de tenant. Ver excepciones abajo.

## Dependencias

Dirección esperada: `app` → `interface` / `container` → `application` → `domain`, e `infra` implementa contratos del dominio.

`core` puede usarlo cualquier módulo. Un módulo vertical no debe importar el dominio de otro. `modules/integrations` lo usan los containers y las rutas de pago; no es un vertical.

Composición manual, sin contenedor de DI: `buildCreateBarbershopAppointmentController`, `buildCreateOrderController`, `buildGetCatalogService`, etc. Crean repositorios Prisma y el `NotificationSender` del tenant.

Imports relativos. `tsconfig.json` no define `paths`.

## Flujos que existen

**Turno**

1. La página arma el perfil con `GetBarbershopSiteProfileService` (slots del día, servicios fijos).
2. El formulario hace `POST /api/barbershop/appointments` con `tenantId` en el body.
3. Rate limit en memoria (10 pedidos / 60 s por IP).
4. `CreateBarbershopAppointmentController` → `CreateBarbershopAppointmentService`.
5. El servicio reutiliza o crea `BarbershopCustomer` por teléfono, rechaza el slot si ese `barberId` ya lo tiene, persiste y dispara WhatsApp. Si WhatsApp falla, el turno queda creado.

**Pedido**

1. `/{slug}/rotisserie/carta` (o `/` en el dominio del tenant) carga el catálogo disponible.
2. `POST /api/rotisserie/orders` exige `tenantSlug`. El servidor resuelve `tenantId`. El id del body no se usa como fuente de verdad.
3. `CreateOrderService` valida teléfono AR, productos disponibles y stock, suma el envío si es delivery, persiste y notifica. Si la notificación falla, el pedido queda creado.

**Pago de turno (Mercado Pago)**

Vive en route handlers, no en un caso de uso:

- `GET /api/barbershop/payments/config` — public key
- `POST /api/barbershop/payments` — cobro con el token del Brick
- `POST /api/barbershop/payments/preference` — Checkout Pro
- `POST /api/barbershop/payments/webhook` — actualiza `paymentStatus`

El turno se crea antes, con `paymentStatus = pending` si el medio es Mercado Pago.

## Multi-tenant

Tabla `tenants`. El resto de las tablas de negocio llevan `tenantId` (ítems de pedido también).

Resolución:

- Por host: `resolvePublicTenantByHost` en `src/app/publicTenantHosts.ts`.
- Por slug de URL: `resolveTenantContextBySlug` lee `tenants` y devuelve `{ tenantId, tenantSlug }`.
- `TenantContext` es solo esa pareja. No hay middleware de tenant ni usuario de request.

Hosts declarados hoy: `mgbarber`, `rufianbarbershop`, `lafamilia` (`lafamiliaroti.com`), `yoni247`. `next.config.js` repite los hosts de La Familia y de Yoni para rewrites (`/privacy`, `/terms`, `/order/:id`) y para redirigir `/{slug}/...` a `/` en ese dominio.

En un host público, `/` renderiza la vertical de ese tenant y el layout oculta la navegación de la plataforma (`Shell`).

## Datos

Un datasource Prisma (`DATABASE_URL`). Modelos: `Tenant`, settings y turnos/clientes de barbería, `TenantAuth`, `TenantIntegration`, catálogo y pedidos de rotisería. Precios de rotisería y costo de envío están en centavos de ARS.

No hay tablas de usuarios, membresías, pagos ni gimnasio.

El seed (`prisma/seed.js`) crea tenants de demo (`crown`, `heritage`, `northline`), las dos barberías reales, La Familia y Yoni. Settings, categorías y productos usan `upsert` con `update: {}` (no pisan filas existentes). Los clientes de barbería del seed sí actualizan nombre y teléfono si el número ya existe.

## Autenticación

No hay usuarios finales ni sesión de cliente.

El admin es una cookie httpOnly por tenant, `admin_session_{slug}`, valor fijo `"ok"`, 12 horas. El login acepta `TenantAuth.adminPasswordHash` (negocio) o `TenantAuth.supportPasswordHash` (soporte). Al entrar, el servidor registra el slug y cuál de las dos coincidió. El formulario del panel solo reemplaza la clave del negocio, y exige la clave actual de negocio. `scripts/set-support-password.ts` carga o reemplaza la de soporte y no pisa la del negocio; si además viene `ADMIN_PASSWORD` y el negocio todavía no tiene clave, la crea. Fuera de producción, `admin-local` entra solo cuando las dos claves están vacías.

- Producción: `/admin` elige el panel según el host. Las rutas `/{slug}/.../admin` responden 404.
- Local: `/admin` redirige a MG Barber. El admin por slug sigue disponible.

Las server actions de `src/app/admin/actions.ts` revisan esa cookie antes de escribir.

## Integraciones

`TenantIntegration` es única por `(tenantId, provider)`. `provider` es el string `whatsapp` o `mercadopago`. `config` es JSON. Access token y API token se guardan cifrados (`encrypt` / `decrypt` en `src/core/crypto/crypto-utils.ts`). Hace falta `ENCRYPTION_KEY` de 32 bytes en hex para importar ese módulo.

WhatsApp sale por Graph API `v19.0`, templates `es_AR`:

- Barbería: `WebhookNotificationSender` — `barbershop_appointment_v2` al negocio y `barbershop_confirmation_v2` al cliente. Solo el primer teléfono de `recipientPhones`.
- Rotisería: `RotisserieOrderNotificationSender` — `rotisserie_new_order` a cada dueño y `rotisserie_order_received` al cliente. Sin credenciales, el pedido usa `ConsoleNotificationSender`. La Familia manda ocho variables en orden de lectura (la dirección es la cuarta) y las sanitiza igual que la nota. Yoni sigue con sus siete, en el orden de su plantilla.

Scripts de carga (no son parte del runtime): `scripts/migrate-to-tenant-integrations.ts`, `scripts/update-whatsapp-token.ts`, `scripts/provision-mgbarber-mercadopago.ts`, `scripts/provision-yoni247.ts`, `scripts/provision-lafamilia-whatsapp.ts`.

## Qué hace cada vertical

**Barbería.** Un barbero implícito por tenant: el formulario envía `barberId = "{slug}-main-barber"`. No hay entidad barbero. Servicios (corte, barba, combo), precios y el texto de horario comercial están fijos en `PrismaBarbershopSiteProfileRepository`. Lo configurable en DB es nombre público, descripción, teléfono, maps, grilla semanal y slots express. La agenda pública es solo el día en curso, zona `America/Argentina/Buenos_Aires`, con 60 minutos de anticipación (30 en slots express). Sin teléfono en settings, el sitio responde 404.

**Rotisería.** Categorías y productos por tenant, nombres normalizados únicos, visibilidad, orden y stock. `stockQuantity` null significa sin tope. El catálogo público oculta no disponibles y stock 0. `RotisserieTenantSettings` guarda el costo de envío y, para los tenants de `tenantUsesWeeklyMenu` (hoy solo `lafamilia`), un menú semanal JSON de lunes a domingo. Esa carta destaca el día actual en `America/Argentina/Buenos_Aires`. Yoni no muestra ni guarda ese menú. Pedido: retiro o delivery, efectivo o transferencia. Si no hay settings, el servicio usa 2.500 ARS (250.000 centavos) de envío. El estado al crear es `pending`.

## Excepciones a las capas

Estas piezas no siguen el camino controller → service → repository. Conviene no copiarlas al extender un módulo:

- Mercado Pago habla con Prisma y con la API desde `src/app/api/barbershop/payments`.
- El admin lee y escribe Prisma en los paneles y en las server actions.
- `CreateOrderService` lee `rotisserieTenantSettings` con Prisma, no con un repositorio.
- El perfil público de barbería lee settings con SQL crudo, no con el include de Prisma.
