let PLUGIN_INFO =
    <KeySnailPlugin>
    <name>HoK Ex</name>
    <description>Extend HoK</description>
    <description lang="ja">HoK をちょっと拡張する</description>
    <updateURL>https://raw.github.com/gist/992351/hok-ex.ks.js</updateURL>
    <iconURL>https://sites.google.com/site/958site/Home/files/hok-ex.ks.png</iconURL>
    <license>MPL</license>
    <author>958</author>
    <version>0.0.4</version>
    <minVersion>1.8.0</minVersion>
    <detail><![CDATA[
=== 使い方 ===
==== HoK で要素選択時の動作を拡張 ====
インストールするだけで、HoK にて要素選択時に以下の機能が追加されます
- select 要素を選択した際に、anything.el ライクに選択する
- <input type="file"> を選択した際に、prompt でファイルを選択する
- pdf, doc 等のリンクを開く際に、Google Docs Viewer で開く
- リンクを開く際に ime.nu を除去する

上記機能を書き換えたい場合は、以下のように plugins.options['hok_ex.actions'] を書き換えてください
>|javascript|
plugins.options['hok_ex.actions'] = [
    // Google docs viewer
    {
        type    : 'url',
        matcher : function(elem) {
            const extRe = new RegExp('^[^\\?#]+\\.(' +
                    ['doc','docx','xls','xlsx','ppt','pptx','pdf'].join('|') +
                    ')($|[#?])', 'i');
            return (elem.href && !/^https?:\/\/docs\.google\.com/.test(elem.href) && extRe.test(elem.href));
        },
        fn      : function(elem)
            'http://docs.google.com/viewer?url='+encodeURIComponent(elem.href)+'&chrome=true'
    }
];
||<

また、プリセットアクションはそのままで、アクションを追加したい場合は plugins.options['hok_ex.extra_actions'] を定義してください
たとえば、K2Emacs.ks.js と連携する場合は、以下のように書くとよいでしょう
>|javascript|
plugins.options['hok_ex.extra_actions'] = [

    // Textarea を選択した際に、K2Emacs で開く

    {

        type    : 'unique',

        matcher : function(elem) (elem.localName.toLowerCase() == 'textarea'),

        fn      : function(elem) {

            elem.focus();

            ext.exec('edit_text', null, { originalTarget: elem });

        }

    }

];

||<

本プラグインの上記機能が邪魔になった場合は、エクステ 'hok-ex-toggle' を実行してください
一時的に機能を無効化できます

==== HoK 右クリックメニュー開く を prompt.selector で ====
以下の機能も追加されます
- 拡張ヒントモードの "右クリックメニューを開く" を実行した際に、右クリックメニューを anything.el ライクに選択する
 - 正常に表示されないメニューが一部あります

上記機能のみ無効にしたい場合は、
>|javascript|
hook.addToHook('PluginLoaded', function() delete plugins.hok_ex.contextMenuSelector);
||<
としてください

==== ちょっとだけ便利なエクステを追加 ====
* 'hok-ex-start-continuous-mode'  は動作しなくなった為、削除しました。

=== 謝辞 ===
以下のスクリプトを参考にさせていただきました
- HTML の select 要素選択を anything.el ライクに行う - mooz deceives you
 - http://d.hatena.ne.jp/mooz/20100206/p1
- mooz's gist: 286772 — Gist
 - https://gist.github.com/286772
]]></detail>
</KeySnailPlugin>;

// Options

