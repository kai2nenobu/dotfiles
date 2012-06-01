// ========================== KeySnail Init File =========================== //

// この領域は, GUI により設定ファイルを生成した際にも引き継がれます
// 特殊キー, キーバインド定義, フック, ブラックリスト以外のコードは, この中に書くようにして下さい
// ========================================================================= //
//{{%PRESERVE%
// prompt.rows                = 12;
prompt.useMigemo           = true;
prompt.migemoMinWordLength = 4;
prompt.displayDelayTime    = 30;
// command.kill.killRingMax   = 15;
// command.kill.textLengthMax = 8192;

//}}%PRESERVE%
// ========================================================================= //


// ================================ My original ============================ //
//// hok_ex
// リンクを google docs へ渡すのを防ぐ
plugins.options['hok_ex.actions'] = null;

//// KeySnail 操作
key.setViewKey(['K', 'p'], function (ev, arg) {
    ext.exec("open-plugin-manager",arg, ev);
}, 'プラグインマネージャを開く');

key.setViewKey(['K', 'r'], function (ev, arg) {
    ext.exec("reload-the-initialization-file",arg, ev);
}, '設定ファイルを再読み込み');

key.setViewKey(['K', 'b'], function (ev, arg) {
    ext.exec("list-all-keybindings",arg, ev);
}, 'キーバインド一覧を表示');

//// URL 操作
key.setViewKey(['g', 'u'], function () {
    var uri = getBrowser().currentURI;
    if (uri.path == "/") {
        return;
    }
    var pathList = uri.path.split("/");
    if (!pathList.pop()) {
        pathList.pop();
    }
    loadURI(uri.prePath + pathList.join("/") + ("/"));
}, '一つ上のディレクトリへ移動');

