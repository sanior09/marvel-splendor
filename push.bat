@echo off
chcp 65001 >nul
echo ===================================================
echo   J.A.R.V.I.S. Rapid Deployment Protocol to GitHub
echo ===================================================
cd /d "%~dp0"
git add .
set msg=%*
if "%msg%"=="" set msg=update: toggle maintenance mode
git commit -m "%msg%"
git push origin main
echo.
echo ===================================================
echo   Done! All changes have been pushed to GitHub.
echo ===================================================
timeout /t 3 >nul