let pOptions = plugins.setupOptions('hok_ex', {
    'enable' : {
        preset: true,
        description: M({
            ja: '初期状態で有効か (初期値: true)',
            en: 'Default enabled (初期値: true)'
        })
    },
    'actions': {
        preset: [
            // select 要素をセレクタで選択
            {
                type    : 'unique',
                matcher : function(elem) (elem.localName.toLowerCase() === "select"),
                fn      : function(elem) plugins.hok_ex.optionSelector(elem)
            },
            // upload from commandline
            {
                type    : 'unique',
                matcher : function(elem) (elem.localName.toLowerCase() === "input" && elem.type.toLowerCase() === "file"),
                fn      : function(elem) plugins.hok_ex.uploadCommandline(elem)
            },
            // Google docs viewer
            {
                type    : 'url',
                matcher : function(elem) {
                    const extRe = new RegExp('^[^?#]+\\.(' +
                            ['doc','docx','xls','xlsx','ppt','pptx','pdf'].join('|') +
                            ')($|[#?])', 'i');
                    return (elem.href && !/^https?:\/\/docs\.google\.com/.test(elem.href) && extRe.test(elem.href));
                },
                fn      : function(elem)
                    'http://docs.google.com/viewer?url='+encodeURIComponent(elem.href)+'&chrome=true'
            },
            // ime.nu 除去
            {
                type    : 'url',
                matcher : function(elem) (elem.href && /^http:\/\/ime\.nu/.test(elem.href)),
                fn      : function(elem) elem.href.replace('ime.nu/', '')
            }
        ],
        description: M({
            ja: 'デフォルトアクションを書き換える',
            en: 'Overwrite default actions'
        })
    },
    'extra_actions': {
        preset:[],
        description: M({
            ja: 'ユーザ定義アクション',
            en: 'User define actions'
        })
    },
}, PLUGIN_INFO);

// Hook HoK

let gEnable = pOptions['enable'];

plugins.hok_ex = {
    // select 要素をセレクタで選択
    // via http://d.hatena.ne.jp/mooz/20100206/p1
    optionSelector: function(elem) {
        let options = Array.slice(elem.childNodes).filter((function (e) (e.localName || "") === "option"));
        prompt.selector({
            message      : "select:",
            collection   : options.map((function (e) e.textContent)),
            initialIndex : elem.selectedIndex || 0,
            callback     : function (i) {
                elem.selectedIndex = i;
                let event = content.document.createEvent('Event');
                event.initEvent('change', true, true);
                elem.dispatchEvent(event);
            }
        });
    },
    // upload from commandline
    uploadCommandline: function(elem) {
        // set default dir
        util.changeDirectory(util.getUnicharPref('browser.download.lastDir') || share.pwd);

        // via https://gist.github.com/286772
        prompt.reader({

            message : "Select file (" + share.pwd + ") :",

            group : "upload-file",

            flags : [ICON | IGNORE, 0],

            completer : completer.fetch.directory({

                // hideDotFiles : true,

                // mask : /\.(js|jpg|jpeg)$/,

                filter: function (collection, query) {

                    let matched = [];

                    let remains = collection;



                    // head

                    remains = remains.filter(function (c) {

                        if (c.indexOf(query) === 0) { matched.push(c); return false; }

                        return true;

                    });

                    // ignore case

                    let (query = query.toLowerCase())

                        remains = remains.filter(function (c) {

                            if (c.toLowerCase().indexOf(query.toLowerCase()) === 0) { matched.push(c); return false; }

                                return true;

                            });



                    if ("xulMigemoCore" in window)

                        return matched.concat(remains.filter(function (c) c.match(window.xulMigemoCore.getRegExp(query))));



                    return matched;

                }

            }),

            callback : function (query) {
                if (query)

                    elem.value = completer.utils.normalizePath(share.pwd + userscript.directoryDelimiter + query);

            }

        });
    },
    // contextmenu in selector
    contextMenuSelector: function(elem) {
        elem.focus();

        document.popupNode = elem;
        let menu = document.getElementById("contentAreaContextMenu");
        menu.showPopup(elem, -1, -1, "context", "bottomleft", "topleft");
        let temp = gContextMenu;
        gContextMenu = temp;

        let collection = Array.slice(menu.getElementsByTagName('menuitem'))
            .filter(function(item) {
                let enabled = true;
                if (item.parentNode != menu) {
                    let pa = item.parentNode;
                    enabled = (pa.label && !pa.disabled && !pa.hidden);
                }
                return (enabled && item.label && !item.disabled && !item.hidden);
            })
            .map(function(item) {
                let label = (item.parentNode != menu) ?
                    item.parentNode.parentNode.label + ' -> ' + item.label :
                    item.label;
                return [label, item];
            });
        menu.hidePopup();
        prompt.selector({
            message     : 'Select menu item :',
            collection  : collection,
            flags       : [0, HIDDEN | IGNORE],
            onFinish    : function() gContextMenu = null,
            actions     : [[
                function(aIndex) collection[aIndex][1].doCommand()
            ]]
        });
    },
    /*
    startContinuous: function() {
        if (!my.hokex.orgDestruction) my.hokex.orgDestruction = util.evalInContext('destruction', plugins.hok.hok.startForeground);

        my.hokex.unloadHandler = function() {
            util.evalInContext('destruction()', plugins.hok.hok.startForeground);
        };

        content.addEventListener('unload', my.hokex.unloadHandler, false);
        util.evalInContext(function() {
            destruction = function (aForce) {
                if (continuousMode && !aForce) {
                    my.hokex.orgDestruction(true);
                    setTimeout(plugins.hok.hok.startContinuous, 0);
                    return;
                }
                my.hokex.orgDestruction(aForce);
                if (aForce) {
                    content.removeEventListener('unload', my.hokex.unloadHandler, false);
                    util.evalInContext(function() {
                        destruction = my.hokex.orgDestruction;
                    }.toSource() + '()', plugins.hok.hok.startForeground);
                }
            }
        }.toSource() + '()', plugins.hok.hok.startForeground);
        plugins.hok.hok.startContinuous();
    },
    */
};

