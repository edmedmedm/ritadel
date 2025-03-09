@echo off
echo Starting API server with Poetry...

REM Start the API server using Poetry run
start cmd /k poetry run python webui.py --api

echo Waiting for API server to initialize...
timeout /t 5

echo Starting Next.js dev server...
cd webui
start cmd /k npm run dev

echo Servers should be starting now.
echo - API server: http://localhost:5000
echo - Next.js: http://localhost:3000 