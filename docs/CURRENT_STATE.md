# Estado actual

Fotografía del repo. Donde el código no alcanza para saber si algo está en producción, queda marcado como falta de contexto.

## Funciona en el código

- Home de plataforma en `/` cuando el host no es un dominio de tenant.
- Sitio de turnos para un tenant con `BarbershopTenantSettings.phone`: grilla del día, reserva en efectivo o Mercado Pago, aviso por WhatsApp si hay integración.
- Mercado Pago de barbería: Brick, preferencia y webhook que pasan el turno a `paid`, `pending` o `failed`.
- Carta de rotisería, alta de pedido (retiro/delivery, efectivo/transferencia), confirmación por id y descuento de stock numérico.
- WhatsApp de rotisería a varios teléfonos del negocio y, si el template responde, al cliente.
- Admin de barbería: nombre, descripción, maps, teléfono, horarios, slots express, borrado de turnos del día y cambio de la clave del negocio.
- Admin de rotisería: costo de envío, categorías y productos (alta, orden, mover, ocultar, borrar), con topes de 30 categorías, 50 productos por categoría y 300 productos, y cambio de la clave del negocio. El menú semanal del admin es solo de La Familia.
- Carta de La Familia: destaca el menú configurado para el día actual y muestra la semana completa. La carta de Yoni no incluye ese bloque.
- Seed create-only para tenants, settings de barbería y catálogo de La Familia y Yoni.
- Dominios declarados: `mgbarber.xyz`, `rufianbarbershop.com`, `lafamiliaroti.com`, `yoni24hs.com` (con `www`).

## Incompleto

- **Acceso:** no hay login de clientes ni de staff. Cada tenant tiene clave de negocio y clave de soporte. La de soporte se carga con `scripts/set-support-password.ts`. Fuera de producción, `admin-local` sigue sirviendo cuando las dos están vacías.
- **Pedidos:** el tipo admite `confirmed` y `cancelled`, pero el alta deja `pending` y no hay caso de uso ni pantalla para cambiarlo. El admin no lista pedidos.
- **Turnos:** el enum tiene `COMPLETED` y `CANCELLED`. Nada en `src/` asigna `COMPLETED`. La acción de admin llamada cancel borra la fila (`deleteMany`), no marca `CANCELLED`.
- **Servicios de barbería** (corte / barba / combo y precios), ciudad, barrio y la frase de horario están hardcodeados. La grilla semanal sí es configurable, pero el sitio solo muestra hoy.
- **WhatsApp entrante:** el webhook verifica el token y registra el mensaje. No responde ni crea turnos o pedidos.
- **Kiosco y heladería** de Yoni están en el contexto de negocio, no en el modelo.
- `npm run lint` corre con `.eslintrc.json` (`next/core-web-vitals`). No hay tests ni CI en el repo.
- Tailwind 3.4 está instalado con preflight desactivado y solo lo usa el panel de plataforma (`src/app/platform`, `Shell`). Sitios de tenant y admins siguen con el CSS clásico de `globals.css`.

## Problemas conocidos en el código

- `.env.example` trae un `ENCRYPTION_KEY` que no decodifica a 32 bytes. Sin una clave válida, importar `crypto-utils` tira el proceso.
- Los tenants demo del seed (`crown`, `heritage`, `northline`) no tienen settings de barbería. Sin teléfono, `/{slug}/barbershop` responde 404. La home igual los enlaza.
- `next.config.js` duplica los hosts de La Familia y de Yoni. Un dominio nuevo en `publicTenantHosts.ts` no obtiene esos rewrites solo.
- `POST /api/barbershop/appointments` y las rutas de pago confían el `tenantId` que manda el cliente. Rotisería no.
- La cookie de admin no está firmada. Quien pueda setear `admin_session_{slug}=ok` pasa el chequeo de sesión. La contraseña solo se valida en el login.
- El webhook de Mercado Pago no verifica firma: prueba el payment id con el token de cada tenant hasta que uno responde. El `POST /webhook` de WhatsApp tampoco valida firma de Meta.
- El descuento de stock hace `updateMany` y no mira si actualizó filas. Si otro pedido se llevó el stock en el medio, este pedido puede commitearse igual.
- `scripts/migrate-to-tenant-integrations.ts` importa `bcrypt`. El resto del proyecto usa `bcryptjs`, y `bcrypt` no está en `package.json`.
- El seed actualiza nombre y teléfono de clientes de barbería cuando el número ya existe. El resto del seed no pisa filas.
- `provision-mgbarber-mercadopago.ts` hace upsert y **sí** reemplaza la config de Mercado Pago de ese tenant. `provision-yoni247.ts` no toca un `TenantAuth` existente, pero sí actualiza la integración de WhatsApp si ya está.
- Precios de Yoni: el seed y `docs/tenants/yoni247-business-context.md` dicen que la carta de jul 2026 está desactualizada.
- El rate limit es memoria del proceso. No se comparte entre instancias y se pierde al reiniciar.
- `allowedDevOrigins` en `next.config.js` incluye la IP LAN `192.168.100.109` además de localhost.

## Falta contexto

No se puede afirmar desde el repo:

- Dónde está desplegado (`.vercel` está en `.gitignore`; no hay `vercel.json` ni Dockerfile).
- Si las integraciones de WhatsApp y Mercado Pago ya están cargadas en la base real.
- Si los templates de Meta (`barbershop_*`, `rotisserie_new_order`, `rotisserie_order_received`) están aprobados.
- El estado de los pasos de Meta listados en `docs/tenants/yoni247-business-context.md`.
- Quién opera cada tenant fuera de los slugs y teléfonos que aparecen en seed, hosts y scripts.

## Huecos que el propio código deja abiertos

No son un plan comprometido. Son el siguiente trabajo que el repo ya señala:

1. Definir el ciclo del pedido (`pending` → `confirmed` / `cancelled`) si el admin tiene que operarlo.
2. No dar por cerrada la carta de Yoni ni el alta de WhatsApp sin confirmar la base y Meta.
3. Alinear servicios y horarios visibles de barbería con lo que el admin puede editar, si el negocio lo pide. Hoy no es así.
