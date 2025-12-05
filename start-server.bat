@echo off
echo ========================================
echo   Cards & Smoke Shop - Local Server
echo ========================================
echo.
echo Starting web server on port 8000...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo Finding your IP address...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
    echo Your website will be available at:
    echo.
    echo   http://!IP!:8000
    echo.
    echo Open this URL on your mobile device
    echo (Make sure mobile is on same Wi-Fi network)
    echo.
    echo Press Ctrl+C to stop the server
    echo ========================================
    echo.
)

REM Start the server
python -m http.server 8000

pause






