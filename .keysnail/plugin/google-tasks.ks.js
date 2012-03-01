// Info

let PLUGIN_INFO =
<KeySnailPlugin>
    <name>Google Tasks</name>
    <description>Google Tasks from KeySnail</description>
    <author>958</author>
    <version>0.0.2</version>
    <updateURL>https://gist.github.com/raw/970125/google-tasks.ks.js</updateURL>
    <iconURL>https://sites.google.com/site/958site/Home/files/google-tasks.ks.png</iconURL>
    <license>MIT</license>
    <include>main</include>
    <detail lang="ja"><![CDATA[
=== 使い方 ===
Google Tasks を表示・編集します

=== 認証 ===
エクステ初回実行時に Google アカウントの認証画面が表示されますので "Allow Access" をクリックしてください

すると、コードが表示されますので、コードをコピーして prompt に貼り付けて Enter してください

これで認証は完了です

=== 設定 ===
キーマップをカスタマイズしたい場合は、以下のように
>|javascript|
//タスク一覧のキーマップ
plugins.settings['google_tasks.tasks_keymap'] = {
    "C-z"   : "prompt-toggle-edit-mode",
    "SPC"   : "prompt-next-page",
    "b"     : "prompt-previous-page",
    "j"     : "prompt-next-completion",
    "k"     : "prompt-previous-completion",
    "g"     : "prompt-beginning-of-candidates",
    "G"     : "prompt-end-of-candidates",
    "q"     : "prompt-cancel",
    // google tasks  specific actions
    "n"     : "create",
    "t"     : "toggle-status",
    "e"     : "edit",
    "d"     : "delete",
    "s"     : "select-task-list"
};

//タスクリスト選択画面のキーマップ
plugins.options['google_tasks.task_list_keymap'] = {
    "C-z"   : "prompt-toggle-edit-mode",
    "SPC"   : "prompt-next-page",
    "b"     : "prompt-previous-page",
    "j"     : "prompt-next-completion",
    "k"     : "prompt-previous-completion",
    "g"     : "prompt-beginning-of-candidates",
    "G"     : "prompt-end-of-candidates",
    "q"     : "prompt-cancel",
    // google tasks  specific actions
    "s"     : "select-task-list",
    "t"     : "show-tasks",
    "n"     : "create-task"
};
||<
]]></detail>
</KeySnailPlugin>;

// Option

let pOptions = plugins.setupOptions("google_tasks", {
    "tasks_keymap": {
        preset: {
            "C-z"   : "prompt-toggle-edit-mode",
            "SPC"   : "prompt-next-page",
            "b"     : "prompt-previous-page",
            "j"     : "prompt-next-completion",
            "k"     : "prompt-previous-completion",
            "g"     : "prompt-beginning-of-candidates",
            "G"     : "prompt-end-of-candidates",
            "q"     : "prompt-cancel",
            // google tasks  specific actions
            "n"     : "create",
            "t"     : "toggle-status",
            "e"     : "edit",
            "d"     : "delete",
            "s"     : "select-task-list"
        },
        description: M({
            ja: "タスク一覧の操作用キーマップ",
            en: "Local keymap for tasks"
        })
    },
    "task_list_keymap": {
        preset: {
            "C-z"   : "prompt-toggle-edit-mode",
            "SPC"   : "prompt-next-page",
            "b"     : "prompt-previous-page",
            "j"     : "prompt-next-completion",
            "k"     : "prompt-previous-completion",
            "g"     : "prompt-beginning-of-candidates",
            "G"     : "prompt-end-of-candidates",
            "q"     : "prompt-cancel",
            // google tasks  specific actions
            "s"     : "select-task-list",
            "t"     : "show-tasks",
            "n"     : "create-task"
        },
        description: M({
            ja: "タスクリスト選択画面の操作用キーマップ",
            en: "Local keymap for task list"
        })
    },
}, PLUGIN_INFO);

// Main

