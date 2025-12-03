# Guía de Inicio Rápido - IAWorks

## Requisitos Previos

1. **Node.js** (v16 o superior) - [Descargar](https://nodejs.org/)
2. **MongoDB** - Elige una opción:
   - **Local**: [Descargar MongoDB Community](https://www.mongodb.com/try/download/community)
   - **Cloud**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Gratuito)

## Instalación

### 1. Instalar Dependencias del Backend

```bash
# Desde la carpeta raíz del proyecto (d:\IAWorks)
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Copiar el template
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/iaworks

# JWT
JWT_SECRET=tu_clave_super_secreta_cambiar_en_produccion_12345
JWT_EXPIRE=7d

# Puerto
PORT=5000

# Email (opcional, para recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-de-app

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 3. Iniciar MongoDB

#### Opción A: MongoDB Local

```bash
# Windows
mongod

# Mac/Linux
sudo mongod
```

#### Opción B: MongoDB Atlas (Cloud)

1. Ir a https://www.mongodb.com/cloud/atlas
2. Crear cuenta gratuita
3. Crear cluster (tier gratuito)
4. Obtener string de conexión
5. Actualizar `MONGODB_URI` en `.env`:
   ```
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/iaworks
   ```

## Ejecución

### Iniciar Backend

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# O modo producción
npm start
```

El servidor estará en: **http://localhost:5000**

### Iniciar Frontend

Abre el archivo `index.html` en tu navegador o usa un servidor local:

#### Opción 1: Live Server (VS Code)
1. Instalar extensión "Live Server" en VS Code
2. Click derecho en `index.html`
3. Seleccionar "Open with Live Server"

#### Opción 2: Servidor HTTP Simple

```bash
# Python 3
python -m http.server 3000

# Node.js (instalar http-server globalmente)
npm install -g http-server
http-server -p 3000
```

El frontend estará en: **http://localhost:3000**

## Primer Uso

### 1. Configuración Inicial del Admin

Al abrir la aplicación por primera vez, verás una **pantalla de configuración inicial**.

Esta pantalla SOLO aparece la primera vez y te pide crear el primer administrador:

- **Nombre**: Tu nombre
- **Email**: admin@iaworks.com (o el que prefieras)
- **Contraseña**: Mínimo 6 caracteres
- **Clave de Admin**: `IAWORKS_ADMIN_2024`

Una vez creado el admin, esta pantalla **desaparece para siempre**.

### 2. Crear Usuarios

Ahora puedes:
- Usar "Registrarse" para crear cuentas de usuario normales
- Usar "Iniciar Sesión" para entrar con admin o usuarios

### 3. Configurar Email (Opcional)

Si quieres usar recuperación de contraseña:

1. Usar Gmail:
   - Ir a cuenta de Google
   - Activar autenticación de 2 factores
   - Generar "Contraseña de aplicación"
   - Usar esa contraseña en `SMTP_PASS`

2. Actualizar `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=contraseña-de-app-generada
   ```

## Estructura del Proyecto

```
d:\IAWorks\
├── Backend/
│   ├── config/
│   │   └── db.js                 # Configuración MongoDB
│   ├── controllers/
│   │   └── authController.js     # Lógica de autenticación
│   ├── middleware/
│   │   └── auth.js              # Protección de rutas
│   ├── models/
│   │   └── User.js              # Modelo de usuario
│   ├── routes/
│   │   └── authRoutes.js        # Endpoints API
│   ├── utils/
│   │   └── sendEmail.js         # Envío de emails
│   ├── .env                     # Variables de entorno
│   ├── server.js                # Servidor Express
│   └── package.json             # Dependencias
│
├── Frontend/
│   ├── index.html               # Página principal
│   ├── styles.css               # Estilos y animaciones
│   ├── script.js                # Lógica de la aplicación
│   └── api.js                   # Cliente de API
│
└── README.md                    # Este archivo
```

## Funcionalidades Implementadas

### ✅ Sistema de Usuarios
- Registro con validación
- Login con JWT
- Recuperación de contraseña
- Actualización de perfil
- Cambio de contraseña

### ✅ Sistema de Admin
- Creación de primer admin (una sola vez)
- Login de admin
- Verificación de permisos

### ✅ Dashboard
- Vista de perfil
- Configuración SMTP
- Configuración Instagram
- Ver leads y citas

### ✅ Animaciones
- Transiciones entre páginas
- Scroll reveal animations
- Efectos hover
- Loading states

## Endpoints de la API

### Públicos (sin autenticación)

```http
GET  /api/auth/admin/exists        # Verificar si existe admin
POST /api/auth/admin/create-first  # Crear primer admin
POST /api/auth/register            # Registrar usuario
POST /api/auth/login               # Login
POST /api/auth/forgot-password     # Recuperar contraseña
PUT  /api/auth/reset-password/:token  # Resetear contraseña
```

### Privados (requieren token)

```http
GET  /api/auth/me                  # Obtener perfil
PUT  /api/auth/profile             # Actualizar perfil
PUT  /api/auth/password            # Cambiar contraseña
PUT  /api/auth/smtp                # Configurar SMTP
PUT  /api/auth/instagram           # Configurar Instagram
```

## Solución de Problemas

### Error: "Cannot connect to MongoDB"

**Solución**:
1. Verificar que MongoDB esté ejecutándose
2. Revisar `MONGODB_URI` en `.env`
3. Si usas Atlas, verificar IP whitelist

### Error: "CORS"

**Solución**:
El backend ya tiene CORS habilitado. Verifica que:
- Backend esté en puerto 5000
- Frontend use el puerto configurado
- `FRONTEND_URL` en `.env` sea correcto

### Error: "Token inválido"

**Solución**:
1. Hacer logout
2. Limpiar localStorage del navegador
3. Volver a hacer login

### Pantalla de setup no aparece

**Solución**:
Si ya hay un admin en la BD pero quieres resetear:
1. Eliminar la base de datos
2. Reiniciar MongoDB
3. Recargar la aplicación

## Próximos Pasos

- [ ] Implementar gestión de planes de pago (Stripe/PayPal)
- [ ] Sistema completo de leads
- [ ] Calendario de citas
- [ ] Integración con Google Maps API
- [ ] Integración con Instagram Business API
- [ ] Sistema de email marketing
- [ ] Panel de administración completo

## Soporte

Para problemas o preguntas, revisar:
- `README_BACKEND.md` - Documentación detallada del backend
- Logs del servidor (consola donde corre `npm run dev`)
- Consola del navegador (F12)

## Licencia

ISC