key.setViewKey(['g', 'U'], function () {
    var uri = window._content.location.href;
    if (uri == null) {
        return;
    }
    var root = uri.match(/^[a-z]+:\/\/[^/]+\//);
               if (root) {
                   loadURI(root, null, null);
               }
              }, 'ルートディレクトリへ移動');

key.setViewKey(['g', '>'], function (ev, arg) {
    let pattern = /(.*?)([0]*)([0-9]+)([^0-9]*)$/;
    let url = content.location.href;
    let digit = url.match(pattern);

    if (digit[1] && digit[3])
    {
        let len = digit[3].length;
        let next = +digit[3] + (arg ? arg : 1);
        content.location.href = digit[1] + (digit[2] ||"").slice(next.toString().length - len) + next + (digit[4] ||"");
    }
}, 'URLの中の数値をひとつ増加（インクリメント）');

key.setViewKey(['g', '<'], function (ev, arg) {
    let pattern = /(.*?)([0]*)([0-9]+)([^0-9]*)$/;
    let url = content.location.href;
    let digit = url.match(pattern);

    if (digit[1] && digit[3])
    {
        let len = digit[3].length;
        let next = +digit[3] - (arg ? arg : 1);
        content.location.href = digit[1] + (digit[2] ||"").slice(next.toString().length - len) + next + (digit[4] ||"");
    }
}, 'URLの中の数値をひとつ減少（デクリメント）');

//// ヘッダ (h1 ~ h4) を一覧表示し，その位置までスクロールできるように．Emacs でいうところの imenu のようなもの．
//// http://keysnail.g.hatena.ne.jp/mooz/20120212/1329040579
ext.add("imenu-headers", function () {
  let anchorSelector = [
    "h1",
    "h2",
    "h3",
    "h4"
  ].join(",");

  let elements = Array.slice(content.document.querySelectorAll(anchorSelector));

  function elementToString(element) {
    let headerString = "",
        matched = null;
    if ((matched = element.localName.match(/h([0-9])/))) {
      let headerCount = parseInt(matched[1], 10);
      headerString = (new Array(headerCount)).join("  ");

      let headerMarks = {
        1: '',            /* none */
        2: "\u2023",      /* right arrow */
        3: "\u2022",      /* bullet */
        4: "\u25E6"       /* white bullet */
      };

      if (headerMarks[headerCount])
        headerString = headerString + headerMarks[headerCount] + " ";
    }

    return headerString + element.textContent;
  }

  function scrollToElement(element) {
    let anchor = element.getAttribute("id") || element.getAttribute("name");
    if (anchor)
      content.location.hash = anchor;
    else
      element.scrollIntoView();
  }

  prompt.selector({
    message: "jump to: ",
    collection: elements.map(function (element) elementToString(element)),
    callback: function (selectedIndex) {
      if (selectedIndex < 0)
        return;
      scrollToElement(elements[selectedIndex]);
    }
  });
}, "imenu-headers", true);

key.setViewKey(['g', 'i'], function (ev) {
  ext.exec("imenu-headers");
}, 'jump to headers');

//// Firefox を再起動する
key.setGlobalKey(["C-x", "C-r"], function (ev, arg) {
    ext.exec("restart-firefox", arg, ev);
}, 'Firefoxを再起動する', true);

//// プロンプト内でスペルチェック
//// http://keysnail.g.hatena.ne.jp/mooz/20111129/1322537423
let (p = document.querySelector("#keysnail-prompt-textbox")) {
  p && p.setAttribute("spellcheck", "true");
};

//// 選択文字列で google 検索
//// http://keysnail.g.hatena.ne.jp/mooz/20100318/1268923913
key.defineKey([key.modes.CARET, key.modes.VIEW], 's', function (ev, arg) {
    shell.input("tabopen google " + (content.document.getSelection().toString() || "").replace(/[, ]/g, "\\$&"));
}, 'Google word');

// about:config の設定
util.setPrefs(
    {
        "extensions.checkCompatibility.7.0": false,   // ignore compatibility
        "extensions.checkCompatibility.8.0": false,   // ignore compatibility
        "extensions.checkCompatibility.9.0": false,   // ignore compatibility
        "extensions.checkCompatibility.10.0": false,  // ignore compatibility
        "extensions.checkCompatibility.11.0": false,  // ignore compatibility
        "extensions.checkCompatibility.12.0": false,  // ignore compatibility
        "browser.urlbar.trimURLs": false,             // show "http://" in location bar
    }
);

// firebugでオブジェクトをインスペクト
// http://efcl.info/2011/0402/res2453/
function fbug(x) {
    var args = Array.slice(arguments);
    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1']
                        .getService(Components.interfaces.nsIWindowMediator);
    var {Firebug} = windowManager.getMostRecentWindow("navigator:browser");
    if (Firebug.Console.isEnabled() && Firebug.toggleBar(true, 'console')) {
        Firebug.Console.logFormatted(args);
    }
    return args.length > 1 ? args : args[0];
};

// PRESERVE エリアの外に
// http://efcl.info/2011/0402/res2453/
key.setViewKey(['ESC', 'ESC'], function (ev) {
    userscript.loadPlugins();
}, 'プラグインのリロード');


// key.defineKey([key.modes.VIEW, key.modes.CARET], '?', function () {
//     let keymap = key.trailByKeySequence(key.keyMapHolder[key.modes.GLOBAL], []) || {};
//     keymap = _.extend(keymap, key.currentKeyMap);
//     let nextActions = [];
//     for (let [key, val] in Iterator(keymap))
//         nextActions.push((typeof(val) == 'function') ? (key + ': ' + val.ksDescription) : (key + ': ...'));
//     gHelpBox.show(nextActions);
// }, 'hoge', true);



// ============================= Plugin settings =========================== //
//// displayLastModified
key.setViewKey(['C-c', 'l'], function (ev, arg) {
    ext.exec('displayLastModified-URL', arg, ev);
}, 'ページの最終更新日を表示', true);

//// Expander 動的略語展開（小文字で開始しても大文字に展開可能）
plugins.options["dabbrev.next_key"] = "M-/"; //展開
plugins.options["dabbrev.prev_key"] = "M-\\"; //ひとつ前の候補に戻る
key.setEditKey('M-/', function (ev, arg) {
    ext.exec("dabbrev-expand", arg, ev);
}, "動的略語展開", true);
plugins.options["dabbrev.candidates"] = [
    "Firefox",
    "Safari",
    "Chrome",
    "Thunderbird",
    "Evernote",
    "Twitter",
    "Facebook",
    "Emacs",
    "KeySnail",
    "ZBrush",
    "FlashDevelop",
    "FlashPlayer"
];

//// Scrollet!
key.setGlobalKey(['C-x', 'r', 'SPC'], function (ev, arg) {
    ext.exec("scrollet-set-mark", arg, ev);
}, "現在の位置をマークに保存", true);

key.setGlobalKey(['C-x', 'r', 'j'], function (ev, arg) {
    ext.exec("scrollet-jump-to-mark", arg, ev);
}, "マークに保存された位置へジャンプ", true);

key.setGlobalKey(['C-x', 'r', 'j'], function (ev, arg) {
    ext.exec("scrollet-jump-to-mark", arg, ev);
}, "マークに保存された位置へジャンプ", true);

//// RILnail
//// Read it later フロントエンド
key.setViewKey(['r', 'a'], function (ev, arg) {
    ext.exec('ril-append', arg, ev);
}, 'RIL - 現在のタブを RIL に追加');

key.setViewKey(['r', 'r'], function (ev, arg) {
    ext.exec('ril-remove', arg, ev);
}, 'RIL - 現在のタブを RIL から削除');

key.setViewKey(['r', 't'], function (ev, arg) {
    ext.exec('ril-toggle', arg, ev);
}, 'RIL - 現在のタブを RIL に追加 または 削除');

key.setViewKey(['r', 'A'], function (ev, arg) {
    ext.exec('ril-append-and-close', arg, ev);
}, 'RIL - 現在のタブを RIL に追加してタブを閉じる');

key.setViewKey(['r', 'l'], function (ev, arg) {
    ext.exec('ril-show-reading-list', arg, ev);
}, 'RIL - リストを表示');

//// Google Web History
plugins.options["google-web-history.keymap"] = {
    "C-z"   : "prompt-toggle-edit-mode",
    "SPC"   : "",
    "b"     : "prompt-previous-page",
    "j"     : "prompt-next-completion",
    "k"     : "prompt-previous-completion",
    "g"     : "prompt-beginning-of-candidates",
    "G"     : "prompt-end-of-candidates",
    "q"     : "prompt-cancel",
    // google web history specific actions
    "/"     : "search",
    "o"     : "open"
};

//// Google Calendar
plugins.options["google_calendar.show_date"] = 30;
// key bind
key.setViewKey(["c", "a"], function (ev, arg) {
    ext.exec("google-calendar-show-all-events", arg, ev);
}, 'Google Calendar - 全てのイベント一覧', true);

key.setViewKey(["c", "s"], function (ev, arg) {
    ext.exec("google-calendar-show-events-on-calendar", arg, ev);
}, 'Google Calendar - カレンダーのイベント一覧', true);

key.setViewKey(["c", "c"], function (ev, arg) {
    ext.exec("google-calendar-create-event", arg, ev);
}, 'Google Calendar - イベントを作成', true);

//// site-local-keymap
var local = {};
plugins.options["site_local_keymap.local_keymap"] = local;

function fake(k, i) function () { key.feed(k, i); };
function pass(k, i) [k, fake(k, i)];
function ignore(k, i) [k, null];

key.setGlobalKey("C-;", function (ev, arg) {
    ext.exec("site-local-keymap-toggle-status", arg, ev);
}, 'Site local keymap', true);

//// Slideshare
local["^http://www.slideshare.net/"] = [
  ['n', function () ext.exec("slideshare-next")],
  ['p', function () ext.exec("slideshare-previous")],
  ['j', function () ext.exec("slideshare-next")],
  ['k', function () ext.exec("slideshare-previous")],
  ['f', function () ext.exec("slideshare-toggle-fullscreen")]
];


//// Hatebnail
key.setGlobalKey(["M-h", "l"], function (ev, arg) {
    ext.exec("list-hateb-items", arg);
}, "はてなブックマークのアイテムを一覧表示", true);

key.setViewKey(["M-h", "c"], function (ev, arg) {
    ext.exec("list-hateb-comments", arg);
}, "はてなブックマークのコメントを一覧表示", true);

key.setViewKey(["M-h", "a"], function (ev, arg) {
    ext.exec("hateb-bookmark-this-page");
}, 'このページをはてなブックマークに追加', true);

//// Dlbsnail
//// 2011-08-05 (Fri)
key.setViewKey('d', function (ev, arg) {
    ext.exec("dlbsnail-show-file-list", arg, ev);
}, 'Show Download Statusbar Items', true);

plugins.options["dlbsnail.file_key_map"] = {
    "C-z"   : "prompt-toggle-edit-mode",
    "SPC"   : "prompt-next-page",
    "b"     : "prompt-previous-page",
    "j"     : "prompt-next-completion",
    "k"     : "prompt-previous-completion",
    "g"     : "prompt-beginning-of-candidates",
    "G"     : "prompt-end-of-candidates",
    "q"     : "prompt-cancel",
    // for finished file
    "o"     : "open-this-file",
    "O"     : "show-this-file",
    "R"     : "rename-this-file",
    // "C-D"   : "delete-this-file",
    "C"     : "clear-this-file",
    // for in progress or pause file
    // "C-C"   : "cancel-this-file",
    // for in progress file
    // "C-P"   : "pause-this-file",
    // for pause file
    "r"     : "resume-this-file",
    // for all file
    "c"     : "copy-url",
    "V"     : "visit-ref-website",
    "u"     : "undo-clear",
    "h"     : "refresh-file-list",
    "s"     : "switch-file-type"
};

//// TabSnail
//// 2011-08-05 (Fri)
// key.setViewKey("U", function(ev, arg) {
//   ext.exec("tst-select-parent-tab", arg, ev);
// }, '親タブを選択する');

// key.setViewKey(["t", "^"], function(ev, arg) {
//   ext.exec("tst-select-first-child-tab", arg, ev);
// }, '最初の子タブを選択する');

// key.setViewKey(["t", "$"], function(ev, arg) {
//   ext.exec("tst-select-last-child-tab", arg, ev);
// }, '最後の子タブを選択する');

// key.setViewKey("^", function(ev, arg) {
//   ext.exec("tst-select-first-sibling-tab", arg, ev);
// }, '最初の兄弟タブを選択する', true);

// key.setViewKey("$", function(ev, arg) {
//   ext.exec("tst-select-last-sibling-tab", arg, ev);
// }, '最後の兄弟タブを選択する', true);

// key.setViewKey("H", function(ev, arg) {
//   ext.exec("tst-select-previous-sibling-tab", arg, ev);
// }, '前の兄弟タブを選択する');

// key.setViewKey("L", function(ev, arg) {
//   ext.exec("tst-select-next-sibling-tab", arg, ev);
// }, '次の兄弟タブを選択する');

// key.setGlobalKey(['C-t', '>'], function(ev, arg) {
//   ext.exec("tst-read-selected-tab-later", arg, ev);
// }, '選択中のタブを最後尾に移動する');

key.setGlobalKey(['C-t', 'h'], function(ev, arg) {
  ext.exec("tst-move-selected-tab-left", arg, ev);
}, '選択中のタブを左へ移動する');

key.setGlobalKey(['C-t', 'l'], function(ev, arg) {
  ext.exec("tst-move-selected-tab-right", arg, ev);
}, '選択中のタブを右へ移動する');

key.setGlobalKey(['C-t', '^'], function(ev, arg) {
  ext.exec("tst-promote-tab", arg, ev);
}, '選択中のタブを1つ上の階層に移動する');

key.setGlobalKey(['C-t', 'RET'], function(ev, arg) {
  ext.exec("tst-demote-tab", arg, ev);
}, '選択中のタブを1つ下の階層に移動する');

key.setViewKey(['C-t', 'SPC'], function(ev, arg) {
  ext.exec("tst-toggle-collapse-expand-tree", arg, ev);
}, 'タブの折りたたみをトグル', true);

key.setViewKey(['C-t', 't'], function(ev, arg) {
  ext.exec("tst-toggle-autohide-tabbar", arg, ev);
}, 'タブバーの表示をトグル', true);

//// ツリー型タブアドオンでタブの移動はできるが，
//// 標準でもできるのでバインドしておく
//// http://d.hatena.ne.jp/mooz/20090904/p1
key.setViewKey("H",
               function () {
                   if (gBrowser.mCurrentTab.previousSibling)
                       gBrowser.moveTabTo(gBrowser.mCurrentTab, gBrowser.mCurrentTab._tPos - 1);
                   else
                       gBrowser.moveTabTo(gBrowser.mCurrentTab, gBrowser.mTabContainer.childNodes.length - 1);
               },
               "選択中のタブを右へ移動");

key.setViewKey("L",
               function () {
                   if (gBrowser.mCurrentTab.nextSibling)
                       gBrowser.moveTabTo(gBrowser.mCurrentTab, gBrowser.mCurrentTab._tPos + 1);
                   else
                       gBrowser.moveTabTo(gBrowser.mCurrentTab, 0);
               },
               "選択中のタブを左へ移動");

//// Abbreviations manager 略語展開
//// https://gist.github.com/1024186
key.setEditKey([['C-x', '\''], ['C-]']], function (ev, arg) {
    ext.exec('abbreviations-expand', arg, ev);
}, '略語を展開する');

key.setEditKey(['C-c', 'y'], function (ev, arg) {
    ext.exec('abbreviations-show', arg, ev);
    prompt.editModeEnabled = true;
}, '略語一覧を表示');

key.setViewKey(['A', 'a'], function (ev, arg) {
    ext.exec('abbreviations-add', arg, ev);
}, '略語を追加');

key.setViewKey(['A', 'l'], function (ev, arg) {
    ext.exec('abbreviations-show', arg, ev);
}, '略語一覧を表示');


//// Migemo 検索
//// https://gist.github.com/999712
key.setViewKey('/', function (ev, arg) {
    window.XMigemoFind.target = document.getElementById('content');
    window.XMigemoFind.clear(false);
    window.XMigemoFind.isLinksOnly = false;
    window.XMigemoFind.isQuickFind = false;
    window.XMigemoFind.findMode = window.XMigemoFind.FIND_MODE_MIGEMO;
    window.XMigemoFind.caseSensitive = false;
    prompt.reader({
        message : 'Find:',
        onChange: function (arg) window.XMigemoFind.find(false, arg.textbox.value, false),
        callback: function (text) {}
    });
    LinuxIMEoff();
}, 'Migemo 検索', true);

key.setViewKey('n', function (ev, arg) {
    window.XMigemoFind.findNext(true);
}, 'Migemo 検索 - 次へ', true);

key.setViewKey('N', function (ev, arg) {
    window.XMigemoFind.findPrevious(true);
}, 'Migemo 検索 - 前へ', true);

//// Google Tasks
//// 2011-05-18 (Wed)
//// google calendar の TODO を操作
key.setGlobalKey(['C-t', 's'], function (ev, arg) {
    ext.exec("google-tasks-show-tasks", arg, ev);
}, 'Google Tasks - タスク一覧を表示');

key.setGlobalKey(['C-t', 'c'], function (ev, arg) {
    ext.exec("google-tasks-create", arg, ev);
}, 'Google Tasks - 新しいタスクを作成');

//// prompt.selector の色変更
//// 2011-05-09 (Mon)
//// http://keysnail.g.hatena.ne.jp/mooz/20100306/1267841504
(function () {
     function arrange(seed) {
         let colors = [
             ["%FG%" , "#e2e2e2"],
             ["%BG%" , "#151515"],
             // ["%FG_SELECTED%" , "#e2e2e2"],
             ["%BG_SELECTED%" , "rgba(60,76,82,0.2)"],
             //
             ["%FG_MESSAGE%" , "#61b5d4"],
             //
             ["%FG_HOVER%" , "#61b5d4"],
             ["%BG_HOVER%" , "#232323"],
             //
         ];

         colors.forEach(function ([k, v]) { seed = seed.replace(k, v, "g"); } );
         return seed;
     }

     let ooo = {
         "twitter_client": {
             "normal_tweet_style" : "color:%FG%;",
             "my_tweet_style" : "color:#7ad3f2;",
             "reply_to_me_style" : "color:#f279d2;",
             "retweeted_status_style" : "color:#d2f279;",
             "selected_row_style" : "color:%FG%; background-color:%BG_SELECTED%;",
             "selected_user_style" : "color:%FG%; background-color:rgba(60,76,82,0.4);",
             "selected_user_reply_to_style" : "color:%FG%; background-color:rgba(82,60,76,0.4);",
             "selected_user_reply_to_reply_to_style" : "color:%FG%; background-color:rgba(79,60,82,0.4);",
             "search_result_user_name_style" : "color:%FG_MESSAGE%;"
         }
     };

     // style.register(<><![CDATA[
     // #hBookmark-status-count label {
     // display: inline !important;
     // -moz-opacity: 1 !important;
     // cursor: pointer !important;
     // }

     // #hBookmark-status-count image {
     // display: none !important;
     // }
     // ]]></>.toString());

     // style.prompt["default"] = "color:#e2e2e2;";
     // style.prompt["description"] = "color:#abbac0;";
     // style.prompt["url"] = "color:#98d3e7;text-decoration:underline;";
     // style.prompt["engine"] = "color:#1782de;";
     // style.prompt["bookmark"] = "color:#f14b0d;";
     // style.prompt["history"] = "color:#62e500;";

     // style.js["function"] = "color:#1782de;";
     // style.js["object"] = "color:#f14b0d;";
     // style.js["string"] = "color:#62e500;";
     // style.js["xml"] = "color:#6621dd;";
     // style.js["number"] = "color:#b616e7;";
     // style.js["boolean"] = "color:#e63535;";
     // style.js["undefined"] = "color:#e000a5;";
     // style.js["null"] = "color:#07d8a8;";

     // for (let [prefix, opts] in Iterator(ooo))
     //     for (let [k, v] in Iterator(opts))
     //         plugins.options[prefix + "." + k] = arrange(v);

     style.register(arrange(<><![CDATA[
/* おまじない */
#keysnail-prompt,
#keysnail-prompt textbox,
listbox#keysnail-completion-list,
listbox#keysnail-completion-list listitem,
#keysnail-completion-list listheader
{
    -moz-appearance : none !important;
    border : none !important;
}

/* 基本スタイル */
// #keysnail-prompt,
// #keysnail-prompt textbox,
// listbox#keysnail-completion-list,
// #keysnail-completion-list listheader,
// #keysnail-twitter-client-user-tweet
// {
//     font-family : Monaco, Consolas, monospace !important;
//     background-color : %BG% !important;
//     color : %FG% !important;
// }

// description.ks-text-link { color : #98d3e7 !important; }
// description.ks-text-link:hover { color : #248baf !important; }

/*
listbox#keysnail-completion-list {
background-image : url("file:///home/masa/Desktop/ildjarn.png") !important;
background-position : right bottom !important;
background-attachment : fixed !important;
background-repeat : no-repeat !important;
}
*/

/* 選択中行のスタイル */
#keysnail-completion-list listitem[selected="true"],
listbox#keysnail-completion-list:focus > listitem[selected="true"]
{
    background-color : %BG_SELECTED% !important;
    color : %FG_SELECTED% !important;
}

/* プロンプト入力エリアへマウスオーバーした際, 背景色を変更 */
// #keysnail-prompt textbox:hover
// {
//     background-color : %BG_HOVER% !important;
// }

/* プロンプトのメッセージ */
// .keysnail-prompt-label {
//     color : %FG_MESSAGE% !important;
// }

/* 下部へ線を引く */
// listbox#keysnail-completion-list {
//     border-bottom : 1px solid %FG% !important;
//     margin : 0 !important;
// }

/* ヘッダ */
// #keysnail-completion-list listheader {
//     font-weight : bold !important;
//     padding : 2px !important;
//     color : %FG_HOVER% !important;
//     border-bottom : 1px solid %FG_HOVER% !important;
//     -moz-border-bottom-colors : %FG_HOVER% !important;
//     margin-bottom : 4px !important;
// }
]]></>.toString()));
 })();

//// 2011-05-03 (Tue)
//// http://d.hatena.ne.jp/shiba_yu36/20101022/1287749097
//// タブグループを操作する
// key.setGlobalKey([['C-z', 'C-p'], ['C-P']], function (ev, arg) {
//     ext.exec("tabgroup-previous", arg, ev);
// }, '左のグループへ移動', true);
// key.setGlobalKey([['C-z', 'C-n'], ['C-N']], function (ev, arg) {
//     ext.exec("tabgroup-next", arg, ev);
// }, '右のグループへ移動', true);
// key.setGlobalKey(['C-z', 'g'], function (ev, arg) {
//     ext.exec("tabgroup-goto", arg, ev);
// }, '指定した番号のグループに移動', true);
// key.setGlobalKey(['C-z', 'C-c'], function (ev, arg) {
//     ext.exec("tabgroup-create", arg, ev);
// }, 'グループを新規作成', true);
// key.setGlobalKey(['C-z', 'C-k'], function (ev, arg) {
//     ext.exec("tabgroup-close", arg, ev);
// }, '現在のグループを閉じる', true);
// key.setGlobalKey(['C-z', 'A'], function (ev, arg) {
//     ext.exec("tabgroup-group-nickname", arg, ev);
// }, '現在のグループに名前をつける', true);
// key.setGlobalKey(['C-z', 'a'], function (ev, arg) {
//     ext.exec("tabgroup-goto-last-selected", arg, ev);
// }, '直前のグループに移動', true);

//// 2011-04-28 (Thu)
//// https://github.com/azu/KeySnail-Plugins/tree/master/JSReference
//// JavaScriptリファレンスを引く
key.setGlobalKey(['<f1>', 'j'], function (ev, arg) {
    ext.exec("JsReferrence-open-prompt", arg, ev);
}, 'JsReferrenceのプロンプトを開く', true);
key.setGlobalKey(['<f1>', 'r'], function (ev, arg) {
    ext.exec("JsReferrence-reIndex", arg, ev);
}, 'JsReferrenceののインデックスを作り直す', true);

//// 2011-04-28 (Thu)
//// http://keysnail.g.hatena.ne.jp/basyura/20110427/1303908543
//// 訪問するとフォーカスしてしまうサーチボックスを消す
style.register(<><![CDATA[
      @-moz-document url-prefix("http://www.yahoo.co.jp/") {
        #searchbox { display : none; }
      }
    ]]></>.toString() , style.XHTML);

style.register(<><![CDATA[
      @-moz-document url-prefix("http://www.livedoor.com/") {
        #header { display : none; }
      }
    ]]></>.toString() , style.XHTML);

//// 2011-04-28 (Thu)
//// https://gist.github.com/945841
//// 直前に選択したタブに移動
if (typeof gBrowser !== 'undefined') {
    let previousSelectedTabIndex = gBrowser.tabContainer.selectedIndex;
    let currentSelectedTabIndex = previousSelectedTabIndex;
    gBrowser.tabContainer.addEventListener("TabSelect", function(){
        previousSelectedTabIndex = currentSelectedTabIndex;
        currentSelectedTabIndex = gBrowser.tabContainer.selectedIndex;
    }, false);
    key.setGlobalKey('C-^', function (ev, arg) {
       gBrowser.tabContainer.selectedIndex = previousSelectedTabIndex;
    }, "直前のタブに移動");
}

//// hisotry 設定
//// 2011-04-25 (Mon)

plugins.options["history.max-results"] = 5000;
key.setViewKey(['C-h'], function (ev, arg) {
    ext.exec("history-show", arg, ev);
    LinuxIMEoff();
}, "history - 履歴を表示");

//// bmany 設定
// C-RET で別タブで開く
plugins.options["bmany.keymap"] = {
    "M-RET" : "open-foreground-tab,c"
};
plugins.options["bmany.default_open_type"] = "tab"; // デフォルトで別タブで開く

// key bind
key.setViewKey([':', 'b'], function (ev, arg) {
    ext.exec("bmany-list-all-bookmarks", arg, ev);
    LinuxIMEoff();
}, 'ブックマーク');

key.setViewKey([':', 'B'], function (ev, arg) {
    ext.exec("bmany-list-bookmarklets", arg, ev);
    LinuxIMEoff();
}, "bmany - ブックマークレットを一覧表示");

key.setViewKey([':', 'k'], function (ev, arg) {
    ext.exec("bmany-list-bookmarks-with-keyword", arg, ev);
    LinuxIMEoff();
}, "bmany - キーワード付きブックマークを一覧表示");

key.setViewKey([':', 't'], function (ev, arg) {
    ext.exec("bmany-list-bookmarks-with-tag", arg, ev);
    LinuxIMEoff();
}, 'bmany - タグ付きブックマークを一覧表示');

//// prompt で自動的に IME を off
//// Windows Mac ではできるが，Linux はだめらしい
// http://keysnail.g.hatena.ne.jp/mooz/20110320/1300641715
style.register(<><![CDATA[
    #keysnail-prompt-textbox *|input {
        ime-mode : inactive !important;
    }
]]></>);

