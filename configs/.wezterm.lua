local wezterm = require 'wezterm';

-- Common settings
local ret = {
  -- color_scheme = "JetBrains Darcula",
  font = wezterm.font("HackGenNerd Console"),
  font_size = 14.0,
  enable_scroll_bar = true,
  -- debug_key_events = true,
}

-- Key bindings
keys = {
  -- Command pallete
  {key="P", mods="CTRL|SHIFT", action=wezterm.action{ShowLauncherArgs={flags="FUZZY|KEY_ASSIGNMENTS"}}},
  -- Windows Terminal compatibility
  {key="=", mods="ALT|SHIFT", action=wezterm.action{SplitVertical={}}},
  {key="+", mods="ALT|SHIFT", action=wezterm.action{SplitHorizontal={}}},
}
ret["keys"] = keys

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
  local wsl_command = {"wsl.exe", "--distribution", "main"}
  table.insert(launch_menu, {
    label = "WSL Default",
    args = wsl_command
  })
  table.insert(keys, {
    key="%", mods="CTRL|SHIFT", action=wezterm.action{SpawnCommandInNewTab={args=wsl_command}},
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
