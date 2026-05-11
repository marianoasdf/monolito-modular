# Arquitectura propuesta

## 1. Estructura de carpetas

```text
src/
  app/
    (public)/
    (tenant)/[tenantSlug]/
      barbershop/
      gym/
      rotisserie/
    api/
      barbershop/
      gym/
      rotisserie/
      core/
  core/
    shared/
      domain/
      application/
      infra/
    tenancy/
      domain/
      application/
      infra/
    users/
      domain/
      application/
      interface/
      infra/
    payments/
      domain/
      application/
      interface/
      infra/
    notifications/
      domain/
      application/
      interface/
      infra/
  modules/
    barbershop/
      domain/
        entities/
        value-objects/
        repositories/
      application/
        dto/
        services/
      interface/
        http/
          controllers/
          presenters/
      infra/
        persistence/
          models/
          repositories/
    gym/
      domain/
      application/
      interface/
      infra/
    rotisserie/
      domain/
      application/
      interface/
      infra/
```

## 2. Convenciones de nombres

- Carpetas en `kebab-case`: `value-objects`, `route-handlers`.
- Entidades y servicios en `PascalCase`: `BarbershopAppointment`, `CreateBarbershopAppointmentService`.
- Interfaces de repositorio con sufijo `Repository`: `BarbershopAppointmentRepository`.
- Adaptadores de infraestructura con prefijo tecnológico cuando ayude: `PrismaBarbershopAppointmentRepository`, `MercadoPagoGateway`, `ResendNotificationSender`.
- DTOs con sufijos `Command`, `Query`, `Response`: `CreateBarbershopAppointmentCommand`.
- Modelos de persistencia con sufijo `Record` o `Row`: `BarbershopAppointmentRecord`.
- Archivos de rutas de Next.js solo para cableado y traducción HTTP.
- Alias de imports recomendados: `@/core/*`, `@/modules/*`, `@/app/*`.

## 3. Responsabilidad por capa

### Dominio

- Entidades, value objects y reglas puras.
- No conoce Next.js, Prisma ni APIs externas.
- Puede depender de contratos, no de implementaciones.

### Aplicación

- Orquesta casos de uso.
- Valida invariantes de negocio a nivel de caso de uso.
- Invoca repositorios y servicios transversales del core.

### Interfaz

- Traduce HTTP, server actions o jobs a comandos de aplicación.
- Serializa respuestas y errores.
- No contiene reglas de negocio duras.

### Infraestructura

- Prisma, SQL, email, pasarelas de pago, colas.
- Implementa contratos declarados en dominio o aplicación.
- Es la capa que cambia cuando un módulo se mueve a otra base.

## 4. Estrategia multi-tenant

- Todas las tablas compartidas arrancan con `tenant_id`.
- El `tenantId` debe viajar explícitamente en comandos y contexto.
- Nunca leer o escribir entidades sin filtrar por `tenantId`.
- El acceso a datos debe pasar por repositorios por módulo.
- Evitar servicios globales que consulten tablas de módulos directamente.

Ejemplo de tablas compartidas al inicio:

- `tenants`
- `users`
- `memberships`
- `payments`
- `notifications`
- `barbershop_appointments`
- `gym_class_bookings`
- `rotisserie_orders`

## 5. Cómo dejar preparada la migración a base separada

La regla es esta: el dominio y la aplicación nunca saben en qué base están los datos.

Para eso:

- Cada módulo define su propio contrato de repositorio.
- La implementación concreta vive en `infra/persistence/repositories`.
- Los modelos de persistencia del módulo no se reutilizan fuera de ese módulo.
- El core expone contratos, no acceso directo a tablas ajenas.

Cuando barbería escale, cambia solamente:

- el datasource de [src/modules/barbershop/infra/persistence](src/modules/barbershop/infra/persistence)
- la composición de dependencias del módulo

No deberían cambiar:

- entidades de [src/modules/barbershop/domain](src/modules/barbershop/domain)
- casos de uso de [src/modules/barbershop/application](src/modules/barbershop/application)
- controllers de [src/modules/barbershop/interface](src/modules/barbershop/interface)

## 6. Relación con Next.js

Usar Next.js como shell full-stack:

- `src/app/...` para páginas, layouts y route handlers.
- `src/modules/.../interface/http/controllers` para adaptar la request al caso de uso.
- `src/modules/.../application/services` para la lógica del caso de uso.
- `src/modules/.../infra/...` para persistencia y proveedores externos.

Eso evita que la lógica de negocio quede enterrada en `route.ts` o en server actions gigantes.

## 7. Ejemplo de flujo limpio

Alta de turno de barbería:

1. `POST /api/barbershop/appointments`
2. Route handler resuelve tenant y body.
3. Controller crea `CreateBarbershopAppointmentCommand`.
4. Service valida disponibilidad y crea la entidad.
5. Repository persiste con `tenantId`.
6. Notification sender del core envía confirmación.

## 8. Qué compartir y qué no compartir

Compartir en `core`:

- usuarios
- autenticación
- pagos
- notificaciones
- tenancy
- utilidades de dominio realmente genéricas

No compartir en `core`:

- agendas de barbería
- membresías del gimnasio
- estados de pedido de rotisería
- queries SQL específicas de un módulo

Si algo suena a negocio vertical, debe vivir en `modules/<modulo>`.