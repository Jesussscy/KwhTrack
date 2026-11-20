@echo off
rem Inicia MySQL local persistente y el servidor de kwhTrack. Doble clic para usar.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0backend\tools\kwh-local.ps1" start
echo.
pause