// linux でも IME を off できるようにする（要 xvkbd）
// http://keysnail.g.hatena.ne.jp/myuhe/20110614/1308056504
function LinuxIMEoff() {
    if(navigator.platform.indexOf("Linux") == 0) {
        var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath("/usr/bin/xvkbd");
        var process = Components.classes["@mozilla.org/process/util;1"]
            .createInstance(Components.interfaces.nsIProcess);
        process.init(file);
        var args = ["-text",  "\\[Control]\\[Shift]\\[space]"];
        process.run(false, args, args.length);
    }
    return;
};


//// toggle ime
// key.setEditKey("M-\\",
//         function (ev, arg) {
//                 let elem = ev.originalTarget;

//                 elem.style.imeMode = {
//                 active : "inactive",
//                 inactive : "active"
//                 }[elem.style.imeMode] || "active";

//                 elem.blur();
//                 elem.focus();
//         }, "Toggle IME", true);


//// hok 設定
plugins.options["hok.hint_color_link"]       = 'rgba(180, 255, 81, 0.9)';
plugins.options["hok.hint_color_form"]       = 'rgba(157, 82, 255, 0.9)';
plugins.options["hok.hint_color_candidates"] = 'rgba(240, 82, 93, 0.9)';
plugins.options["hok.hint_color_focused"]    = 'rgba(255, 4, 5, 0.9)';
// このオプションを２つに分けて設定すると，先に設定した方しか有効にならないようだ
plugins.options["hok.actions"] = [
    // Caret hint を使ってると "右クリックメニューを開く" が潰されてしまうので追加
    ['r',
     M({ja: "右クリックメニューを開く", en: "Open context menu"}),
     function (elem) {
          document.popupNode = elem;
          var menu = document.getElementById("contentAreaContextMenu");
          menu.showPopup(elem, -1, -1, "context", "bottomleft", "topleft");
      }
     ],
     // 定型文挿入
     // http://keysnail.g.hatena.ne.jp/myuhe/20110523
     //キーバインドはjにしてる。
    ['j',
     M({ja: "定型文を挿入", en: "insert fixed form"}),
     function (elem) {
         elem.focus();
         var fixedForms = [
             "your Email",
             "your address",
             "your phone number"
         ];
         prompt.selector(
             {
                 message    : "select form:",
                 collection : fixedForms,
                 flags      : [0],
                 callback   : function (i) { command.insertText(fixedForms[i]); }
             });
     }, false, false, ['textarea', 'input']]
];

