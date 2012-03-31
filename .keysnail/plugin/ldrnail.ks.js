// Info

let PLUGIN_INFO =
<KeySnailPlugin>
    <name>LDRnail</name>
    <description>LDRize clone with KeySnail</description>
    <description lang="ja">LDRize を KeySnail で</description>
    <iconURL>https://sites.google.com/site/958site/Home/files/ldrnail.png</iconURL>
    <updateURL>https://raw.github.com/gist/1369730/ldrnail.ks.js</updateURL>
    <author>958</author>
    <version>0.1.2</version>
    <license>MIT</license>
    <minVersion>1.8.0</minVersion>
    <include>main</include>
    <detail lang="ja"><![CDATA[
=== 概要 ===
KeySnail 上で動く LDRize クローンです
KeySnail プラグインの Prefer LDRize や LDRCnail とほぼ同等の機能も提供します

=== 使い方 ===
インストールするだけでそれなりに使えます

インストールすると、アドオンバーに jk というアイコンが追加されます
このアイコンは、現在表示中のページで、LDRnail が有効になっているかどうかを表します

このアイコンが有効表示されているのに、LDRnail のキーバインドが無効になる場合があります
これは、下記のような domain 指定されていない Siteinfo のみ読み込んでいる状態です
- http://wedata.net/items/28636
- http://wedata.net/items/28635
- http://wedata.net/items/28634
s キーを押して Siteinfo を選択してみてください

=== キーバインドの指定 ===
キーバインドを変えるには、以下のように plugins.options["ldrnail.keybind"] を設定します
>|javascript|
plugins.options["ldrnail.keybind"] = {
    'j': 'next',
    'k': 'prev',
    'p': 'pin',
    'l': 'list',
    'f': 'focus',
    'v': 'view',
    'o': 'open',
    's': 'siteinfo',
};
||<
'next', 'prev' などには機能を示す文字列を表します
以下の何れかを指定可能です
next:
 次へ移動
perv:
 前へ移動
pin:
 カレントのピンをトグル
list:
 ピンリストを表示
focus:
 テキストボックスへフォーカス
view:
 カレントを現在のタブで表示
open:
 ピンもしくはカレントを背面のタブで表示
siteinfo:
 Siteinfo を切り替える

* LDRize の iframe 相当の機能は非対応です

=== より高度なキーバインドの指定 ===
キーバインドに function を指定することも可能です
以下の例では、i キーで、ピンかカレントリンクを Read It Later 拡張に追加します
>|javascript|
plugins.options["ldrnail.keybind"] = {
    "j" : 'next', "k" : 'prev', "p" : 'pin', "v" : 'view', "o" : 'open', 'l': 'list', 's': 'siteinfo',
    "i" : function() {
        let view = plugins.ldrnail.currentSiteinfo['view'];
        let link = plugins.ldrnail.currentSiteinfo['link'];

        let titles = [];
        plugins.ldrnail.pinnedItemsOrCurrentItem.forEach(function(item){
            let url = plugins.ldrnail.getItemLink(item).href;
            let title = plugins.ldrnail.getItemView(item) || url;
            if (url) {
                RIL.saveLink(url, title, RIL.xul('clickToSaveTags').value);
                titles.push(title);
            }
        });
        plugins.ldrnail.clearPin();
        if (titles.length > 0)
            display.prettyPrint('Add RIL \n' + titles.join('\n'), { timeout: 1000 });
    },
};
||<

=== 他プラグインとの連携 ===
以下のように、KeySnail の他プラグインと組み合わせて使うと便利です
>|javascript|
// サイトローカル・キーマップ のキー定義
plugins.options["site_local_keymap.local_keymap"] = {
    // Tumblr の dashboard で t を押すとリブログ
    // (tumblr Dashboard jk disable も必要)
    //   http://coderepos.org/share/browser/lang/javascript/userscripts/tumblr_dashboard_jk_disable.user.js?
    "^http://www.tumblr.com/dashboard": [
        ["t", function() {
            if (plugins.kungfloo) {
                plugins.ldrnail.pinnedLinksOrCurrentLink.forEach(function(link) {
                    plugins.kungfloo.reblog(link, true, false, ["ReBlog - Tumblr link"]);
                });
                plugins.ldrnail.clearPin();
            }
        }],
    ],
};
||<

=== ピンリストをカスタマイズする ===
デフォルトで 'l' キーで表示されるピンリストを自由にカスタマイズすることができます
以下の例では、次のアクションを追加しています
'o':
 ピンリストで選択中のアイテムをバックグラウンドタブで開く
's':
 ピンリストで選択中のアイテム位置までスクロールする
>|javascript|
plugins.options["ldrnail.pinned_list_actions"] = [
    [function(aIndex) {
         if (aIndex < 0)
             return;
         let link = plugins.ldrnail.getItemLink(plugins.ldrnail.pinnedItems[aIndex]);
         if (link)
             openUILinkIn(link, 'tabshifted');
     },
     "Open link in background tab", "open,c",
    ],
    [function(aIndex) {
         if (aIndex < 0)
             return;
         let elem = plugins.ldrnail.pinnedItems[aIndex];
         if (elem)
             elem.scrollIntoView(true);
     },
     "Scroll to this item", "scroll,c",
    ],
];
plugins.options["ldrnail.pinned_list_keymap"] = {
    "o": "open",
    "s": "scroll",
};
||<

アクションの詳しい設定方法は http://d.hatena.ne.jp/mooz/20091004/p1 の 'アクション / コールバック' 項を参照してください
キーマップの指定方法は KeySnailer にはおなじみだと思いますので、ここでは割愛します

=== 2ストロークキーで使いたい ===
KeySnail のキーシーケンスを利用することで設定が可能です
まず、以下のように設定し、LDRnail のキーバインドを無効にします
>|javascript|
plugins.options["ldrnail.keybind"] = null;
||<
後は、いつもの様にエクステを KeySnail のキーシーケンスに割り当てます
>|javascript|
key.setViewKey(['C-l', 'j'], function(ev, arg) {
    ext.exec('ldrnail-next', arg, ev);
}, 'LDRnail - next', true);
||<

=== 特定のサイトで無効にする ===
plugins.options["ldrnail.exclude_urls"] を設定すると、指定した URL 上で LDRnail のキーバインドが自動的に無効になります
以下のように定義すると google で LDRnail のキーバインドが動かなくなります
なお、URL には正規表現を指定する必要があります
>|javascript|
plugins.options["ldrnail.exclude_urls"] = [
    "^http://www.google.co.jp/.*",
];
||<
ただし、ここで指定した URL 上でも、エクステ 'ldrnail-toggle-status' を実行することで、LDRnail を有効にすることができます

なお、plugins.options["ldrnail.include_urls"]を指定した場合、exclude_urls の指定は無視されます

=== 特定のサイトでのみ有効にする ===
plugins.options["ldrnail.include_urls"] を設定すると、指定した URL 上でのみ LDRnail のキーバインドが有効になります
以下のように定義すると google でのみ LDRnail のキーバインドが動作します
なお、URL には正規表現を指定する必要があります
>|javascript|
plugins.options["ldrnail.include_urls"] = [
    "^http://www\\.google\\.co\\.jp/.*",
];
||<
ただし、ここで指定した URL 以外でも、エクステ 'ldrnail-toggle-status' を実行することで、LDRnail を有効にすることができます

なお、null または [] を指定した場合、すべてのサイトで有効になります ('.*' を指定した場合と同様の動作となります)

=== インテリジェンススクロール ===
エクステ 'ldrnail-toggle-intelligence-scroll' を実行すると、インテリジェンススクロールが有効になります
この状態では、カレントパラグラフが画面内に収まっていない場合に、次のパラグラフまで移動せずに、適当な位置へスクロールするようになります
スクロール量や、スクロール判定の閾値を変更したい場合は、plugins.options["ldrnail.skip_height"] を1以下の値 (0.8とか) に変更してください
また、再び同エクステを実行すると、インテリジェンススクロールが無効になります
なお、インテリジェンススクロールの状態は、タブごとに管理されます

新規タブを開いた際に、デフォルトでインテリジェンススクロールを有効にしたい場合は、plugins.options["ldrnail.use_intelligence_scroll"] を true に設定してください

=== リンクを開く際に URL を加工する ===
plugins.options["ldrnail.pre_open_filter"] を設定すると、LDRnail でリンクを開く際に URL を加工することができます
たとえば、以下のように設定すると PDF のリンクを Google docs viewer で開きます
>|javascript|
plugins.options["ldrnail.pre_open_filter"] = function(aURL) {
    (!/^https?:\/\/docs\.google\.com/.test(aURL) && /^[^?#]+\.pdf($|[#?])/i.test(aURL)) ?
        'https://docs.google.com/viewer?url='+encodeURIComponent(aURL)+'&embedded=true&chrome=true' : aURL;
}
||<

=== 謝辞 ===
以下のスクリプトを流用にしました

- Minibuffer
 - http://userscripts.org/scripts/show/11759
- LDRize
 - http://userscripts.org/scripts/show/11562
- ChromeKeyconfig
 - http://ss-o.net/chrome_extension/#ChromeKeyconfig
- Vimperator plugin ldrize_cooperation.js
 - https://github.com/vimpr/vimperator-plugins/blob/master/ldrize_cooperation.js
]]></detail>
</KeySnailPlugin>;

// Option

let pOptions = plugins.setupOptions("ldrnail", {
    "siteinfo": {
        preset: [],
        description: M({
            ja: "独自定義した siteinfo",
            en: "Local siteinfo"
        })
    },
    "keybind": {
        preset: {
            'j': 'next',
            'k': 'prev',
            'p': 'pin',
            'l': 'list',
            'f': 'focus',
            'v': 'view',
            'o': 'open',
            's': 'siteinfo',
        },
        description: M({
            ja: "キー定義",
            en: "KeyBind"
        })
    },
    "siteinfo_urls": {
        preset: [
            'http://wedata.net/databases/LDRize/items.json'
        ],
        description: M({
            ja: "siteinfo の URL",
            en: "siteinfo URLs"
        })
    },
    "default_height": {
        preset: 10,
        description: M({
            ja: "スクロール時の高さ",
            en: "default height"
        })
    },
    "css_highlight_current_before": {
        preset: 
            'content: url("data:image/png;base64,'+
'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAQCAYAAAAvf+5AAAAA2klEQVQoz2P4jx0woGMQ8f/KuqP/'+
'62QiwDQuxWCFIEW70meBabwKYSae7dzyf6FFJVbFDDCR+6tP/1/t1YpTMUwHGIAUzTUoBmtCV4zs'+
'DjBolYv9f2Xa7v+boib871NIweFgBohTQIpBpi+2qf5fKxOONbzAoB9o0vG61WBnVEmHYigEg0mK'+
'6f93Z87+P1Mz73+xVCBWq8G+PlK14v90laz/hZIB/9A9AwYgBaCwnKKY8T9f0hdr8IAVgRwNMjFL'+
'wgt3gIMUgRSDFD3aeB53FMIUgWi8cU1MMgMA0KH1UcXw2wUAAAAASUVORK5CYII='+
/*
'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAQCAYAAAAvf+5AAAAA2UlEQVQoz2P4jx0woGMQ8X//3E3/'+
'i6QCwDQuxWCFIEUrYrvBNF6FMBN31iz6P9E4F6tiBpjIyVnb/89yrsCpGKYDDECK+nQywJrQFSO7'+
'AwwqpEP+729f+X9hYNP/BtkoHA5mgDgFpBhk+mSz/P+FUv5YwwsMGoEmbS6aBXZGnqQvhkIwaJGL'+
'/b8yvud/l2ry/wwJT6xWg329MW/G/w7FhP9p4h7/0D0DBiAFoLBsk4v7nyLuhjV4wIpAjgaZmCDm'+
'jDvAQYpAikGKzizYjTsKYYpANN64JiaZAQD6tu3ldRKWuQAAAABJRU5ErkJggg=='+
*/
            '");' +
            'position:absolute;'+
            'margin-left: -16px;'+
            'margin-top: 2px;',
        description: M({
            ja: "カレントのスタイル (before 疑似要素)",
            en: "Current style (before pseudo-element)"
        })
    },
    "css_highlight_current": {
        preset: '',
        description: M({
            ja: "カレントのスタイル",
            en: "Current style"
        })
    },
    "css_highlight_current_intelligence_before": {
        preset: '',
        description: M({
            ja: "インテリジェンススクロール有効時のカレントのスタイル (before 疑似要素)",
            en: "Current style of intelligence scroll (before pseudo-element)"
        })
    },
    "css_highlight_current_intelligence": {
        preset: '',
        description: M({
            ja: "インテリジェンススクロール有効時のカレントのスタイル",
            en: "Current style of intelligence scroll"
        })
    },
    "css_highlight_pinned": {
        preset:
            'outline: 2px solid #CC6060 !important;' +
            'outline-offset: 1px !important;' +
            '-moz-outline-radius: 3px !important;',
        description: M({
            ja: "ピンのスタイル",
            en: "Pinned style"
        })
    },
    "include_urls": {
        preset: [],
        description: M({
            ja: "ページを開いたときに自動的に有効にする URLリスト (正規表現)",
            en: "URL regexp list of sites you want to enabled the LDRnail."
        })
    },
    "exclude_urls": {
        preset: [],
        description: M({
            ja: "ページを開いたときに自動的に無効にする URLリスト (正規表現)",
            en: "URL regexp list of sites you want to suspend the LDRnail."
        })
    },
    "pinned_count_style": {
        preset: 'color:#383838;font-weight:bold;',
        description: M({
            ja: "ピン数のスタイル",
            en: "Pinned count style."
        })
    },
    "pinned_list_actions": {
        preset: null,
        description: M({
            ja: "ピンリストのアクション",
            en: "Pinned list actions."
        })
    },
    "pinned_list_keymap": {
        preset: null,
        description: M({
            ja: "ピンリストのキーマップ",
            en: "Pinned list keymap."
        })
    },
    "pre_open_filter": {
        preset: null,
        description: M({
            ja: "リンクを開く際のフィルタ関数",
            en: "The filter function when opening a link"
        })
    },
    "use_intelligence_scroll": {
        preset: false,
        description: M({
            ja: "デフォルトで Intelligence scroll を行う",
            en: "Use Intelligence scroll at Default",
        })
    },
    "skip_height": {
        preset: 1,
        description: M({
            ja: "Intelligence scroll を行う閾値 (0 ～ 1)",
            en: "Threshold do intelligence scroll (0-1)",
        })
    },
}, PLUGIN_INFO);

const PINNED_CLASS = '__ldrnail_pinned';
const CURRENT_CLASS = '__ldrnail_current';
const INTELLIGENCE_CLASS = '__ldrnail_intelligence';
const DEFAULT_HEIGHT = pOptions['default_height'];
const SKIP_HEIGHT = pOptions["skip_height"];
const USE_INTELLIGENCE_SCROLL = pOptions['use_intelligence_scroll'];

// Utils (by Minibuffer.user.js)

// $X on XHTML
// @target Freifox3, Chrome3, Safari4, Opera10
// @source http://gist.github.com/184276.txt
function $X (exp, context) {
    context || (context = content.document);
    var _document = context.ownerDocument || context,
        documentElement = _document.documentElement,
        isXHTML = documentElement.tagName !== 'HTML' && _document.createElement('p').tagName === 'p',
        defaultPrefix = null;
    if (isXHTML) {
        defaultPrefix = '__default__';
        exp = addDefaultPrefix(exp, defaultPrefix);
    }
    function resolver (prefix) {
        return context.lookupNamespaceURI(prefix === defaultPrefix ? null : prefix) ||
            documentElement.namespaceURI || "";
    }

    var result = _document.evaluate(exp, context, resolver, XPathResult.ANY_TYPE, null);
    switch (result.resultType) {
        case XPathResult.STRING_TYPE : return result.stringValue;
        case XPathResult.NUMBER_TYPE : return result.numberValue;
        case XPathResult.BOOLEAN_TYPE: return result.booleanValue;
        case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
            // not ensure the order.
            var ret = [], i = null;
            while (i = result.iterateNext()) ret.push(i);
            return ret;
    }
}
// XPath 式中の接頭辞のない名前テストに接頭辞 prefix を追加する
// e.g. '//body[@class = "foo"]/p' -> '//prefix:body[@class = "foo"]/prefix:p'
// http://nanto.asablo.jp/blog/2008/12/11/4003371
function addDefaultPrefix(xpath, prefix) {
    var tokenPattern = /([A-Za-z_\u00c0-\ufffd][\w\-.\u00b7-\ufffd]*|\*)\s*(::?|\()?|(".*?"|'.*?'|\d+(?:\.\d*)?|\.(?:\.|\d+)?|[\)\]])|(\/\/?|!=|[<>]=?|[\(\[|,=+-])|([@$])/g;
    var TERM = 1, OPERATOR = 2, MODIFIER = 3;
    var tokenType = OPERATOR;
    prefix += ':';
    function replacer(token, identifier, suffix, term, operator, modifier) {
        if (suffix) {
            tokenType =
                (suffix == ':' || (suffix == '::' && (identifier == 'attribute' || identifier == 'namespace')))
                ? MODIFIER : OPERATOR;
        } else if (identifier) {
            if (tokenType == OPERATOR && identifier != '*')
                token = prefix + token;
            tokenType = (tokenType == TERM) ? OPERATOR : TERM;
        } else {
            tokenType = term ? TERM : operator ? OPERATOR : MODIFIER;
        }
        return token;
    }
    return xpath.replace(tokenPattern, replacer);
}

// Utils (by ldrize.user.js)

function getNodeClientRect(node) {
    if (!node) return;
    let span;
    let rect;
    if (node.nodeType == 3) {
        textnode = node;
        span = node.ownerDocument.createElement('span');
        node.parentNode.insertBefore(span, node);
        node = span;
    }
    rect = node.getBoundingClientRect();
    if (span)
        span.parentNode.removeChild(span);
    return rect;
}

// Utils

function attachClassToNode(node, _class){
    if (node && node.nodeType == 1)
        node.classList.add(_class);
}
function removeClassToNode(node, _class) {
    if (node && node.nodeType == 1)
        node.classList.remove(_class);
}

function toURI(aURL)
    Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(aURL, null, null)

// Main

function LDRnail(tab) {
    const win = tab.linkedBrowser.contentWindow;
    const doc = content.document;

    let paragraphs = [];
    let pinnedIndexes = [];
    let isAvailable = false;

    let currentURL = win.location.href;
    let siteinfos = getAvailableInfos(currentURL);
    if (siteinfos.length > 0)
        isAvailable = true;

    if (!isAvailable)
        return;

    let currentSiteinfo = (siteinfos[0].domain) ? siteinfos[0] : {};

    let currentIndex = -1;
    initParagraphs();

    let useIntelligence = USE_INTELLIGENCE_SCROLL;
    if (useIntelligence)
        attachClassToNode(doc.body, INTELLIGENCE_CLASS);

    // bottom spacer
    let spacer = doc.createElement('div');
    spacer.setAttribute('style', 'position: absolute; visibility: hidden; height: 1px; width: 1px; over-flow: hidden;');
    spacer.id = 'gm_ldrize';
    spacer.appendChild(doc.createTextNode('dummy'));
    doc.body.appendChild(spacer);

    win.addEventListener('unload', function() {
        spacer = null;
        paragraphs = null;
        win.removeEventListener('unload', arguments.callee, false);
    }, false);

    function getAvailableInfos(url) {
        let disable = false;
        let result = share.ldrnail.siteinfo.filter(function(info){
            if (disable)
                return false;
            let match = false
            try {
                match = url.match(info.domain);
            } catch(e) { }
            try {
                match = ($X(info.domain, doc).length > 0);
            } catch(e) { }
            try {
                if (!info.domain || info.domain == 'microformats' || match) {
                    if (info.disable) {
                        disable = true;
                        return false;
                    } else if ($X(info.paragraph, doc).length > 0) {
                        return true;
                    }
                }
            } catch(e) {
                return false;
            }
        }).sort(function(a, b) {
            let cmp = (!a.domain ? 1 : (!b.domain ? -1 : 0));
            if (cmp == 0) {
                try {
                    cmp = (url.match(a.domain) ? -1 : (url.match(b.domain) ? 1 : 0));
                } catch(e){ }
            }
            if (cmp == 0) {
                cmp = (a.domain == 'microformats' ? -1 : (b.domain == 'microformats' ? 1 : 0));
            }
            return cmp;
        });
        if (disable)
            result = [];
        return result;
    }

    let prevPageHeight;

    function initParagraphs() {
        let xpath = currentSiteinfo['paragraph'];
        if (!xpath) return;
        matches = $X(xpath, doc);
        if(!matches || !matches.length) return;
        matches.forEach(function(node){
            let index = paragraphs.indexOf(node);
            if (index == -1)
                paragraphs.push(node);
        });
        prevPageHeight = getPageHeight();
    }

    function getPageHeight() {
        return Math.max(doc.documentElement.scrollHeight,
                                  doc.body.scrollHeight);
    }

    function getNextIndex(next) {
        // ページの高さが変わっている場合は、ここで paragraph を更新する
        if (prevPageHeight < getPageHeight()) {
            spacer.style.top = getPageHeight() + 'px';
            initParagraphs();
        }

        if (currentIndex > -1) {
            //スクロール位置がカレントパラグラフに一致している場合
            let rect = getNodeClientRect(paragraphs[currentIndex]);
            if (rect.top >= DEFAULT_HEIGHT - 1 && rect.top < DEFAULT_HEIGHT + 1) {
                let index = currentIndex + (next ? 1 : -1);
                let rect = getNodeClientRect(paragraphs[index]);
                if (!rect || (rect.height > 0 && rect.width > 0))
                    return index;
            }
        }

        let result = -1;
        if (next) {
            paragraphs.some(function(paragraph,i){
                let rect = getNodeClientRect(paragraph);
                if ((DEFAULT_HEIGHT + 1) < rect.top && rect.height > 0 && rect.width > 0) {
                    result = i;
                    return true;
                }
            });
        } else {
            let prev = -1;
            paragraphs.some(function(paragraph,i){
                let rect = getNodeClientRect(paragraph);
                if ((DEFAULT_HEIGHT - 1) < rect.top) {
                    result = prev;
                    return true;
                }
                if (rect.height > 0 && rect.width > 0)
                    prev = i;
            });
            if (result == -1)
                result = prev;
        }
        return result;
    }

    function addPin(newIndex) {
        attachClassToNode(paragraphs[newIndex], PINNED_CLASS);
        pinnedIndexes.push(newIndex);
        pinnedIndexes.sort(function(a, b) a - b);
    }

    function removePin(index) {
        removeClassToNode(paragraphs[pinnedIndexes[index]], PINNED_CLASS);
        pinnedIndexes.splice(index, 1);
    }

    function togglePin() {
        if (currentIndex != -1) {
            let index = pinnedIndexes.indexOf(currentIndex);
            (index == -1) ? addPin(currentIndex) : removePin(index);
        }
        next();
    }

    function clearPin() {
        while (pinnedIndexes.length > 0)
            removePin(0);
    }

    function isScroll(rect)
        (Math.abs(rect.top) > win.innerHeight * SKIP_HEIGHT - DEFAULT_HEIGHT) ? true : false;

    function next() {
        let cur = getNextIndex(true);
        if (currentIndex > -1)
            removeClassToNode(paragraphs[currentIndex], CURRENT_CLASS);
        if (cur != -1 && cur < paragraphs.length) {
            let rect = getNodeClientRect(paragraphs[cur]);
            if (useIntelligence && isScroll(rect)) {
                win.scrollBy(0, win.innerHeight * SKIP_HEIGHT - DEFAULT_HEIGHT * 2 - 1);
            } else {
                spacer.style.top = (rect.top + win.scrollY + win.innerHeight) + 'px';
                win.scrollBy(0, rect.top - DEFAULT_HEIGHT);
                attachClassToNode(paragraphs[cur], CURRENT_CLASS);
                currentIndex = cur;
            }
        } else if (paragraphs.length > 0) {
            if (useIntelligence)
                win.scrollBy(0, win.innerHeight * SKIP_HEIGHT - DEFAULT_HEIGHT * 2 - 1);
            else
                win.scrollTo(0, getPageHeight());
            currentIndex = -1;
        }
        prevPageHeight = getPageHeight();
    }

    function prev() {
        let cur = getNextIndex(false);
        if (currentIndex > -1) 
            removeClassToNode(paragraphs[currentIndex], CURRENT_CLASS);
        if (cur >= 0) {
            let rect = getNodeClientRect(paragraphs[cur]);
            if (useIntelligence && isScroll(rect)) {
                win.scrollBy(0, -(win.innerHeight * SKIP_HEIGHT - DEFAULT_HEIGHT * 2 - 1));
            } else {
                win.scrollBy(0, rect.top - DEFAULT_HEIGHT);
                attachClassToNode(paragraphs[cur], CURRENT_CLASS);
                spacer.style.top = (DEFAULT_HEIGHT + win.scrollY + win.innerHeight) + 'px';
                currentIndex = cur;
            }
        } else if (paragraphs.length > 0) {
            spacer.style.top = '0px';
            if (useIntelligence)
                win.scrollBy(0, -(win.innerHeight * SKIP_HEIGHT - DEFAULT_HEIGHT * 2 - 1));
            else
                win.scrollTo(0, 0);
            currentIndex = -1;
        }
        prevPageHeight = getPageHeight();
    }

    function focus() {
        currentIndex = -1;
        let xpath = currentSiteinfo['focus'] || '//input[@type="text" or not(@type)]';
        let matches = $X(xpath, doc);
        if(!matches.length) return;
        matches[0].focus();
        win.scrollBy(0, getNodeClientRect(matches[0]).top - DEFAULT_HEIGHT);
    }

    function setCurrentSiteinfo(info) {
        if (currentIndex != -1)
            removeClassToNode(paragraphs[currentIndex], CURRENT_CLASS);
        currentIndex = -1;
        paragraphs = [];
        currentSiteinfo = info;
        initParagraphs();
    }

    function open(elem, where) {
        let url = elem.href;
        if (typeof pOptions['pre_open_filter'] == 'function')
            url = pOptions['pre_open_filter'](url) || url;
        if (url.indexOf('javascript:') != 0)
            openUILinkIn(url, where, false, null, toURI(win.location.href));
    }

    let self = {
        isAvailable: isAvailable,

        next: next,
        prev: prev,

        togglePin: togglePin,
        clearPin: clearPin,

        get paragraphs() {
            return paragraphs;
        },
        get currentItem() {
            return currentIndex != -1 ? paragraphs[currentIndex] : null;
        },
        get currentLink() {
            return self.getItemLink(self.currentItem);
        },
        get pinnedItems() {
            return pinnedIndexes.length > 0 ? pinnedIndexes.map(function(i) paragraphs[i]) : [];
        },
        get pinnedLinks() {
            return self.pinnedItems.map(self.getItemLink);
        },
        get pinnedItemsOrCurrentItem() {
            return (pinnedIndexes.length > 0 ? pinnedIndexes.map(function(i) paragraphs[i]) :
                (currentIndex != -1 ? [paragraphs[currentIndex]] : []));
        },
        get pinnedLinksOrCurrentLink() {
            return self.pinnedItemsOrCurrentItem.map(self.getItemLink);
        },

        getItemView: function(item) {
            let xpath = currentSiteinfo['view'];
            return (item ? (xpath ? $X(xpath, item)[0].textContent : (function() {
                    let baseTop = getNodeClientRect(item).top;
                    let strs = [];
                    $X('descendant::text()[normalize-space(self::text()) != ""]', item).some(function(node){
                        if (Math.abs(getNodeClientRect(node).top - baseTop) >= 20)
                            return true;
                        strs.push(node.nodeValue);
                    });
                    return strs.join('');
                })()) : null);
        },
        getItemLink: function(item) {
            let xpath = currentSiteinfo['link'];
            return (xpath && item) ? $X(xpath, item)[0] : null;
        },

        open: function(tab) {
            self.pinnedLinksOrCurrentLink.forEach(function(link) {
                if (link && link.href)
                    open(link, 'tabshifted');
            });
            if (pinnedIndexes.length == 0)
                next();
            clearPin();
        },
        view: function() {
            let link = self.currentLink;
            if (link && link.href)
                open(link, "current");
            clearPin();
        },

        focus: focus,

        get siteinfos() siteinfos,
        get currentSiteinfo() currentSiteinfo,
        setSiteinfoByIndex: function(index) {
            if (index >= 0 && index < siteinfos.length)
                setCurrentSiteinfo(siteinfos[index]);
        },
        setSiteinfoByName: function(name) {
            let result = null;
            if (siteinfos.some(function(info) {
                    if (info.name == name) {
                        result = info;
                        return true;
                    }
                }))
            {
                setCurrentSiteinfo(result);
            }
        },

        get useIntelligenceScroll() {
            return useIntelligence;
        },
        set useIntelligenceScroll(value) {
            useIntelligence = value;
            if (useIntelligence)
                attachClassToNode(doc.body, INTELLIGENCE_CLASS);
            else
                removeClassToNode(doc.body, INTELLIGENCE_CLASS);
        },
    };

    return self;
}

// Siteinfo operation

function siteinfoOperate(urls, update) {
    if (!update && share.ldrnail.siteinfo) return;

    share.ldrnail.siteinfo = pOptions['siteinfo'];

    const expire = 24 * 60 * 60 * 1000; // 24h
    let cached_siteinfo = getCache();
    let responsedCount = 0;

    urls.forEach(function (url) {
        if (update || !cached_siteinfo || !cached_siteinfo[url] || new Date(cached_siteinfo[url].expire) < new Date())
            util.requestGet(url, {
                callback: function(res) {
                    getCacheCallback(res, url);
                }
            });
        else
            share.ldrnail.siteinfo = share.ldrnail.siteinfo.concat(cached_siteinfo[url].info);
    });

    function getCache() persist.restore('ldrnail_cacheInfo') || {};
    function setCache(info) persist.preserve(info, 'ldrnail_cacheInfo');

    function getCacheErrorCallback(url) {
        if (cached_siteinfo[url]) {
            cached_siteinfo[url]['expire'] = new Date(new Date().getTime() + expire);
            setCache(cached_siteinfo);
            share.ldrnail.siteinfo = share.ldrnail.siteinfo.concat(cached_siteinfo[url].info);
        }
    }
    function getCacheCallback(res, url) {
        if (++responsedCount >= urls.length)
            display.echoStatusBar('LDRnai - Updated siteinfo');
        if (res.status != 200)
            return getCacheErrorCallback(url);
        let info = JSON.parse(res.responseText) || [];
        if (info && info.length) {
            cached_siteinfo[url] = {
                url: url,
                expire: new Date(new Date().getTime() + expire),
                info: info.map(function(i) i.data)
            };
            setCache(cached_siteinfo);
            share.ldrnail.siteinfo = share.ldrnail.siteinfo.concat(cached_siteinfo[url].info);
        }
    }
}

// create share.ldrnail

share.ldrnail = {};

// create plugins.ldrnail

plugins.ldrnail = {
    initializeOnTab: function(tab) {
        if (!content.document.__ldrnail_isChecked) {
            content.document.__ldrnail_isChecked = true;
            tab.__ldrnail = LDRnail(tab);
            content.addEventListener('unload', function() {
                tab.__ldrnail = null;
                content.removeEventListener('unload', arguments.callee, false);
            }, false);
        }
    },

    get isAvailableCurrentTab() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        plugins.ldrnail.initializeOnTab(tab);
        return tab.__ldrnail && tab.__ldrnail.isAvailable;
    },
    isAvailable: function(tab) {
        plugins.ldrnail.initializeOnTab(tab);
        return tab.__ldrnail && tab.__ldrnail.isAvailable;
    },

    next: function() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            tab.__ldrnail.next();
    },
    prev: function() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            tab.__ldrnail.prev();
    },

    pin: function() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab)) {
            tab.__ldrnail.togglePin();
            panel.pinnedCount = plugins.ldrnail.pinnedItems.length;
        }
    },
    clearPin: function() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab)) {
            tab.__ldrnail.clearPin();
            panel.pinnedCount = 0;
        }
    },

    open: function() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            tab.__ldrnail.open("tabshifted");
    },
    view: function() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            tab.__ldrnail.view();
    },

    focus: function() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            tab.__ldrnail.focus();
    },

    getItemView: function(item) {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.getItemView(item);
    },
    getItemLink: function(item) {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.getItemLink(item);
    },

    get paragraphs() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.paragraphs;
    },
    get currentItem() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.currentItem;
    },
    get currentLink() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.currentLink;
    },
    get pinnedItems() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.pinnedItems;
    },
    get pinnedLinks() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.pinnedLinks;
    },
    get pinnedItemsOrCurrentItem() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.pinnedItemsOrCurrentItem;
    },
    get pinnedLinksOrCurrentLink() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.pinnedLinksOrCurrentLink;
    },

    get currentSiteinfo() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.currentSiteinfo;
    },

    get siteinfos() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            return tab.__ldrnail.siteinfos;
    },

    list: function() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab)) {
            let items = tab.__ldrnail.pinnedItems;
            if (items.length == 0) return;

            let info = tab.__ldrnail.currentSiteinfo;
            prompt.selector({
                message      : "Pinned items: ",
                collection   : items.map(tab.__ldrnail.getItemView),
                actions      : pOptions['pinned_list_actions'],
                keymap       : pOptions['pinned_list_keymap'],
                callback     : function(index) {
                    let link = tab.__ldrnail.getItemLink(items[index]);
                    if (link && link.href)
                        openUILinkIn(link.href, 'tab', false, null, toURI(content.location.href));
                },
            });
        }
    },

    siteinfo: function() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab)) {
            let infos = tab.__ldrnail.siteinfos;
            if (infos.length <= 0) return;
            let collection = infos.map(function(info) info.name);
            prompt.selector({
                message      : "select siteinfo: ",
                collection   : infos.map(function(info) info.name),
                initialIndex : infos.indexOf(tab.__ldrnail.currentSiteinfo),
                callback     : function(index) tab.__ldrnail.setSiteinfoByIndex(index),
            });
        }
    },

    toggleIntelligenceScroll: function() {
        let tab = window.gBrowser.mTabContainer.childNodes[gBrowser.mTabContainer.selectedIndex];
        if (plugins.ldrnail.isAvailable(tab))
            tab.__ldrnail.useIntelligenceScroll = !tab.__ldrnail.useIntelligenceScroll;
    },
};

