@echo off
title SWAFL web (keep this window open)
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org then run this again. & pause & exit /b)
node serve.js
pause
