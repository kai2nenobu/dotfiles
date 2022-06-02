local wezterm = require 'wezterm';

local ret = {
  -- color_scheme = "JetBrains Darcula",
  font = wezterm.font("HackGenNerd Console"),
  font_size = 14.0,
  enable_scroll_bar = true,
}

-- Windows specific
if wezterm.target_triple == "x86_64-pc-windows-msvc" then
  -- Default program
  ret["default_prog"] = {"pwsh.exe"}
  -- Launch menu
  local launch_menu = {}
  table.insert(launch_menu, {
    label = "PowerShell Core",
    args = {"pwsh.exe"},
  })
  table.insert(launch_menu, {
    label = "WSL Default",
    args = {"wsl.exe", "--distribution", "main"}
  })
  table.insert(launch_menu, {
    label = "Command Prompt",
    args = {"cmd.exe"}
  })
  table.insert(launch_menu, {
    label = "Windows PowerShell",
    args = {"powershell.exe"},
  })
  ret["launch_menu"] = launch_menu
end

return ret
