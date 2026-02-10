# 🤝 Integración de Zoho SalesIQ

## ✅ Estado de Integración

**Zoho SalesIQ** ha sido integrado exitosamente en tu tienda e-baby.

## 📍 Ubicación del Script

El widget de chat en vivo está instalado en: `index.html`

```html
<!-- Zoho SalesIQ Chat Widget -->
<script>
  window.$zoho = window.$zoho || {};
  $zoho.salesiq = $zoho.salesiq || {
    ready: function() {}
  }
</script>
<script 
  id="zsiqscript" 
  src="https://salesiq.zohopublic.eu/widget?wc=siq45ca2ee213a30162bc0b1cd88d271ebca1e8b1b631be7969995062c80d04bfa95c8dcf3a8994897cd11ade72f04cc865" 
  defer>
</script>
```

## 🎯 Características

El widget de Zoho SalesIQ te proporciona:

- ✅ **Chat en vivo** con tus clientes
- ✅ **Seguimiento de visitantes** en tiempo real
- ✅ **Análisis de comportamiento** de usuarios
- ✅ **Respuestas automáticas** y chatbots
- ✅ **Integración con CRM** de Zoho
- ✅ **Historial de conversaciones**
- ✅ **Notificaciones** de mensajes nuevos

## 🎨 Personalización del Widget

### Cambiar Colores y Estilo

Puedes personalizar el widget desde el panel de Zoho SalesIQ:

1. Accede a tu panel: https://salesiq.zoho.eu/
2. Ve a **Settings** → **Brands** → **Widget**
3. Personaliza:
   - Color principal (sugerido: `#FFC1CC` - rosa pastel)
   - Color secundario (sugerido: `#83b5b6` - turquesa pastel)
   - Posición del widget (recomendado: esquina inferior derecha)
   - Mensaje de bienvenida
   - Avatar del operador

### Colores Recomendados (Coincide con tu Marca)

```css
/* Rosa pastel - Color principal */
#FFC1CC

/* Turquesa pastel - Color secundario */
#83b5b6

/* Blanco suave - Fondo */
#FFFFFF
```

## 🚀 Funcionalidades Avanzadas

### 1. Configurar Mensajes Automáticos

```javascript
<script>
window.$zoho = window.$zoho || {};
$zoho.salesiq = $zoho.salesiq || {
  ready: function() {
    // Mensaje de bienvenida personalizado
    $zoho.salesiq.chat.greetings({
      name: "Bienvenida",
      text: "¡Hola! 👶 ¿En qué puedo ayudarte con productos para tu bebé?",
      delay: 3000 // Mostrar después de 3 segundos
    });
  }
}
</script>
```

### 2. Tracking de Eventos Personalizados

```javascript
// Rastrear cuando un usuario agrega al carrito
$zoho.salesiq.visitor.customaction("product_added_to_cart", {
  product_name: "Nombre del producto",
  price: 29.99
});

// Rastrear cuando completa una compra
$zoho.salesiq.visitor.customaction("purchase_completed", {
  order_value: 150.00,
  order_id: "ORD-12345"
});
```

### 3. Pre-llenar Información del Visitante

```javascript
$zoho.salesiq.visitor.name("Nombre del Cliente");
$zoho.salesiq.visitor.email("cliente@email.com");
$zoho.salesiq.visitor.contactnumber("+34123456789");
```

### 4. Mostrar/Ocultar Widget Programáticamente

```javascript
// Mostrar el widget
$zoho.salesiq.floatwindow.visible("show");

// Ocultar el widget
$zoho.salesiq.floatwindow.visible("hide");

// Abrir la ventana de chat
$zoho.salesiq.floatwindow.open();

// Cerrar la ventana de chat
$zoho.salesiq.floatwindow.close();
```

## 📊 Métricas y Análisis

### Dashboard de Zoho SalesIQ

Accede a: https://salesiq.zoho.eu/dashboard

Podrás ver:
- 📈 Número de visitantes en tiempo real
- 💬 Chats activos y en espera
- ⏱️ Tiempo promedio de respuesta
- 📊 Páginas más visitadas
- 🎯 Tasa de conversión
- 📍 Ubicación geográfica de visitantes

## 🎨 Integración con tu Diseño

El widget se integra automáticamente con tu diseño de tonos pastel. Para una mejor experiencia:

### Recomendaciones de Posición

1. **Esquina inferior derecha** (Recomendado)
   - No obstruye el contenido principal
   - Visible pero no intrusivo
   - Compatible con el botón de WhatsApp

2. **Esquina inferior izquierda**
   - Alternativa si tienes otros widgets a la derecha

### Espaciado con Otros Elementos

