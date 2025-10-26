@echo off
setlocal enabledelayedexpansion

echo ============================================
echo League AI Oracle - Health Check
echo ============================================
echo.

set PASS=0
set FAIL=0
set WARN=0

echo Checking critical files...
echo.

REM Check .env file
if exist .env (
    echo [PASS] .env file exists
    set /a PASS+=1
) else (
    echo [FAIL] .env file missing
    set /a FAIL+=1
)

REM Check .gitignore for .env
findstr /C:".env" .gitignore >nul 2>&1
if %errorlevel%==0 (
    echo [PASS] .env is in .gitignore
    set /a PASS+=1
) else (
    echo [FAIL] .env not in .gitignore
    set /a FAIL+=1
)

REM Check server proxy
if exist server\proxy.js (
    echo [PASS] Backend proxy exists
    set /a PASS+=1
) else (
    echo [FAIL] Backend proxy missing
    set /a FAIL+=1
)

REM Check package.json scripts
findstr /C:"dev:server" package.json >nul 2>&1
if %errorlevel%==0 (
    echo [PASS] npm scripts configured
    set /a PASS+=1
) else (
    echo [FAIL] npm scripts not configured
    set /a FAIL+=1
)

REM Check new utility files
if exist lib\cache.ts (
    echo [PASS] Cache manager exists
    set /a PASS+=1
) else (
    echo [FAIL] Cache manager missing
    set /a FAIL+=1
)

if exist lib\validation.ts (
    echo [PASS] Validation utilities exist
    set /a PASS+=1
) else (
    echo [FAIL] Validation utilities missing
    set /a FAIL+=1
)

if exist lib\validators.ts (
    echo [PASS] Zod validators exist
    set /a PASS+=1
) else (
    echo [FAIL] Zod validators missing
    set /a FAIL+=1
)

if exist hooks\useDebounce.ts (
    echo [PASS] useDebounce hook exists
    set /a PASS+=1
) else (
    echo [FAIL] useDebounce hook missing
    set /a FAIL+=1
)

if exist hooks\useAsync.ts (
    echo [PASS] useAsync hook exists
    set /a PASS+=1
) else (
    echo [FAIL] useAsync hook missing
    set /a FAIL+=1
)

REM Check modified files
if exist contexts\ChampionContext.tsx (
    echo [PASS] ChampionContext exists
    set /a PASS+=1
) else (
    echo [FAIL] ChampionContext missing
    set /a FAIL+=1
)

if exist contexts\ChampionContext.backup.tsx (
    echo [PASS] ChampionContext backup exists
    set /a PASS+=1
) else (
    echo [WARN] ChampionContext backup missing
    set /a WARN+=1
)

if exist components\common\ErrorBoundary.tsx (
    echo [PASS] ErrorBoundary exists
    set /a PASS+=1
) else (
    echo [FAIL] ErrorBoundary missing
    set /a FAIL+=1
)

if exist lib\indexedDb.ts (
    echo [PASS] IndexedDB utilities exist
    set /a PASS+=1
) else (
    echo [FAIL] IndexedDB utilities missing
    set /a FAIL+=1
)

REM Check documentation
if exist SETUP.md (
    echo [PASS] Setup documentation exists
    set /a PASS+=1
) else (
    echo [WARN] Setup documentation missing
    set /a WARN+=1
)

if exist CHANGES.md (
    echo [PASS] Changes documentation exists
    set /a PASS+=1
) else (
    echo [WARN] Changes documentation missing
    set /a WARN+=1
)

REM Check node_modules
if exist node_modules (
    echo [PASS] Dependencies installed
    set /a PASS+=1
) else (
    echo [FAIL] Dependencies not installed
    set /a FAIL+=1
)

REM Check for required dependencies
if exist node_modules\zod (
    echo [PASS] Zod installed
    set /a PASS+=1
) else (
    echo [FAIL] Zod not installed
    set /a FAIL+=1
)

if exist node_modules\express (
    echo [PASS] Express installed
    set /a PASS+=1
) else (
    echo [FAIL] Express not installed
    set /a FAIL+=1
)

if exist node_modules\cors (
    echo [PASS] CORS installed
    set /a PASS+=1
) else (
    echo [FAIL] CORS not installed
    set /a FAIL+=1
)

if exist node_modules\dotenv (
    echo [PASS] Dotenv installed
    set /a PASS+=1
) else (
    echo [FAIL] Dotenv not installed
    set /a FAIL+=1
)

if exist node_modules\concurrently (
    echo [PASS] Concurrently installed
    set /a PASS+=1
) else (
    echo [FAIL] Concurrently not installed
    set /a FAIL+=1
)

echo.
echo ============================================
echo Health Check Results
echo ============================================
echo PASS: %PASS%
echo FAIL: %FAIL%
echo WARN: %WARN%
echo.

if %FAIL% gtr 0 (
    echo [ERROR] Health check failed!
    echo Please run: npm install --force
    echo.
    pause
    exit /b 1
) else if %WARN% gtr 0 (
    echo [WARNING] Some non-critical issues found
    echo App should still work
    echo.
    pause
    exit /b 0
) else (
    echo [SUCCESS] All checks passed!
    echo Ready to start development
    echo.
    pause
    exit /b 0
)

