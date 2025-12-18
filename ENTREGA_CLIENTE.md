# 🎉 PLATAFORMA IAWORKS - ACCESO Y CREDENCIALES

## 🌐 URLS DE ACCESO

### **Sitio Web (Frontend):**
https://ia-works.vercel.app

### **API Backend:**
https://iaworks-production.up.railway.app

---

## 🔐 CREDENCIALES DE ADMINISTRADOR

### **Panel de Administración:**
- **URL:** https://ia-works.vercel.app
- **Email:** admin@iaworks.com
- **Contraseña:** admin123

⚠️ **IMPORTANTE:** Cambia esta contraseña después del primer inicio de sesión.

---

## 📋 PRIMEROS PASOS

### **1. Iniciar Sesión como Admin**
1. Ve a https://ia-works.vercel.app
2. Haz clic en "Iniciar Sesión" (esquina superior derecha)
3. Ingresa las credenciales de arriba
4. Serás redirigido al Panel de Administración

### **2. Configurar Métodos de Pago**
1. En el panel, ve a **"Configuración de Pagos"**
2. Completa AL MENOS UN método de pago:

   **PayPal:**
   - Ingresa tu email de PayPal Business
   
   **USDC (Criptomonedas):**
   - Ingresa tu dirección de wallet USDC
   - Selecciona la red (Ethereum/Polygon/BSC)
   
   **Transferencia Bancaria:**
   - IBAN
   - Titular de la cuenta
   - Nombre del banco

3. Haz clic en **"Guardar Configuración"**

### **3. Cambiar Contraseña del Admin**
1. Ve a la sección **"Usuarios"**
2. Busca tu usuario admin
3. Haz clic en "Resetear Contraseña"
4. Ingresa una contraseña segura nueva

---

## 💰 CÓMO FUNCIONA EL SISTEMA DE PAGOS

### **Flujo de Usuarios:**
1. Usuario se registra en la plataforma
2. Usuario elige un plan (Casual €20, Premium €40, Golden €60)
3. Usuario selecciona método de pago (PayPal/USDC/Banco)
4. Usuario realiza el pago EXTERNAMENTE (fuera de la plataforma)
5. Usuario confirma el pago en la plataforma
6. **El pago queda PENDIENTE de aprobación**

### **Flujo del Admin (TÚ):**
1. Ve a la sección **"Pagos Pendientes"** en el panel
2. Verás una tabla con todos los pagos esperando aprobación
3. Para cada pago, verifica:
   - Si es PayPal: Revisa tu cuenta PayPal
   - Si es USDC: Verifica el Transaction Hash en blockchain
   - Si es Banco: Verifica el comprobante y tu cuenta bancaria
4. Si el pago es válido, haz clic en **"Aprobar"**
5. Si el pago es falso/duplicado, haz clic en **"Rechazar"**
6. Al aprobar, la suscripción del usuario se activa automáticamente por 30 días

---

## 🎯 SECCIONES DEL PANEL DE ADMINISTRACIÓN

### **1. Dashboard**
- Estadísticas generales (usuarios, ingresos, suscripciones activas)
- Gráfico de usuarios por plan
- Lista de pagos recientes

### **2. Usuarios**
- Ver todos los usuarios registrados
- Suspender/Activar usuarios
- Cambiar plan de un usuario manualmente
- Resetear contraseñas

### **3. Cupones**
- Crear cupones de descuento
- Código personalizado (ej: BIENVENIDA20)
- Porcentaje de descuento
- Fecha de expiración
- Límite de usos
- Soporte para códigos de afiliados

### **4. Pagos Pendientes** ⭐ (MÁS IMPORTANTE)
- Ver todos los pagos esperando aprobación
- Detalles completos de cada pago
- Aprobar/Rechazar pagos
- Al aprobar, el usuario recibe acceso automáticamente

### **5. Configuración de Pagos**
- Configurar tus cuentas de PayPal, USDC, Banco
- Los usuarios verán esta información al hacer checkout

### **6. Logs del Sistema**
- Historial de eventos importantes
- Filtrar por tipo de evento
- Útil para debugging

---

## ⚙️ GESTIÓN DE LA PLATAFORMA

### **Cuentas de Hosting:**

**Railway (Backend):**
- URL: https://railway.app
- Proyecto: IAWorks
- Plan: Gratis (con $5 de crédito mensual)
- ⚠️ Si excedes los recursos, Railway te cobrará o pausará el servicio
- Puedes ver uso y estadísticas en el dashboard de Railway

**Vercel (Frontend):**
- URL: https://vercel.com
- Proyecto: ia-works
- Plan: Gratis (suficiente para tráfico medio)
- Despliegues automáticos desde GitHub

**MongoDB Atlas (Base de Datos):**
- URL: https://cloud.mongodb.com
- Cluster: IAWorksDB
- Plan: Gratis (512MB de almacenamiento)
- Ya está configurado y conectado

**GitHub (Código):**
- Repositorio: https://github.com/FacundoCanellada/IAWorks
- Todo el código está versionado aquí
- Cambios en GitHub se despliegan automáticamente

---

## 🔧 MANTENIMIENTO

### **Tareas Diarias:**
- Revisar "Pagos Pendientes" y aprobar/rechazar
- Responder consultas de usuarios

### **Tareas Semanales:**
- Revisar estadísticas del Dashboard
- Verificar que los servicios estén funcionando

### **Tareas Mensuales:**
- Verificar uso de recursos en Railway
- Revisar logs del sistema en busca de errores

---

## 🆘 SOPORTE Y CONTACTO

Si necesitas modificaciones, tienes problemas técnicos, o quieres agregar nuevas funcionalidades:

**Desarrollador:** [Tu nombre]
**Email:** [Tu email]
**Teléfono/WhatsApp:** [Tu número]

---

## 📊 PLANES DE SUSCRIPCIÓN

Los usuarios pueden elegir entre 3 planes:

| Plan | Precio | Duración |
|------|--------|----------|
| **Casual** | €20 | 30 días |
| **Premium** | €40 | 30 días |
| **Golden** | €60 | 30 días |

Puedes modificar estos planes contactando al desarrollador.

---

## ✅ CHECKLIST ANTES DE LANZAR

- [ ] Has iniciado sesión con las credenciales de admin
- [ ] Has configurado AL MENOS UN método de pago
- [ ] Has cambiado la contraseña del admin
- [ ] Has probado el flujo completo (crear usuario, hacer pago de prueba, aprobar)
- [ ] Has revisado todas las secciones del panel
- [ ] Tienes acceso a las cuentas de Railway y Vercel

---

## 🎉 ¡LISTO PARA RECIBIR USUARIOS Y PAGOS!

Tu plataforma está completamente funcional y lista para operar.

**Recuerda:**
- Los pagos NO son automáticos - debes aprobarlos manualmente
- Revisa "Pagos Pendientes" regularmente
- Mantén tu contraseña segura
- Haz backups de MongoDB Atlas periódicamente

---

**Fecha de entrega:** 11 de diciembre de 2025
**Versión:** 1.0 - Producción
