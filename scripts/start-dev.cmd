@echo off
setlocal

echo ============================================================
echo  SpiceGarden - One-shot dev startup
echo ============================================================

echo.
echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
  echo npm install failed
  exit /b %errorlevel%
)

echo.
echo [2/4] Starting Docker services (Postgres, Redis, Mongo)...
docker-compose -f compose.dev.yaml up -d
if %errorlevel% neq 0 (
  echo docker-compose up failed - ensure Docker Desktop is running
  exit /b %errorlevel%
)

echo.
echo [3/4] Starting Backend on port 3001...
start "SpiceGarden Backend" cmd /c "npm run dev -w @spicegarden/backend"

echo.
echo [4/4] Starting Frontend apps...
start "Customer Web (3002)"      cmd /c "npm run dev -w @spicegarden/customer-web"
start "Restaurant Dashboard (3003)" cmd /c "npm run dev -w @spicegarden/restaurant-dashboard"
start "Super Admin (3004)"       cmd /c "npm run dev -w @spicegarden/super-admin"
start "Launcher"                 cmd /c "npm run dev --prefix apps/launcher"

echo.
echo ============================================================
echo  Services should be starting in separate windows.
echo ============================================================
echo   Backend (API):        http://localhost:3001
echo   Customer Web:         http://localhost:3002
echo   Restaurant Dashboard: http://localhost:3003
echo   Super Admin:          http://localhost:3004
echo   Launcher Renderer:    http://localhost:8080
echo.
echo  Wait 15-30 seconds for apps to compile, then visit URLs.
echo.
echo  Mobile (Expo):
echo    cd apps/customer-mobile
echo    npx expo start
echo.
echo  When done, close windows or run:
echo    docker-compose -f compose.dev.yaml down
echo ============================================================

pause
