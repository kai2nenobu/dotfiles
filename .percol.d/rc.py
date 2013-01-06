from percol.finder import FinderMultiQueryString, FinderMultiQueryMigemo, FinderMultiQueryRegex
# Change prompt in response to the status of case sensitivity
percol.view.__class__.PROMPT = property(
    lambda self:
    ur"<bold><cyan>QUERY </cyan>[a]:</bold> %q" if percol.model.finder.case_insensitive
    else ur"<bold><yellow>QUERY </yellow>[A]:</bold> %q"
)
# Display finder name in RPROMPT
percol.view.prompt_replacees["F"] = lambda self, **args: self.model.finder.get_name()
percol.view.RPROMPT = ur"\<%F\> (%i/%I) [%n/%N]"

# Emacs like
percol.import_keymap({
    "C-h" : lambda percol: percol.command.delete_backward_char(),
    "C-d" : lambda percol: percol.command.delete_forward_char(),
    "C-k" : lambda percol: percol.command.kill_end_of_line(),
    "C-y" : lambda percol: percol.command.yank(),
    "C-a" : lambda percol: percol.command.beginning_of_line(),
    "C-e" : lambda percol: percol.command.end_of_line(),
    "C-b" : lambda percol: percol.command.backward_char(),
    "C-f" : lambda percol: percol.command.forward_char(),
    "C-n" : lambda percol: percol.command.select_next(),
    "C-p" : lambda percol: percol.command.select_previous(),
    "C-v" : lambda percol: percol.command.select_next_page(),
    "M-v" : lambda percol: percol.command.select_previous_page(),
    "M-<" : lambda percol: percol.command.select_top(),
    "M->" : lambda percol: percol.command.select_bottom(),
    "C-m" : lambda percol: percol.finish(),
    "C-j" : lambda percol: percol.finish(),
    "C-g" : lambda percol: percol.cancel(),
    "M-c" : lambda percol: percol.command.toggle_case_sensitive(),
    "M-m" : lambda percol: percol.command.toggle_two_finders(FinderMultiQueryMigemo, FinderMultiQueryString),
    "M-r" : lambda percol: percol.command.toggle_two_finders(FinderMultiQueryRegex, FinderMultiQueryString)
})

# migemo
# from percol.finder import FinderMultiQueryMigemo
# FinderMultiQueryMigemo.dictionary_path = "/usr/local/share/migemo/utf-8/migemo-dict"
# FinderMultiQueryMigemo.minimum_query_length = 2
