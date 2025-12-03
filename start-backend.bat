@echo off
echo ========================================
echo   IAWorks - Inicio del Servidor
echo ========================================
echo.

REM Verificar si existe node_modules
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias...
    call npm install
    echo.
)

REM Verificar si existe .env
if not exist ".env" (
    echo [ADVERTENCIA] No se encontro archivo .env
    echo.
    echo Por favor:
    echo 1. Copia .env.example a .env
    echo 2. Configura tus variables de entorno
    echo.
    echo Ejecutando: copy .env.example .env
    copy .env.example .env
    echo.
    echo [INFO] Archivo .env creado. Por favor configuralo antes de continuar.
    pause
    exit
)

echo [INFO] Iniciando servidor en modo desarrollo...
echo.
echo El servidor estara disponible en: http://localhost:5000
echo El frontend deberia abrirse en: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

npm run dev