// plugins.options["hok.actions"] = [
// ];


// key bind
key.defineKey([key.modes.VIEW, key.modes.CARET], [['e'], ['C-x', 'e']], function (aEvent, aArg) {
    ext.exec("hok-start-foreground-mode", aArg);
}, 'Hit a Hint を開始', true);

key.defineKey([key.modes.VIEW, key.modes.CARET], 'E', function (aEvent, aArg) {
    ext.exec("hok-start-background-mode", aArg);
}, 'リンクをバックグラウンドで開く Hit a Hint を開始', true);

key.defineKey([key.modes.VIEW, key.modes.CARET], ';', function (aEvent, aArg) {
    ext.exec("hok-start-extended-mode", aArg);
}, 'HoK - 拡張ヒントモード', true);

key.defineKey([key.modes.VIEW, key.modes.CARET], ['C-c', 'C-e'], function (aEvent, aArg) {
    ext.exec("hok-start-continuous-mode", aArg);
}, 'リンクを連続して開く Hit a Hint を開始', true);

//// Yet Another Twitter Client KeySnail 設定
plugins.options["twitter_client.update_interval"] = 60000;
plugins.options["twitter_client.popup_new_repliest"] = false;
plugins.options["twitter_client.automatically_begin"] = true;
plugins.options["twitter_client.popup_new_statuses"] = true;
plugins.options["twitter_client.prefer_screen_name"] = true; // ID で表示
plugins.options["twitter_client.lists"] = ["kbkbkbkb1/todai-orch", "kbkbkbkb1/eeic09",
                                        "kbkbkbkb1/hobby", "kbkbkbkb1/emacs"];
