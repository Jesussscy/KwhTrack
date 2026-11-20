@echo off
rem Detiene el servidor y apaga MySQL de forma ordenada (los datos se conservan).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0backend\tools\kwh-local.ps1" stop
echo.
pause
