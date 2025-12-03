# IAWorks Backend - Sistema de Autenticación

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configurar variables de entorno en `.env`:
   - `MONGODB_URI`: URL de conexión a MongoDB
   - `JWT_SECRET`: Clave secreta para JWT
   - `SMTP_*`: Configuración de email para recuperación de contraseña

## Configuración de MongoDB

### Opción 1: MongoDB Local
```bash
# Instalar MongoDB Community Edition
# Luego usar:
MONGODB_URI=mongodb://localhost:27017/iaworks
```

### Opción 2: MongoDB Atlas (Cloud)
1. Crear cuenta en https://www.mongodb.com/cloud/atlas
2. Crear un cluster gratuito
3. Obtener la URL de conexión
4. Configurar en `.env`:
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/iaworks
```

## Ejecutar el servidor

### Modo desarrollo (con auto-reload):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor se ejecutará en: `http://localhost:5000`

## Estructura del Proyecto

```
d:\IAWorks\
├── config/
│   └── db.js                 # Configuración de base de datos
├── controllers/
│   └── authController.js     # Controladores de autenticación
├── middleware/
│   └── auth.js              # Middleware de autenticación
├── models/
│   └── User.js              # Modelo de usuario
├── routes/
│   └── authRoutes.js        # Rutas de autenticación
├── utils/
│   └── sendEmail.js         # Utilidad para envío de emails
├── .env.example             # Ejemplo de variables de entorno
├── .gitignore               # Archivos ignorados por git
├── package.json             # Dependencias del proyecto
└── server.js                # Punto de entrada del servidor
```

## Endpoints de la API

### Autenticación

#### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

#### Recuperar Contraseña
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "juan@example.com"
}
```

#### Resetear Contraseña
```http
PUT /api/auth/reset-password/:resetToken
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### Rutas Protegidas (requieren token)

#### Obtener Perfil
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Actualizar Perfil
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Juan Pérez Actualizado",
  "email": "juannuevo@example.com"
}
```

#### Actualizar Contraseña
```http
PUT /api/auth/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

#### Configurar SMTP
```http
PUT /api/auth/smtp
Authorization: Bearer {token}
Content-Type: application/json

{
  "host": "smtp.gmail.com",
  "port": 587,
  "user": "tu-email@gmail.com",
  "pass": "tu-app-password"
}
```

#### Configurar Instagram
```http
PUT /api/auth/instagram
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "tu_instagram",
  "accessToken": "token_de_instagram",
  "businessAccountId": "id_de_cuenta"
}
```

### Administración

#### Verificar si existe Admin
```http
GET /api/auth/admin/exists
```

#### Crear Primer Admin (solo si no existe ninguno)
```http
POST /api/auth/admin/create-first
Content-Type: application/json

{
  "name": "Administrador",
  "email": "admin@iaworks.com",
  "password": "admin123",
  "adminKey": "IAWORKS_ADMIN_2024"
}
```

**Nota:** La clave de admin está definida en el código. Cámbiala en producción.

## Configuración de Email (Gmail)

Para usar Gmail como SMTP:

1. Ir a tu cuenta de Google
2. Activar autenticación de 2 factores
3. Generar una "Contraseña de aplicación"
4. Usar esa contraseña en `SMTP_PASS`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
```

## Características Implementadas

✅ **Sistema de Usuarios**
- Registro con validación de email
- Login con JWT
- Recuperación de contraseña por email
- Actualización de perfil y contraseña

✅ **Configuraciones de Usuario**
- Conexión SMTP para email marketing
- Conexión Instagram Business para setter
- Ver plan actual y fechas
- Ver leads y citas generadas

✅ **Sistema de Administrador**
- Verificación de existencia de admin
- Creación de primer admin (una sola vez)
- Protección de rutas con middleware de admin

✅ **Seguridad**
- Contraseñas encriptadas con bcrypt
- Tokens JWT con expiración
- Validación de datos con express-validator
- Tokens de recuperación con expiración de 10 minutos

## Próximos Pasos

1. Conectar el frontend con estas APIs
2. Implementar gestión de planes de pago
3. Crear sistema de leads
4. Implementar calendario de citas
5. Integrar servicios de email marketing
6. Integrar Instagram Business API

## Notas de Seguridad

⚠️ **IMPORTANTE para Producción:**
- Cambiar `JWT_SECRET` por una clave segura y aleatoria
- Cambiar `adminKey` en `createFirstAdmin`
- Usar HTTPS
- Configurar rate limiting
- Implementar CSRF protection
- Validar todos los inputs