// keymap
plugins.options["twitter_client.keymap"] = {
    "C-z"   : "prompt-toggle-edit-mode",
    "SPC"   : "prompt-next-page",
    "b"     : "prompt-previous-page",
    "j"     : "prompt-next-completion",
    "k"     : "prompt-previous-completion",
    "g"     : "prompt-beginning-of-candidates",
    "G"     : "prompt-end-of-candidates",
    "q"     : "prompt-cancel",
    // twitter client specific actions
    "t"     : "tweet",
    "r"     : "reply",
    "R"     : "retweet",
    "d"     : "send-direct-message",
    "D"     : "delete-tweet",
    "f"     : "add-to-favorite",
    "v"     : "display-entire-message",
    "V"     : "view-in-twitter",
    "c"     : "copy-tweet",
    "*"     : "show-target-status",
    "@"     : "show-mentions",
    "/"     : "search-word",
    "o"     : "open-url",
    "+"     : "show-conversations",
    "h"     : "refresh-or-back-to-timeline",
    "s"     : "switch-to"
};
// 誤爆防止
plugins.options["twitter_client.tweet_keymap"] = {
    "C-RET" : "prompt-decide",
    "RET"   : ""
};
// アイコンサイズを固定
// http://keysnail.g.hatena.ne.jp/mooz/?word=*%5Btips%5D
style.register(<><![CDATA[ @-moz-document
url("chrome://global/content/alerts/alert.xul") { image#alertImage {
max-width : 96px !important; max-height : 96px !important; } }
]]></>);

// key bind
key.setGlobalKey(['C-c', 't'], function (ev, arg) {
    ext.exec("twitter-client-tweet", arg);
}, 'つぶやく', true);

key.setGlobalKey(['C-c', 'T'], function (ev, arg) {
    ext.exec("twitter-client-tweet-this-page", arg);
}, 'このページのタイトルと URL を使ってつぶやく', true);

key.setViewKey('t', function (ev, arg) {
    ext.exec("twitter-client-display-timeline", arg);
}, 'TL を表示', true);

key.setViewKey('T', function (ev, arg) {
    ext.exec("twitter-client-switch-to", arg);
}, 'リスト, Home, Mentions, Favorites などを選択', true);

//// K2Emacs 設定
if(navigator.userAgent.indexOf("Win") != -1 ){
    plugins.options["K2Emacs.editor"]    = "C:\\emacs23.3-imepatch\\bin\\emacsclientw.exe";
} else {
    plugins.options["K2Emacs.editor"]    = "emacsclient";
}
plugins.options["K2Emacs.ext"]    = "html";
plugins.options["K2Emacs.encode"] = "UTF-8"
plugins.options["K2Emacs.sep"] = "\\";
// key bind
key.setEditKey(["C-x", "#"], function (ev, arg) {
    ext.exec("edit_text", arg);
}, "外部エディタで編集", true);

//// 最近閉じたタブを復元する
util.setPrefs(
    {
        "browser.sessionstore.max_tabs_undo" : 100 // 履歴の件数
    }
);
ext.add("list-closed-tabs", function () {
    const fav = "chrome://mozapps/skin/places/defaultFavicon.png";
    var ss   = Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore);
    var json = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
    var closedTabs = [[tab.image || fav, tab.title] for each (tab in json.decode(ss.getClosedTabData(window)))];

    if (!closedTabs.length)
        return void display.echoStatusBar("最近閉じたタブが見つかりませんでした", 2000);

    prompt.selector(
        {
            message    : "select tab to undo:",
            collection : closedTabs,
            flags      : [ICON | IGNORE, 0],
            callback   : function (i) { if (i >= 0) window.undoCloseTab(i); }
        });
}, "List closed tabs");

//// キャレット関連
function remove_Caret() {
    prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(null);
    prefs.setBoolPref('accessibility.browsewithcaret', false);
}
function set_Caret() {
    prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(null);
    prefs.setBoolPref('accessibility.browsewithcaret', true);
}

ext.add("set_Caret", set_Caret,
        M({ja: "キャレットモードに入る",
            en: "caret_mode"}));
ext.add("remove_Caret", remove_Caret,
        M({ja: "キャレットモードをキャンセル",
            en: "caret_mode"}));

// key-bind
key.setViewKey(["@"], function (ev, arg) {
    ext.exec("set_Caret", arg);
}, "キャレットモードに入る", true);
key.setCaretKey(["@"], function (ev, arg) {
    ext.exec("remove_Caret", arg);
}, "キャレットモードをキャンセル", true);


//// tanything
// key-bind
plugins.options["tanything_opt.keymap"] = {
    "C-z"   : "prompt-toggle-edit-mode",
    "SPC"   : "prompt-next-page",
    "b"     : "prompt-previous-page",
    "j"     : "prompt-next-completion",
    "k"     : "prompt-previous-completion",
    "g"     : "prompt-beginning-of-candidates",
    "G"     : "prompt-end-of-candidates",
    "q"     : "prompt-cancel",
    // Tanything specific actions
    "O"     : "localOpen",
    "w"     : "localClose",
    "p"     : "localLeftclose",
    "n"     : "localRightclose",
    "a"     : "localAllclose",
    "d"     : "localDomainclose",
    "c"     : "localClipUT",
    "C"     : "localClipU",
    "<"     : "localMovetostart",
    ">"     : "localMovetoend",
    "B"     : "localAddBokmark",
    "p"     : "localTogglePin"
};
key.defineKey([key.modes.VIEW, key.modes.CARET], 'a', function (ev, arg) {
    ext.exec("tanything", arg);
}, 'タブを一覧表示', true);

// prompt.editModeEnabled でプロンプトで C-z を押して、編集モードになってる状態にできる
// Emacs のバッファ移動的な感じで使う
// http://keysnail.g.hatena.ne.jp/mooz/20110401/1301651641
key.setGlobalKey(['C-x', 'b'], function (ev, arg) {
    ext.exec("tanything", arg);
    prompt.editModeEnabled = true;
}, 'タブを一覧表示 (編集モード)', true);

