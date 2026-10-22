# La Familia Rotisería y Viandas — Contexto de negocio

> Información relevada con la dueña (jun 2026) y carta actualizada por WhatsApp (oct 2026).
> Fuente de verdad del dominio para el tenant `lafamilia`. El catálogo de `prisma/seed.js` coincide con esta carta.

## El negocio

- **Nombre:** La Familia Rotisería y Viandas.
- **Ubicación:** Concordia.
- **Tagline:** "La solución a tu almuerzo o cena. Viandas caseras + rotisería. Delivery. Pedidos por WhatsApp."
- **Lemas en la carta:** "¡Come rico, casero y sin gastar de más!" · "Hecho en casa con amor".
- **Estado:** funciona bien; el objetivo es mejorar la atención, no reinventar la operación.

## Cómo operan hoy

- **Instagram:** `@lafamiliarotiseriayviandas` (~373 seguidores, 15 publicaciones). Publican el menú del día y destacados.
- **Grupo de WhatsApp:** "Menú del día | La Familia", creado 16/4/26. **~72–80 personas** (meta declarada: 100, con sorteo de incentivo). Ahí publican el menú **todos los días**.
- **Pedidos:** por WhatsApp, contestados **manualmente**. Teléfono/pedidos: `wa.me/+5493455086144` (+54 9 3455 08-6144).
- **Delivery** y retiro.

## Problema principal (validado con la dueña)

- *"¿Qué es lo que más te preguntan por WhatsApp?"* → **"Siempre piden la carta o qué menú hay hoy."**
- No alcanzan a responder rápido porque **están cocinando**.
- Mejora prevista: **WhatsApp Cloud** (se implementará más adelante, fase posterior).

## Ritmo del día (validado con la dueña)

- *"¿Qué sale más, la roti o las viandas?"* → **"Ambas. Depende la hora. Al mediodía viandas y a la noche roti."**

## Menú del día y menú semanal

El menú del día cuesta **$6.000** y es comida al plato casera hecha en el día. La dueña y sus empleados pueden configurar desde el panel una descripción para cada día de lunes a domingo. La carta pública destaca el día actual y también muestra la semana completa. Un día vacío aparece como **“Consultar”**.

## Carta completa (cartel del local)

Precios en pesos argentinos.

**Pizzas:** Muzzarella $10.000 · Napolitana $13.000 · Fugazza $12.000 · Provenzal $12.000 · Jamón y huevo $15.000 · Alemana $17.000 · A caballo $18.000

**Tartas** (jamón y queso / verdura / choclo / cebolla y queso — consultar stock): Jamón y queso $13.000 · Verdura $11.000 · 1/2 tarta $7.000 · Mini tarta $4.000

**Empanadas:** Jamón y queso o verdura $1.500 c/u · Carne $2.000 c/u · 6: $9.000 · 12: $18.000

**Sánguches de milanesa** (rinden dos personas): Gigante de carne $15.000 · Gigante de pollo $12.000 · El Llorón de carne $15.000 · El Llorón de pollo $12.000

**Hamburguesas** (salen con papas): Completa $12.000 · Doble carne $13.000 · Doble cheddar $15.000 · Vegetariana $10.000

**Hamburpizza:** 1/2 $15.000 · Entera $25.000

**Pizzanesa:** 1/2 $15.000 · Entera $25.000

**Adicional:** Papas fritas $3.000, solo para sánguches de milanesa, hamburpizza o pizzanesa.

**Papas fritas:** Bandeja mediana $5.000

**Comida al plato:** Tortilla simple $8.000 · Tortilla rellena $10.000

**Pastas** (salsas: fileto, blanca o boloñesa): Tallarines caseros $6.000 · Ravioles $6.000 · Ñoquis $6.000 · Canelones $7.000 · Lasaña $7.000

**Sánguches de miga y tostados:** Tostados $5.000 · Miga simples $7.000 · Miga triples $9.000

**Postres:** Budín de pan o flan, porción grande $3.000 · Postre en pote $4.500 · 2 postres en pote $8.000

**Menú del día:** $6.000

## Objetivo del sistema (visión)

Web con **pedidos automáticos** que reemplace la dependencia del grupo de WhatsApp:

- Cliente elige productos desde la web (menú del día o carta) → genera el pedido.
- **Notificación automática por WhatsApp al negocio** (a Nicki) + **confirmación automática al cliente**.
- Objetivo: reducir mensajes repetitivos ("qué hay hoy" / "qué hay disponible") y **acelerar ventas** sin frenar a quien está cocinando.
- El grupo de WhatsApp actual es **solo informativo (no interactivo)**; la web aporta la parte transaccional.

## Medios de pago (previstos)

- **Efectivo**
- **Transferencia**
- **Saldo** (a evaluar)
- **MercadoPago** (más adelante)

## Delivery

- **Cobertura:** casi toda la zona.
- **Logística:** motos tipo Uber.
- **Costo de envío:** mínimo **$2.000**, máximo **$5.000**.
- También hay **retiro** en el local.

## Horarios de atención

- **Lunes a sábado:** 10:00–14:00.
- **Domingos:** 11:00–15:00.
- **Tarde/noche (todos los días):** 19:30–00:00.
- Mediodía → predominan **viandas**; noche → predomina **rotisería** (ambos importantes).

## Productos (matiz relevado)

- **Viandas:** mayormente fijas, pero van cambiando.
- **Rotisería:** varía según disponibilidad.
- El **menú diario** se publica hoy en el grupo de WhatsApp.

## Decisiones del proyecto

- **Dominio público:** usar un **nombre corto** (evitar algo largo tipo "lafamilia…"). Pendiente de elegir y registrar en `src/app/publicTenantHosts.ts`. (El `slug` interno del tenant sigue siendo `lafamilia`.)
- Mantener la lógica actual pero mejorada con: link a WhatsApp, link al grupo y **pedidos automáticos**.

## Notas para próximas fases

- Mantener sincronizada esta fuente con cambios de carta confirmados por la dueña.
- WhatsApp Cloud: confirmación automática de pedidos + responder "qué hay hoy" / "la carta" (fase posterior).
- Capturas de referencia (cartel, IG, grupo de WhatsApp) guardadas en la carpeta `assets/` del proyecto.