Si tienes el botón de WhatsApp u otros elementos flotantes, ajusta en Zoho:
- **Margin bottom**: 80-100px (para evitar solapamiento)
- **Margin right/left**: 20px (espacio del borde)

## 🔧 Configuración Recomendada

### Horarios de Atención

1. Ve a **Settings** → **Work Hours**
2. Configura tus horarios (ej: Lun-Vie 9:00-18:00)
3. Fuera de horario: Activa respuesta automática

### Respuestas Automáticas Sugeridas

```
🤖 Preguntas Frecuentes:
- "¿Cuál es el tiempo de envío?" 
  → "El envío tarda 2-3 días laborables en España"

- "¿Tienen descuentos?"
  → "¡Sí! Usa el código BABY15 para 15% de descuento"

- "¿Los productos son seguros?"
  → "Todos nuestros productos cumplen con certificaciones CE y son hipoalergénicos"

- "¿Aceptan devoluciones?"
  → "Sí, tienes 30 días para devoluciones sin preguntas"
```

### Integración con Equipo

1. **Agregar operadores**: Settings → Operators → Add Operator
2. **Departamentos**: Crea departamentos (Ventas, Soporte, Devoluciones)
3. **Asignación automática**: Distribuye chats entre operadores

## 📱 Experiencia Mobile

El widget es **totalmente responsive** y se adapta a:
- 📱 Móviles (iOS y Android)
- 💻 Tablets
- 🖥️ Escritorio

En móviles, el widget se posiciona automáticamente sobre tu `MobileBottomNav`.

## 🔐 Privacidad y GDPR

### Cumplimiento RGPD

Zoho SalesIQ cumple con GDPR. Considera agregar:

```html
<!-- Banner de cookies (si no lo tienes) -->
<div class="cookie-banner">
  Usamos chat en vivo para mejorar tu experiencia. 
  <a href="/privacidad">Ver política de privacidad</a>
</div>
```

### Configurar Privacidad

1. Ve a **Settings** → **Privacy**
2. Habilita:
   - ✅ Anonimizar IPs
   - ✅ Solicitar consentimiento de cookies
   - ✅ Periodo de retención de datos (ej: 12 meses)

## 🎯 Tips para Maximizar Conversiones

### 1. Mensajes Proactivos
Configura mensajes que se activen cuando:
- El usuario permanece más de 30 segundos en una página de producto
- El usuario visita el carrito pero no compra (abandono de carrito)
- El usuario visita por tercera vez

### 2. Chat Buttons en Páginas Clave
Agrega botones "Chat con nosotros" en:
- Página de producto (dudas específicas)
- Checkout (resolver problemas de pago)
- Categorías (ayuda para elegir)

Ejemplo de implementación:
```javascript
<button 
  onClick={() => $zoho.salesiq.floatwindow.open()}
  className="chat-button"
>
  💬 ¿Tienes dudas? Chatea con nosotros
</button>
```

### 3. Seguimiento Post-Chat
- Solicita feedback después de cada chat
- Envía encuestas de satisfacción
- Ofrece descuentos para próximas compras

## 📞 Soporte de Zoho

- 📧 Email: support@zohosalesiq.com
- 📚 Documentación: https://www.zoho.com/salesiq/help/
- 🎥 Tutoriales: https://www.zoho.com/salesiq/videos/
- 💬 Community: https://help.zoho.com/portal/community/salesiq

## ✅ Checklist de Configuración

- [x] Script de Zoho SalesIQ agregado a `index.html`
- [ ] Personalizar colores del widget (rosa/turquesa pastel)
- [ ] Configurar horarios de atención
- [ ] Crear respuestas automáticas para FAQs
- [ ] Agregar operadores al equipo
- [ ] Configurar mensajes de bienvenida
- [ ] Ajustar posición del widget (no obstruir otros elementos)
- [ ] Configurar privacidad y GDPR
- [ ] Probar en móvil, tablet y escritorio
- [ ] Configurar notificaciones por email/push

## 🎨 Código de Colores para Dashboard

Para que el widget coincida con tu diseño:

**Configuración en Zoho SalesIQ Dashboard:**
```
Primary Color: #FFC1CC (Rosa pastel)
Secondary Color: #83b5b6 (Turquesa pastel)
Button Color: #FFC1CC
Chat Background: #FFFFFF
Operator Bubble: #E0F7FA (Turquesa suave)
Visitor Bubble: #FFF9C4 (Amarillo pastel)
```

---

**Nota:** El widget estará visible automáticamente en tu sitio web después del próximo despliegue. Puedes configurar todas las opciones desde el panel de Zoho SalesIQ sin necesidad de modificar código.
