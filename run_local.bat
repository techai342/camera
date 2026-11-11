@echo off
title Camera & Intelligence Platform - Local Server
color 0b
cls
echo ==============================================================================
echo        CAMERA & TELEMETRY URL SHORTENER (SAQIB VISUALS)
echo ==============================================================================
echo.
echo  [*] Checking environment...
if not exist node_modules (
    echo  [!] node_modules not found. Installing dependencies...
    call npm install
)

echo.
echo  ------------------------------------------------------------------------------
echo  [+] Local PC URL      :  http://localhost:3005
echo  [+] Mobile / Wi-Fi IP :  http://192.168.1.6:3005
echo  [+] Admin Dashboard   :  http://localhost:3005/mradmin
echo  [+] Secondary Admin   :  http://localhost:3005/saqib-admin
echo.
echo  [KEY] Admin Login Credentials:
echo        Username : admin
echo        Password : saqib99
echo  ------------------------------------------------------------------------------
echo.
echo  [*] Launching browser in 2 seconds...
timeout /t 2 /nobreak >nul
start "" http://localhost:3005
start "" http://localhost:3005/mradmin
echo.
echo  [+] Starting Next.js Dev Server (Turbopack) on port 3005...
call npm run dev
pause
