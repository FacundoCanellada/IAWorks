# Script para iniciar Backend y Frontend

Write-Host "Iniciando Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\IAWorks; npm run dev"

Start-Sleep -Seconds 5

Write-Host "Iniciando Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\IAWorks; npx http-server -p 3000 -c-1 --cors"

Start-Sleep -Seconds 3

Write-Host "`n✅ Servidores iniciados:" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nPresiona Enter para cerrar..." -ForegroundColor Gray
Read-Host
