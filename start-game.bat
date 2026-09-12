@echo off
title Splendor Marvel - Unified Terminal
color 0B

echo =========================================================================
echo    [ N A C H A P O L   I N D U S T R I E S   C O N T R O L   S Y S T E M ]
echo =========================================================================
echo.
echo    [- STATUS -]  ALL SYSTEMS OPERATIONAL.
echo    [- ACCESS -]  WELCOME BACK, SIR.
echo.
echo =========================================================================
echo     Starting SPLENDOR: MARVEL (Unified 1-Window Mode)
echo =========================================================================
echo.
echo  - Server (Port 3001) and Client (Port 5173) are running together here!
echo  - Game Web UI: http://localhost:5173
echo  - Press Ctrl+C anytime to stop both server and client.
echo.
echo =========================================================================
echo.

:: Automatically open browser after 3 seconds in the background
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Run both Server and Client concurrently in this exact single window
call npm run dev
