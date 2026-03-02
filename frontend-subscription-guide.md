# Guía de Integración Frontend: Gestión de Suscripciones

Esta guía detalla cómo utilizar los nuevos endpoints para el ciclo de vida de la suscripción de un negocio (Upgrade y Renovaciones).

## 0. Consultar Detalles de la Suscripción Actual
El Frontend puede obtener el estado en tiempo real, limites del plan y fechas de la suscripción enviando el ID (que obtienes del `/auth/me` o el storage de sesión).

**Endpoint:** `GET /api/subscriptions/{subscriptionId}`
**Auth:** Requiere Token JWT (Bearer)

### Respuesta Exitosa (200 OK)
Devuelve el objeto completo de la Suscripción, incluyendo el Plan y el Usuario dueño.
```json
{
  "id": "uuid-subscription",
  "status": "ACTIVE",
  "endDate": "2026-03-30T10:00:00.000Z",
  "autoRenew": false,
  "isPublicReview": false,
  "hasPendingPayment": true,
  "isNearingExpiration": true,
  "plan": {
    "name": "PRO",
    "price": 29.99,
    "maxUsers": 10,
    "maxProducts": 500,
    "storage": 150
  }
}
```

---

## 1. Renovar una Suscripción (Mismo Plan)
Se utiliza para extender el tiempo de la suscripción actual subiendo un Comprobante de Pago desde el Frontend (Transferencia, Yape, Plin). El sistema no activará la suscripción al instante, sino que lo enviará al panel de Administradores para ser aprobado.

**Endpoint:** `POST /api/subscriptions/{subscriptionId}/renew`
**Auth:** Requiere Token JWT (Bearer)
**Headers:** `Content-Type: multipart/form-data` (Requisito CRÍTICO para el `file`)

### FormData Payload Obligatorio
En lugar de JSON, tu Frontend debe construir un objeto `FormData` y enviarlo por la red (Axios o Fetch handlearán los límites automáticamente).
```javascript
const formData = new FormData();
formData.append("paymentMethod", "TRANSFER"); // O 'YAPE', 'PLIN', etc.
formData.append("referenceCode", "193-98765432-0-12"); // Tu N° de Operación del recibo
formData.append("file", fileObject); // El Input type="file" capturado
// formData.append("additionalDays", "30"); // OPCIONAL
```

### Respuesta Exitosa (200 OK)
Devuelve un objeto de confirmación informando el nuevo estado pendiente y el `paymentId` autogenerado.
```json
{
  "message": "Comprobante recibido. En proceso de validación por los administradores.",
  "paymentId": "uuid-payment-transaction",
  "status": "PENDING"
}
```

---

## 2. Cambiar de Plan (Upgrade / Downgrade)
Se utiliza cuando el cliente adquiere un plan con mayores/menores beneficios (Ej: Pasa de FREE a PRO). Este proceso actualiza automáticamente los límites como `maxProducts` o `storage` asociados.

**Endpoint:** `POST /api/subscriptions/{subscriptionId}/upgrade`
**Auth:** Requiere Token JWT (Bearer)

### Request Body (Requerido)
```json
{
  "newPlanId": "uuid-del-nuevo-plan-pro"
}
```

### Respuesta Exitosa (200 OK)
Devuelve la Suscripción Actualizada asociada al Nuevo Plan.
```json
{
  "id": "uuid-subscription",
  "planId": "uuid-del-nuevo-plan-pro",
  "status": "ACTIVE",
  "endDate": "2026-03-30T10:00:00.000Z",
  "lastRenewalDate": "2026-02-28T10:00:00.000Z"
}
```

## Consideraciones Generales
1. Al invocar cualquiera de estos dos endpoints, el Backend automáticamente genera los registros contables y el historial en la tabla `SubscriptionMovement`.
2. Puedes saber límites actuales de un usuario en el front-end llamando al `GET /api/subscriptions/{id}` y leyendo `subscription.plan.maxProducts`, `subscription.plan.maxUsers` o `subscription.plan.storage`.

---

## 3. Cancelar una Suscripción
Se utiliza cuando el cliente desea dar de baja su suscripción y no renovar más. Esto desactiva la suscripción inmediatamente.

**Endpoint:** `POST /api/subscriptions/{subscriptionId}/cancel`
**Auth:** Requiere Token JWT (Bearer)

