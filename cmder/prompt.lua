---
-- Change a lambda in prompt into my favorite character
---
local function my_prompt_filter()
    local lambda = "λ"
    local my_prompt = ">"
    clink.prompt.value = string.gsub(clink.prompt.value, lambda, my_prompt)
end

clink.prompt.register_filter(my_prompt_filter, 100)
