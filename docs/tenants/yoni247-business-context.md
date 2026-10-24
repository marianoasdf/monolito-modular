# Yoni 24/7 — Contexto de negocio

> Información relevada jul 2026. Fuente de verdad del dominio para este tenant.

## El negocio

- **Nombre:** Yoni 24/7
- **Slug interno:** `yoni247`
- **Dominio:** `yoni24hs.com`
- **Ubicación:** Benito Legerén, Concordia
- **Instagram:** [@yoni24hs](https://www.instagram.com/yoni24hs/)
- **Facebook:** [Yoni24hs](https://www.facebook.com/Yoni24hs/)
- **Slogan:** "Tu barrio, tu lugar, siempre. Yoni 24/7 — Abierto las 24 horas."

## Rubros actuales

- **Comidas 24hs** (rotisería + milanesas + hamburguesas + pizzas + papas) — módulo activo
- **Kiosco 24hs**
- **Heladería** (próximamente)

## Pedidos y notificaciones

- **Teléfonos receptores de pedidos:**
  - `+5493434671787` (343 467-1787)
  - `+5493454933676` (345 493-3676)
- **Canal:** WhatsApp Cloud API — template `rotisserie_new_order` (idioma `es_AR`)
- **Template variables:** `{{1}}` nombre cliente · `{{2}}` teléfono · `{{3}}` modalidad · `{{4}}` pago · `{{5}}` items · `{{6}}` total · `{{7}}` nota

## Carta (jul 2026 — precios desactualizados según el cliente)

### Pizzas
| Producto | Precio |
|---|---|
| Pizza muzza | $7.500 |
| Pizza napolitana | $12.000 |
| Pizza primavera | $12.000 |
| Pizza caballo | $15.000 |
| Pizza calabaza | $14.000 |
| Pizza jamón morrón | $14.000 |

### Hamburguesas y Milanesas
| Producto | Precio |
|---|---|
| Hamburguesa completa (c/papas) | $7.500 |
| Sandwid Mila completa (c/papas) | $9.500 |
| Mila Napo (c/papas) | $10.000 |
| Primo muzza (c/papas) | $14.000 |
| Mila Napo para dos | $15.000 |

### Papas
| Producto | Precio |
|---|---|
| Bandeja de papas | $7.500 |
| Bandeja papas con cheddar | $9.000 |
| Bandeja papas panceta verdeo cheddar | $13.000 |
| Bandeja de salchipapas | $12.000 |

## Pasos externos pendientes (Meta Business Suite)

1. Crear número de WhatsApp Business API para Yoni en Meta Business Suite.
2. Obtener `Phone Number ID` y `Access Token` permanente.
3. Crear template `rotisserie_new_order` en idioma `es_AR` con 7 variables de cuerpo.
4. Ejecutar `scripts/provision-yoni247.ts` con las variables de entorno correspondientes.

## Variables de entorno necesarias para provision

```
YONI247_WHATSAPP_PHONE_NUMBER_ID=
YONI247_WHATSAPP_API_TOKEN=
YONI247_ADMIN_ACCESS_PASSWORD=
```
