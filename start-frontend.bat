@echo off
echo ========================================
echo   IAWorks - Abrir Frontend
echo ========================================
echo.
echo Abriendo el frontend en el navegador...
echo.
echo IMPORTANTE: Asegurate de que el backend este corriendo en http://localhost:5000
echo.

REM Intentar abrir con Python (si está instalado)
where python >nul 2>nul
if %errorlevel% == 0 (
    echo [INFO] Iniciando servidor HTTP con Python en puerto 3000...
    echo.
    echo El frontend estara disponible en: http://localhost:3000
    echo.
    echo Presiona Ctrl+C para detener el servidor
    echo ========================================
    echo.
    start http://localhost:3000
    python -m http.server 3000
) else (
    echo [INFO] Python no encontrado. Abriendo archivo directamente...
    echo.
    echo NOTA: Para mejor experiencia, instala Python o usa Live Server de VS Code
    echo.
    start index.html
)
