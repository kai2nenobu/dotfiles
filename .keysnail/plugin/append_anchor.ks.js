let PLUGIN_INFO =
<KeySnailPlugin>
    <name>Append Anchor</name>
    <description>append anchors to texts look like url.</description>
    <description lang="ja">URL っぽいテキストにアンカーをつける。</description>
    <version>0.0.5</version>
    <updateURL>https://raw.github.com/gist/1000062/append_anchor.ks.js</updateURL>
    <iconURL>https://sites.google.com/site/958site/Home/files/append_anchor.ks.png</iconURL>
    <minVersion>1.8.0</minVersion>
    <detail><![CDATA[
=== 使い方 ===
テキストリンクっぽい動作を HoK 開始時に自動的に行います。
このページ上で HoK を実行してみてください。
下のテキスト上にヒントが表示されるようになります。
ｔｔｐ：／／ｇｉｔｈｕｂ．ｃｏｍ／ｍｏｏｚ／ｋｅｙｓｎａｉｌ／
ttp://github.com/mooz/keysnail/

=== 謝辞 ===
以下のスクリプトを参考にさせていただきました
-appendAnchor.js at master from vimpr/vimperator-plugins - GitHub
-https://github.com/vimpr/vimperator-plugins/blob/master/appendAnchor.js
]]></detail>
</KeySnailPlugin>;

let pOptions = plugins.setupOptions("anc", {
    'auto_append_anchor': {
        preset: true,
        description: M({
            ja:"HoK 開始時に自動で ext.exec('add-anchor') する (初期値: true)",
            en:"Execute ext.exec('add-anchor') automatically when run HoK (default: true)"
        })
    }
}, PLUGIN_INFO);

// hok hook
if (pOptions['auto_append_anchor']) {
    hook.addToHook('PluginLoaded', function() {
        if (!plugins.hok) return;

        if (!my.orgHokStart)
            my.orgHokStart = plugins.hok.hok.start;

        plugins.hok.hok.start = function() {
            appendAnchor();
            my.orgHokStart.apply(this, arguments);
        };
    });
}

// main
function appendAnchor() {
    const className = "ks_appended_anchor";
    const xpath = L(
        '//text()[(contains(self::text(), "://") or contains(self::text(), "：／／")) ' +
        'and not(ancestor::*[contains(concat(" ",normalize-space(@class)," ")," ' +
        className +
        ' ")] or ancestor::a or ancestor::script or ancestor::style or ancestor::aside or ancestor::head)]');
    const regexpLikeURL = new RegExp(L(
        '(?:h?ttps?|ftp|ｈ?ｔｔｐｓ?|ｆｔｐ)' +
        '(?:://|：／／)' +
        '[-_.!~*\'a-zA-Z0-9;?:@&=+$,%#/' +
         '－＿．！～＊’ａ-ｚＡ-Ｚ０-９；？：＠＆＝＋＄，％＃／]+'
    ), "g");

    let _nsIFind = Components.classes['@mozilla.org/embedcomp/rangefind;1'].getService(Components.interfaces.nsIFind);
    _nsIFind.findBackwards = false;
    _nsIFind.caseSensitive = true;

    (function (win){
        appendAnchor(win);
        for (let i = 0; i < win.frames.length; i++) {
            if (win.frames[i]) arguments.callee(win.frames[i]);
        }
    })(window.content);

    function appendAnchor(win) {
        let doc = win.document;

        $X(xpath, doc).forEach(function(node) {
            node = node.parentNode;

            if (node.classList.contains(className)) return;
            node.classList.add(className);

            let text = node.textContent;
            let arResult = text.match(regexpLikeURL);
            if (!arResult || arResult.length == 0) return;

            let findRange = doc.createRange();
            findRange.selectNode(node);

            let startPt = doc.createRange();
            startPt.selectNode(node);
            startPt.collapse(true);

            let endPt = doc.createRange();
            endPt.selectNode(node);
            endPt.collapse(false);

            let ranges = [];
            try{
                for (let i = 0; i < arResult.length; i++) {
                    let rsltRange = _nsIFind.Find(arResult[i], findRange, startPt, endPt);
                    if (rsltRange == null || $X('ancestor-or-self::a', rsltRange.startContainer.parentNode).length > 0)
                        break;

                    ranges.push(rsltRange);

                    let offset = rsltRange.endOffset;
                    startPt.setStart(rsltRange.startContainer, offset);
                    startPt.setEnd(rsltRange.startContainer, offset);
                }
            }catch(e){ }

            endPt.detach();
            startPt.detach();
            findRange.detach();

            for (let i = ranges.length - 1; i >= 0; i--) {
                let href = convertFullWidthToHalfWidth(ranges[i].toString());
                if (href.indexOf('t') == 0) href = 'h' + href;

                // build anchor element
                let anchor = doc.createElement('a');
                anchor.setAttribute('href', href);
                anchor.textContent = '\u200c';
                ranges[i].insertNode(anchor);

                ranges[i].detach();
            }
        });
    }
}

// add ext
plugins.withProvides(function (provide) {
    provide("add-anchor",
        function(ev, arg) appendAnchor(),
        M({ja:'URL らしきテキストにリンクをつける', en:'append anchors to texts look like url'})
    );
}, PLUGIN_INFO);

// via http://taken.s101.xrea.com/blog/article.php?id=510
function convertFullWidthToHalfWidth (aString) {
    const fullWidthReg = /[\uFF01\uFF02\uFF03\uFF04\uFF05\uFF06\uFF07\uFF08\uFF09\uFF0A\uFF0B\uFF0C\uFF0D\uFF0E\uFF0F\uFF10\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19\uFF1A\uFF1B\uFF1C\uFF1D\uFF1E\uFF1F\uFF20\uFF21\uFF22\uFF23\uFF24\uFF25\uFF26\uFF27\uFF28\uFF29\uFF2A\uFF2B\uFF2C\uFF2D\uFF2E\uFF2F\uFF30\uFF31\uFF32\uFF33\uFF34\uFF35\uFF36\uFF37\uFF38\uFF39\uFF3A\uFF3B\uFF3C\uFF3D\uFF3E\uFF3F\uFF40\uFF41\uFF42\uFF43\uFF44\uFF45\uFF46\uFF47\uFF48\uFF49\uFF4A\uFF4B\uFF4C\uFF4D\uFF4E\uFF4F\uFF50\uFF51\uFF52\uFF53\uFF54\uFF55\uFF56\uFF57\uFF58\uFF59\uFF5A\uFF5B\uFF5C\uFF5D\uFF5E]/g;
    function f2h() {
        let str = arguments[0];
        let code = str.charCodeAt(0);
        code &= 0x007F;
        code += 0x0020;
        return String.fromCharCode(code);
    }
    return aString.replace(fullWidthReg, f2h);
}

function $X(exp, context, resolver, result_type) {
    context || (context = document);
    var Doc = context.ownerDocument || context;
    var result = Doc.evaluate(exp, context, resolver, result_type || XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if (result_type) return result;
    for (var i = 0, len = result.snapshotLength, res = new Array(len); i < len; i++) {
        res[i] = result.snapshotItem(i);
    }
    return res;
}
