@echo off

if defined SSH_AGENT_PID (
  REM Stop SSH Agent
  taskkill /pid %SSH_AGENT_PID% /f
  REM Delete variable
  set SSH_AGENT_PID=
  set SSH_AUTH_SOCK=
  REM Delete user environment variables
  REG delete HKCU\Environment /F /V SSH_AGENT_PID
  REG delete HKCU\Environment /F /V SSH_AUTH_SOCK
) else (
  echo SSH Agent is not running
)
