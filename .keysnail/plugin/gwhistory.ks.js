// Info

let PLUGIN_INFO =
<KeySnailPlugin>
    <name>Google Web History</name>
    <description>Google Web History from KeySnail</description>
    <description lang="ja">Google Web 履歴を検索</description>
    <author>958</author>
    <version>0.0.1</version>
    <license>MIT</license>
    <minVersion>1.8.0</minVersion>
    <include>main</include>
    <detail lang="ja"><![CDATA[
=== 使い方 ===
Google Web 履歴を表示・検索します

エクステ実行時に Google にログインしている必要があります

たまにパスワード入力を求める画面が出ますが、Google Web History が定期的にパスワード入力を求める仕様になっているためです
Google アカウントのパスワードを入力してください

キーマップを変更したい人は、次のような設定を .keysnail.js の PRESERVE エリアへ

>||
plugins.options["google-web-history.keymap"] = {
    "C-z"   : "prompt-toggle-edit-mode",
    "SPC"   : "prompt-next-page",
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
||<

コマンドを拡張して使うことも

>||
shell.add(["gwhistory"], "search google web history",
  function(args, extra) {
    ext.exec("google-web-history-search", args.join(' '), null);
  }, { argCount: '*' }, true
);
||<
]]></detail>
</KeySnailPlugin>;

// Option

let pOptions = plugins.setupOptions("google-web-history", {
    "keymap": {
        preset: {
            "C-z"   : "prompt-toggle-edit-mode",
            "SPC"   : "prompt-next-page",
            "b"     : "prompt-previous-page",
            "j"     : "prompt-next-completion",
            "k"     : "prompt-previous-completion",
            "g"     : "prompt-beginning-of-candidates",
            "G"     : "prompt-end-of-candidates",
            "q"     : "prompt-cancel",
            // google web history specific actions
            "o"     : "open"
        },
        description: M({
            ja: "メイン画面の操作用キーマップ",
            en: "Local keymap for manipulation"
        })
    },
}, PLUGIN_INFO);

// Add ext

function WebHistory(arg) {
    let initialIndex = 0;
    let beforeIndex = 0;
    let query = "";
    var collection = [];
    let totalCount = 0;

    if (arg && arg.length > 0) {
        search(arg);
    } else {
        searchPrompt();
    }

    function login(loginHtml, cb) {
        let pass = window.prompt('enter your google account password', '');
        if (!pass) {
            display.echoStatusBar('login failed', 3000);
            return;
        }

        let doc = createHTMLDocument_XSLT(loginHtml);
        let form = doc.getElementsByTagName('form')[0];
        let param = {};
        Array.slice(form.getElementsByTagName('input')).forEach(function(e){
            param[e.name] = e.value;
        });
        param['Passwd'] = pass;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (ev) {
            if (xhr.readyState == 4) {
                if (xhr.status != 200)
                    return;
                setTimeout(function(){cb()}, 500);
            }
        };
        xhr.open('POST', form.action, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        param = (function(){
            let ret = [];
            for (i in param) {
                ret.push(i + '=' + param[i]);
            }
            return ret.join('&');
        })();
        xhr.send(param);
    }

    function parseRss(xml) {
        let items = xml.getElementsByTagName('item');
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            let title = items[i].getElementsByTagName('title')[0].textContent;
            let url = items[i].getElementsByTagName('link')[0].textContent;
            let desc = items[i].getElementsByTagName('description')[0].textContent;
            let category = items[i].getElementsByTagName('category')[0].textContent;
            let date = items[i].getElementsByTagName('pubDate')[0].textContent;
            if (!url) continue;

            let iconURL;
            if (category.indexOf('query') != -1) {
                iconURL = 'http://www.google.com/favicon.ico';
                title += ' - ' + desc;
            } else {
                iconURL = util.getFaviconPath(url);
            }
            collection.push([
                iconURL,
                title,
                url,
                desc,
                date,
                category
            ]);
            totalCount++;
        }
    }

    function searchWord(cb, startIndex) {
        //search query
        let url  = 'https://www.google.com/history/find?output=rss&q=' + query;
        if (startIndex)
            url += '&start=' + startIndex;

        util.message('request:' + url);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (ev) {
            if (xhr.readyState == 4) {
                if (xhr.status != 200) {
                    return;
                }
                if (xhr.responseXML) {
                    parseRss(xhr.responseXML);
                    cb();
                } else {
                    login(xhr.responseText, function(){ searchWord(cb, startIndex) });
                }
            }
        };
        xhr.open('GET', url, true);
        xhr.send(null);
    }

    let fetchingPreviousNow = false;
    function doFetchPrevious(nextIndex) {
        fetchingPreviousNow = true;

        document.getElementById("keysnail-prompt-textbox").blur();
        display.echoStatusBar("Fetching previous entries ...", 3000);
        searchWord(function(){
                fetchingPreviousNow = false;
                display.echoStatusBar("Fetching previous entries Done", 3000);
                if (collection.length > 0)
                    openPrompt();
                else
                    display.echoStatusBar("No results", 3000);
            }
        , nextIndex);
    }

    function openPrompt() {
        prompt.finish(true);
        prompt.selector(
            {
                message    : "pattern:",
                acyclic    : true,
                collection : collection,
                flags      : [ICON | IGNORE, 0, 0, HIDDEN | IGNORE, IGNORE, HIDDEN | IGNORE],
                style      : [style.prompt.description, style.prompt.description, style.prompt.description],
                header     : ["Title", "URL", "Last visited"],
                width      : [35, 50, 15],
                keymap     : pOptions["keymap"],
                beforeSelection : function (arg) {
                    if (!arg.row || fetchingPreviousNow)
                        return;

                    if (collection.length > 1 &&
                        arg.i === collection.length - 1 &&
                        arg.i === beforeIndex) {

                        doFetchPrevious(totalCount);
                        return;
                    }

                    beforeIndex = arg.i;
                },
                stylist    : function (args, n, current) {
                    let category = args[5];
                    let style = "";

                    if (category.indexOf('browser result') != -1) {
                    } else if (category.indexOf('result') != -1) {
                        if (n == 1)
                            style += "margin-left: 1em;";
                    } else if (category.indexOf('query') != -1) {
                        if (n < 4)
                            style += "font-weight:bold;";
                    }
                    return style;
                },
                actions    : [
                    [function (aIndex) {
                         if (aIndex >= 0) {
                             let url = collection[aIndex][2];
                             openUILinkIn(url, "tab");
                         }
                     },
                     'Open',
                     'open']
                ],
                initialIndex : beforeIndex
            }
        );
    }

    function searchPrompt() {
        prompt.read("search:", function (word) {
            search(word);
        }, null, null, null, 0, "google-web-history-search");
    }

    function search(q) {
        query = q;
        searchWord(function(){
                if (collection.length > 0) {
                    openPrompt(collection);
                } else {
                    searchPrompt();
                    display.echoStatusBar("No results", 3000);
                }
            }
        );
    }
}

plugins.withProvides(function (provide) {
    provide("google-web-history-search",
        function (ev, arg) {
            new WebHistory(arg);
        },
        M({ja: "Google Web History - Google Web 履歴を検索", en: "Google Web History - Search Google Web Histories"}));
}, PLUGIN_INFO);

// Util

// from js-reference.ks.js
function createHTMLDocument_XSLT(source) {
    var processor = new XSLTProcessor();
    var sheet = new DOMParser().parseFromString(
            '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">' +
                    '<xsl:output method="html"/>' +
                    '<xsl:template match="/">' +
                    '<html><head><title></title></head><body></body></html>' +
                    '</xsl:template>' +
                    '</xsl:stylesheet>',
            'application/xml'
            );
    processor.importStylesheet(sheet);
    var doc = processor.transformToDocument(sheet);
    var range = doc.createRange();
    range.selectNodeContents(doc.documentElement);
    range.deleteContents();
    doc.documentElement.appendChild(range.createContextualFragment(source));
    return doc;
}

// timeago: a jQuery plugin
// http://timeago.yarp.com/
function toAgo(time){
	var strings = {
		suffixAgo: "ago",
		suffixFromNow: "from now",
		seconds: "less than a minute",
		minute: "about a minute",
		minutes: "%d minutes",
		hour: "about an hour",
		hours: "about %d hours",
		day: "a day",
		days: "%d days",
		month: "about a month",
		months: "%d months",
		year: "about a year",
		years: "%d years"
	};
	var $l = strings;
	var prefix = $l.prefixAgo;
	var suffix = $l.suffixAgo;

	var distanceMillis = new Date().getTime() - time;

	var seconds = distanceMillis / 1000;
	var minutes = seconds / 60;
	var hours = minutes / 60;
	var days = hours / 24;
	var years = days / 365;

	function substitute(string, number) {
		var value = ($l.numbers && $l.numbers[number]) || number;
		return string.replace(/%d/i, value);
	}

	var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
		seconds < 90 && substitute($l.minute, 1) ||
		minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
		minutes < 90 && substitute($l.hour, 1) ||
		hours < 24 && substitute($l.hours, Math.round(hours)) ||
		hours < 48 && substitute($l.day, 1) ||
		days < 30 && substitute($l.days, Math.floor(days)) ||
		days < 60 && substitute($l.month, 1) ||
		days < 365 && substitute($l.months, Math.floor(days / 30)) ||
		years < 2 && substitute($l.year, 1) ||
		substitute($l.years, Math.floor(years));

	return [prefix, words, suffix].join(" ").trim();
}
