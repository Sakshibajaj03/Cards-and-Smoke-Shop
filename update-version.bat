@echo off
echo ========================================
echo   Website Version Updater
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Step 1: Updating version number...
node update-version.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to update version
    pause
    exit /b 1
)

echo.
echo Step 2: Updating HTML files with new version...
node update-html-versions.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to update HTML files
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo Next steps:
echo 1. Review the changes
echo 2. Commit and push to GitHub:
echo    git add .
echo    git commit -m "Version update"
echo    git push
echo.
echo Mobile users will automatically get the update!
echo.
pause




