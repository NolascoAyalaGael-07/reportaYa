$ErrorActionPreference = 'Stop'

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$resultsDirectory = Join-Path $PSScriptRoot 'resultados'
New-Item -ItemType Directory -Force -Path $resultsDirectory | Out-Null
$runId = Get-Date -Format 'yyyy-MM-dd_HHmmss'

$checks = @(
  @{
    Name = 'Backend automatizado'
    RelativeDirectory = '01_Codigo_Fuente\backend'
    Directory = Join-Path $repositoryRoot '01_Codigo_Fuente\backend'
    Arguments = @('test')
    Log = Join-Path $resultsDirectory "backend_test_$runId.txt"
  },
  @{
    Name = 'Compilacion frontend'
    RelativeDirectory = '01_Codigo_Fuente\frontend'
    Directory = Join-Path $repositoryRoot '01_Codigo_Fuente\frontend'
    Arguments = @('run', 'build')
    Log = Join-Path $resultsDirectory "frontend_build_$runId.txt"
  }
)

foreach ($check in $checks) {
  if (-not (Test-Path $check.Directory)) {
    throw "No se encontro el proyecto: $($check.Directory)"
  }

  "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')" | Set-Content -Encoding utf8 -Path $check.Log
  "Directorio: $($check.RelativeDirectory)" | Add-Content -Encoding utf8 -Path $check.Log
  "Comando: npm.cmd $($check.Arguments -join ' ')" | Add-Content -Encoding utf8 -Path $check.Log
  Write-Output "`n=== $($check.Name) ==="

  Push-Location $check.Directory
  try {
    $arguments = $check.Arguments
    $previousNoColor = $env:NO_COLOR
    $env:NO_COLOR = '1'
    try {
      $commandOutput = & npm.cmd @arguments 2>&1
      $exitCode = $LASTEXITCODE
    }
    finally {
      if ($null -eq $previousNoColor) {
        Remove-Item Env:NO_COLOR -ErrorAction SilentlyContinue
      }
      else {
        $env:NO_COLOR = $previousNoColor
      }
    }

    foreach ($line in $commandOutput) {
      $text = [string]$line
      $text | Add-Content -Encoding utf8 -Path $check.Log
      Write-Output $text
    }
  }
  finally {
    Pop-Location
  }

  if ($exitCode -ne 0) {
    throw "$($check.Name) fallo con codigo $exitCode. Revisa $($check.Log)."
  }

  Write-Output "Registro guardado: $($check.Log)"
}

Write-Output "`nTodas las verificaciones terminaron correctamente."
