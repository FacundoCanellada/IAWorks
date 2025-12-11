# Script para preparar el proyecto para entregar

Write-Host "🚀 Preparando proyecto IAWorks para entrega..." -ForegroundColor Cyan

# Crear carpeta de entrega
$deliveryFolder = "IAWorks-Entrega"
if (Test-Path $deliveryFolder) {
    Remove-Item -Recurse -Force $deliveryFolder
}
New-Item -ItemType Directory -Path $deliveryFolder | Out-Null

Write-Host "📦 Copiando archivos del proyecto..." -ForegroundColor Yellow

# Archivos del backend
Copy-Item -Path "server.js" -Destination $deliveryFolder
Copy-Item -Path "package.json" -Destination $deliveryFolder
Copy-Item -Path "package-lock.json" -Destination $deliveryFolder
Copy-Item -Path ".env.example" -Destination $deliveryFolder
Copy-Item -Path ".gitignore" -Destination $deliveryFolder

# Carpetas del backend
Copy-Item -Path "models" -Destination "$deliveryFolder\models" -Recurse
Copy-Item -Path "controllers" -Destination "$deliveryFolder\controllers" -Recurse
Copy-Item -Path "routes" -Destination "$deliveryFolder\routes" -Recurse
Copy-Item -Path "middleware" -Destination "$deliveryFolder\middleware" -Recurse
Copy-Item -Path "utils" -Destination "$deliveryFolder\utils" -Recurse
Copy-Item -Path "config" -Destination "$deliveryFolder\config" -Recurse

# Frontend
Copy-Item -Path "index.html" -Destination $deliveryFolder
Copy-Item -Path "script.js" -Destination $deliveryFolder
Copy-Item -Path "api.js" -Destination $deliveryFolder
Copy-Item -Path "styles.css" -Destination $deliveryFolder

# Documentación
Copy-Item -Path "README.md" -Destination $deliveryFolder
Copy-Item -Path "INSTRUCCIONES_ADMIN.md" -Destination $deliveryFolder
Copy-Item -Path "SISTEMA_PAGOS_COMPLETO.md" -Destination $deliveryFolder

# Copiar el .env REAL (CON CREDENCIALES) para el admin
Copy-Item -Path ".env" -Destination "$deliveryFolder\.env"

Write-Host "✅ Archivos copiados correctamente" -ForegroundColor Green

# Comprimir todo
Write-Host "📦 Comprimiendo proyecto..." -ForegroundColor Yellow
Compress-Archive -Path $deliveryFolder -DestinationPath "IAWorks-COMPLETO.zip" -Force

Write-Host ""
Write-Host "🎉 ¡PROYECTO LISTO PARA ENTREGAR!" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Archivo generado: IAWorks-COMPLETO.zip" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 El archivo incluye:" -ForegroundColor White
Write-Host "   ✅ Backend completo (Node.js + Express)" -ForegroundColor Gray
Write-Host "   ✅ Frontend completo (HTML + CSS + JS)" -ForegroundColor Gray
Write-Host "   ✅ Base de datos configurada (MongoDB Atlas)" -ForegroundColor Gray
Write-Host "   ✅ Archivo .env CON CREDENCIALES" -ForegroundColor Gray
Write-Host "   ✅ Instrucciones completas para el admin" -ForegroundColor Gray
Write-Host "   ✅ Documentación del sistema de pagos" -ForegroundColor Gray
Write-Host ""
Write-Host "📧 Envía el archivo IAWorks-COMPLETO.zip al administrador" -ForegroundColor Yellow
Write-Host "📖 El admin debe leer INSTRUCCIONES_ADMIN.md primero" -ForegroundColor Yellow
Write-Host ""

# Limpiar carpeta temporal
Remove-Item -Recurse -Force $deliveryFolder

Write-Host "Presiona Enter para cerrar..."
Read-Host
