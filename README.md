# Monolito multi-SaaS modular

Un solo despliegue [Next.js](https://nextjs.org) 14 (App Router) y una base PostgreSQL para varios negocios. Hay dos verticales: barbería (turnos) y rotisería (carta y pedidos).

Cada negocio es un tenant (`slug` + `tenantId`). En producción el dominio público identifica al tenant; en local se entra por la ruta `/{slug}/...`.

## Stack

- Next.js 14.2, React 18, TypeScript 5.9
- PostgreSQL + Prisma 6.8
- Mercado Pago (turnos de barbería) y WhatsApp Cloud API (notificaciones)
- Contraseñas de admin con `bcryptjs`; tokens de integración cifrados con AES-256-GCM

No hay alias `@/` configurados: los imports son relativos.

## Cómo ejecutarlo

Requisitos: Node.js, npm y PostgreSQL local. No hay versión de Node fijada en el repo.

1. Instalar dependencias: `npm install`
2. Crear la base (conectado a una base administrativa, no dentro de una migración):

```sql
CREATE DATABASE multi_saas;
```

El script está en [prisma/create-database.sql](prisma/create-database.sql).

3. Copiar `.env.example` a `.env` y completar:

- `DATABASE_URL` — por defecto `postgresql://postgres:postgres@localhost:5432/multi_saas?schema=public`
- `ENCRYPTION_KEY` — 64 caracteres hexadecimales (32 bytes). El valor de ejemplo **no** sirve: `src/core/crypto/crypto-utils.ts` corta el proceso al importarse si la clave no decodifica a 32 bytes.

4. Aplicar esquema y datos iniciales:

```bash
npm run prisma:generate
npx prisma migrate dev
npm run prisma:seed
```

`npm run prisma:seed` ejecuta `prisma/seed.js`. No hay bloque `prisma.seed` en `package.json`, así que `npx prisma db seed` no está cableado.

5. Levantar la app: `npm run dev` y abrir `http://localhost:3000`.

En local, `/admin` redirige a `/mgbarber/barbershop/admin`. La clave de desarrollo, si el tenant no tiene hash, es `admin-local`. El admin de rotisería en local es `/{slug}/rotisserie/admin` (por ejemplo `/yoni247/rotisserie/admin`).

## Rutas útiles en local

| Ruta | Qué es |
|---|---|
| `/` | Índice de tenants (sin dominio público) |
| `/{slug}/barbershop` | Sitio de turnos |
| `/{slug}/rotisserie/carta` | Carta y pedido |
| `/{slug}/barbershop/admin` | Admin de barbería (solo fuera de producción) |
| `/{slug}/rotisserie/admin` | Admin de rotisería (solo fuera de producción) |

Tenants con dominio propio: ver `src/app/publicTenantHosts.ts`. En ese host, `/` es el sitio del negocio y `/admin` es su panel.

## Documentación

| Archivo | Para qué |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Estructura real y responsabilidades |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decisiones ya tomadas en el código |
| [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) | Qué funciona, qué no, huecos |
| [docs/tenants/yoni247-business-context.md](docs/tenants/yoni247-business-context.md) | Negocio de Yoni 24/7 |
| [docs/tenants/lafamilia-business-context.md](docs/tenants/lafamilia-business-context.md) | Negocio de La Familia |

El alta de tenants está en [`.cursor/rules/tenant-provisioning.mdc`](.cursor/rules/tenant-provisioning.mdc).
