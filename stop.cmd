@echo off
rem Stop SpiceGarden local environment

rem Stop Docker compose services (core infrastructure and optionally observability)
docker compose -f "compose.dev.yaml" down

rem Attempt to close any terminal windows opened by the launcher
for /f "tokens=2 delims=," %%i in ('tasklist /FI "WINDOWTITLE eq SpiceGarden *" /FO CSV /NH') do (
  taskkill /PID %%i /F >nul 2>&1
)

echo SpiceGarden services have been stopped.
