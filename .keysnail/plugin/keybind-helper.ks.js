let PLUGIN_INFO =
    <KeySnailPlugin>
    <name>Keybind helper</name>
    <description>I display a key to push next</description>
    <description lang="ja">入力中のキーに続くキーバインドを一覧表示する</description>
    <updateURL>https://raw.github.com/gist/1026637/keybind-helper.ks.js</updateURL>
    <iconURL>https://sites.google.com/site/958site/Home/files/keybind-helper.ks.png</iconURL>
    <version>0.0.2</version>
    <minVersion>1.8.0</minVersion>
    <detail><![CDATA[
=== 使い方 ===
キーバインド入力中に、「あれ ? 次のキーなんだっけ ?」と思ったことはありませんか ?
そんなあなたにこのプラグインをおすすめします

プラグインをインストールするだけで、キー入力開始時に、自動的に次に押すべきキーの一覧を表示します
]]></detail>
</KeySnailPlugin>;

// Options

let pOptions = plugins.setupOptions('keybind_helper', {
    enable : {
        preset: true,
        description: M({
            ja: '初期状態で有効か (初期値: true)',
            en: 'Default enabled (初期値: true)'
        })
    },
    style: {
        preset: 'padding: 4px; border: solid gray; border-width: 1px 3px 3px 1px; -moz-border-bottom-colors: #ccc #aaa #888; -moz-border-right-colors: #ccc #aaa #888;',
        description: M({
            ja: 'パネルのスタイル',
            en: 'Panel style'
        })
    },
    offset: {
        preset: { x: -20, y: -20 },
        description: M({
            ja: 'パネル表示位置のオフセット',
            en: 'Offset of panel'
        })
    },
}, PLUGIN_INFO);

let gEnable = pOptions['enable'];

// Panel

let gHelpBox = (function() {
    let panel = document.getElementById('ks_kbhelp_message');
    let owner = document.getElementById("browser-bottombox");
//    let owner = document.getElementById("content");
    let isShown = true;

    if (!panel) {
        panel = document.createElement('panel');
        panel.setAttribute('id', 'ks_kbhelp_message');
        panel.setAttribute('noautohide', 'true');
        panel.setAttribute('noautofocus', 'true');
        owner.appendChild(panel);
    }
    panel.setAttribute('style', pOptions['style']);

    hide();

    function show(messages) {
        clear();
        messages.forEach(function (msg) {
            let desc = document.createElement('description');
            desc.textContent = msg;
            panel.appendChild(desc);
        });
        if (!isShown)
            panel.openPopup(owner, 'before_end', pOptions['offset'].x, pOptions['offset'].y, false, false);
        isShown = true;
    }

    function clear() {
        while (panel.hasChildNodes())
            panel.removeChild(panel.firstChild);
    }

    function hide() {
        if (isShown) {
            isShown = false;
            panel.hidePopup();
            clear();
        }
    }

    return {
        show: show,
        hide: hide,
    }
})();

// Hook

hook.addToHook('KeyPress', function(aEvent) {
    if (!gEnable) return;

    setTimeout(function() {
        if (key.currentKeySequence.length == 0) {
            gHelpBox.hide();
        } else {
            let keymap = key.trailByKeySequence(key.keyMapHolder[key.modes.GLOBAL], key.currentKeySequence) || {};
            keymap = _.extend(keymap, key.currentKeyMap);

            let nextActions = [];
            for (let [key, val] in Iterator(keymap))
                nextActions.push((typeof(val) == 'function') ? (key + ': ' + val.ksDescription) : (key + ': ...'));
            gHelpBox.show(nextActions);
        }
    }, 0);
});

// Add ext

plugins.withProvides(function(provide) {
    provide('keybind-helper-toggle', function (ev, arg) {
        gEnable = !gEnable;
        if (!gEnabled)
            gHelpBox.hide();
    }, M({ ja:'Keybind helper - 有効・無効をトグル', en:'Keybind helper - Toggle enabled' }));
}, PLUGIN_INFO);
