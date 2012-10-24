// Info

var PLUGIN_INFO =
<KeySnailPlugin>
    <name>Tabgroup Controller</name>
    <description>Manipulate Tabgroup</description>
    <description lang="ja">Tabgroup を操作</description>
    <author>958</author>
    <version>0.0.2</version>
    <license>MIT</license>
    <minVersion>1.8.0</minVersion>
    <include>main</include>
    <detail lang="ja"><![CDATA[
=== これは何 ? ===
Firefox 4 から搭載された、タブグループ機能を KeySnail 上で操作します

=== 使い方 ===

==== タブグループを作成する ====
エクステ 'tabgroup-create' を実行すると、新規タブグループを作成します
この際、前置引数を指定すると、指定した数値がタブグループの名前になります

==== タブグループを移動する ====
エクステ 'tabgroup-next' 'tabgroup-prev' を実行すると、表示されているタブグループを切り替えます

==== タブグループを削除する ====
エクステ 'tabgroup-close' を実行すると、現在表示中のタブグループを削除します

==== タブグループ一覧を表示 ====
エクステ 'tabgroup-list' を実行すると、タブグループ一覧が表示されます
デフォルトで以下のキーバインドに対応しています
s:
 表示されているタブグループを切り替える
c:
 新しいタブグループを作成する
d:
 選択されているタブグループを閉じる
e:
 選択されているタブグループの名前を変更する
m:
 現在表示中のタブを、選択されているタブグループに移動する
キーバインドを変更する場合は以下のように plugins.options['tabgroup.keymap'] を設定してください
>|javascript|
plugins.options['tabgroup.keymap'] = {
    "C-z" : "prompt-toggle-edit-mode",
    "SPC" : "prompt-next-page",
    "b"   : "prompt-previous-page",
    "j"   : "prompt-next-completion",
    "k"   : "prompt-previous-completion",
    "g"   : "prompt-beginning-of-candidates",
    "G"   : "prompt-end-of-candidates",
    "D"   : "prompt-cancel",
    // Tabgroup specific actions
    's'   : 'select',
    'c'   : 'create',
    'd'   : 'close',
    'e'   : 'edit-title',
    'm'   : 'move-tab-to',
};
||<

==== 謝辞 ====
以下のスクリプトを流用にしました

- vimperator unload-tab.js
 - https://github.com/vimpr/vimperator-plugins/blob/c4c6a2f0df63d0c9eced030b0bd87af0dac8f027/unload-tab.js
]]></detail>

</KeySnailPlugin>;

// Options

var pOptions = plugins.setupOptions("tabgroup", {
    'keymap': {
        preset: {
            's': 'select',
            'c': 'create',
            'd': 'close',
            //'U': 'unload',
            'e': 'edit-title',
            'm': 'move-tab-to',
        },
        description: M({
            ja: "タブグループ一覧の操作用キーマップ",
            en: "Local keymap for manipulation"
        })
    },
}, PLUGIN_INFO);

// Main

function TabGroup(callback) {
    TabView._initFrame(function() {
        var win = TabView.getContentWindow();
        callback.call(win.GroupItems, win);
    });
};

var tgm = (function() {
    function selectGroup(aGroupItem) {
        if (aGroupItem.getChildren().length > 0)
            gBrowser.selectedTab = aGroupItem.getActiveTab().tab;
        else
            aGroupItem.newTab();
    }

    function getOrCreateTabGroupsByName(aName, callback) {
        TabGroup(function(win) {
            var groups = this.groupItems.filter(function(item) !item.hidden && item.title == aName);
            if (groups.length == 0) {
                let box = new win.Rect(30, 30, win.TabItems.tabWidth, win.TabItems.tabHeight);
                let opts = {immediately: true, bounds: box, title: aName};
                groups.push(new win.GroupItem([], opts));
            }
            callback.call(this, groups);
        });
    }

    function create(title) {
        TabGroup(function(win){
            let box = new win.Rect(30, 30, win.TabItems.tabWidth, win.TabItems.tabHeight);
            let opts = {immediately: true, bounds: box, title: title};
            let groupItem = new win.GroupItem([], opts);
            groupItem.newTab();
        });
    }

    var self = {
        selectGroup: selectGroup,
        getOrCreateTabGroupsByName: getOrCreateTabGroupsByName,
        create: create,
    };
    return self;
})();

plugins.tabGroup = tgm;

// Add exts

