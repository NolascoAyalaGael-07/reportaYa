$ErrorActionPreference = 'Stop'

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$sourceRoot = Join-Path $repositoryRoot '01_Codigo_Fuente'
$backendPath = Join-Path $sourceRoot 'backend'
$frontendPath = Join-Path $sourceRoot 'frontend'

if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
  throw 'No se encontró Node.js. Instala Node.js y vuelve a iniciar ReportaYa.'
}

if (-not (Test-Path (Join-Path $backendPath '.env'))) {
  throw 'Falta 01_Codigo_Fuente\backend\.env. Sigue la configuración de MySQL indicada en el README principal.'
}

foreach ($directory in @($backendPath, $frontendPath)) {
  if (-not (Test-Path (Join-Path $directory 'node_modules'))) {
    throw "Faltan dependencias en $directory. Ejecuta npm install en backend y frontend según el README."
  }
}

Start-Process -FilePath 'powershell.exe' `
  -WorkingDirectory $backendPath `
  -ArgumentList @('-NoExit', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', 'npm.cmd run dev') | Out-Null

Start-Process -FilePath 'powershell.exe' `
  -WorkingDirectory $frontendPath `
  -ArgumentList @('-NoExit', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', 'npm.cmd run dev') | Out-Null

Write-Output 'Se abrieron las terminales del backend y frontend.'
Write-Output 'API: http://localhost:3001'
Write-Output 'Interfaz: http://localhost:5173'
Write-Output 'Si aparece un error de conexion, revisa MySQL y 01_Codigo_Fuente\backend\.env.'
