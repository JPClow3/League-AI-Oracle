@echo off
REM Script to download and self-host Google Fonts
REM Run this to eliminate external font requests

echo Downloading Google Fonts for self-hosting...

REM Create fonts directory
if not exist "public\fonts" mkdir "public\fonts"

REM Download Inter font (regular, medium, semibold, bold)
echo Downloading Inter font...
curl -o public/fonts/inter-400.woff2 "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
curl -o public/fonts/inter-500.woff2 "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2"
curl -o public/fonts/inter-600.woff2 "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2"
curl -o public/fonts/inter-700.woff2 "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2"

REM Download Teko font (regular, medium, semibold, bold)
echo Downloading Teko font...
curl -o public/fonts/teko-400.woff2 "https://fonts.gstatic.com/s/teko/v20/LYjNdG7kmE0gV69VV69VV0s.woff2"
curl -o public/fonts/teko-500.woff2 "https://fonts.gstatic.com/s/teko/v20/LYjNdG7kmE0gV8JVV69VV0s.woff2"
curl -o public/fonts/teko-600.woff2 "https://fonts.gstatic.com/s/teko/v20/LYjNdG7kmE0gV_pSV69VV0s.woff2"
curl -o public/fonts/teko-700.woff2 "https://fonts.gstatic.com/s/teko/v20/LYjNdG7kmE0gV5ZSV69VV0s.woff2"

echo Fonts downloaded to public/fonts/
echo Update index.html to use local fonts
pause

