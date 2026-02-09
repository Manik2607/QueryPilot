@echo off
echo ================================
echo QueryPilot Backend Setup
echo ================================
echo.

echo [1/3] Installing backend dependencies...
cd server
if not exist "node_modules\" (
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)

echo.
echo [2/3] Checking .env file...
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env >nul
    echo.
    echo ⚠️  IMPORTANT: Edit server/.env and add your GEMINI_API_KEY
    echo    Get your API key from: https://makersuite.google.com/app/apikey
) else (
    echo .env file already exists
)

echo.
echo [3/3] Installing frontend dependencies...
cd ..\client
if not exist "node_modules\" (
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)

cd ..

echo.
echo ================================
echo Setup Complete! ✓
echo ================================
echo.
echo Next steps:
echo 1. Edit server/.env and add your GEMINI_API_KEY
echo 2. Configure at least one database in server/.env
echo 3. Run the backend:  cd server ^&^& npm run dev
echo 4. Run the frontend: cd client ^&^& npm run dev
echo 5. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see README.md
echo ================================
