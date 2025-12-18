# 📚 DOCUMENTACIÓN TÉCNICA - IAWORKS

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Frontend:**
- **Hosting:** Vercel
- **Tecnología:** HTML5, JavaScript, TailwindCSS
- **URL:** https://ia-works.vercel.app

### **Backend:**
- **Hosting:** Railway
- **Tecnología:** Node.js, Express.js
- **URL:** https://iaworks-production.up.railway.app
- **Puerto:** 5000

### **Base de Datos:**
- **Hosting:** MongoDB Atlas
- **Región:** AWS São Paulo (sa-east-1)
- **Plan:** Free Tier (512MB)

---

## 🔑 ACCESOS A SERVICIOS

### **Railway (Backend Hosting)**
- Correo: [El que usaste para registrarte]
- Dashboard: https://railway.app/dashboard
- Para ver logs del backend, métricas, reiniciar servicios

### **Vercel (Frontend Hosting)**
- Correo: [El que usaste para registrarte]
- Dashboard: https://vercel.com/dashboard
- Para ver despliegues, analytics, dominios

### **MongoDB Atlas (Base de Datos)**
- Correo: [El que se usó para crear la cuenta]
- Dashboard: https://cloud.mongodb.com
- Para ver datos, hacer backups, monitorear uso

### **GitHub (Código Fuente)**
- Usuario: FacundoCanellada
- Repositorio: https://github.com/FacundoCanellada/IAWorks
- Todo el código está aquí

---

## 🔐 CREDENCIALES Y CONFIGURACIÓN

### **Variables de Entorno (Ya configuradas en Railway):**

```
MONGODB_URI=mongodb+srv://fcanellada2_db_user:e2XAnnVVNrRRhRZa@iaworksdb.ok65wab.mongodb.net/iaworks?retryWrites=true&w=majority

JWT_SECRET=iaworks_secret_key_change_in_production_12345

JWT_EXPIRE=7d

PORT=5000

NODE_ENV=production

FRONTEND_URL=https://ia-works.vercel.app
```

⚠️ **NOTA DE SEGURIDAD:** El JWT_SECRET actual es básico. Para mayor seguridad, cámbialo por una cadena aleatoria más larga.

---

## 🛠️ CÓMO HACER CAMBIOS

### **Si necesitas modificar algo en el futuro:**

1. **Cambios en el Frontend (HTML, CSS, JS):**
   - Edita los archivos en el repositorio de GitHub
   - Haz commit y push
   - Vercel desplegará automáticamente en 1-2 minutos

2. **Cambios en el Backend (Node.js):**
   - Edita los archivos en el repositorio de GitHub
   - Haz commit y push
   - Railway desplegará automáticamente en 2-3 minutos

3. **Cambios en la Base de Datos:**
   - Se manejan automáticamente desde el código
   - Si necesitas acceso directo, usa MongoDB Compass con la URI

---

## 📊 MONITOREO

### **Cómo saber si todo está funcionando:**

1. **Railway Dashboard:**
   - Ve a https://railway.app
   - Si el proyecto está "Online" con luz verde = Todo bien
   - Si está "Crashed" = Hay un error

2. **Vercel Dashboard:**
   - Ve a https://vercel.com
   - Mira los despliegues recientes
   - Si todos dicen "Ready" = Todo bien

3. **Prueba Manual:**
   - Abre https://ia-works.vercel.app
   - Si carga y puedes iniciar sesión = Todo bien

---

## 🚨 SOLUCIÓN DE PROBLEMAS COMUNES

### **"No puedo iniciar sesión"**
- Verifica que Railway esté "Online"
- Abre la consola del navegador (F12) y busca errores
- Verifica que la URL del backend sea correcta

### **"Los pagos no aparecen"**
- Verifica la conexión a MongoDB Atlas
- Revisa los logs en Railway
- Verifica que el usuario esté logueado

### **"El sitio no carga"**
- Verifica que Vercel esté "Ready"
- Limpia la caché del navegador (Ctrl + Shift + R)
- Espera 2-3 minutos (a veces tarda en propagarse)

### **"Error de CORS"**
- Verifica que FRONTEND_URL en Railway sea: https://ia-works.vercel.app
- Reinicia el servicio en Railway

---

## 💾 BACKUPS

### **MongoDB Atlas hace backups automáticos:**
- Snapshots diarios (últimos 2 días guardados)
- Para restaurar, ve a MongoDB Atlas > Clusters > Backup

### **Código (GitHub):**
- Todo el código tiene versionamiento automático
- Puedes ver el historial y restaurar versiones anteriores

---

## 💰 COSTOS

### **Actual (Todo Gratis):**
- Railway: $5/mes de crédito gratis
- Vercel: 100% gratis para este uso
- MongoDB Atlas: 100% gratis (512MB)
- **TOTAL: $0/mes**

### **Si Creces:**
- Railway puede cobrar si excedes los $5
- Vercel sigue gratis hasta ~100GB de bandwidth/mes
- MongoDB Atlas sigue gratis hasta 512MB de datos

---

## 📈 ESCALABILIDAD

### **Si tienes mucho tráfico en el futuro:**

1. **Railway:**
   - Actualizar al plan Hobby ($5/mes) o Pro ($20/mes)
   - Más CPU, RAM y bandwidth

2. **MongoDB Atlas:**
   - Actualizar a plan pago (~$9/mes para 2GB)
   - Más almacenamiento y mejores backups

3. **Vercel:**
   - Probablemente seguirá gratis
   - Plan Pro es $20/mes si necesitas más

---

## 🔒 SEGURIDAD

### **Implementado:**
- ✅ HTTPS en todos los servicios
- ✅ JWT para autenticación
- ✅ Contraseñas hasheadas con bcrypt
- ✅ CORS configurado
- ✅ Validación de roles (admin/user)

### **Recomendaciones futuras:**
- Cambiar JWT_SECRET por uno más fuerte
- Configurar rate limiting (limitar intentos de login)
- Agregar 2FA para admin
- Configurar emails de recuperación de contraseña

---

## 📞 CONTACTO TÉCNICO

Para soporte técnico, modificaciones o problemas:

**Desarrollador:** [Tu nombre]
**Email:** [Tu email]
**Disponibilidad:** [Tu horario]

---

**Última actualización:** 11 de diciembre de 2025
