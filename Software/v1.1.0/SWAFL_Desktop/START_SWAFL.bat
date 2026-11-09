@echo off
cd /d "%~dp0"
if not exist ".eula_accepted_1.0" (
  echo.
  echo ==================================================================
  echo   SWAFL End User Licence Agreement - please read before you start
  echo ==================================================================
  echo.
  more < "%~dp0EULA.txt"
  echo.
  choice /c YN /m "Do you accept the End User Licence Agreement (Y = accept, N = decline)"
  if errorlevel 2 exit /b 1
  echo accepted %date% %time%> ".eula_accepted_1.0"
)
call "%~dp0tools\use_node.bat" || exit /b 1
if not exist node_modules (call npm install)
call npm start
