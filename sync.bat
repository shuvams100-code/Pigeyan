@echo off
title Pigeyan Auto-Sync
echo Starting Auto-Sync Script for Pigeyan...

:loop
echo.
echo ==============================================
echo Syncing changes to GitHub at %time%...
echo ==============================================

:: Stage all changes
git add .

:: Commit only if there are changes
git diff-index --quiet HEAD || git commit -m "Auto-sync: %date% %time%"

:: Push changes to the main branch
git push origin main

echo.
echo Sync complete. Waiting for 30 minutes before next sync...
:: Wait for 1800 seconds (30 minutes)
timeout /t 1800 /nobreak

goto loop