// status bar

let panel = (function() {
    const ICON_PREFERRED = 'data:image/png;base64,' +
'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABkklEQVQ4y2P4//8/AwyfmbGlZ6Zz'+
'2f9N1XNug/jr49tPzDRO+39qwdb5yOqQMQrneP/qHpCGDXn9X5ENODFv806iDHhw4ILfsd6V/VfW'+
'HyogywB0TLIBV1cdLFuZ0n/t6OR1W7AZ8PPbD6ldNYsPg9RcXnlsAklh8OfPH8adNbP3gPg7cvsu'+
'/PryXZwkA/a1L5wKYm9K6rny88NXCZJiYaFPyZ+Zpmn/Z5qk/394/EYkydEIwss8Sn+C6M0p3ef/'+
'/P4jQJIBS8PrHn9+80l+Y3LXbRD/xsbjuWQlpFfXHznOts78v9Sr/PO39x8VSDbg379/LEc7V6wE'+
'iR3qXzkfyGdm+Pv3L9yAo70rwQZszJ8ANmB70fQTi92r/p9fuW8lTM2X1x/lVkY0v1jqV///9d0H'+
'QQxLA+seHGhdtuTC/D39ywPqnoEMONC4aD1I8a/vvyR+fv4p/+fXH15klwLFJcHiv/8IMsBCGYaX'+
'+pa/+vL0rRa+JI4SjXf2nEjckjntwUr/pv+7Gufv/fz6vRWxmkEYAD+4vsdGg3zDAAAAAElFTkSu'+
'QmCC';
    const ICON_DISABLED = 'data:image/png;base64,' +
'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABgklEQVQ4y2P4//8/AwyvWrWqJykp'+
'6X9/f/9tEL+6uvpEeHj4/3Xr1s1HVoeMUTiLFi3qAWlobW39imzAmjVrdhJlwOnTp/0WLlzYv2fP'+
'ngKyDEDHJBuwc+fOstra2mtLly7dgs2A79+/S02aNOkwSM2OHTsmkBQGv3//Zpw4ceIeEL+9vf3C'+
't2/fxEkyYNasWVNB7Lq6uiufP3+WICkWMjMz/0RERPwH4QsXLkSSHI1QQ36C6IaGhvNA7wiQZEBR'+
'UdHjd+/eyQOdfxvE379/fy5ZCenu3buOMTEx/7Oysj5//PhRgWQD/v37xzJv3ryVIDFggpsP5DMz'+
'/P37F27AggULwAa0tbWBDejq6jqRkZHxf9u2bSthaoBekSstLX2Rm5v7/+HDh0EM+fn5D4BRtGTD'+
'hg39QPYzkAHTp09fD1L848cPia9fv8r/+vWLF9mlQHFJkDgwMAUZYKEMwzk5Oa+AQAtfEkeJxmPH'+
'jiW2tLQ8ANr+f+rUqXvfvn1rRaxmEAYAuEau6pzIjyUAAAAASUVORK5CYII=';
    const ICON_SUSPENDED = 'data:image/png;base64,' +
'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB30lEQVQ4y2P4//8/AwyfmbGlZ6Zz'+
'2f9N1XNug/jr49tPzDRO+39qwdb5yOqQMQrneP/qHpCGDXn9X5ENODFv806iDHhw4ILfsd6V/VfW'+
'HyogywB0TLIBV1cdLFuZ0n/t6OR1W7AZ8PPbD6ldNYsPg9RcXnlsAklh8OfPH8adNbP3gPg7cvsu'+
'/PryXZwkA/a1L5wKYm9K6rny88NXCZJiYaFPyZ+Zpmn/Z5qk/394/EYkydEIwss8Sn+C6M0p3ef/'+
'/P4jQJIBS8PrHp/MNO/Y5y/1a7cjy/9dXrzvdroyVRBtwNHyxJsXiy1+ft/a+//ftR3/v64o+n86'+
'W/fPTmfmXKIM2OUr8vUbUPP/Sb7//5cL/vvfpvj/dZfD/50uzPcY/v79CzfgaO9KsAEb8yeADdhe'+
'NP3EYveq/3ucWP79O7vuPxL4975eAizOsDSw7sGB1mVLLszf0788oO4ZyIADjYvWgwz49f2XxM/P'+
'P+V3urE8+TI3+f9/oKYfZQz/3wHxwwzm/0DxpwywUIbhpb7lr748fauF7LXD4VINJ5NVfj8rV/z/'+
'qpL1/90Uxv97fVn+7HBlrmS4s+dE4pbMaQ9W+jf939U4f+/n1++tsKX5I+GyFTtdme+DnA2kH4M0'+
'g8QB6gSqbDrm2CMAAAAASUVORK5CYII=';

    let container = document.getElementById('ldrnail-status-panel');
    if (container)
        container.parentNode.removeChild(container);
    container = document.createElement('statusbarpanel');
    container.setAttribute('id', 'ldrnail-status-panel');
    container.setAttribute('align', 'center');
    let box = document.createElement('hbox');
    box.setAttribute('align', 'center');
    box.setAttribute('flex', 1);
    let icon = document.createElement('image');
    icon.setAttribute('flex', 1);
    icon.setAttribute('src', ICON_DISABLED);
    let label = document.createElement('label');
    label.setAttribute('style', pOptions['pinned_count_style']);
    label.setAttribute('flex', 1);
    label.setAttribute('value', '-');

    box.appendChild(icon);
    box.appendChild(label);
    box.addEventListener("click", function(e) ext.exec('ldrnail-toggle-status'), false);
    container.appendChild(box);
    document.getElementById('status-bar').insertBefore(container,
            document.getElementById('keysnail-status').nextSibling);

    let self = {
        STATE_PREFERRED: 1,
        STATE_SUSPENDED: 0,
        STATE_DISABLED: -1,

        set pinnedCount(count) {
            if (count == null) {
                label.setAttribute('disabled', true);
                label.setAttribute('value', '-');
            } else {
                label.setAttribute('disabled', false);
                label.setAttribute('value', count);
            }
        },
        set tips(msg) {
            container.setAttribute('tooltiptext', msg);
        },
        set state(value) {
            switch (value) {
            case self.STATE_PREFERRED:
                icon.setAttribute('src', ICON_PREFERRED);
                self.tips = "LDRnail enabled";
                self.pinnedCount = plugins.ldrnail.pinnedItems.length;
                break;
            case self.STATE_SUSPENDED:
                icon.setAttribute('src', ICON_SUSPENDED);
                self.tips = "LDRnail suspended";
                self.pinnedCount = null;
                break;
            case self.STATE_DISABLED:
                icon.setAttribute('src', ICON_DISABLED);
                self.tips = "LDRnail disabled";
                self.pinnedCount = null;
                break;
            }
        },
    };
    return self;
})();

