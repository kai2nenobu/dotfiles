var PLUGIN_INFO =
<KeySnailPlugin>
    <name>TabGroup ElscreenLike</name>
    <name lang="ja">TabGruop ElscreenLike</name>
    <description>you can use TabGroupManager like elscreen</description>
    <description lang="ja">タブグループマネージャをelscreenのように使用することが出来ます。</description>
    <version>0.0.3</version>
    <updateURL>http://github.com/shiba-yu36/keysnail-plugin/raw/master/tabgroup-elscreenlike.ks.js</updateURL>
    <iconURL></iconURL>
    <author mail="shibayu36@gmail.com" homepage="http://d.hatena.ne.jp/shiba_yu36/">shiba_yu36</author>
    <license>The MIT License</license>
    <license lang="ja">MIT ライセンス</license>
    <minVersion>1.0</minVersion>
    <include>main</include>
    <provides>
        <ext>tabgroup-previous</ext>
        <ext>tabgroup-next</ext>
        <ext>tabgroup-goto</ext>
        <ext>tabgroup-create</ext>
        <ext>tabgroup-close</ext>
        <ext>tabgroup-group-nickname</ext>
        <ext>tabgroup-goto-last-selected</ext>
    </provides>
    <detail lang="ja"><![CDATA[
=== 使い方 ===
　このプラグインをインストールすることにより、firefoxのaddonであるタブグループマネージャをelscreenのように使うことができるようになります。
  下のリンクからタブグループマネージャをインストールしてから利用してください。
  https://addons.mozilla.org/ja/firefox/addon/10254/
    ]]></detail>
</KeySnailPlugin>;

// ChangeLog : {{{
//
// ==== 0.0.3 (2010 12/30) ====
// fix bug in content focus
// 
// ==== 0.0.2 (2010 12/30) ====
// タブグループを閉じるときはダイアログを表示するように
//
// ==== 0.0.1 ====
// リリース
//
// }}}

ext.add("tabgroup-previous", selectPreviousGroup, M({
    ja : "左のグループを選択",
    en : "select left group"
}));

ext.add("tabgroup-next", selectNextGroup, M({
    ja : "右のグループを選択",
    en : "select right group"
}));

ext.add("tabgroup-goto", selectNthGroup, M({
    ja : "指定した番号のグループへ移動",
    en : "select group of entered number"
}));

ext.add("tabgroup-create", openNewGroup, M({
    ja : "新しいグループを開く",
    en : "open new group"
}));

ext.add("tabgroup-close", closeCurrentGroup, M({
    ja : "現在のグループを閉じる",
    en : "close current group"
}));

ext.add("tabgroup-group-nickname", renameCurrentGroup, M({
    ja : "現在のグループの名前を変更する",
    en : "rename current group"
}));

ext.add("tabgroup-goto-last-selected", gotoLastSelectedGroup, M({
    ja : "直前のグループに移動",
    en : "rename current group"
}));


let last_selected_group_index;

function selectPreviousGroup () {
    if (KeySnail.windowType != "navigator:browser" || !("TabGroupsManager" in window))
        return;

    saveCurrentGroupIndex();
    TabGroupsManager.allGroups.selectNthGroup(getLeftGroupIndex());
}

function selectNextGroup () {
    if (KeySnail.windowType != "navigator:browser" || !("TabGroupsManager" in window))
        return;

    saveCurrentGroupIndex();
    TabGroupsManager.allGroups.selectNthGroup(getRightGroupIndex());
}

function selectNthGroup () {
    if (KeySnail.windowType != "navigator:browser" || !("TabGroupsManager" in window))
        return;

    prompt.read("goto group number: ", function (group_index) {
        if (!group_index.match("\\d+"))
            return;

        saveCurrentGroupIndex();
        TabGroupsManager.allGroups.selectNthGroup(group_index);
    });
}

function openNewGroup () {
    if (KeySnail.windowType != "navigator:browser" || !("TabGroupsManager" in window))
        return;

    saveCurrentGroupIndex();
    TabGroupsManager.command.OpenNewGroupActive();
}

function closeCurrentGroup () {
    if (KeySnail.windowType != "navigator:browser" || !("TabGroupsManager" in window))
        return;

    if (window.confirm(L("このグループを閉じてもよいですか？"))) {
        TabGroupsManager.command.CloseActiveGroup();
    }
}

function renameCurrentGroup () {
    if (KeySnail.windowType != "navigator:browser" || !("TabGroupsManager" in window))
        return;

    var current_group = TabGroupsManager.allGroups.selectedGroup;
    prompt.read("set group title to: ", function (group_name) {
        current_group.renameByText(group_name);
    });
}

function  gotoLastSelectedGroup () {
    if (KeySnail.windowType != "navigator:browser" || !("TabGroupsManager" in window))
        return;

    let current_index = TabGroupsManager.allGroups.groupbar.selectedIndex;
    let last_index    = getLastSelectedGroup();
    TabGroupsManager.command.SelectNthGroup(last_index);
    setLastSelectedGroup(current_index);
}

function saveCurrentGroupIndex () {
    last_selected_group_index = TabGroupsManager.allGroups.groupbar.selectedIndex;
}

function getRightGroupIndex () {
    var group_count = TabGroupsManager.allGroups.groupbar.itemCount;
    var current_index = TabGroupsManager.allGroups.groupbar.selectedIndex;
    if (current_index == group_count - 1) {
        return 0;
    }
    else {
        return current_index + 1;
    }
}

function getLeftGroupIndex () {
    var group_count = TabGroupsManager.allGroups.groupbar.itemCount;
    var current_index = TabGroupsManager.allGroups.groupbar.selectedIndex;
    if (current_index == 0) {
        return group_count - 1;
    }
    else {
        return current_index - 1;
    }
}

function getLastSelectedGroup() {
    return last_selected_group_index;
}

function setLastSelectedGroup(index) {
    last_selected_group_index = index;
}