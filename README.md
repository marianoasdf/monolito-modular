# Monolito Multi-SaaS Modular

Base de arquitectura para un monolito multi-tenant en Node.js + Next.js con tres verticales iniciales:

- barbería
- gimnasio
- rotisería

El objetivo es mantener un solo despliegue y una sola base de datos al comienzo, pero con límites internos claros para poder escalar cada módulo sin reescribir la lógica de negocio.

## Principios

- Un solo frontend y backend con Next.js App Router.
- Multi-tenant por `tenant_id` desde el primer día.
- Dominio separado de infraestructura para facilitar migraciones.
- `core` compartido solo para capacidades transversales.
- Cada módulo vertical controla sus propias entidades, casos de uso y repositorios.

## Estructura

La guía completa está en [docs/architecture.md](docs/architecture.md).

## Módulos iniciales

- [src/modules/barbershop](src/modules/barbershop)
- [src/modules/gym](src/modules/gym)
- [src/modules/rotisserie](src/modules/rotisserie)

## Core compartido

- [src/core/users](src/core/users)
- [src/core/payments](src/core/payments)
- [src/core/notifications](src/core/notifications)
- [src/core/tenancy](src/core/tenancy)
- [src/core/shared](src/core/shared)

## Idea de flujo

1. Una route handler de Next.js recibe la request.
2. El controller traduce HTTP a un comando de aplicación.
3. El service ejecuta la regla de negocio usando repositorios y servicios del core.
4. La infraestructura persiste usando modelos con `tenantId`.
5. El frontend consume las rutas o server actions sin acoplarse a la persistencia.

## Creación de base PostgreSQL

La migración de Prisma en [prisma/migrations/20260510_init_barbershop/migration.sql](prisma/migrations/20260510_init_barbershop/migration.sql) crea tablas dentro de una base ya existente. La creación de la base `multi_saas` queda documentada aparte en [prisma/create-database.sql](prisma/create-database.sql), porque `CREATE DATABASE` es una operación de nivel servidor y no conviene mezclarla dentro de una migración de esquema.

Flujo recomendado:

```sql
-- ejecutar conectado a postgres o a otra base administrativa
CREATE DATABASE multi_saas;
```

Después:

```bash
npm run prisma:validate
npx prisma migrate dev --name init_barbershop
```