// Key hook

let keyHook = (function() {
    // Override mode detector

    key.modes.LDRNAIL = "LDRnail";

    let localKeyMap = (function() {
        let result = {};
        if (pOptions['keybind']) {
            for (let [k, v] in Iterator(pOptions['keybind']))
                result[k] = (typeof (v) == 'string') ? plugins.ldrnail[v] : v;
        }
        return result;
    })();

    // save key.getCurrentMode
    if (!my.ldrnailOriginalGetCurrentMode)
        my.ldrnailOriginalGetCurrentMode = key.getCurrentMode;
    key.getCurrentMode = function (aEvent, aKey) {
        if (self.enabled && key.keyMapHolder[key.modes.LDRNAIL] && !util.isWritable(aEvent) &&
            !util.isCaretEnabled() && plugins.ldrnail.isAvailableCurrentTab)
        {
            if (pOptions['keybind'][aKey] == 'siteinfo' ||
                (key.keyMapHolder[key.modes.LDRNAIL][aKey] && plugins.ldrnail.paragraphs.length > 0))
            {
                return key.modes.LDRNAIL;
            }
        }
        return my.ldrnailOriginalGetCurrentMode.call(key, aEvent, aKey);
    };

    // Hook LocationChange

    if (my.ldrnailLocationChangeHandler)
        hook.removeHook('LocationChange', my.ldrnailLocationChangeHandler);
    my.ldrnailLocationChangeHandler = locationChangeHandler;

    hook.addToHook('LocationChange', locationChangeHandler);

    function updateKeyMapHolder() {
        if (content.document.__ldrnail_status && plugins.ldrnail.isAvailableCurrentTab)
            key.keyMapHolder[key.modes.LDRNAIL] = localKeyMap;
        else
            key.keyMapHolder[key.modes.LDRNAIL] = null;
        updateStatusbar();
    };

    let setEventContent = null;

    function updateKeyMapHandler() {
        setEventContent = null;
        content.removeEventListener('DOMContentLoaded', arguments.callee, false);
        updateKeyMapHolder();
    }

    const includeURLs = pOptions['include_urls'];
    const excludeURLs = pOptions['exclude_urls'];

    function locationChangeHandler(aNsURI) {
        // about:blank?
        if (!aNsURI || !aNsURI.spec) {
            key.keyMapHolder[key.modes.LDRNAIL] = null;
            updateStatusbar();
            return;
        }

        // Check exclude urls
        if (typeof content.document.__ldrnail_status === "undefined") {
            if (includeURLs && includeURLs.length > 0) {
                if (includeURLs.some(function(aPattern) aNsURI.spec.match(aPattern)))
                    content.document.__ldrnail_status = true;
                else
                    content.document.__ldrnail_status = false;
            } else if (excludeURLs) {
                if (excludeURLs.some(function(aPattern) aNsURI.spec.match(aPattern)))
                    content.document.__ldrnail_status = false;
                else
                    content.document.__ldrnail_status = true;
            } else
                content.document.__ldrnail_status = true;
        }

        if (setEventContent)
            try {
                setEventContent.removeEventListener('DOMContentLoaded', updateKeyMapHandler, false);
            } catch(e) { }

        let docState = content.document.readyState;
        if (content.document && ['interactive', 'complete'].some(function(aState) docState == aState)) {
            setEventContent = null;
            updateKeyMapHolder();
        } else {
            key.keyMapHolder[key.modes.LDRNAIL] = null;
            updateStatusbar();

            setEventContent = content;
            content.addEventListener('DOMContentLoaded', updateKeyMapHandler, false);
        }
    }

    function updateStatusbar() {
        // change statusbar icon
        if (!self.enabled)
            panel.state = panel.STATE_SUSPENDED;
        else if (key.keyMapHolder[key.modes.LDRNAIL] && key.status && !key.suspended)
            panel.state = panel.STATE_PREFERRED;
        else
            panel.state = panel.STATE_DISABLED;
    }

    let enabled = true;

    let self = {
        get enabled() { return enabled && content.document.__ldrnail_status; },
        set enabled(val) {
            enabled = val;
            if (val)
                content.document.__ldrnail_status = val;
            updateKeyMapHolder();
            // change statusbar icon
            updateStatusbar();
        },
        update: function() locationChangeHandler({ spec: content.location.href }),
    };

    return self;
})();