//// Web ページを簡潔に表示
function readability (){
    x=content.document.createElement('SCRIPT');
    x.type='text/javascript';
    x.src='http://brettterpstra.com/share/readability.js?x='+(Math.random());
    content.document.getElementsByTagName('head')[0].appendChild(x);
    y=content.document.createElement('LINK');
    y.rel='stylesheet';
    y.href='http://brettterpstra.com/share/readability.css?x='+(Math.random());
    y.type='text/css';
    y.media='screen';
    content.document.getElementsByTagName('head')[0].appendChild(y);
    }
// key bind
ext.add("readability", readability,
        M({ja: "readabilityスタート",
            en: "start readability"}));

key.setGlobalKey(["C-c", "q"], function (ev, arg) {
    ext.exec("readability", arg);
}, "readability", true);


// ========================= Special key settings ========================== //

key.quitKey              = "C-g";
key.helpKey              = "<f1>";
key.escapeKey            = "C-q";
key.macroStartKey        = "<f3>";
key.macroEndKey          = "<f4>";
key.universalArgumentKey = "C-u";
key.negativeArgument1Key = "C--";
key.negativeArgument2Key = "C-M--";
key.negativeArgument3Key = "M--";
key.suspendKey           = "<f2>";

// ================================= Hooks ================================= //

hook.setHook('KeyBoardQuit', function (aEvent) {
    if (key.currentKeySequence.length) {
        return;
    }
    command.closeFindBar();
    if (util.isCaretEnabled()) {
        let marked = aEvent.originalTarget.ksMarked;
        let type = typeof marked;
        if (type === "number" || type === "boolean" && marked) {
            command.resetMark(aEvent);
        } else {
            let elem = document.commandDispatcher.focusedElement;
            if (elem) {
                elem.blur();
            }
            gBrowser.focus();
            _content.focus();
        }
    } else {
        goDoCommand("cmd_selectNone");
    }
    if (KeySnail.windowType == "navigator:browser") {
        key.generateKey(aEvent.originalTarget, KeyEvent.DOM_VK_ESCAPE, true);
    }
});




// ============================= Key bindings ============================== //

key.setViewKey('>', function (ev, arg) {
    let pattern = /(.*?)([0]*)([0-9]+)([^0-9]*)$/;
    let url = content.location.href;
    let digit = url.match(pattern);

    if (digit[1] && digit[3])
    {
        let len = digit[3].length;
        let next = +digit[3] + (arg ? arg : 1);
        content.location.href = digit[1] + (digit[2] ||"").slice(next.toString().length - len) + next + (digit[4] ||"");
    }
}, 'URLの中の数値をひとつ増加（インクリメント）');

key.setViewKey('<', function (ev, arg) {
    let pattern = /(.*?)([0]*)([0-9]+)([^0-9]*)$/;
    let url = content.location.href;
    let digit = url.match(pattern);

    if (digit[1] && digit[3])
    {
        let len = digit[3].length;
        let next = +digit[3] - (arg ? arg : 1);
        content.location.href = digit[1] + (digit[2] ||"").slice(next.toString().length - len) + next + (digit[4] ||"");
    }
}, 'URLの中の数値をひとつ減少（デクリメント）');

key.setGlobalKey(['C-c', 't'], function (ev, arg) {
    ext.exec("twitter-client-tweet", arg);
}, 'つぶやく', true);

key.setGlobalKey(['C-c', 'T'], function (ev, arg) {
    ext.exec("twitter-client-tweet-this-page", arg);
}, 'このページのタイトルと URL を使ってつぶやく', true);

key.setGlobalKey(['C-c', 'q'], function (ev, arg) {
    ext.exec("readability", arg);
}, 'readability', true);

key.setGlobalKey(['C-c', 'u'], function (ev) {
    undoCloseTab();
}, '閉じたタブを元に戻す');

key.setGlobalKey(['C-c', 'C-c', 'C-v'], function (ev) {
    toJavaScriptConsole();
}, 'Javascript コンソールを表示', true);

key.setGlobalKey(['C-c', 'C-c', 'C-c'], function (ev) {
    command.clearConsole();
}, 'Javascript コンソールの表示をクリア', true);

key.setGlobalKey('C-M-r', function (ev) {
    userscript.reload();
}, '設定ファイルを再読み込み', true);

key.setGlobalKey('M-x', function (ev, arg) {
    ext.select(arg, ev);
}, 'エクステ一覧表示', true);

key.setGlobalKey('M-:', function (ev) {
    command.interpreter();
}, 'JavaScript のコードを評価', true);

key.setGlobalKey(['<f1>', 'b'], function (ev) {
    key.listKeyBindings();
}, 'キーバインド一覧を表示');

key.setGlobalKey(['<f1>', 'F'], function (ev) {
    openHelpLink("firefox-help");
}, 'Firefox のヘルプを表示');

key.setGlobalKey('C-m', function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_RETURN, true);
}, 'リターンコードを生成');

key.setGlobalKey(['C-x', 'l'], function (ev) {
    command.focusToById("urlbar");
}, 'ロケーションバーへフォーカス', true);

key.setGlobalKey(['C-x', 'g'], function (ev) {
    command.focusToById("searchbar");
}, '検索バーへフォーカス', true);

key.setGlobalKey(['C-x', 't'], function (ev) {
    command.focusElement(command.elementsRetrieverTextarea, 0);
}, '最初のインプットエリアへフォーカス', true);

key.setGlobalKey(['C-x', 's'], function (ev) {
    command.focusElement(command.elementsRetrieverButton, 0);
}, '最初のボタンへフォーカス', true);

key.setGlobalKey(['C-x', 'k'], function (ev) {
    BrowserCloseTabOrWindow();
}, 'タブ / ウィンドウを閉じる');

key.setGlobalKey(['C-x', 'K'], function (ev) {
    closeWindow(true);
}, 'ウィンドウを閉じる');

key.setGlobalKey(['C-x', 'n'], function (ev) {
    OpenBrowserWindow();
}, 'ウィンドウを開く');

key.setGlobalKey(['C-x', 'C-c'], function (ev) {
    goQuitApplication();
}, 'Firefox を終了', true);

key.setGlobalKey(['C-x', 'o'], function (ev, arg) {
    command.focusOtherFrame(arg);
}, '次のフレームを選択');

key.setGlobalKey(['C-x', '1'], function (ev) {
    window.loadURI(ev.target.ownerDocument.location.href);
}, '現在のフレームだけを表示', true);

key.setGlobalKey(['C-x', 'C-f'], function (ev) {
    BrowserOpenFileWindow();
}, 'ファイルを開く', true);

key.setGlobalKey(['C-x', 'C-s'], function (ev) {
    saveDocument(window.content.document);
}, 'ファイルを保存', true);

key.setGlobalKey(['C-c', 'b'], function () {
    gBrowser.selectedTab.focus();
    content.focus();
}, 'BODYへフォーカス', true);

key.setGlobalKey(['C-c', 'p'], function (ev, arg) {
    var p = document.getElementById("keysnail-prompt");
    if (p.hidden) {
        return;
    }
    document.getElementById("keysnail-prompt-textbox").focus();
}, 'プロンプトへフォーカス');

key.setGlobalKey(['C-x', 'e'], function (ev, arg) {
    ext.exec("excite_translation", arg);
}, 'excite翻訳する');

key.setGlobalKey('M-w', function (ev) {
    command.copyRegion(ev);
}, '選択中のテキストをコピー', true);

key.setGlobalKey('C-s', function (ev) {
    command.iSearchForwardKs(ev);
}, 'Emacs ライクなインクリメンタル検索', true);

key.setGlobalKey('C-r', function (ev) {
    command.iSearchBackwardKs(ev);
}, 'Emacs ライクな逆方向インクリメンタル検索', true);

key.setGlobalKey('C-M-l', function (ev) {
    getBrowser().mTabContainer.advanceSelectedTab(1, true);
}, 'ひとつ右のタブへ');

key.setGlobalKey('C-M-h', function (ev) {
    getBrowser().mTabContainer.advanceSelectedTab(-1, true);
}, 'ひとつ左のタブへ');

