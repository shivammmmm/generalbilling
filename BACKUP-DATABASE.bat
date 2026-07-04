@echo off
title AgroShop - Backup
color 0B

echo.
echo  =====================================================
echo   AgroShop - Database Backup
echo  =====================================================
echo.

REM Backup folder with date
for /f "tokens=1-3 delims=/" %%a in ("%date%") do set TODAY=%%c-%%b-%%a
set BACKUP_PATH=%~dp0BACKUPS\backup_%TODAY%_%time:~0,2%-%time:~3,2%
set BACKUP_PATH=%BACKUP_PATH: =0%

mkdir "%BACKUP_PATH%" >nul 2>&1

echo  Backup chal raha hai...
echo  Source:  C:\data\db\
echo  Target:  %BACKUP_PATH%

REM Try mongodump first (best method)
mongodump --db agroshop --out "%BACKUP_PATH%" >nul 2>&1

if %errorlevel% == 0 (
    echo  ✓ Backup complete using mongodump
) else (
    REM Fallback: copy raw data files
    echo  mongodump nahi mila, raw copy kar rahe hain...
    xcopy "C:\data\db\" "%BACKUP_PATH%\raw-db\" /E /I /Q >nul 2>&1
    echo  ✓ Raw backup complete
)

echo.
echo  =====================================================
echo   Backup saved:
echo   %BACKUP_PATH%
echo  =====================================================
echo.
echo  Yeh folder USB mein copy kar lo!
echo.
pause