### Request Body (Opcional)
```json
{
  "notes": "El cliente indica que el precio le resulta elevado."
}
```

### Respuesta Exitosa (200 OK)
Devuelve la Suscripción con el estado inactivo.
```json
{
  "id": "uuid-subscription",
  "status": "INACTIVE",
  "isActive": false,
  "endDate": "2026-03-30T10:00:00.000Z"
}
```

---

## 3.1 Reactivar una Suscripción
Se utiliza para revertir una cancelación y devolver la suscripción a estado activo sin alterar la fecha de fin o agregar días adicionales de forma arbitraria.

**Endpoint:** `POST /api/subscriptions/{subscriptionId}/reactivate`
**Auth:** Requiere Token JWT (Bearer)

### Respuesta Exitosa (200 OK)
Devuelve la Suscripción con el estado activo.
```json
{
  "id": "uuid-subscription",
  "status": "ACTIVE",
  "isActive": true,
  "autoRenew": true,
  "endDate": "2026-03-30T10:00:00.000Z"
}
```

---

## 4. Activar/Desactivar Renovación Automática
Permite al usuario indicar si su plan debe renovarse y cobrarse de forma automática o si prefiere esperar notificaciones de pago manual.

**Endpoint:** `PATCH /api/subscriptions/{subscriptionId}/auto-renew`
**Auth:** Requiere Token JWT (Bearer)

### Request Body (Requerido)
```json
{
  "autoRenew": false
}
```

### Respuesta Exitosa (200 OK)
```json
{
  "id": "uuid-subscription",
  "autoRenew": false,
  "status": "ACTIVE"
}
```

> **NOTA IMPORTANTE PARA FRONTEND (Estado Demos/Login):**
> Al hacer Login (`POST /api/auth/login`) y al recargar la sesión (`GET /api/auth/me`), el Backend ahora devuelve el objeto `subscription` completo dentro del usuario. Podrás leer directamente si la auto-renovación está activa sin hacer peticiones extra:
> 
> ```json
> "subscription": {
>    "status": "ACTIVE",
>    "planId": "uuid...",
>    "endDate": "2026-03-30T...",
>    "autoRenew": true
> }
> ```

---

## 5. Crear Empleados / Usuarios del Negocio (con validación de Límites)
Permite al `OWNER` o `BUSINESS_MANAGER` de la suscripción invitar a nuevos empleados (ej. vendedores, almaceneros) a su negocio, validando automáticamente que no se supere el límite `maxUsers` del Plan que están pagando.

**Endpoint:** `POST /api/users/business`
**Auth:** Requiere Token JWT de un perfil `OWNER` o `BUSINESS_MANAGER`.

### Request Body (Requerido)
```json
{
  "email": "vendedor1@minegocio.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "999888777",
  "roleCode": "SELLER" // Opciones Comunes: 'SELLER', 'STOCK_MANAGER'
}
```
*Si no envías `password`, el Backend genera uno seguro aleatorio.*

### Respuesta Exitosa (200 OK)
Devuelve el objeto del usuario y envía un correo (Welcome Email) al nuevo empleado con sus credenciales de acceso.
```json
{
  "message": "Usuario de negocio creado correctamente",
  "data": {
    "id": "uuid-nuevo-usuario",
    "email": "vendedor1@minegocio.com"
  }
}
```

### Respuestas de Error (Limitaciones)
Si el negocio ya agotó sus cupos, el Backend responderá inmediatamente un `403 Forbidden` indicando la razón.
```json
{
  "message": "Límite de usuarios (5) alcanzado para el plan STARTER"
}
```

---

## 5.1. Listar Roles Disponibles (Para el Dropdown de Creación)
Tu formulario necesita mostrar los roles que el dueño puede elegir para su nuevo empleado (Vendedor, Almacenero, etc.). Usa esta ruta para obtener una lista segura.

**Endpoint:** `GET /api/roles`
**Auth:** Requiere Token JWT de un perfil `OWNER` o `BUSINESS_MANAGER`.

*El sistema filtra inteligentemente los roles internos administrativos y solo le devuelve al dueño las opciones válidas para su negocio.*

---

## 5.2. Listar Usuarios Actuales del Negocio
Útil para la tabla de "Gestión de Personal" de tu Panel de Configuración. Retorna de forma segura a todos los empleados atados a esta suscripción.

