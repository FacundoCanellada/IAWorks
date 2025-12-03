# 🚀 Inicio Rápido - IAWorks

## Opción 1: Scripts Automáticos (Windows)

### Iniciar Backend:
```bash
start-backend.bat
```

### Iniciar Frontend (en otra terminal):
```bash
start-frontend.bat
```

## Opción 2: Manual

### Terminal 1 - Backend:
```bash
npm install
npm run dev
```

### Terminal 2 - Frontend:
```bash
# Con Python
python -m http.server 3000

# O abrir index.html con Live Server de VS Code
```

## URLs

- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000

## Primera Vez

1. Abre http://localhost:3000
2. Verás la pantalla de "Configuración Inicial"
3. Crea el primer administrador:
   - Nombre: Tu nombre
   - Email: admin@iaworks.com
   - Contraseña: admin123
   - Clave Admin: `IAWORKS_ADMIN_2024`
4. ¡Listo! Ya puedes usar la aplicación

## Flujo Completo

```
Landing Page
    ↓
Registrarse → Login → Dashboard
    ↓              ↓
Ver perfil    Configurar SMTP/Instagram
              Ver leads y citas
```

## Verificar que todo funciona

1. Backend corriendo en puerto 5000
2. Frontend corriendo en puerto 3000
3. MongoDB corriendo (local o Atlas)
4. Pantalla de setup inicial aparece al abrir

## ¿Problemas?

Ver README.md para solución de problemas detallada.
