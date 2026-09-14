@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "PORT=3000"
for %%P in (3000 3001 3002 3003 3004 3005) do (
  powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %%P -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }" >nul 2>nul
  if !errorlevel! equ 0 (
    set "PORT=%%P"
    goto :found_port
  )
)

echo Khong tim thay port trong tu 3000 den 3005.
echo Hay tat terminal server cu roi chay lai file nay.
pause
exit /b 1

:found_port
echo.
echo Dang chay Cham A Luoi tai: http://localhost:%PORT%
echo Neu trinh duyet khong tu mo, hay copy link tren de mo thu cong.
echo.

where npm >nul 2>nul
if %errorlevel% equ 0 (
  if not exist node_modules (
    npm install
  )
  npm run dev -- -p %PORT%
  exit /b %errorlevel%
)

set "CODEX_NODE=C:\Users\Predator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%CODEX_NODE%" (
  "%CODEX_NODE%" node_modules\next\dist\bin\next dev -p %PORT%
  exit /b %errorlevel%
)

echo Khong tim thay Node.js/npm.
echo Hay cai Node.js LTS tu https://nodejs.org, sau do chay:
echo npm install
echo npm run dev
pause
