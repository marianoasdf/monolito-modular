# Decisiones técnicas

Solo lo que el código ya hace. No es una lista de mejoras.

## Un monolito y una base

Un deploy Next.js y un `DATABASE_URL`. El aislamiento entre negocios es `tenantId` en las filas, no un schema ni una base por tenant. Los repositorios de cada módulo son el punto previsto si más adelante un vertical cambia de datasource; hoy todos usan el mismo `PrismaClient`.

## La vertical vive en `src/modules`, el HTTP en `src/app`

Turnos y pedidos tienen dominio, caso de uso, controller y repositorio. Next.js enruta y renderiza. Se eligió composición explícita (`build*`) en lugar de un framework de inyección.

## El tenant público se declara en código

`PUBLIC_TENANT_HOSTS` mapea host → slug y vertical (`barbershop` | `rotisserie`). No sale de la base. Los rewrites de Next para Yoni están aparte, en `next.config.js`, porque el host tiene que reescribirse antes de llegar a la página.

## Dos formas de identificar al tenant en APIs

Rotisería resuelve el tenant en el servidor a partir de `tenantSlug`. Barbería acepta `tenantId` (y en pagos también `appointmentId`) en el body o el query, y filtra las escrituras con ese par. La segunda forma es la que quedó implementada en turnos y Mercado Pago.

## Secretos por tenant, no por entorno

WhatsApp y Mercado Pago no se leen de variables de entorno en el request. Están en `tenant_integrations.config`, con tokens cifrados (AES-256-GCM). Las variables de entorno de los scripts solo sirven para cargar esa fila. La clave de cifrado sí es global: `ENCRYPTION_KEY`.

## Admin por cookie de tenant, sin usuarios

Dos contraseñas hasheadas por tenant (`tenant_auth`): la del negocio y la de soporte. Una cookie cuyo nombre incluye el slug. No hay tabla de usuarios ni roles. La cookie no va firmada: el valor almacenado es el literal `ok`. La clave de soporte se rota con `scripts/set-support-password.ts` y no se entrega al negocio.

## Notificaciones desacopladas del caso de uso, atadas a WhatsApp en el container

El servicio depende de `NotificationSender`. El container elige la implementación según la integración del tenant. Un fallo de envío no revierte el turno ni el pedido.

## Dinero de rotisería en centavos

`priceInCents`, `totalInCents` y `deliveryFeeInCents` son enteros. El admin convierte pesos a centavos al guardar. Barbería muestra precios en pesos enteros (`priceInArs`) y esos importes no están en la base: están armados en código.

## Catálogo de rotisería editable; servicios de barbería no

La carta (nombre, precio, stock, orden, visibilidad, costo de envío) se administra por server actions. Los tres servicios de barbería y el texto fijo de horario no tienen tabla.

## Un solo barbero por local

El slot se reserva contra `barberId`, con unicidad `(tenantId, barberId, startsAt)`. La UI siempre manda `{slug}-main-barber`. Alcanza para un local con una agenda; no modela equipo.

## Stock ausente = ilimitado

Si `stockQuantity` es null, el producto sigue en la carta y el descuento no aplica. Si es un número, el listado exige `> 0` y el alta exige cantidad suficiente. El descuento corre en la misma transacción que el insert del pedido.

## Alta de tenants no destructiva en el seed

Tenants, settings de barbería, categorías y productos del seed se crean si no existen y no se actualizan (`update: {}`). Los scripts de provisioning cubren auth e integraciones, que no deben vivir en el seed general. La regla operativa está en `.cursor/rules/tenant-provisioning.mdc`.

## Zona horaria de la agenda

Los slots de barbería se calculan con `America/Argentina/Buenos_Aires` y offset fijo `-03:00`. No hay zona por tenant.
