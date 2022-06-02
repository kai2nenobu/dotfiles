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
end

return ret
