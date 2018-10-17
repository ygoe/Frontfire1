@echo off
:: Initialise
cd /d "%~dp0"

:: Clean
if exist dist rd /s /q dist || goto error

:: Publish
md dist\frontfire || goto error
md dist\frontfire\css || goto error
copy src\css\frontfire.css dist\frontfire\css >nul || goto error
copy src\css\frontfire.css.map dist\frontfire\css >nul || goto error
copy src\css\frontfire.min.css dist\frontfire\css >nul || goto error
copy src\css\frontfire.min.css.map dist\frontfire\css >nul || goto error
md dist\frontfire\js || goto error
copy src\js\frontfire.es5.js dist\frontfire\js\frontfire.js >nul || goto error
copy src\js\frontfire.es5.js.map dist\frontfire\js\frontfire.js.map >nul || goto error
copy src\js\frontfire.min.js dist\frontfire\js >nul || goto error
copy src\js\frontfire.min.js.map dist\frontfire\js >nul || goto error
echo Publish finished
echo.

:: Copy to website
xcopy dist\frontfire docs\lib\frontfire\ /s /q /y > nul || goto error

:: Pack download src archive
cd src
7za a ..\dist\frontfire-src.zip * > nul || echo 7za not found. && goto error
cd ..

:: Pack download dist archive
cd dist
7za a frontfire.zip frontfire > nul || echo 7za not found. && goto error
cd ..

:: Compress to gzip for network size estimation
cd dist\frontfire\css
7za a frontfire.min.css.gz frontfire.min.css > nul || gzip frontfire.min.css -c > frontfire.min.css.gz || del frontfire.min.css.gz && echo 7za/gzip not found. && goto error
cd ..\..\..
cd dist\frontfire\js
7za a frontfire.min.js.gz frontfire.min.js > nul || gzip frontfire.min.js -c > frontfire.min.js.gz || del frontfire.min.js.gz
cd ..\..\..

:: Exit
timeout /t 2 /nobreak >nul
exit /b

:error
pause
