# Guía Admin: Gestión de Tarifas y Precios (API)

Esta guía explica el flujo para los administradores del sistema (Back-office) sobre cómo cambiar el precio de un plan o lanzar ofertas, como por ejemplo: **Terminar la fase "Public Preview" (Beta Gratis) del Plan STARTER y comenzar a cobrarlo**.

Todo este proceso se basa en el modelo `Tariff` (Tarifas). **No se modifica el `Plan` directamente**, sino la `Tarifa` asociada a él.

---

## Escenario: Cobrar por el plan STARTER (Fin del Public Preview)

Actualmente, el plan `STARTER` tiene asignada una Tarifa activa ligada a la Promoción `BETA` (osto $0.00). Para empezar a cobrar su precio real (Ej: $29.99/mes), el flujo es:

### Paso 1: Desactivar la Tarifa Gratuita Actual
Primero, busca el ID de la tarifa actual (puedes consultar el endpoint `GET /api/tariffs?planCode=STARTER`) y modifícala para desactivarla.

**Endpoint:** `PUT /api/tariffs/{tariffId}`
**Auth:** Admin Token

```json
{
  "isActive": false
}
```
*Al desactivar la tarifa, los **nuevos** usuarios ya no podrán seleccionar el plan STARTER de forma gratuita.*

### Paso 2: Crear la Nueva Tarifa con Precio Real
Ahora, envías una petición para crear una nueva "oferta comercial" (Tarifa) para el plan STARTER. 

**Endpoint:** `POST /api/tariffs`
**Auth:** Admin Token

```json
{
  "planId": "uuid-del-plan-starter",
  "promotionId": null, 
  "totalCost": 29.99,
  "description": "Precio regular mensual para usuarios STARTER",
  "isActive": true
}
```

> **Nota Crítica sobre `promotionId`:** 
> Al mandar `null` (o no enviarlo), el sistema entiende que esta tarifa **NO** tiene descuento. El cliente pagará el 100% de `totalCost`.

### Resultado en Producción
A partir de este momento:
1. Cualquier cliente nuevo que vaya a la página de registro y seleccione "STARTER", el Backend (`request.service.ts`) buscará automáticamente la **Tarifa Activa** del plan STARTER.
2. Como desactivaste la antigua (Paso 1) y creaste esta nueva (Paso 2), el sistema le cobrará `$29.99` al cliente en la pasarela de pagos inicial y guardará este precio como su `paymentTransactions`.
3. Los usuarios activos que obtuvieron la tarifa gratis anterior seguirán utilizándola *solo hasta* que su ciclo actual se acabe, debido a que el movimiento preexistente ya quedó grabado en `SubscriptionMovement`.