const actions = pOptions['actions'].concat(pOptions['extra_actions']);

hook.addToHook('PluginLoaded', function(){
    if (!plugins.hok) return;

    const openMode = [null, 'tab', 'tabshifted', 'window', 'current'];
    if (!my.hokex) my.hokex = {};

    // Hook hok.followLink
    if (!my.hokex.orgFollowLink) my.hokex.orgFollowLink = plugins.hok.followLink;
    plugins.hok.followLink = function(elem, where) {
        if (!gEnable) {
            my.hokex.orgFollowLink(elem, where);
            return;
        }
        let isExecute = false;
        try {
            for (let i = 0; i < actions.length; i++) {
                if (actions[i].matcher(elem)) {
                    let result = actions[i].fn(elem);
                    isExecute = true;
                    switch (actions[i].type) {
                    case 'url':
                        openUILinkIn(result, openMode[where]);
                        break;
                    }
                    break;
                }
            }
        } catch(ex) {
            util.message(ex);
        }
        if (!isExecute)
            my.hokex.orgFollowLink(elem, where);
    };

    // Hook hok.openContextMenu
    if (!my.hokex.orgOpenContextMenu) my.hokex.orgOpenContextMenu = plugins.hok.openContextMenu;
    plugins.hok.openContextMenu = function(elem) {
        if (!gEnable) {
            my.hokex.orgOpenContextMenu(elem);
            return;
        }
        (plugins.hok_ex.contextMenuSelector || my.hokex.orgOpenContextMenu)(elem);
    }
});

// Add ext

plugins.withProvides(function(provide) {
    provide('hok-ex-toggle', function (ev, arg) {
        gEnable = !gEnable;
    }, M({ ja:'HoK Ex - 有効・無効をトグル', en:'HoK Ex - Toggle enabled' }));
    /*
    provide("hok-ex-start-continuous-mode",
        plugins.hok_ex.startContinuous,
    M({ja: "HoK Ex - リンクを連続して開く", en: "HoK Ex - Start Hit a Hint continuous mode"}));
    */
}, PLUGIN_INFO);
