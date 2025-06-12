# Configuración del Sistema de Notificaciones por Email

Este documento explica cómo configurar el sistema de notificaciones por email para alertas de sensores.

## Cambios Implementados

### 1. Nueva Lógica de Validación de Sensores

- **Temperatura**: Acepta cualquier valor (positivo, negativo o cero) como válido
- **Otros sensores** (velocidad, flujo, cobertura): Valor cero indica falla y genera alerta

### 2. Sistema de Notificaciones por Email

- Se envía automáticamente un email a `jaiderpj16@gmail.com` cuando se detecta falla en sensores
- Solo se activa para sensores no de temperatura con valor cero
- Incluye información detallada del área, sensor y timestamp

## Opciones de Configuración de Email

### Opción 1: EmailJS (Recomendado para Frontend)

1. **Instalar EmailJS**:
   ```bash
   npm install @emailjs/browser
   ```

2. **Crear cuenta en EmailJS**:
   - Visita [https://www.emailjs.com/](https://www.emailjs.com/)
   - Crea una cuenta gratuita
   - Configura un servicio de email (Gmail, Outlook, etc.)
   - Crea una plantilla de email

3. **Configurar en el código**:
   - Abre `src/components/SensorActivityMonitor.jsx`
   - Busca la función `sendEmailNotification`
   - Descomenta el código de EmailJS
   - Reemplaza:
     - `YOUR_SERVICE_ID` con tu Service ID
     - `YOUR_TEMPLATE_ID` con tu Template ID
     - `YOUR_PUBLIC_KEY` con tu Public Key

4. **Plantilla de Email sugerida**:
   ```
   Asunto: {{subject}}
   
   ALERTA DE SENSOR - SISTEMA DE MONITOREO MINERO
   
   Área: {{area_name}}
   Sensor: {{sensor_type}}
   Valor detectado: {{sensor_value}}
   Fecha y hora: {{timestamp}}
   
   Descripción:
   {{message}}
   
   Este es un mensaje automático del sistema de monitoreo.
   ```

### Opción 2: Backend Personalizado

1. **Crear endpoint en tu backend**:
   ```javascript
   // Ejemplo con Node.js/Express
   app.post('/api/send-notification-email', async (req, res) => {
     const { to_email, subject, message, area_name, sensor_type } = req.body;
     
     // Usar nodemailer, SendGrid, etc.
     // Implementar lógica de envío
     
     res.json({ success: true });
   });
   ```

2. **Descomentar código en el frontend**:
   - En `sendEmailNotification`, descomenta la sección de "endpoint personalizado"

### Opción 3: Servicio Externo (SendGrid, Mailgun, etc.)

1. **Configurar servicio de terceros**
2. **Crear endpoint proxy en tu backend**
3. **Actualizar la función `sendEmailNotification`**

## Estructura del Email de Notificación

Cada email incluye:
- **Destinatario**: jaiderpj16@gmail.com
- **Asunto**: 🚨 Alerta de Sensor - [Nombre del Área]
- **Contenido**:
  - Área afectada
  - Tipo de sensor
  - Valor detectado
  - Timestamp con zona horaria de Colombia
  - Mensaje descriptivo

## Pruebas

Para probar el sistema:
1. Simula un sensor con valor 0 (excepto temperatura)
2. Verifica en la consola del navegador los logs de notificación
3. Una vez configurado el servicio de email, verifica la recepción

## Notas Importantes

- El sistema solo envía notificaciones cuando un sensor cambia de un valor válido a 0
- No se envían notificaciones repetidas para el mismo estado
- La temperatura puede ser 0 sin generar alerta
- Todos los timestamps usan la zona horaria de Colombia (America/Bogota)

## Troubleshooting

- **No se envían emails**: Verifica la configuración del servicio de email
- **Emails duplicados**: El sistema previene esto, pero verifica la lógica de cambio de estado
- **Formato incorrecto**: Revisa la plantilla de email y los datos enviados