key.setGlobalKey(['C-t', 'U'], function () {
    ext.exec("list-closed-tabs");
}, 'List closed tabs');

key.setGlobalKey(['C-t', 'u'], function () {
    undoCloseTab();
}, '閉じたタブを元に戻す');

// key.setGlobalKey('C-j', function (aEvent, arg) {
//     command.bookMarkToolBarJumpTo(aEvent, arg);
// }, 'ブックマークツールバーのアイテムを開く', true);

key.setViewKey('e', function (aEvent, aArg) {
    ext.exec("hok-start-foreground-mode", aArg);
}, 'Hit a Hint を開始', true);

key.setViewKey('E', function (aEvent, aArg) {
    ext.exec("hok-start-background-mode", aArg);
}, 'リンクをバックグラウンドで開く Hit a Hint を開始', true);

key.setViewKey(';', function (aEvent, aArg) {
    ext.exec("hok-start-extended-mode", aArg);
    LinuxIMEoff();
}, 'HoK - 拡張ヒントモード', true);

key.setViewKey(['C-c', 'C-e'], function (aEvent, aArg) {
    ext.exec("hok-start-continuous-mode", aArg);
}, 'リンクを連続して開く Hit a Hint を開始', true);

key.setViewKey('t', function (ev, arg) {
    ext.exec("twitter-client-display-timeline", arg);
    LinuxIMEoff();
}, 'TL を表示', true);

key.setViewKey('T', function (ev, arg) {
    ext.exec("twitter-client-switch-to", arg);
}, 'リスト, Home, Mentions, Favorites などを選択', true);

key.setViewKey('a', function (ev, arg) {
    ext.exec("tanything", arg);
}, 'タブを一覧表示', true);

key.setViewKey([['C-n'], ['j']], function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_DOWN, true);
}, '一行スクロールダウン');

key.setViewKey([['C-p'], ['k']], function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_UP, true);
}, '一行スクロールアップ');

key.setViewKey([['C-f'], ['.']], function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_RIGHT, true);
}, '右へスクロール');

key.setViewKey([['C-b'], [',']], function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_LEFT, true);
}, '左へスクロール');

key.setViewKey([['M-v'], ['b']], function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_PAGE_UP, true);
    // スムーススクロールのためにキーの生成の方にしよう
    //goDoCommand("cmd_scrollPageUp");
}, '一画面分スクロールアップ');

key.setViewKey([['C-v'], ['f']], function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_PAGE_DOWN, true);
    //goDoCommand("cmd_scrollPageDown");
}, '一画面スクロールダウン');

key.setViewKey([['M-<'], ['g', 'g']], function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_HOME, true);
    //goDoCommand("cmd_scrollTop");
}, 'ページ先頭へ移動', true);

key.setViewKey([['M->'], ['G']], function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_END, true);
    //goDoCommand("cmd_scrollBottom");
}, 'ページ末尾へ移動', true);

key.setViewKey(['l'], function (ev) {
    getBrowser().mTabContainer.advanceSelectedTab(1, true);
}, 'ひとつ右のタブへ');

key.setViewKey(['h'], function (ev) {
    getBrowser().mTabContainer.advanceSelectedTab(-1, true);
}, 'ひとつ左のタブへ');

key.setViewKey('M-!', function (ev, arg) {
    shell.input(null, arg);
}, 'コマンドの実行', true);

key.setViewKey('R', function (ev) {
    BrowserReload();
}, '更新', true);

key.setViewKey(['C-x', 'R'], function () {
    BrowserReloadSkipCache();
}, '更新(キャッシュを無視)');

key.setViewKey('B', function (ev) {
    BrowserBack();
}, '戻る');

key.setViewKey('F', function (ev) {
    BrowserForward();
}, '進む');

key.setViewKey(['C-x', 'h'], function (ev) {
    goDoCommand("cmd_selectAll");
}, 'すべて選択', true);

key.setViewKey('M-p', function (ev) {
    command.walkInputElement(command.elementsRetrieverButton, true, true);
}, '次のボタンへフォーカスを当てる');

key.setViewKey('M-n', function (ev) {
    command.walkInputElement(command.elementsRetrieverButton, false, true);
}, '前のボタンへフォーカスを当てる');

key.setViewKey(['c', 't'], function () {
    var w = window._content;
    var d = w.document;
    var txt = d.title;
    const CLIPBOARD = Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper);
    CLIPBOARD.copyString(txt);
}, 'タイトルコピー');

key.setViewKey(['c', 'u'], function () {
    var w = window._content;
    var d = w.document;
    var txt = d.location.href;
    const CLIPBOARD = Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper);
    CLIPBOARD.copyString(txt);
}, 'URLコピー');

key.setViewKey(['c', 'd'], function () {
    var w = window._content;
    var d = w.document;
    var txt = "[[" + d.location.href + "|" + d.title + "]]";
    const CLIPBOARD = Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper);
    CLIPBOARD.copyString(txt);
}, 'Dokuwiki のリンク形式でタイトルとURLコピー');

key.setViewKey(['c', 'p'], function () {
    var w = window._content;
    var d = w.document;
    var txt = "[[" + d.title + ":" + d.location.href + "]]";
    const CLIPBOARD = Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper);
    CLIPBOARD.copyString(txt);
}, 'PukiWiki のリンク形式でタイトルとURLコピー');

key.setViewKey(['c', 'o'], function () {
    var w = window._content;
    var d = w.document;
    var txt = "[[" + d.location.href + "][" + d.title + "]]";
    const CLIPBOARD = Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper);
    CLIPBOARD.copyString(txt);
}, 'Org-mode のリンク形式でタイトルとURLコピー');

