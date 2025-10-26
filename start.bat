@echo off
echo ============================================
echo League AI Oracle - Quick Start Script
echo ============================================
echo.

echo [1/4] Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    pause
    exit /b 1
)
echo ✓ Node.js found
echo.

echo [2/4] Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)
echo ✓ npm found
echo.

echo [3/4] Checking .env file...
if exist .env (
    echo ✓ .env file found
) else (
    echo WARNING: .env file not found!
    echo Creating .env file with default values...
    echo GEMINI_API_KEY=AIzaSyAakAOGA9fWDGhGolZMjv-OzyFbQ_hakoA > .env
    echo VITE_DATA_VERSION=1.0.0 >> .env
    echo ✓ .env file created
)
echo.

echo [4/4] Checking node_modules...
if exist node_modules (
    echo ✓ Dependencies already installed
) else (
    echo Installing dependencies...
    call npm install --force
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed
)
echo.

echo ============================================
echo Ready to start! Choose an option:
echo ============================================
echo 1. Start both servers (Recommended)
echo 2. Start frontend only
echo 3. Start backend only
echo 4. Exit
echo.
set /p choice=Enter your choice (1-4):

if "%choice%"=="1" (
    echo.
    echo Starting both backend and frontend servers...
    echo Backend: http://localhost:3001
    echo Frontend: http://localhost:3000
    echo.
    echo Press Ctrl+C to stop both servers
    npm run dev
) else if "%choice%"=="2" (
    echo.
    echo Starting frontend only...
    echo Frontend: http://localhost:3000
    echo.
    npm run dev:client
) else if "%choice%"=="3" (
    echo.
    echo Starting backend only...
    echo Backend: http://localhost:3001
    echo.
    npm run dev:server
) else if "%choice%"=="4" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

