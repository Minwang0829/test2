@echo off
REM 普通用户即可，请勿「以管理员身份运行」
cd /d "%~dp0"

echo.
echo  ========================================
echo   AI 调研问卷（局域网扫码）
echo   无需管理员 — 请不要用管理员运行
echo  ========================================
echo.
echo  若 Windows 防火墙弹窗要求管理员：
echo    请直接点「取消」，改用填写页「复制给主持」。
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  未找到 node。请改用：直接打开 HTML + 复制答卷汇总。
  echo.
  pause
  exit /b 1
)

set SURVEY_LAN=1
node server.js
pause