**Endpoint:** `GET /api/users/business`
**Auth:** Requiere Token JWT de un perfil `OWNER` o `BUSINESS_MANAGER`.

### Respuesta Exitosa (200 OK)
Devuelve el listado de usuarios con el detalle interno de su `role`.
```json
{
  "message": "Usuarios del negocio obtenidos correctamente",
  "data": [
    {
      "id": "uuid1",
      "email": "vendedor1@minegocio.com",
      "firstName": "Juan",
      "firstName": "Juan",
      "lastName": "Pérez",
      "isActive": true,
      "role": {
         "code": "SELLER"
      },
      "lastLogin": "2024-05-15T14:30:00.000Z" // Puede ser nulo si nunca ha ingresado
    }
  ]
}
```

---

## 5.3. Activar o Desactivar a un Empleado
Permite suspender el acceso a la plataforma a un empleado (por ejemplo, si renunció o fue despedido) sin borrar su historial financiero. Si lo quieres reactivar, llamas al mismo endpoint.

**Endpoint:** `PATCH /api/users/business/{id_del_usuario}/toggle-status`
**Auth:** Requiere Token JWT de un perfil `OWNER` o `BUSINESS_MANAGER`.

### Descripción de Seguridad Integrada:
- Si el dueño envía el ID de un usuario que NO pertenece a su empresa, la API devolverá `403 Forbidden`.
- Si el dueño intenta desactivarse a sí mismo (`su propio ID`), la API devolverá `400 Bad Request` por seguridad.
- Si el empleado está actualmente conectado trabajando y lo desactivas, **el Backend destruirá automáticamente su sesión (`token`)**, de modo que en su siguiente click en la plataforma será expulsado al Login.

### Respuesta Exitosa (200 OK)
Devuelve el nuevo estado booleano del usuario.
```json
{
  "message": "El acceso del usuario a la plataforma ha sido suspendido",
  "data": {
    "isActive": false
  }
}
```

---

## 5.4. Eliminar Permanentemente a un Empleado
A diferencia de suspender, este endpoint borra físicamente al usuario, sus permisos asignados y su enlace con la empresa de la base de datos.
> **⚠️ Advertencia:** Úsalo solo si el trabajador fue creado por error o si la protección de datos exige su eliminación total. De lo contrario, prefiere el endpoint de "Suspender" (`5.3`) para conservar el historial en reportes financieros.

**Endpoint:** `DELETE /api/users/business/{id_del_usuario}`
**Auth:** Requiere Token JWT de un perfil `OWNER` o `BUSINESS_MANAGER`.

### Descripción de Seguridad Integrada:
- No puedes eliminar usuarios que pertenezcan a otras suscripciones (Retorna `403 Forbidden`).
- El `OWNER` no puede auto-eliminarse mediante esta ruta por motivos de seguridad (Retorna `400 Bad Request`).

### Respuesta Exitosa (200 OK)
Devuelve un mensaje de confirmación y `data: null`.
```json
{
  "message": "Usuario eliminado del negocio permanentemente",
  "data": null
}
```

---

## 5.5. Editar Datos de un Empleado
Permite actualizar información básica de contacto y/o cambiar el Rol del empleado dentro de la empresa.

**Endpoint:** `PUT /api/users/business/{id_del_usuario}`
**Auth:** Requiere Token JWT de un perfil `OWNER` o `BUSINESS_MANAGER`.

### Campos Editables (Todos Opcionales)
Puedes enviar todos o solo uno de los campos en el cuerpo de la petición.
- `firstName` (String): Nombres del empleado.
- `lastName` (String): Apellidos del empleado.
- `phone` (String): Celular o teléfono.
- `roleCode` (String): El código base del nuevo rol a asignar (ej. `"SELLER"`, `"STOCK_MANAGER"`).

**Request Body (Ejemplo actualizando nombre y rol):**
```json
{
  "firstName": "Juan Carlos",
  "roleCode": "STOCK_MANAGER"
}
```

### Comportamiento Especial:
- **Cambio de Rol:** Si envías un `roleCode` que es diferente al rol actual del usuario, el backend actualizará sus permisos **y eliminará inmediatamente su sesión activa** en caso de estar conectado, forzándolo a iniciar sesión nuevamente para que se apliquen sus nuevas restricciones de seguridad.
- **Protección de Dueño:** Un `OWNER` no puede usar este endpoint para auto-editar sus datos. Para modificar su nombre o teléfono, debe usar la vista de "Mi Perfil" que consume el endpoint general de usuarios.

