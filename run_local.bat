@echo off
title Saqib Visuals - ShortyOS 3D Clay
color 0b
cls
echo ===================================================
echo     STARTING SHORTYOS 3D CLAY - SAQIB VISUALS
echo ===================================================
echo.
echo  Local PC URL:   http://localhost:3005
echo  Mobile Wi-Fi:   http://192.168.1.5:3005
echo.
echo  Admin Panel:    http://localhost:3005/mradmin
echo  Username:       admin
echo  Password:       saqib99
echo.
echo ===================================================
echo.
echo Opening browser in 3 seconds...
start "" http://localhost:3005
echo.
npm run dev
pause
