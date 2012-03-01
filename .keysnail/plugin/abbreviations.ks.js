var PLUGIN_INFO =
    <KeySnailPlugin>
    <name>Abbreviations manager</name>
    <description lang="ja">Vimperator の Abbreviations みたいなもの</description>
    <updateURL>https://raw.github.com/gist/1024186/abbreviations.ks.js</updateURL>
    <iconURL>https://sites.google.com/site/958site/Home/files/abbreviations.ks.png</iconURL>
    <license>MIT</license>
    <minVersion>1.8.0</minVersion>
    <author>958</author>
    <version>0.0.4</version>
    <detail><![CDATA[
=== 概要 ===
略語を定義して、入力時に展開します
Vimperator の :ab とか C-] の劣化版です

=== 使い方 ===
まず、略語を定義します
エクステ 'abbreviations-add' を実行して
>||
k keysnail
||<
と入力後 Enter してみてください

そのあとに、どこかのテキストボックス上（たとえばナビゲーションバー） で k と入力後、エクステ 'abbreviations-expand' を実行してみてください
k が keysnail に展開されます

また、KeySnail のプロンプト上で、k と入力後 SPC キーを押下してみてください
同様に k が keysnail に展開されます

以下のようにキーバインドを設定するとよいかもしれません
>||
key.setEditKey('C-]', function (ev, arg) {
    ext.exec('abbreviations-insert', arg, ev);
}, '略語を展開');
||<

定義済みの略語一覧を表示したり、削除したい場合は、エクステ 'abbreviations-show' を実行してください
]]></detail>
</KeySnailPlugin>;

let pOptions = plugins.setupOptions('abbreviations', {
    'keymap': {
        preset: {
            "C-z"   : "prompt-toggle-edit-mode",
            "SPC"   : "prompt-next-page",
            "b"     : "prompt-previous-page",
            "j"     : "prompt-next-completion",
            "k"     : "prompt-previous-completion",
            "g"     : "prompt-beginning-of-candidates",
            "G"     : "prompt-end-of-candidates",
            "q"     : "prompt-cancel",
            // 
            "i"     : "insert",
            "c"     : "create",
            "r"     : "remove",
        },
        description: M({
            ja: "略語一覧の操作用キーマップ",
            en: "Local keymap for abbreviations list"
        })
    },
    'prompt_spc': {
        preset: true,
        description: M({
            ja: "プロンプトで SPC キー押下時に略語を展開する",
            en: "When pressing the space key at the prompt to expand the abbreviation"
        })
    }
}, PLUGIN_INFO);

const GROUP = 'abbreviations';

let gAbbrs = persist.restore(GROUP) || {};

function getMostAbbrLength () {
    let len = 0;
    for (let key in gAbbrs) {
        if (key.length > len) len = key.length;
    }
    return len;
}

// Hack prompt text box
(function() {
    let textbox = document.getElementById("keysnail-prompt-textbox");

    // clean up
    if (my.abbrKeyHandler)
        textbox.removeEventListener('keypress', my.abbrKeyHandler, false);
    my.abbrKeyHandler = null;

    if (pOptions['prompt_spc']) {
        my.abbrKeyHandler = function (ev) {
            let keyStr = key.keyEventToString(ev);
            if (keyStr == 'SPC')
                ext.exec('abbreviations-expand', null, ev);
        };
        textbox.addEventListener('keypress', my.abbrKeyHandler, false);
    }
})();

// Add ext

plugins.withProvides(function (provide) {
    provide('abbreviations-add', function (ev, arg) {
        prompt.read('Input new abbreviation (key value):', function(word) {
            if (!word)
                return;
            let words = word.trim().split(' ');
            if (words.length < 2)
                return;
            gAbbrs[words.shift()] = words.join(' ');
            persist.preserve(gAbbrs, GROUP);
        });
    }, M({ja:'略語を追加', en:'Append abbreviation'}));

    provide ('abbreviations-expand', function (ev, arg) {
        let elem = ev.originalTarget;
        let value = elem.value;
        if (!value)
            return;

        let stt = elem.selectionStart;
        let end = elem.selectionEnd;
        if (stt != end)
            return;

        let abbr = '';
        for (let i = 0, maxLen = getMostAbbrLength(); i <= maxLen && stt >= 0; stt--, i++) {
            let ch = value.charAt(stt);
            if (/\s|　/.test(ch)) {
                stt++;
                abbr = value.slice(stt, end);
                break;
            }
            if (stt == 0) {
                abbr = value.slice(stt, end);
                break;
            }
        }
        if (abbr && abbr in gAbbrs) {
            elem.selectionStart = stt;
            elem.selectionEnd = end;
            command.insertText(gAbbrs[abbr]);
        }
    }, M({ja:'略語を展開', en:'Expand abbreviation'}));

    provide ('abbreviations-show', function (ev, arg) {
        let collection = [[key, value] for ([key, value] in Iterator(gAbbrs))];

        prompt.selector({
            message     : 'Abbreviations :',
            collection  : collection,
            header      : ['Key', 'Value'],
            keymap      : pOptions['keymap'],
            actions     : [
                [ function(aIndex, rows) {
                      // persist.preserve(gAbbrs, GROUP);
                      // rows.splice(aIndex, 1);
                      // prompt.refresh();
                      command.insertText(gAbbrs[rows[aIndex][0]]);
                  }, 'Insert expanded value', 'insert'],
                [ function() ext.exec('abbreviations-add'), 'Create new abbreviation', 'create' ],
                [ function(aIndex, rows) {
                      delete gAbbrs[rows[aIndex][0]];
                      persist.preserve(gAbbrs, GROUP);
                      rows.splice(aIndex, 1);
                      prompt.refresh();
                  }, 'Remove selected abbreviation', 'remove,c' ],
            ]
        });
    }, M({ja: '略語一覧を表示', en:'Show abbreviations list'}));
}, PLUGIN_INFO);