**Respuesta Exitosa (200 OK)**
```json
{
  "message": "Usuario de negocio actualizado correctamente",
  "data": null
}
```

---

## 6. Gestión de Acceso Avanzado (Matriz de Permisos por Rol)
Esta sección permite construir la vista donde el `OWNER` selecciona un Rol (ej. "Cajero") desde un dropdown, visualiza todos los Módulos del Sistema (Dashboard, Inventario, Ventas, etc.) y habilita o deshabilita acciones específicas (Ver, Crear, Editar, Eliminar).

### 6.1. Obtener la Matriz de Permisos de un Rol (Para Renderizar la UI)
Llama a este endpoint cada vez que el usuario seleccione un Rol en el dropdown principal. Devuelve todo el catálogo de Módulos (Vistas) y para cada uno, qué acciones están `isAssigned: true` o `false`.

**Endpoint:** `GET /api/roles/{roleId}/permissions`
**Auth:** Requiere Token JWT (`OWNER` o `ADMIN`).

**Respuesta Exitosa (200 OK):**
```json
{
  "data": [
    {
      "viewId": "uuid-vista",
      "viewCode": "DASHBOARD",
      "viewName": "Control de Dashboard",
      "description": "Ajuste los privilegios específicos para el módulo de indicadores.",
      "permissions": [
        {
          "id": "uuid-permiso-1",
          "name": "READ",
          "description": "Acceso de lectura",
          "isAssigned": true
        },
        {
          "id": "uuid-permiso-2",
          "name": "CREATE",
          "description": "Añadir registros",
          "isAssigned": false
        }
      ]
    },
    // ... más módulos (Inventario, Ventas, compras...)
  ]
}
```

### 6.2. Guardar (Actualizar) los Permisos de un Módulo
Cuando el usuario marca o desmarca los checkboxes de un Módulo específico (Ej: "Dashboard") o hace clic en "Guardar Permisos", envías la nueva selección al backend. **Ojo: Si el usuario desmarca todos los permisos de un módulo, envías un array vacío en `permissions`**.

**Endpoint:** `POST /api/roles/{roleId}/permissions`
**Auth:** Requiere Token JWT (`OWNER` o `ADMIN`).

**Request Body (Requerido):**
```json
{
  "viewCode": "DASHBOARD",
  "permissions": ["READ", "CREATE"] // Envía solo los "name" que deben estar checkeados
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Permisos del rol actualizados correctamente"
}
```

---

## 7. Administrar el Catálogo de Módulos (Vistas) y Permisos Base
*Nota: Estas rutas generalmente son exclusivas para el Súper `ADMIN` o el equipo de soporte. El dueño de negocio (`OWNER`) solo consume lo que está creado aquí.*

Si mañana construyes un nuevo módulo, digamos "**Marketing**", o inventas una nueva acción como "**EXPORTAR_EXCEL**", necesitas registrarlos en la Base de Datos para que luego aparezcan automáticamente en la pantalla de "Gestión de Acceso Avanzado" de los dueños.

### 7.1. Crear un Nuevo Módulo (View)
**Endpoint:** `POST /api/views`
**Auth:** Token de Súper `ADMIN`

**Request Body:**
```json
{
  "code": "MARKETING", // Nombre en clave interno (sin espacios)
  "name": "Módulo de Marketing" // Nombre que verá el usuario en la UI
}
```

*Nota: Tienes a disposición todo el CRUD (`GET /api/views`, `PUT /api/views/:id`, `DELETE /api/views/:id`).*

### 7.2. Crear una Nueva Acción (Permission)
Este es el catálogo universal de acciones (El `Ver`, `Crear`, `Editar` universales).

**Endpoint:** `POST /api/permissions`
**Auth:** Token de Súper `ADMIN`

**Request Body:**
```json
{
  "name": "EXPORT",      // Clave interna
  "description": "Descargar reportes Excel" // Lo que verá el usuario
}
```

*Nota: Igual que las vistas, tienes su respectivo CRUD completo en `/api/permissions`.*

