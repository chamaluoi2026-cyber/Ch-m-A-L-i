@echo off
setlocal enabledelayedexpansion
title KHOI CHAY TOAN BO HE THONG CHAM A LUOI
color 0A

echo ========================================================
echo     HE THONG DU LICH CONG DONG CHAM A LUOI
echo ========================================================
echo.

set "BASE_DIR=%~dp0"
set "CUST_DIR=D:\Website\ChamALuoi-Customer"
set "ADMIN_DIR=D:\Website\ChamALuoi-Admin"

if not exist "%CUST_DIR%" (
    if exist "%BASE_DIR%ChamALuoi-Customer" (
        set "CUST_DIR=%BASE_DIR%ChamALuoi-Customer"
        set "ADMIN_DIR=%BASE_DIR%ChamALuoi-Admin"
    ) else (
        set "CUST_DIR=%BASE_DIR%..\ChamALuoi-Customer"
        set "ADMIN_DIR=%BASE_DIR%..\ChamALuoi-Admin"
    )
)

echo [1/2] Dang khoi chay Web Khach hang (Port 3000)...
start "Cham A Luoi - Web Khach (Port 3000)" /D "%CUST_DIR%" cmd /k start-customer.bat

ping 127.0.0.1 -n 4 >nul

echo [2/2] Dang khoi chay Web Quan tri Admin (Port 3001)...
start "Cham A Luoi - Admin Portal (Port 3001)" /D "%ADMIN_DIR%" cmd /k start-admin.bat

echo.
echo ========================================================
echo   TAT CA MAY CHU DA DUOC KHOI CHAY THANH CONG!
echo ========================================================
echo - Web Khach hang: http://localhost:3000
echo - Web Quan tri:   http://localhost:3001/admin
echo - Cau hinh Logo:  http://localhost:3001/admin/media
echo - Live Chat:      http://localhost:3001/admin/chat
echo ========================================================
echo.
pause
