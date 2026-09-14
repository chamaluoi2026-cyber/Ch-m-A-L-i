@echo off
setlocal enabledelayedexpansion
title Cham A Luoi - Quan Tri Admin (Port 3001)

cd /d "%~dp0"

set "NODE_CMD="
if exist "D:\Website\ChamALuoi-NodeJS\node.exe" (
    set "NODE_CMD=D:\Website\ChamALuoi-NodeJS\node.exe"
) else if exist "D:\ChamALuoi-NodeJS\node.exe" (
    set "NODE_CMD=D:\ChamALuoi-NodeJS\node.exe"
) else if exist "C:\Users\Predator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
    set "NODE_CMD=C:\Users\Predator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
) else (
    where node >nul 2>nul
    if !errorlevel! equ 0 (
        set "NODE_CMD=node"
    )
)

if "%NODE_CMD%"=="" (
    echo [ERROR] Khong tim thay Node.js de khoi chay he thong!
    echo Vui long kiem tra file D:\Website\ChamALuoi-NodeJS\node.exe
    pause
    exit /b 1
)

echo ===================================================
echo   CHAM A LUOI - ADMIN PORTAL DANG KHOI DONG (PORT 3001)
echo ===================================================
echo [1] Quan tri he thong: http://localhost:3001/admin
echo [2] Cong co so doi tac: http://localhost:3001/business
echo [3] Node Runtime: %NODE_CMD%
echo.

echo [Kiem tra] Dang giai phong cong 3001 (neu dang bi ket)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Dang khoi dong may chu Next.js, vui long doi giay lat...
echo Trinh duyet se tu dong mo http://localhost:3001/admin sau vai giay...
echo.

start "" cmd /c "ping 127.0.0.1 -n 5 >nul && start http://localhost:3001/admin"
"%NODE_CMD%" node_modules\next\dist\bin\next dev -p 3001
pause