let gPrompt = {
    get visible() !document.getElementById("keysnail-prompt").hidden,
    forced : false,
    close  : function () {
        if (!gPrompt.forced)
            return;

        gPrompt.forced = false;

        if (gPrompt.visible)
            prompt.finish(true);
    }
};

if (!share.googleTasks)
    share.googleTasks = {};

let googleTasks = (function() {
    const CLIENT_ID = '29409684772.apps.googleusercontent.com';
    const CLIENT_SECRET = '5lXWWIEnc-ngUpTjDPGXQWjG';

    const CHECK_ICON = 'data:image/png;base64,'+
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANElEQVQ4y2NgGFnAN2fGfxCmSDNZ'+
        'hqBrJskAkjSjKyBLMz5MslNJ9jNFmqkSXVRJMEMPAABm3XhBteLZ7QAAAABJRU5ErkJggg==';

    let settings = {
        PREF_TOKEN: 'extensions.keysnail.plugins.google_tasks.token',
        get: function(key){
            let ret = null;
            let values = util.getUnicharPref(settings.PREF_TOKEN, "");
            if (values) {
                values = JSON.parse(values);
                if (values[key])
                    ret = values[key];
            }
            return ret;
        },
        set: function(str){
            util.setUnicharPref(settings.PREF_TOKEN, str);
        }
    };

    function getAccessToken() {
        let refreshToken = settings.get('refresh_token');

        if (refreshToken) {
            if (!share.googleTasks.accessToken || !share.googleTasks.refreshTimer) {
                util.message('google tasks: refresh_token');
                let xhr = util.httpPost('https://accounts.google.com/o/oauth2/token',
                    {
                        'client_id': CLIENT_ID,
                        'client_secret': CLIENT_SECRET,
                        'refresh_token': refreshToken,
                        'grant_type': 'refresh_token'
                    }
                );
                util.message('google tasks: refresh_token result=' + xhr.responseText);
                let result = JSON.parse(xhr.responseText);
                share.googleTasks.refreshTimer = setTimeout(
                                function() delete share.googleTasks.refreshTimer,
                                (result['expires_in'] - 10) * 1000);
                share.googleTasks.accessToken = result['access_token'];
            }
            return share.googleTasks.accessToken;
        }

        if (share.googleTasks.refreshTimer)
            clearTimeout(share.googleTasks.refreshTimer);

        gBrowser.loadOneTab("https://accounts.google.com/o/oauth2/auth?redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/tasks&response_type=code&" +
            "client_id=" + CLIENT_ID,
            null, null, null, false);
        inputCode();

        function inputCode() {
            gPrompt.close();
            prompt.read(
                M({
                    ja: '画面上に表示されているコードを入力して ENTER を押してください :',
                    en: 'Enter the code shown on the screen please press ENTER :'
                }),
                function (str) {
                    if (str === null)
                        return;

                    let xhr = util.httpPost('https://accounts.google.com/o/oauth2/token',
                        {
                            'client_id': CLIENT_ID,
                            'client_secret': CLIENT_SECRET,
                            'code': str,
                            'redirect_uri': 'urn:ietf:wg:oauth:2.0:oob',
                            'grant_type': 'authorization_code'
                        }
                    );
                    if (xhr.status == 200) {
                        display.notify("Google tasks authorization success.");
                        settings.set(xhr.responseText);
                        let result = JSON.parse(xhr.responseText);
                        share.googleTasks.refreshTimer = setTimeout(
                                        function() share.googleTasks.refreshTimer = null,
                                        (result['expires_in'] - 10) * 1000);
                        share.googleTasks.accessToken = result['access_token'];
                    } else {
                        display.notify("Failed to get access token : " + xhr.responseText);
                        inputCode();
                    }
                }
            );
        }

        return null;
    }

    function selectTaskList(callback) {
        let token = getAccessToken();
        if (!token) return;

        util.message('google tasks: selectTaskList');
        let url = 'https://www.googleapis.com/tasks/v1/users/@me/lists?oauth_token=' + token;
        util.httpGet(url, false, function(xhr) {
            let taskList = JSON.parse(xhr.responseText);
            let collection = taskList.items.map(function(item) [item.title]);
            util.message('google tasks: selectTaskList result = ' + collection);

            if (collection.length == 1 && callback) {
                share.googleTasks.current = taskList.items[0];
                callback(taskList.items[0])
            } else {
                prompt.selector({
                    message    : "Select tasklist:",
                    collection : collection,
                    keymap     : pOptions['task_list_keymap'],
                    actions    : [
                        [ function(index) {
                            share.googleTasks.current = taskList.items[index];
                            if (callback) callback(taskList.items[index])
                          }, M({en:'Select task list', ja:'タスクリストを選択'}),
                          'select-task-list' ],
                        [ function(index) {
                            share.googleTasks.current = taskList.items[index];
                            showTasks(share.googleTasks.current);
                          }, M({en:'Show tasks in selected task list', ja:'選択したタスクリストのタスク一覧を表示'}),
                          'show-tasks' ],
                        [ function(index) {
                            share.googleTasks.current = taskList.items[index];
                            createTask(share.googleTasks.current);
                          }, M({en:'Create task in selected task list', ja:'選択したタスクリストにタスクを作成'}),
                          'create-task' ]
                    ]
                });
            }
        });
    }

    function requestCreateTask(list, task, callback) {
        let token = getAccessToken();
        if (!token) return;

        let url = 'https://www.googleapis.com/tasks/v1/lists/' + list.id + '/tasks?oauth_token=' + token;
        let params = JSON.stringify({ title: task.title, notes: task.notes });
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (callback) callback(xhr.status);
            }
        };
        xhr.send(params);
    }

    function requestUpdateTask(list, task, callback) {
        let token = getAccessToken();
        if (!token) return;

        let url = 'https://www.googleapis.com/tasks/v1/lists/' + list.id + '/tasks/' + task.id + '?oauth_token=' + token;
        let params = JSON.stringify(task);
        let xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (callback) callback(xhr.status);
            }
        };
        xhr.send(params);
    }

    function requestDeleteTask(list, task, callback) {
        let token = getAccessToken();
        if (!token) return;

        let url = 'https://www.googleapis.com/tasks/v1/lists/' + list.id + '/tasks/' + task.id + '?oauth_token=' + token;
        let params = JSON.stringify(task);
        let xhr = new XMLHttpRequest();
        xhr.open("DELETE", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (callback) callback(xhr.status);
            }
        };
        xhr.send(null);
    }

    function showTasks(list) {
        let token =  getAccessToken();
        if (!token) return;

        let url = 'https://www.googleapis.com/tasks/v1/lists/' + list.id + '/tasks?oauth_token=' + token;
        util.httpGet(url, false, function(xhr) {
            let tasks = JSON.parse(xhr.responseText);

            if (!tasks.items) {
                display.echoStatusBar('No tasks');
                return;
            }

            let collection = tasks.items.map(
                    function(item) [item.status=='completed' ? CHECK_ICON : null, item.title, item.notes]);

            prompt.selector({
                message    : "Tasks:",
                collection : collection,
                flags      : [ICON | IGNORE, 0, 0],
                header     : ['Title', 'Notes'],
                style      : [0, style.prompt.description],
                width      : [30, 70],
                keymap     : pOptions['tasks_keymap'],
                stylist    : function (args, n, current) {
                    let style = "";
                    if (args[0] != null) {
                        style += 'text-decoration: line-through;';
                    }
                    return style;
                },
                actions    : [
                    [ function(){
                          createTask(share.googleTasks.current);
                      }, M({en:'Create task', ja:'タスクを作成'}), 'create' ],
                    [ selectTaskList
                      , M({en:'Select task list', ja:'タスクリストを選択'}), 'select-task-list' ],
                    [ function(index) {
                          let task = tasks.items[index];
                          prompt.read(
                              'Title:',
                              function(title){
                                  if (title.length == 0) return;
                                  prompt.read(
                                      'Notes:',
                                      function(notes){
                                          task.title = title;
                                          task.notes = notes;
                                          requestUpdateTask(list, task, function(status){
                                              if (status == 200) {
                                                  display.echoStatusBar('Update task: ' + title);
                                              } else {
                                                  display.echoStatusBar('Error: ' + status);
                                              }
                                          });
                                      },
                                      undefined, undefined, task.notes
                                  );
                              },
                              undefined, undefined, task.title
                          );
                      }, M({en:'Edit', ja:'タスクを編集'}), 'edit' ],
                    [ function(index) {
                          let task = tasks.items[index];
                          if (task.status == 'completed') {
                              task.status = 'needsAction';
                              delete task.completed;
                              collection[index][0] = null;
                          } else {
                              task.status = 'completed';
                              collection[index][0] = CHECK_ICON;
                          }
                          requestUpdateTask(list, task, function(status){
                              prompt.refresh();
                              if (status == 200) {
                                  display.echoStatusBar('Update task: ' + task.title);
                              } else {
                                  display.echoStatusBar('Error: ' + status);
                              }
                          });
                      }, M({en:'Toggle status', ja:'完了状態を変更'}), 'toggle-status,c' ],
                    [ function(index) {
                          let task = tasks.items[index];
                          requestDeleteTask(list, task, function(status) {
                              tasks.items.splice(index, 1);
                              collection.splice(index, 1);
                              prompt.refresh();
                              if (status == 204) {
                                  display.echoStatusBar('Delete task: ' + task.title);
                              } else {
                                  display.echoStatusBar('Error: ' + status);
                              }
                          });
                      }, M({en:'Delete', ja:'タスクを削除'}), 'delete,c' ]
                ]
            });
        });
    }

    function createTask(list) {
        prompt.read(
            'Title:',
            function(title){
                if (title.length == 0) return
                prompt.read(
                    'Notes:',
                    function(notes){
                        requestCreateTask(list, {title: title, notes: notes}, function(status) {
                            if (status == 200) {
                                display.echoStatusBar('Created task: ' + title);
                            } else {
                                display.echoStatusBar('Error: ' + status);
                            }
                        });
                    }
               );
            }
        );
    }

    let self = {
        selectTaskList: function(arg){
            selectTaskList();
        },

        showTasks: function(arg){
            if (arg || share.googleTasks.current == undefined)
                selectTaskList(showTasks);
            else
                showTasks(share.googleTasks.current);
        },

        createTask: function(arg){
            if (share.googleTasks.current == undefined)
                selectTaskList(createTask);
            else
                createTask(share.googleTasks.current);
        },

        reAuth: function(arg){
            settings.set('{}');
            delete share.googleTasks.current;
            delete share.googleTasks.accessToken;
            getAccessToken();
        }
    };

    return self;
})();

// Add ext

plugins.withProvides(function (provide) {
    provide("google-tasks-select-task-list",
        function (ev, arg) {
            googleTasks.selectTaskList(arg);
        },
        M({en:'Google Tasks - Select task list', ja:'Google Tasks - タスクリストを選択'}));
    provide("google-tasks-show-tasks",
        function (ev, arg) {
            googleTasks.showTasks(arg);
        },
        M({en:'Google Tasks - Show tasks', ja:'Google Tasks - タスク一覧を表示'}));
    provide("google-tasks-create",
        function (ev, arg) {
            googleTasks.createTask(arg);
        },
        M({en:'Google Tasks - Create new tasks', ja:'Google Tasks - 新しいタスクを作成'}));
    provide("google-tasks-reauth",
        function (ev, arg) {
            googleTasks.reAuth(arg);
        },
        M({en:'Google Tasks - Reauthorize', ja:'Google Tasks - 再認証'}));
}, PLUGIN_INFO);
