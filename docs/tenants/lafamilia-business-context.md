# La Familia Rotisería y Viandas — Contexto de negocio

> Información relevada con la dueña (jun 2026). Fuente de verdad del dominio para el tenant `lafamilia`.
> Capturado para las próximas fases. **Los datos del seed actual (`prisma/seed.js`) son placeholders**; la carta real está acá abajo.

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

## Menú del día — patrón semanal (Instagram, $5.000 c/u + entrada)

El menú del día **cambia a diario**, pero hay un **patrón semanal** de base:

| Día | Plato |
|---|---|
| Lunes | Arroz amarillo con pollo + entrada |
| Martes | Guiso de lentejas con chorizo + entrada |
| Miércoles | Tallarines con bolognesa o estofado + entrada |
| Jueves | Pastel de papa + entrada |
| Viernes | Burger con papas fritas + entrada |
| Sábado | Canelones de verdura (salsa roja / mixta / blanca) + pan |
| Domingo | Pollo al horno con papas fritas + ensalada |

**Variación diaria real (ejemplo, sábado):** *"Hoy tenemos: Lasaña con salsa! Cambiamos los canelones por hoy… Milanesa con papas fritas o ensalada."*

> **Evidencia de dominio relevante** para la decisión `DailyMenu` (hoy modelado como proyección sobre `Product`): existe **plantilla semanal + override diario**. Si esto se formaliza, refuerza que "Oferta de Hoy" podría emerger como concepto propio en una iteración futura. Por ahora se mantiene como proyección, según lo decidido.

## Carta completa (cartel del local)

Precios en pesos argentinos.

**Pizzas:** Muzzarella $9.000 · Napolitana $12.000 · Fugazza $11.000 · Provenzal $11.000 · Jamón y huevo $12.500 · A caballo $15.000 · Alemana $15.000

**Tartas** (jamón y queso / verdura / choclo / cebolla y queso — consultar stock): Jamón y queso $10.000 · Verdura $9.000 · 1/2 tartas $6.000 · Mini tartas $3.000

**Empanadas** (mismos sabores, consultar stock): $2.500 c/u · 6: $15.000 · 12: $28.000

**Hamburguesas** (salen con papas): Completa $10.500 · Doble carne $12.500 · Doble cheddar $14.500

**Hamburpizza** (sale con papas, rinde dos personas): $28.000 · 1/2 hamburpizza $18.000

**Comida al plato:** Tortilla de papa simple $7.000 · Tortilla de papa rellena $9.000

**Pastas** (salsas: fileto, blanca, bolognesa): Tallarines caseros al huevo $7.000 · Ravioles de verdura $7.000 · Ñoquis $7.000 · Sorrentinos $7.000

**Papas:** Papas fritas $5.000 · Papas con cheddar y verdeo $7.000

**Menú del día:** $5.000

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

- Reemplazar el catálogo placeholder del seed por estas categorías/productos reales (precios en `priceInCents`).
- Categorías reales sugeridas: Menú del día, Pizzas, Tartas, Empanadas, Hamburguesas, Hamburpizza, Comida al plato, Pastas, Papas.
- WhatsApp Cloud: confirmación automática de pedidos + responder "qué hay hoy" / "la carta" (fase posterior).
- Capturas de referencia (cartel, IG, grupo de WhatsApp) guardadas en la carpeta `assets/` del proyecto.
