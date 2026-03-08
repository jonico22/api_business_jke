# Guía Admin: Gestión de Planes, Promociones y Tarifas

Esta guía explica detalladamente cómo los administradores pueden utilizar la API para gestionar las características de los Planes, extender promociones (como el Public Review) y transicionar los planes gratuitos hacia modelos de pago.

---

## 1. Actualizar las Características de un Plan
Si deseas agregar más almacenamiento, permitir más usuarios, o modificar el nombre y descripción de los planes existentes (ej. STARTER, PRO, PLUS), debes utilizar el endpoint de Planes.

**Endpoint:** `PUT /api/plans/{planId}`
**Auth:** Admin Token

### Request Body (Ejemplo)
Puedes enviar solo los campos que deseas actualizar:
```json
{
  "name": "STARTER",
  "description": "Módulo de registro de pedidos y reportes avanzados.",
  "maxUsers": 5, 
  "maxProducts": 500,
  "storage": 500,
  "features": [
    { "name": "Reportes Excel", "included": true },
    { "name": "Soporte Prioritario", "included": false }
  ]
}
```
**Nota:** Al actualizar un Plan mediante este endpoint, *no* se cambia el precio. El precio está regido por las "Tarifas" (Tariff).

---

## 2. Ampliar el "Public Review" (Promoción)
Si notas que la promoción actual está teniendo éxito y deseas extenderla para llegar a más público (por ejemplo, dar 1 mes más de gracia a los nuevos registros), necesitas editar la `Promoción` atada a la tarifa de ese plan.

**Endpoint:** `PUT /api/promotions/{promotionId}`
**Auth:** Admin Token

Actualmente tu semilla crea la promoción `BETA` ("PUBLIC PREVIEW") que otorga $0.00 de costo. Para hacerla durar más tiempo en el mercado:

### Request Body
Extiendes su fecha de expiración (`endDate`) o incrementas los usos máximos si la limitaste por cupos:
```json
{
  "endDate": "2026-08-31T00:00:00.000Z", // Extender hasta Agosto
  "durationValue": 90 // Ahora a los nuevos usuarios les durará 90 días gratis en lugar de 60
}
```
*Efecto:* Las nuevas empresas que se registren seguirán obteniendo el plan de forma gratuita por la duración asignada, hasta la nueva fecha límite de la campaña.

---

## 3. Actualizar el Plan a "Versión Pagada"
Cuando decidas terminar el "Public Review" y comenzar a monetizar el plan STARTER, **no editas el Plan**, sino que cambias su Tarifa "Oferta Comercial".

Tu base de datos está estructurada para mantener un historial de precios limpio.

### Paso 3.1: Desactivar la Tarifa Promocional Actual
Busca el ID de la tarifa gratuita actual y desactívala para que nadie más la pueda adquirir.

**Endpoint:** `PUT /api/tariffs/{tariffIdGratuita}`
```json
{ "isActive": false }
```

### Paso 3.2: Registrar la Nueva Tarifa de Pago
Crea la nueva oferta oficial para el plan STARTER. Al no enviarle `promotionId`, el sistema sabrá que ahora cuesta dinero real.

**Endpoint:** `POST /api/tariffs`
```json
{
  "planId": "uuid-del-plan-starter",
  "totalCost": 29.99,
  "description": "Precio regular mensual para STARTER",
  "isActive": true
}
```

### ¿Qué ocurre con los clientes antiguos vs. los nuevos?
- **Nuevos Clientes:** Al momento de registrar su sociedad, el sistema detectará esta nueva Tarifa Activa y les exigirá el pago de `$29.99`. Al no existir pago automático, tendrán que notificar su transferencia.
- **Clientes Antiguos (Public Review):** Como almacenamos su "fecha de fin" (Ej: 2 meses gratis) en su tabla `Subscription` y tu Cron Job está vigilándolos, ellos **seguirán usando el sistema gratis** sin interrupciones hasta que su fecha se cumpla.
- Una vez que la fecha de los antiguos expire, el Cron los pasará a estado `EXPIRED`, les dará 7 días de gracia y **les exigirá pagar la tarifa actual** para poder continuar operando.