plugins.withProvides(function (provide) {
    provide("tabgroup-list", function () {
        TabGroup(function () {
            function updateCollection(rows) {
                rows.forEach(function(row) {
                    row[0] = row[2].getTitle();
                    row[1] = row[2].getChildren().length;
                });
            }

            var collection = this.groupItems.filter(function(item) !item.hidden)
                .map(function(item) [item.getTitle(), item.getChildren().length, item]);
            var self = this;
            prompt.selector({
                message: 'Tab groups',
                collection: collection,
                flags: [0, 0, HIDDEN|IGNORE],
                header: ['Title', 'Tab count'],
                initialIndex: this.groupItems.indexOf(this.getActiveGroupItem()),
                keymap: pOptions['keymap'],
                actions: [
                    [function(aIndex) {
                        tgm.selectGroup(self.groupItems[aIndex]);
                        self._updateTabBar();
                     }, 'Select', 'select,c'],
                    [function(aIndex, rows) {
                        if (self.groupItems.length > 1) {
                            self.groupItems[aIndex].closeHidden();
                            rows.splice(aIndex, 1);
                            tgm.selectGroup(self.getActiveGroupItem() || self.getLastActiveGroupItem());
                            self._updateTabBar();
                            rows.splice(aIndex, 1);
                            prompt.refresh();
                        }
                     }, 'Close', 'close,c'],
                    [function(aIndex, rows) {
                        var ret = window.prompt('New title:', self.groupItems[aIndex].getTitle());
                        if (ret !== null)  {
                            self.groupItems[aIndex].setTitle(ret);
                            rows[aIndex][0] = ret;
                        }
                        prompt.refresh();
                     }, 'Edit title', 'edit-title,c'],
                    [function(aIndex, rows) {
                        TabView.moveTabTo(
                            window.gBrowser.mTabContainer.selectedItem,
                            self.groupItems[aIndex].id
                        );
                        self._updateTabBar();
                        updateCollection.call(self, rows);
                        prompt.refresh();
                     }, 'Move current tab to selected tabgroup', 'move-tab-to,c'],
                    [function(aIndex, rows) {
                        var title = window.prompt('New title:');
                        if (title !== null) {
                            tgm.create(title);
                            rows.push([title, 1]);
                            prompt.refresh(rows.length - 1);
                        }
                     }, 'Create new tabgroup', 'create,c'],
                    /*
                    [function(aIndex, rows) {
                        // https://github.com/vimpr/vimperator-plugins/blob/c4c6a2f0df63d0c9eced030b0bd87af0dac8f027/unload-tab.js
                        var SS = Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore);
                        self.groupItems[aIndex].getChildren().forEach(function(item) {
                            var tab = item.tab;
                            if (tab && !tab.selected && !tab.linkedBrowser.__SS_restoreState) {
                                var state = SS.getTabState(tab);
                                tab.linkedBrowser.loadURI(null);
                                SS.setTabState(tab, state);
                            }
                        });
                     }, 'Unload tabgroup', 'unload,c'],
                     */
                ],
            });
        });
    }, "Show tabgroup list");
    provide("tabgroup-next", function () {
        TabGroup(function() {
            var cur = this.groupItems.indexOf(this.getActiveGroupItem());
            var groupItem = (this.groupItems.length > cur + 1) ?
                this.groupItems[cur + 1] : this.groupItems[0];
            tgm.selectGroup(groupItem);
            this._updateTabBar();
        });
    }, "Next tabgroup");
    provide("tabgroup-prev", function () {
        TabGroup(function() {
            var cur = this.groupItems.indexOf(this.getActiveGroupItem());
            var groupItem = (cur == 0) ?
                this.groupItems[this.groupItems.length - 1] : this.groupItems[cur - 1];
            tgm.selectGroup(groupItem);
            this._updateTabBar();
        });
    }, "Previous tabgroup");
    provide("tabgroup-close", function () {
        TabGroup(function() {
            var cur = this.groupItems.indexOf(this.getActiveGroupItem());
            if (this.groupItems.length > 1) {
                this.groupItems[cur].closeHidden();
                tgm.selectGroup(this.getActiveGroupItem() || this.getLastActiveGroupItem());
                this._updateTabBar();
            }
        });
    }, "Close current tabgroup");
    provide("tabgroup-create", function (ev, arg) {
        var title = arg || window.prompt('New title:');
        if (title !== null)
            tgm.create(title);
    }, "Create new tabgroup");
}, PLUGIN_INFO);
