@echo off

REM Start SSH Agent (Exit child process immediately)
call start-ssh-agent.cmd /c:"exit 0"
REM Share agent between session
setx SSH_AGENT_PID %SSH_AGENT_PID% > nul
setx SSH_AUTH_SOCK %SSH_AUTH_SOCK% > nul
