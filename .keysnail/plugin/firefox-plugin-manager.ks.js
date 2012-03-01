// Info

let PLUGIN_INFO =
<KeySnailPlugin>
    <name>Firefox plugin manager</name>
    <description>Firefox plugin manager</description>
    <description lang="ja">Firefox のプラグインの有効・無効を切り替える</description>
    <updateURL>https://raw.github.com/gist/1011926/firefox-plugin-manager.ks.js</updateURL>
    <iconURL>https://sites.google.com/site/958site/Home/files/firefox-plugin-manager.ks.png</iconURL>
    <author>958</author>
    <version>0.0.5</version>
    <license>MIT</license>
    <minVersion>1.8.0</minVersion>
    <include>main</include>
    <detail lang="ja"><![CDATA[
=== 使い方 ===
Firefox のプラグインの有効・無効を切り替えます

エクステ 'firefox-plugin-manager-toggle', 'firefox-plugin-manager-enable', 'firefox-plugin-manager-disable' は、パラメータで指定したプラグインの有効・無効を瞬時に切り替えます
普段は無効にしておいて、必要な時だけ有効にするような場合に便利でしょう
パラメータにはプラグイン名の正規表現を指定してください
以下のように使用します

>||
ext.exec('firefox-plugin-manager-toggle', 'adobe acrobat');
ext.exec('firefox-plugin-manager-enable', 'shockwave|silverlight');
ext.exec('firefox-plugin-manager-disable', 'shockwave|silverlight');
||<

エクステ 'firefox-plugin-manager-show' のキーマップを変更したい人は、次のような設定を .keysnail.js の PRESERVE エリアへ

>||
plugins.options["firefox_plugin_manager.keymap"] = {
    "C-z"   : "prompt-toggle-edit-mode",
    "SPC"   : "prompt-next-page",
    "b"     : "prompt-previous-page",
    "j"     : "prompt-next-completion",
    "k"     : "prompt-previous-completion",
    "g"     : "prompt-beginning-of-candidates",
    "G"     : "prompt-end-of-candidates",
    "q"     : "prompt-cancel",
    // Firefox plugin manager specific actions
    "T"     : "toggle",
    'M'     : 'open-plugin-manager',
};
||<
]]></detail>
</KeySnailPlugin>;

// Option

let pOptions = plugins.setupOptions("firefox_plugin_manager", {
    "keymap": {
        preset: {
            'T': 'toggle',
            'M': 'open-plugin-manager',
        },
        description: M({
            ja: "メイン画面の操作用キーマップ",
            en: "Local keymap for manipulation"
        })
    },
}, PLUGIN_INFO);

// Add ext

let pm = (function() {
    const PLUGIN_ICON = "chrome://mozapps/skin/plugins/pluginGeneric.png";
    function getPlugins() {
        let nsIPluginHost = Components.classes["@mozilla.org/plugin/host;1"].
            getService(Components.interfaces.nsIPluginHost);
        return nsIPluginHost.getPluginTags({ });
    }

    function showList() {
        let plugins = getPlugins();
        let collection = plugins.map(function(p) [p.disabled, PLUGIN_ICON, p.name, p.version, p.description]);

        prompt.selector({
            message    : "pattern:",
            collection : collection,
            flags      : [HIDDEN | IGNORE, ICON | IGNORE, 0, 0, 0],
            style      : [0, 0, style.prompt.description],
            header     : ["Name", "Version", "Description"],
            width      : [40, 10, 50],
            keymap     : pOptions["keymap"],
            stylist    : function(args) {
                let style = "";
                if (args[0])
                    style += "opacity: 0.5;";
                return style;
            },
            actions    : [
                [function (aIndex) {
                     if (aIndex >= 0) {
                         display.prettyPrint(
                             plugins[aIndex].name + ' ' + plugins[aIndex].version + '\n' +
                             plugins[aIndex].description + '\n' +
                             plugins[aIndex].fullpath,
                             { timeout: 5000 }
                         );
                     }
                 },
                 'Show detail',
                 'show,c'],
                [function (aIndex, rows) {
                     if (aIndex >= 0) {
                         rows[aIndex][0] = plugins[aIndex].disabled = !plugins[aIndex].disabled;
                         prompt.refresh();
                     }
                 },
                 'Toggle status',
                 'toggle,c'],
                [function () BrowserOpenAddonsMgr("addons://list/plugin"),
                 'Open plugin manager',
                 'open-plugin-manager'],
            ]
        });
    }

    function toggleState(name) {
        if (!name) return;
        let re = new RegExp(name, "i");
        let plugins = getPlugins();
        plugins.filter(function(p) re.test(p.name)).forEach(function(p) p.disabled = !p.disabled);
    }

    function enableState(name) {
        if (!name) return;
        let re = new RegExp(name, "i");
        let plugins = getPlugins();
        plugins.filter(function(p) re.test(p.name)).forEach(function(p) p.disabled = false);
    }

    function disableState(name) {
        if (!name) return;
        let re = new RegExp(name, "i");
        let plugins = getPlugins();
        plugins.filter(function(p) re.test(p.name)).forEach(function(p) p.disabled = true);
    }

    return {
        show: showList,
        toggle: toggleState,
        enable: enableState,
        disable: disableState,
    };
})();

plugins.withProvides(function (provide) {
    provide("firefox-plugin-manager-show",
        function (ev, arg) pm.show(arg),
        M({ja: "Firefox plugin manager - リストを表示",
           en: "Firefox plugin manager - Show list"})
    );
    provide("firefox-plugin-manager-toggle",
        function (ev, arg) pm.toggle(arg),
        M({ja: "Firefox plugin manager - 指定プラグインの有効・無効をトグル",
           en: "Firefox plugin manager - Toggle plugin state"})
    );
    provide("firefox-plugin-manager-enable",
        function (ev, arg) pm.enable(arg),
        M({ja: "Firefox plugin manager - 指定プラグインを有効に",
           en: "Firefox plugin manager - Enable plugin state"})
    );
    provide("firefox-plugin-manager-disable",
        function (ev, arg) pm.disable(arg),
        M({ja: "Firefox plugin manager - 指定プラグインを無効に",
           en: "Firefox plugin manager - Disable plugin state"})
    );
}, PLUGIN_INFO);