key.setViewKey(['c', 'g'], function(ev){
    var loc = getBrowser().contentDocument.URL;
    var doc = frame = document.commandDispatcher.focusedWindow.document
            || gBrowser.contentWindow.document;
    if (loc.match(/github\.com/)) {
        var r = doc.evaluate("//span[@class='clippy-text']",doc,null,
                             XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        var url = r.singleNodeValue.textContent;
        command.setClipboardText(url);
        display.echoStatusBar("Git url is copied: " + url, 1000);
    }
}, 'github の Git URL をコピー');

key.setViewKey('i', function (ev) {
    command.focusElement(command.elementsRetrieverTextarea, 0);
}, '最初のインプットエリアへフォーカス', true);

key.setEditKey(['C-x', '#'], function (ev, arg) {
    ext.exec("edit_text", arg);
}, '外部エディタで編集', true);

key.setEditKey(['C-x', 'h'], function (ev) {
    command.selectAll(ev);
}, '全て選択', true);

key.setEditKey([['C-x', 'u'], ['C-_'], ['C-/']], function (ev) {
    display.echoStatusBar("Undo!", 2000);
    goDoCommand("cmd_undo");
}, 'アンドゥ');

key.setEditKey(['C-x', 'r', 'd'], function (ev, arg) {
    command.replaceRectangle(ev.originalTarget, "", false, !arg);
}, '矩形削除', true);

key.setEditKey(['C-x', 'r', 't'], function (ev) {
    prompt.read("String rectangle: ", function (aStr, aInput) {command.replaceRectangle(aInput, aStr);}, ev.originalTarget);
}, '矩形置換', true);

key.setEditKey(['C-x', 'r', 'o'], function (ev) {
    command.openRectangle(ev.originalTarget);
}, '矩形行空け', true);

key.setEditKey(['C-x', 'r', 'k'], function (ev, arg) {
    command.kill.buffer = command.killRectangle(ev.originalTarget, !arg);
}, '矩形キル', true);

key.setEditKey(['C-x', 'r', 'y'], function (ev) {
    command.yankRectangle(ev.originalTarget, command.kill.buffer);
}, '矩形ヤンク', true);

key.setEditKey([['C-SPC'], ['C-@']], function (ev) {
    command.setMark(ev);
}, 'マークをセット', true);

key.setEditKey('C-o', function (ev) {
    command.openLine(ev);
}, '行を開く (Open line)');

key.setEditKey('C-\\', function (ev) {
    display.echoStatusBar("Redo!", 2000);
    goDoCommand("cmd_redo");
}, 'リドゥ');

key.setEditKey('C-a', function (ev) {
    command.beginLine(ev);
}, '行頭へ移動');

key.setEditKey('C-e', function (ev) {
    command.endLine(ev);
}, '行末へ');

key.setEditKey('C-f', function (ev) {
    command.nextChar(ev);
}, '一文字右へ移動');

key.setEditKey('C-b', function (ev) {
    command.previousChar(ev);
}, '一文字左へ移動');

key.setEditKey('M-f', function (ev) {
    command.forwardWord(ev);
}, '一単語右へ移動');

key.setEditKey('M-b', function (ev) {
    command.backwardWord(ev);
}, '一単語左へ移動');

key.setEditKey('C-n', function (ev) {
    command.nextLine(ev);
}, '一行下へ');

key.setEditKey('C-p', function (ev) {
    command.previousLine(ev);
}, '一行上へ');

key.setEditKey('C-v', function (ev) {
    command.pageDown(ev);
}, '一画面分下へ');

key.setEditKey('M-v', function (ev) {
    command.pageUp(ev);
}, '一画面分上へ');

key.setEditKey('M-<', function (ev) {
    command.moveTop(ev);
}, 'テキストエリア先頭へ');

key.setEditKey('M->', function (ev) {
    command.moveBottom(ev);
}, 'テキストエリア末尾へ');

key.setEditKey('C-d', function (ev) {
    goDoCommand("cmd_deleteCharForward");
}, '次の一文字削除');

key.setEditKey('C-h', function (ev) {
    goDoCommand("cmd_deleteCharBackward");
}, '前の一文字を削除');

key.setEditKey('M-d', function (ev) {
    command.deleteForwardWord(ev);
}, '次の一単語を削除');

key.setEditKey([['C-<backspace>'], ['M-<delete>'], ['M-h']], function (ev) {
    command.deleteBackwardWord(ev);
}, '前の一単語を削除');

key.setEditKey('M-u', function (ev, arg) {
    command.wordCommand(ev, arg, command.upcaseForwardWord, command.upcaseBackwardWord);
}, '次の一単語を全て大文字に (Upper case)');

key.setEditKey('M-l', function (ev, arg) {
    command.wordCommand(ev, arg, command.downcaseForwardWord, command.downcaseBackwardWord);
}, '次の一単語を全て小文字に (Lower case)');

key.setEditKey('M-c', function (ev, arg) {
    command.wordCommand(ev, arg, command.capitalizeForwardWord, command.capitalizeBackwardWord);
}, '次の一単語をキャピタライズ');

key.setEditKey('C-k', function (ev) {
    command.killLine(ev);
}, 'カーソルから先を一行カット (Kill line)');

key.setEditKey('C-y', command.yank, '貼り付け (Yank)');

key.setEditKey('M-y', command.yankPop, '古いクリップボードの中身を順に貼り付け (Yank pop)', true);

key.setEditKey('C-M-y', function (ev) {
    if (!command.kill.ring.length) {
        return;
    }
    let (ct = command.getClipboardText()) (!command.kill.ring.length || ct != command.kill.ring[0]) &&
        command.pushKillRing(ct);
    prompt.selector({message: "Paste:", collection: command.kill.ring, callback: function (i) {if (i >= 0) {key.insertText(command.kill.ring[i]);}}});
}, '以前にコピーしたテキスト一覧から選択して貼り付け', true);

key.setEditKey('C-w', function (ev) {
    goDoCommand("cmd_copy");
    goDoCommand("cmd_delete");
    command.resetMark(ev);
}, '選択中のテキストを切り取り (Kill region)', true);

key.setEditKey('M-n', function (ev) {
    command.walkInputElement(command.elementsRetrieverTextarea, true, true);
}, '次のテキストエリアへフォーカス');

key.setEditKey('M-p', function (ev) {
    command.walkInputElement(command.elementsRetrieverTextarea, false, true);
}, '前のテキストエリアへフォーカス');

key.setCaretKey([['C-a'], ['^']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectBeginLine") : goDoCommand("cmd_beginLine");
}, 'キャレットを行頭へ移動');

key.setCaretKey([['C-e'], ['$'], ['M->'], ['G']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectEndLine") : goDoCommand("cmd_endLine");
}, 'キャレットを行末へ移動');

key.setCaretKey([['C-n'], ['j']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectLineNext") : goDoCommand("cmd_scrollLineDown");
}, 'キャレットを一行下へ');

key.setCaretKey([['C-p'], ['k']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectLinePrevious") : goDoCommand("cmd_scrollLineUp");
}, 'キャレットを一行上へ');

key.setCaretKey([['C-f'], ['l']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectCharNext") : goDoCommand("cmd_scrollRight");
}, 'キャレットを一文字右へ移動');

key.setCaretKey([['C-b'], ['h'], ['C-h']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectCharPrevious") : goDoCommand("cmd_scrollLeft");
}, 'キャレットを一文字左へ移動');

key.setCaretKey([['M-f'], ['w']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectWordNext") : goDoCommand("cmd_wordNext");
}, 'キャレットを一単語右へ移動');

key.setCaretKey([['M-b'], ['W']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectWordPrevious") : goDoCommand("cmd_wordPrevious");
}, 'キャレットを一単語左へ移動');

key.setCaretKey([['C-v'], ['SPC']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectPageNext") : goDoCommand("cmd_movePageDown");
}, 'キャレットを一画面分下へ');

key.setCaretKey([['M-v'], ['b']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectPagePrevious") : goDoCommand("cmd_movePageUp");
}, 'キャレットを一画面分上へ');

key.setCaretKey([['M-<'], ['g']], function (ev) {
    ev.target.ksMarked ? goDoCommand("cmd_selectTop") : goDoCommand("cmd_scrollTop");
}, 'キャレットをページ先頭へ移動');

key.setCaretKey('J', function (ev) {
    util.getSelectionController().scrollLine(true);
}, '画面を一行分下へスクロール');

key.setCaretKey('K', function (ev) {
    util.getSelectionController().scrollLine(false);
}, '画面を一行分上へスクロール');

key.setCaretKey(',', function (ev) {
    util.getSelectionController().scrollHorizontal(true);
    goDoCommand("cmd_scrollLeft");
}, '左へスクロール');

key.setCaretKey('.', function (ev) {
    goDoCommand("cmd_scrollRight");
    util.getSelectionController().scrollHorizontal(false);
}, '右へスクロール');

key.setCaretKey('z', function (ev) {
    command.recenter(ev);
}, 'キャレットの位置までスクロール');

key.setCaretKey([['C-SPC'], ['C-@']], function (ev) {
    command.setMark(ev);
}, 'マークをセット', true);

key.setCaretKey('M-!', function (ev, arg) {
    shell.input(null, arg);
}, 'コマンドの実行', true);

key.setCaretKey('R', function (ev) {
    BrowserReload();
}, '更新', true);

key.setCaretKey('B', function (ev) {
    BrowserBack();
}, '戻る');

key.setCaretKey('F', function (ev) {
    BrowserForward();
}, '進む');

key.setCaretKey(['C-x', 'h'], function (ev) {
    goDoCommand("cmd_selectAll");
}, 'すべて選択', true);

key.setCaretKey('i', function (ev) {
    command.focusElement(command.elementsRetrieverTextarea, 0);
}, '最初のインプットエリアへフォーカス', true);

key.setCaretKey('M-p', function (ev) {
    command.walkInputElement(command.elementsRetrieverButton, true, true);
}, '次のボタンへフォーカスを当てる');

key.setCaretKey('M-n', function (ev) {
    command.walkInputElement(command.elementsRetrieverButton, false, true);
}, '前のボタンへフォーカスを当てる');
