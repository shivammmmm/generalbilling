@echo off
title AgroShop - Stopping...
color 0C

echo.
echo  Stopping AgroShop...

taskkill /f /fi "WINDOWTITLE eq AgroShop - Backend" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq AgroShop - Frontend" >nul 2>&1

echo  ✓ AgroShop stopped.
echo.
timeout /t 2 >nul