// Register style
style.register(
    "."+CURRENT_CLASS+":before {"+
        pOptions['css_highlight_current_before'] +
    "}"+
    "."+INTELLIGENCE_CLASS+" ."+CURRENT_CLASS+":before {"+
        pOptions['css_highlight_current_intelligence_before'] +
    "}"+
    "."+CURRENT_CLASS+" {"+
        pOptions['css_highlight_current']+
    "}"+
    "."+INTELLIGENCE_CLASS+" ."+CURRENT_CLASS+" {"+
        pOptions['css_highlight_current_intelligence']+
    "}"+
    "."+PINNED_CLASS+" {"+
        pOptions['css_highlight_pinned']+
    "}"
, style.XHTML);

// siteinfo operate

siteinfoOperate(pOptions['siteinfo_urls'], false);

// update keystate
setTimeout(keyHook.update, 500);

// add ext

plugins.withProvides(function (provide) {
    provide('ldrnail-next',
        function() plugins.ldrnail.next(),
        'LDRnail - next');
    provide('ldrnail-prev',
        function() plugins.ldrnail.prev(),
        'LDRnail - prev');
    provide('ldrnail-open',
        function() plugins.ldrnail.open(),
        'LDRnail - open');
    provide('ldrnail-view',
        function() plugins.ldrnail.view(),
        'LDRnail - view');
    provide('ldrnail-focus',
        function() plugins.ldrnail.focus(),
        'LDRnail - focus');
    provide('ldrnail-pin',
        function() plugins.ldrnail.pin(),
        'LDRnail - pin');
    provide('ldrnail-clear-pin',
        function() plugins.ldrnail.clearPin(),
        'LDRnail - Clear pin');
    provide('ldrnail-list',
        function() plugins.ldrnail.list(),
        'LDRnail - list');
    provide('ldrnail-siteinfo',
        function() plugins.ldrnail.siteinfo(),
        'LDRnail - siteinfo');
    provide('ldrnail-toggle-status',
        function() keyHook.enabled = !keyHook.enabled,
        'LDRnail - disable local key bind');
    provide('ldrnail-update-siteinfo',
        function() siteinfoOperate(pOptions['siteinfo_urls'], true),
        'LDRnail - Update siteinfo');
    provide('ldrnail-toggle-intelligence-scroll',
        function() plugins.ldrnail.toggleIntelligenceScroll(),
        'LDRnail - Toggle intelligence scroll');
}, PLUGIN_INFO);