> **La Magia del Sistema:** En el instante en que tú como Administrador creas un nuevo Registro en `/api/views` y un nuevo registro en `/api/permissions`, estos automáticamente van a dibujarse en la UI de todos tus clientes dueños de negocio gracias a que tu endpoint `GET /api/roles/{roleId}/permissions` escanea esto en tiempo real. No tienes que tocar código para incluir un nuevo módulo en la pantalla de "Gestión de Permisos Avanzados".

---

## 8. Historial de Suscripciones (Movimientos)
Permite listar el historial de cambios, renovaciones, inicio de sesión (SUBSCRIBED), upgrade, o cancelaciones con sus fechas correspondientes. Ideal para la vista "Historial de Suscripciones" del diseño.

**Endpoint:** `GET /api/subscriptions/{subscriptionId}/history`
**Auth:** Requiere Token JWT (Bearer)

### Respuesta Exitosa (200 OK)
Devuelve el listado ordenado por fecha de manera descendente (el más reciente primero).
```json
[
  {
    "id": "uuid-movement",
    "subscriptionId": "uuid-subscription",
    "previousPlanId": null,
    "newPlanId": "uuid-starter-plan",
    "movementDate": "2026-03-01T16:35:45.363Z",
    "previousEndDate": null,
    "newEndDate": "2026-04-30T16:35:45.354Z",
    "movementType": "SUBSCRIBED",
    "newPlan": {
      "id": "uuid-starter-plan",
      "name": "Starter",
      "code": "PRO"
    }
  }
]
```

---

## 9. Historial de Facturación (Pagos)
Permite listar el historial de operaciones contables ligadas a los movimientos de suscripción. Útil para la pestaña "Historial de Facturación".

**Endpoint:** `GET /api/subscriptions/{subscriptionId}/billing`
**Auth:** Requiere Token JWT (Bearer)

### Respuesta Exitosa (200 OK)
Devuelve el listado de transacciones, con los valores pagados y el estado del pago.
```json
[
  {
    "id": "uuid-payment",
    "amount": 50.00,
    "paymentDate": "2026-03-01T16:35:45.363Z",
    "paymentMethod": "CREDIT",
    "status": "COMPLETED",
    "description": "Pago mensual Starter",
    "subscriptionMovement": {
       "movementType": "RENEWAL",
       "newPlan": {
          "name": "Starter"
       }
    }
  }
]
```


---

## 10. Logica de Bloqueo y Estados de Suscripcion (Frontend)

Para proteger las rutas del proyecto y habilitar visualizaciones condicionales, el Frontend debe evaluar constantemente la propiedad status del objeto Subscription. Existen 4 estados posibles en la base de datos:

### 1. ACTIVE (Sistema Desbloqueado)
- **Significado:** El negocio esta al dia con sus pagos o en periodo de Public Review. Su fecha de fin (endDate) esta en el futuro.
- **Accion en UI:** Acceso total. El usuario puede seguir operando con normalidad.

### 2. EXPIRED (Sistema Bloqueado)
- **Significado:** El CRON detecto que la fecha de vencimiento ya paso y el cliente no tiene aprobada su renovacion.
- **Accion en UI:** Bloquear o redireccionar las rutas a una pantalla de Pago indicandole al usuario que su plan vencio y pidiendo que suba su comprobante via /renew.

### 3. PENDING (Sistema Bloqueado)
- **Significado:** La cuenta comercial acaba de ser creada, pero no han realizado su primer pago de Onboarding.
- **Accion en UI:** Mantener bloqueado el acceso principal, forzando la compra de su primer plan.

### 4. INACTIVE (Sistema Bloqueado)
- **Significado:** La cuenta ha pasado mas de 7 dias caducada o cancelada.
- **Accion en UI:** Mostrar pantalla de Reactivation.

### UI Al Enviar Comprobantes (El Estado PENDING)
Cuando el cliente envia su Comprobante de Yape o Transferencia desde estado EXPIRED, su Suscripcion **sigue fisicamente bloqueada/EXPIRED** hasta que un admin apruebe. Sin embargo, el API responde con un Transaction en PENDING. 
**Mejora de UX Frontend:** Al terminar la subida, debes esconder el formulario y mostrar una alerta tipo:
> 'Hemos recibido tu Ticket de pago. Nuestro equipo lo validara en las proximas 24hs para reactivar tus servicios.'
