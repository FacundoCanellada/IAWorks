# Panel de Administración - Integrado ✅

## 🎨 Estilo y Diseño
El panel de administración mantiene **exactamente el mismo estilo** que el dashboard de usuario:
- ✅ Sidebar gris con navegación lateral
- ✅ Tarjetas con efecto `card-hover`
- ✅ Colores del gradiente púrpura-índigo
- ✅ Iconos de Lucide
- ✅ Tablas con bordes redondeados
- ✅ Mismo layout responsive

## 📋 Funcionalidades Implementadas

### 1. Dashboard Admin (admin-home)
**Estadísticas en tiempo real:**
- Total de usuarios
- Ingresos totales (€)
- Suscripciones activas
- Pagos pendientes de aprobación

**Gráficos:**
- Distribución de usuarios por plan (Casual/Premium/Golden)
- Lista de pagos recientes

**API:** `GET /api/admin/stats`

---

### 2. Gestión de Usuarios (admin-users)
**Tabla completa con:**
- Nombre, Email, Plan, Estado
- Acciones: Suspender/Activar usuario
- Acciones: Cambiar plan de usuario

**APIs:**
- `GET /api/admin/users` - Listar todos los usuarios
- `POST /api/admin/users/toggle-status` - Suspender/activar
- `PUT /api/admin/users/change-plan` - Cambiar plan

---

### 3. Gestión de Cupones (admin-coupons)
**Grid de cupones con:**
- Código del cupón (ej: VERANO2024)
- Porcentaje de descuento (%)
- Fecha de expiración
- Usos actuales / Usos máximos
- Estado: Activo/Inactivo

**Modal para crear cupón:**
- Código (obligatorio)
- Descuento % (1-100)
- Fecha de expiración
- Usos máximos (opcional)

**APIs:**
- `GET /api/admin/coupons` - Listar cupones
- `POST /api/admin/coupons` - Crear cupón
- `PUT /api/admin/coupons/:id` - Actualizar cupón
- `DELETE /api/admin/coupons/:id` - Eliminar cupón

---

### 4. Configuración de Pagos (admin-payments)
**3 tarjetas con formularios:**

**PayPal:**
- Email de PayPal Business

**USDC Wallet:**
- Dirección de wallet USDC
- Red (Ethereum/Polygon/BSC)

**Transferencia Bancaria:**
- IBAN
- Titular de la cuenta
- Nombre del banco

**API:**
- `PUT /api/payment/config` - Guardar configuración

---

### 5. Logs del Sistema (admin-logs)
**Tabla de logs con:**
- Fecha y hora
- Tipo (payment, error, instagram, email, system)
- Nivel (info, warning, error)
- Mensaje
- Usuario relacionado

**Filtros:**
- Por tipo de log (dropdown)

**API:**
- `GET /api/admin/logs?type=payment` - Obtener logs

---

## 🔐 Sistema de Acceso

### Login como Admin:
1. Ir a `/login-page`
2. Usar credenciales de admin
3. **Automáticamente redirige a `admin-page`** (no al dashboard normal)

### Navegación en el Panel:
```javascript
// Sidebar del admin
- Dashboard       → admin-home
- Usuarios        → admin-users
- Cupones         → admin-coupons
- Config Pagos    → admin-payments
- Logs            → admin-logs
```

---

## 🧪 Cómo Probar

### 1. Iniciar servidores:
```powershell
# Terminal 1 - Backend
cd D:\IAWorks
npm run dev

# Terminal 2 - Frontend
cd D:\IAWorks
npx http-server -p 3000
```

### 2. Acceder como admin:
```
http://localhost:3000
→ Login con credenciales de admin
→ Automáticamente va a admin-page
```

### 3. Probar cada sección:
- **Dashboard**: Verificar que carga estadísticas
- **Usuarios**: Ver tabla de usuarios, intentar suspender/cambiar plan
- **Cupones**: Crear un cupón de prueba (ej: TEST2024, 20% descuento)
- **Config Pagos**: Guardar configuración de PayPal/USDC/Bank
- **Logs**: Ver historial de eventos

---

## 📁 Archivos Modificados

### Backend:
- ✅ `models/Coupon.js` - Modelo de cupones
- ✅ `models/Log.js` - Modelo de logs
- ✅ `controllers/adminController.js` - Lógica de admin (10+ funciones)
- ✅ `routes/adminRoutes.js` - Rutas protegidas de admin
- ✅ `server.js` - Montaje de rutas `/api/admin`

### Frontend:
- ✅ `index.html` - Página completa `admin-page` + modal de cupones
- ✅ `api.js` - Objeto `AdminAPI` con todos los métodos
- ✅ `script.js` - 15+ funciones de admin (loadAdminStats, loadUsers, createCoupon, etc.)

---

## 🎯 Próximos Pasos

### Para probar sistema de pagos:
1. Configurar métodos de pago en panel de admin
2. Ir a landing page (logout del admin)
3. Registrar un usuario normal
4. Elegir un plan (Casual/Premium/Golden)
5. Seleccionar método de pago (PayPal/USDC/Bank)
6. Confirmar pago según el método elegido

### Verificaciones:
- [ ] Admin puede ver estadísticas reales
- [ ] Admin puede suspender usuarios
- [ ] Admin puede cambiar planes de usuarios
- [ ] Cupones se crean y validan correctamente
- [ ] Configuración de pagos se guarda en User.paymentConfig
- [ ] Logs se registran automáticamente (pagos, errores, etc.)

---

## 💡 Notas Importantes

1. **Middleware de protección**: Todas las rutas `/api/admin/*` requieren:
   - Token JWT válido (`protect`)
   - Role = 'admin' (`admin` middleware)

2. **Redirección automática**: 
   - Admin login → `admin-page`
   - User login → `landing-page`

3. **Estilo consistente**: El panel usa las mismas clases CSS que el resto de la app:
   - `card-hover` para efectos de tarjetas
   - `btn-primary` para botones principales
   - `bg-gradient-to-r from-purple-600 to-indigo-600` para gradientes

4. **Iconos de Lucide**: Se inicializan con `lucide.createIcons()` después de cada cambio de página

---

## 🚀 ¡Panel Admin Listo para Usar!

El panel de administración está **completamente integrado** y listo para probar. 

**Siguiente paso:** Probar flujo completo de pagos con usuario normal.
