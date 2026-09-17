@echo off
REM 普通用户即可，请勿「以管理员身份运行」
cd /d "%~dp0"

echo.
echo  ========================================
echo   AI 调研问卷（本机预览）
echo   无需管理员权限 — 请不要用管理员运行
echo  ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  未找到 node。也可直接双击打开 admin.html / index.html 使用。
  echo.
  pause
  exit /b 1
)

REM 默认只监听 127.0.0.1，不弹防火墙、不需要管理员
set SURVEY_LAN=
node server.js
pause
