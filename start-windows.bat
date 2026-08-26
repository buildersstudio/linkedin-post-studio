@echo off
rem LinkedIn Post Studio — double-click me to start.
rem
rem This starts a tiny local web server and opens the studio in your browser.
rem Keep this window open while you work; close it to stop.
rem It needs Python, which many PCs already have. If not, the message below
rem tells you where to get it (free, two-minute install).

cd /d "%~dp0"
setlocal enabledelayedexpansion

rem Pick a free high port on first run and remember it in .dev-port, so the studio
rem keeps the same URL every time. Low ports collide with whatever else you have
rem running, and browsers share localhost cookies across every port.
set "PORT="
if exist ".dev-port" set /p PORT=<".dev-port"
if defined PORT (
  netstat -ano | findstr /r /c:":!PORT! .*LISTENING" >nul 2>nul && set "PORT="
)
if not defined PORT (
  rem %RANDOM% is 0-32767, so this lands between 20000 and 52767.
  for /l %%i in (1,1,50) do (
    if not defined PORT (
      set /a CAND=20000 + !RANDOM!
      netstat -ano | findstr /r /c:":!CAND! .*LISTENING" >nul 2>nul || (
        set "PORT=!CAND!"
        >".dev-port" echo !CAND!
      )
    )
  )
)
if not defined PORT (
  echo   Could not find a free port. Close some apps and try again.
  pause
  exit /b
)

echo.
echo   LinkedIn Post Studio is starting at:  http://localhost:!PORT!
echo   Keep this window open while you use it. Close it to stop.
echo.

start "" cmd /c "timeout /t 2 >nul & start http://localhost:!PORT!/"

where py >nul 2>nul
if %errorlevel%==0 goto haspy
where python >nul 2>nul
if %errorlevel%==0 goto haspython

echo   Python was not found on this computer, and the studio needs it to run.
echo.
echo   1. Install it free from  https://www.python.org/downloads/
echo   2. IMPORTANT: tick "Add python.exe to PATH" during the install.
echo   3. Double-click this file again.
echo.
pause
exit /b

:haspy
py -m http.server --bind 127.0.0.1 !PORT!
goto end

:haspython
python -m http.server --bind 127.0.0.1 !PORT!

:end
pause
