@echo off
echo Starting API server...
start cmd /k python webui.py --api

echo Waiting for API server to initialize...
timeout /t 3

echo Starting Next.js dev server...
cd webui
start cmd /k npm run dev

echo Servers should be starting now.
echo - API server: http://localhost:5000
echo - Next.js: http://localhost:3000 