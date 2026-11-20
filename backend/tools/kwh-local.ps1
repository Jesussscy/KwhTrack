# Arranque local de kwhTrack (MySQL persistente + servidor en 127.0.0.1:3000).
# Uso:  powershell -ExecutionPolicy Bypass -File tools\kwh-local.ps1 <start|stop|status|backup>
# Los procesos se lanzan independientes de esta ventana (siguen vivos al cerrarla). Nunca imprime credenciales.
param([Parameter(Position=0)][ValidateSet('start','stop','status','backup')][string]$Cmd='status')
$ErrorActionPreference='Stop'
$backend=Split-Path -Parent $PSScriptRoot
$rt=Join-Path $env:LOCALAPPDATA 'kwhTrackRuntime'
$admin=Get-Content (Join-Path $rt 'mysql-admin.json') -Raw | ConvertFrom-Json
$base=(Get-Content (Join-Path $rt 'mysql-base.txt') -Raw).Trim()
$dbPort=[int]$admin.port;$webPort=3000
function Listening($p){ [bool](Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) }
function ServerPid(){ foreach($c in (Get-NetTCPConnection -LocalPort $webPort -State Listen -ErrorAction SilentlyContinue)){ $p=Get-CimInstance Win32_Process -Filter "ProcessId=$($c.OwningProcess)"; if($p.CommandLine -match 'server\.js'){ return $c.OwningProcess } } }
switch($Cmd){
 'start' {
  if(-not (Listening $dbPort)){
   Start-Process -FilePath "$base\bin\mysqld.exe" -ArgumentList '--no-defaults',"--basedir=$base","--datadir=$rt\mysql-data",'--bind-address=127.0.0.1',"--port=$dbPort",'--mysqlx=0','--skip-name-resolve',"--log-error=$rt\mysql-error.log" -WindowStyle Hidden
   for($i=0;$i -lt 60 -and -not (Listening $dbPort);$i++){ Start-Sleep -Milliseconds 500 }
   if(-not (Listening $dbPort)){ throw "MySQL no arrancó; revisa $rt\mysql-error.log" }
  }
  Write-Host "MySQL activo en 127.0.0.1:$dbPort"
  Push-Location $backend; node tools/local-db.mjs migrate; Pop-Location
  if(-not (ServerPid)){
   if(Listening $webPort){ throw "El puerto $webPort está ocupado por otro programa." }
   Start-Process -FilePath 'node.exe' -ArgumentList '--env-file-if-exists=.env','server.js' -WorkingDirectory $backend -WindowStyle Hidden -RedirectStandardOutput (Join-Path $rt 'server.log') -RedirectStandardError (Join-Path $rt 'server.err.log')
   for($i=0;$i -lt 40 -and -not (Listening $webPort);$i++){ Start-Sleep -Milliseconds 250 }
  }
  Write-Host "Servidor activo: http://127.0.0.1:$webPort/empresarial  (domestico: http://127.0.0.1:$webPort/)"
 }
 'stop' {
  $s=ServerPid; if($s){ Stop-Process -Id $s -Force; Write-Host 'Servidor detenido' } else { Write-Host 'El servidor ya estaba detenido' }
  Push-Location $backend; node tools/local-db.mjs stop; Pop-Location
 }
 'status' {
  Write-Host ("MySQL    : " + $(if(Listening $dbPort){"activo en 127.0.0.1:$dbPort"}else{'apagado'}))
  Write-Host ("Servidor : " + $(if(ServerPid){"activo en http://127.0.0.1:$webPort/empresarial"}else{'apagado'}))
 }
 'backup' { Push-Location $backend; node tools/local-db.mjs backup; Pop-Location }
}
