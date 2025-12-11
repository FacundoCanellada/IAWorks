# 📋 INSTRUCCIONES PARA EL ADMINISTRADOR

## 🎯 LO QUE RECIBES

Este proyecto es una plataforma de suscripciones con sistema de pagos manual.

### **Componentes:**
- ✅ Backend (Node.js + Express)
- ✅ Frontend (HTML, CSS, JavaScript)
- ✅ Base de datos MongoDB Atlas (ya configurada)
- ✅ Sistema de usuarios y autenticación
- ✅ Panel de administración completo
- ✅ Sistema de pagos con 3 métodos (PayPal, USDC, Banco)

---

## 🔐 CREDENCIALES DE ACCESO

### **Admin del Sistema:**
- **Email:** `admin@iaworks.com`
- **Contraseña:** `admin123`

⚠️ **IMPORTANTE:** Cambia esta contraseña después del primer login.

### **MongoDB Atlas:**
- Ya está configurado y funcionando
- Conexión: Configurada en el archivo `.env`

---

## 🚀 OPCIÓN A: HOSTING EN LA NUBE (Recomendado)

### **1. Subir Backend a Railway.app**

1. Ve a [railway.app](https://railway.app) y crea una cuenta
2. Click en "New Project" → "Deploy from GitHub repo"
3. Conecta este repositorio
4. Railway detectará automáticamente que es Node.js
5. Agrega las variables de entorno:
   - `MONGODB_URI` = (el que está en `.env`)
   - `JWT_SECRET` = (el que está en `.env`)
   - `FRONTEND_URL` = La URL que te dará Vercel/Netlify
   - `PORT` = 5000
   - `NODE_ENV` = production

6. Railway te dará una URL tipo: `https://tuproyecto.up.railway.app`

### **2. Subir Frontend a Vercel**

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Click en "New Project"
3. Sube solo estos archivos:
   - `index.html`
   - `script.js`
   - `api.js`
   - `styles.css`
4. Antes de subir, edita `api.js` y cambia:
   ```javascript
   const BASE_URL = 'https://tuproyecto.up.railway.app/api';
   ```
5. Vercel te dará una URL tipo: `https://tuproyecto.vercel.app`

### **3. Actualizar CORS en Backend**

Edita el archivo `.env` y cambia:
```
FRONTEND_URL=https://tuproyecto.vercel.app
```

---

## 🖥️ OPCIÓN B: SERVIDOR PROPIO (VPS)

Si prefieres tu propio servidor:

### **Requisitos:**
- VPS con Ubuntu 20.04+ (DigitalOcean, Contabo, etc.)
- Node.js 16+
- Nginx
- Dominio propio (opcional pero recomendado)

### **Instalación:**

```bash
# 1. Conectar al servidor
ssh root@tu-servidor-ip

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 3. Instalar PM2 (para mantener el servidor corriendo)
npm install -g pm2

# 4. Clonar el proyecto
cd /var/www
git clone tu-repositorio iaworks
cd iaworks

# 5. Instalar dependencias
npm install

# 6. Configurar variables de entorno
nano .env
# (Copiar el contenido del .env)

# 7. Iniciar el backend con PM2
pm2 start server.js --name iaworks-backend
pm2 save
pm2 startup

# 8. Configurar Nginx para el frontend
nano /etc/nginx/sites-available/iaworks

# Contenido:
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        root /var/www/iaworks;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Activar el sitio
ln -s /etc/nginx/sites-available/iaworks /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 9. Obtener SSL (HTTPS) gratis
apt-get install certbot python3-certbot-nginx
certbot --nginx -d tu-dominio.com
```

---

## 💻 OPCIÓN C: EJECUTAR LOCALMENTE

Si solo quieres probarlo en tu computadora:

### **Windows:**

1. Instalar [Node.js](https://nodejs.org/) (versión 16 o superior)
2. Abrir PowerShell en la carpeta del proyecto
3. Instalar dependencias:
   ```powershell
   npm install
   ```
4. Iniciar backend:
   ```powershell
   npm run dev
   ```
5. Abrir otra terminal e iniciar frontend:
   ```powershell
   npx http-server -p 3000 -c-1 --cors
   ```
6. Abrir navegador en: `http://localhost:3000`

### **Mac/Linux:**

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar backend
npm run dev &

# 3. Iniciar frontend
npx http-server -p 3000 -c-1 --cors &

# 4. Abrir navegador
open http://localhost:3000
```

---

## 🎯 PRIMER USO - CONFIGURACIÓN INICIAL

### **Paso 1: Acceder al Panel de Admin**

1. Abre la URL del proyecto
2. Click en "Iniciar Sesión" (arriba a la derecha)
3. Ingresa:
   - Email: `admin@iaworks.com`
   - Contraseña: `admin123`

### **Paso 2: Configurar Métodos de Pago**

1. En el panel de admin, ve a **"Configuración de Pagos"**
2. Completa AL MENOS UN método de pago:

**PayPal:**
- Ingresa tu email de PayPal Business

**USDC (Criptomonedas):**
- Dirección de tu wallet USDC
- Red que usas (Ethereum/Polygon/BSC)

**Transferencia Bancaria:**
- Tu IBAN
- Titular de la cuenta
- Nombre del banco

3. Click en **"Guardar Configuración"**

### **Paso 3: Cambiar Contraseña de Admin**

1. Ve a **"Usuarios"**
2. Busca tu usuario admin
3. Click en "Resetear Contraseña"
4. Ingresa una contraseña segura

---

## 📊 USO DIARIO

### **Aprobar Pagos:**

1. Los usuarios eligen un plan y pagan
2. Sus pagos aparecen en **"Pagos Pendientes"**
3. Verifica el pago (revisa tu PayPal/Wallet/Banco)
4. Si el pago es correcto, click en **"Aprobar"**
5. La suscripción del usuario se activa automáticamente

### **Gestionar Usuarios:**

- Ve a **"Usuarios"** para ver todos los usuarios
- Puedes suspender, activar o cambiar planes
- Puedes resetear contraseñas si un usuario lo olvida

### **Crear Cupones de Descuento:**

1. Ve a **"Cupones"**
2. Click en "Crear Nuevo Cupón"
3. Ingresa código, descuento %, fecha de expiración
4. Click en "Guardar"

### **Ver Estadísticas:**

- El **Dashboard** muestra:
  - Total de usuarios
  - Ingresos totales
  - Suscripciones activas
  - Pagos pendientes
  - Gráfico de usuarios por plan

---

## ⚙️ CONFIGURACIÓN AVANZADA

### **Cambiar JWT Secret:**

1. Edita el archivo `.env`
2. Cambia `JWT_SECRET` por algo aleatorio y largo
3. Ejemplo: `JWT_SECRET=K8mN9pQ2rS5tU7vW3xY6zA1bC4dE9fG2hJ5kL8mN1pQ4rS7tU0vW3xY6zA9bC2dE5fG8hJ1kL4`

### **Configurar Email (Recuperación de Contraseña):**

1. Edita el archivo `.env`
2. Agrega tus credenciales SMTP:
   ```
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-contraseña-de-app
   ```
3. Para Gmail, genera una contraseña de aplicación en [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

## 🆘 SOPORTE

### **Problemas Comunes:**

**"No puedo iniciar sesión"**
- Verifica que backend y frontend estén corriendo
- Revisa que la URL de backend en `api.js` sea correcta
- Abre la consola del navegador (F12) para ver errores

**"Los pagos no se guardan"**
- Verifica la conexión a MongoDB Atlas
- Revisa que el usuario esté logueado
- Verifica que hayas configurado los métodos de pago

**"No recibo emails de recuperación"**
- Configura las credenciales SMTP en `.env`
- Verifica que el servidor permita envío de emails

---

## 📞 CONTACTO CON EL DESARROLLADOR

Si necesitas ayuda adicional o modificaciones:
- [Inserta tus datos de contacto aquí]

---

## 🎉 ¡LISTO!

Tu plataforma está completamente funcional y lista para recibir usuarios y pagos.

**Recuerda:**
- Revisa "Pagos Pendientes" diariamente
- Aprueba solo pagos verificados
- Mantén tu contraseña segura
- Haz backups regulares de MongoDB Atlas
