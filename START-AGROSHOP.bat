@echo off
title AgroShop Management System
color 0A

echo.
echo  =====================================================
echo     AgroShop Management System v1.0
echo     Offline + LAN Edition
echo  =====================================================
echo.

REM ─── MongoDB data folder ───
if not exist "C:\data\db" mkdir "C:\data\db"

REM ─── Set backend .env to local MongoDB ───
cd /d "%~dp0backend"
(
echo PORT=5000
echo MONGO_URI=mongodb://localhost:27017/agroshop
echo JWT_SECRET=agro_offline_key_2024
) > .env

REM ─── Get this laptop's LAN IP ───
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "LAN_IP=%%a"
    goto :gotip
)
:gotip
set LAN_IP=%LAN_IP: =%

REM ─── Set frontend .env with LAN IP ───
cd /d "%~dp0frontend"
(
echo VITE_API_URL=http://%LAN_IP%:5000/api
) > .env

echo  [INFO] Server IP: %LAN_IP%

REM ─── Start MongoDB ───
echo  [1/3] Starting MongoDB...
sc query MongoDB >nul 2>&1
if %errorlevel% == 0 (
    net start MongoDB >nul 2>&1
) else (
    for %%v in (8.0 7.0 6.0 5.0) do (
        if exist "C:\Program Files\MongoDB\Server\%%v\bin\mongod.exe" (
            start /min "" "C:\Program Files\MongoDB\Server\%%v\bin\mongod.exe" --dbpath "C:\data\db"
            timeout /t 4 >nul
            goto :mongostarted
        )
    )
    echo  ERROR: MongoDB not found! Install from mongodb.com
    pause
    exit
)
:mongostarted
echo  MongoDB OK

REM ─── Start Backend ───
echo  [2/3] Starting Backend...
cd /d "%~dp0backend"
start /min "AgroShop-Backend" cmd /k "npm start"
timeout /t 5 >nul
echo  Backend OK ^(Port 5000^)

REM ─── Start Frontend ───
echo  [3/3] Starting Frontend...
cd /d "%~dp0frontend"
start /min "AgroShop-Frontend" cmd /k "npm run dev"
timeout /t 8 >nul
echo  Frontend OK ^(Port 5173^)

REM ─── Open browser ───
start "" "http://localhost:5173/activate"

echo.
echo  =====================================================
echo   AgroShop is RUNNING!
echo.
echo   Is laptop (Server) se: http://localhost:5173
echo   Doosre laptop (LAN) se: http://%LAN_IP%:5173
echo.
echo   Backend API: http://%LAN_IP%:5000
echo  =====================================================
echo.
echo  Doosre laptop mein yeh URL kholo:
echo  http://%LAN_IP%:5173
echo.
pause
