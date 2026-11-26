@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar_reportaya.ps1"
if errorlevel 1 (
  echo No se pudo iniciar ReportaYa. Revisa el mensaje anterior.
  pause
  exit /b 1
)
