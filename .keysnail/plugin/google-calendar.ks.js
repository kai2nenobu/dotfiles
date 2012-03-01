// Info

let PLUGIN_INFO =
<KeySnailPlugin>
    <name>Google Calendar</name>
    <description>Google Calendar from KeySnail</description>
    <author>958</author>
    <version>0.0.2</version>
    <updateURL>https://raw.github.com/gist/1599902/google-calendar.ks.js</updateURL>
    <license>MIT</license>
    <include>main</include>
    <detail lang="ja"><![CDATA[
=== 使い方 ===
Google Calendar のイベントを表示したり、簡単なイベントを作成します

==== 認証 ====
エクステ初回実行時に Google アカウントの認証画面が表示されますので "Allow Access" をクリックしてください
認証コードが表示されますので、認証コードをコピーして prompt に貼り付けて Enter してください

==== イベント一覧 ====
エクステ 'google-calendar-show-all-events' を実行すると、Google Calendar 上で表示設定されているカレンダーの全イベントを一覧表示します
また、エクステ 'google-calendar-show-events-on-calendar' を実行すると、選択したカレンダーのイベントを一覧表示します

なお、この際表示されるイベントは本日から10日後のものまでです
これは設定 'google_calendar.show_date' によって変更可能です

==== イベントを作成 ====
* 本プラグインからイベントを作成するには Google Calendar の言語設定が英語になっている必要があります

エクステ 'google-calendar-create-event' を実行すると、イベントを作成することができます
編集権限を持つのカレンダーが複数ある場合は、イベントを追加するカレンダーを選択後、表示されているプロンプトにイベントを入力してください
編集権限を持つ鵜カレンダーが1つしかない場合は、カレンダー選択が表示されませんので、そのままイベントを入力してください

プロンプトに入力した文字列は Google Calendar の Quick Add 機能を使ってポストされます
以下のような形で入力してください
>||
1/23 8:00 hoge
1/24 8:00-9:00 fuga
1/25 foo
1/26-1/27 bar
||<
]]></detail>
</KeySnailPlugin>;

// Option

let pOptions = plugins.setupOptions("google_calendar", {
    "bullet_char": {
        preset: '',
        description: M({
            ja: "一覧内のカレンダーの色を表すビュレットの文字",
            en: "Bullet character in the list"
        })
    },
    "show_date": {
        preset: 10,
        description: M({
            ja: "何日先のイベントまで表示するか",
            en: "The days that display an event"
        })
    },
}, PLUGIN_INFO);

// http://netarrows.edoblog.net/Entry/29/
function dateToRfc3339(aDate){
    function f00(n){
        return (n<10?"0"+n:n);
    }
    function f000(n){
        return (f00(n)<100?"0"+f00(n):f00(n));
    }
    var tz=aDate.getTimezoneOffset();
    var tza=tz<0?"+":"-";
    var tzh=f00(Math.floor(Math.abs(tz/60)));
    var tzm=f00(tz%60);
    return aDate.getFullYear()
              +"-"+f00(aDate.getMonth()+1)
              +"-"+f00(aDate.getDate())
              +"T"+f00(aDate.getHours())
              +":"+f00(aDate.getMinutes())
              +":"+f00(aDate.getSeconds())
              +"."+f000(aDate.getMilliseconds())
              +tza+tzh+":"+tzm;
}

//http://dansnetwork.com/javascript-iso8601rfc3339-date-parser/
function dateFromRfc3339(dString){
    var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;
    var ret = new Date();
    if (dString.toString().match(new RegExp(regexp))) {
        var d = dString.match(new RegExp(regexp));
        var offset = 0;

        ret.setUTCDate(1);
        ret.setUTCFullYear(parseInt(d[1],10));
        ret.setUTCMonth(parseInt(d[3],10) - 1);
        ret.setUTCDate(parseInt(d[5],10));
        ret.setUTCHours(parseInt(d[7],10));
        ret.setUTCMinutes(parseInt(d[9],10));
        ret.setUTCSeconds(parseInt(d[11],10));
        if (d[12])
            ret.setUTCMilliseconds(parseFloat(d[12]) * 1000);
        else
            ret.setUTCMilliseconds(0);
        if (d[13] != 'Z') {
            offset = (d[15] * 60) + parseInt(d[17],10);
            offset *= ((d[14] == '-') ? -1 : 1);
            ret.setTime(ret.getTime() - offset * 60 * 1000);
        }
    }
    else {
        ret.setTime(Date.parse(dString));
        let offset = ret.getTimezoneOffset();
        ret.setTime(ret.getTime() + (offset * 60 * 1000));
    }
    return ret;
}

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

if (!share.googleCalendar)
    share.googleCalendar = {};

let gcal = (function() {

    let pref = {
        __PREF_TOKEN: 'extensions.keysnail.plugins.google_calendar.token',
        get: function(key){
            let ret = null;
            let values = util.getUnicharPref(pref.__PREF_TOKEN, "");
            if (values) {
                values = JSON.parse(values);
                if (values[key])
                    ret = values[key];
            }
            return ret;
        },
        set: function(str){
            util.setUnicharPref(pref.__PREF_TOKEN, str);
        }
    };

    let caches = {
        __CALENDARS: 'gcal_calendars',
        get calendars() {
            return persist.restore(caches.__CALENDARS);
        },
        set calendars(value) {
            persist.preserve(value, caches.__CALENDARS);
        },
    };

    let request = (function() {
        const CLIENT_ID = '642268695744.apps.googleusercontent.com';
        const CLIENT_SECRET = '_ztWghaEScBQCGw1mK9TB0PE';

        const KEY = '***REMOVED***';
        const REST_URI = 'https://www.googleapis.com/calendar/v3/';

        function getAccessToken() {
            let refreshToken = pref.get('refresh_token');

            if (refreshToken) {
                if (!share.googleCalendar.accessToken || !share.googleCalendar.refreshTimer) {
                    util.message('google calendar: refresh_token');
                    let xhr = util.httpPost('https://accounts.google.com/o/oauth2/token',
                        {
                            'client_id': CLIENT_ID,
                            'client_secret': CLIENT_SECRET,
                            'refresh_token': refreshToken,
                            'grant_type': 'refresh_token'
                        }
                    );
                    util.message('google calendar: refresh_token result=' + xhr.responseText);
                    let result = JSON.parse(xhr.responseText);
                    share.googleCalendar.refreshTimer = setTimeout(
                                    function() delete share.googleCalendar.refreshTimer,
                                    (result['expires_in'] - 10) * 1000);
                    share.googleCalendar.accessToken = result['access_token'];
                }
                return share.googleCalendar.accessToken;
            } else {
                authorization();
            }
        }

        function authorization() {
            if (share.googleCalendar.refreshTimer)
                clearTimeout(share.googleCalendar.refreshTimer);

            gBrowser.loadOneTab("https://accounts.google.com/o/oauth2/auth?redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/calendar&response_type=code&" +
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
                            display.notify("Google calendar authorization success.");
                            pref.set(xhr.responseText);
                            let result = JSON.parse(xhr.responseText);
                            share.googleCalendar.refreshTimer = setTimeout(
                                            function() share.googleCalendar.refreshTimer = null,
                                            (result['expires_in'] - 10) * 1000);
                            share.googleCalendar.accessToken = result['access_token'];
                        } else {
                            display.notify("Failed to get access token : " + xhr.responseText);
                            inputCode();
                        }
                    }
                );
            }
            return null;
        }

        function requestGet(endPoint, params, onSuccess, onError, useApiKey) {
            let url = REST_URI + endPoint;
            for (let i in params) {
                if (params[i])
                    params[i] = encodeURIComponent(params[i]);
                else
                    delete params[i];
            }
            if (useApiKey)
                params['key'] = KEY;
            else
                params['oauth_token'] = getAccessToken();

            url += '?' + util.paramsToString(params)
            util.httpGet(url, false, function(xhr) {
                if (xhr.status == 200) {
                    if (onSuccess) onSuccess(JSON.parse(xhr.responseText));
                } else {
                    if (onError) onError(JSON.parse(xhr.responseText));
                }
            });
        }

        function requestPostUseQuery(endPoint, params, onSuccess, onError) {
            let url = REST_URI + endPoint;
            for (let i in params) {
                if (params[i])
                    params[i] = encodeURIComponent(params[i]);
                else
                    delete params[i];
            }
            params['oauth_token'] = getAccessToken();

            url += '?' + util.paramsToString(params)
            util.httpPost(url, {}, function(xhr) {
                if (xhr.status == 200) {
                    if (onSuccess) onSuccess(JSON.parse(xhr.responseText));
                } else {
                    if (onError) onError(JSON.parse(xhr.responseText));
                }
            });
        }

        let self = {
            authorization: authorization,
            get isAuthorized() {
                return !!pref.get('refresh_token');
            },
            get accessToken() {
                return getAccessToken();
            },

            get: requestGet,
            postQuery: requestPostUseQuery,
        };
        return self;
    })();

    let api = (function() {
        function colorsList(callback) {
            request.get('colors', {},
                function(res) callback(res),
                function(res) display.echoStatusBar('colorList :' + res.error.message),
                true
            );
        }

        function calendarList(callback) {
            request.get('users/me/calendarList', {},
                function(res) callback(res),
                function(res) display.echoStatusBar('calendarList :' + res.error.message)
            );
        }

        function eventsList(id, params, callback) {
            request.get('calendars/' + encodeURIComponent(id) + '/events',
                params,
                function(res) callback(res),
                function(res) display.echoStatusBar('eventsList :' + res.error.message)
            );
        }

        function quickAdd(id, text, callback) {
            request.postQuery('calendars/' + encodeURIComponent(id) + '/events/quickAdd',
                { text: text },
                function(res) callback(res),
                function(res) display.echoStatusBar('quickAdd :' + res.error.message)
            );
        }

        let self = {
            colorsList: colorsList,
            calendarList: calendarList,
            eventsList: eventsList,
            quickAdd: quickAdd,
        };
        return self;
    })();

    function createCalendarObj(item) {
        return {
            updateEvents: function(callback) {
                let now = new Date();
                now.setHours(0);
                now.setMinutes(0);
                now.setSeconds(0);
                let max = new Date();
                max.setDate(now.getDate() + pOptions['show_date'])
                let self = this;
                api.eventsList(this.id,
                    {
                        timeMax: dateToRfc3339(max),
                        timeMin: dateToRfc3339(now),
                        singleEvents: 'True'
                    },
                    function(res) {
                        self.events = res.items || [];
                        callback(self.events)
                    }
                );
            },

            quickAdd: function(text, callback) {
                api.quickAdd(this.id, text, callback);
            },

            id: item.id,
            defaultReminders: item.defaultReminders,
            isWritable: (item.accessRole == 'owner' || item.accessRole == 'writer'),
            events: [],
            summary: item.summary,
            selected: item.selected,
            color: item.color,
        };
    };

    function updateCalendars(callback) {
        util.message('google calendar: updateCalendars');
        api.colorsList(function(res) {
            let colors = res.calendar;
            api.calendarList(function(res) {
                if (res && res.items) {
                    let calendars = res.items.map(function(cal) {
                        let temp = {};
                        for each (let [i, v] in Iterator(cal))
                            temp[i] = v;
                        temp['color'] = colors[cal.colorId];
                        return temp;
                    });
                    caches.calendars = calendars;
                    share.googleCalendar.calendars = calendars.map(function(item) createCalendarObj(item));
                    if (callback) callback(share.googleCalendar.calendars);
                }
            });
        });
    }

    function getCalendars(callback) {
        let calendars = share.googleCalendar.calendars;
        if (!calendars) {
            calendars = caches.calendars;
            if (calendars)
                calendars = share.googleCalendar.calendars = calendars.map(function(item) createCalendarObj(item));
        }
        if (calendars)
            callback(calendars);
        else
            updateCalendars(callback);
    }

    function showCalendars(writableOnly, showUnSelected, callback) {
        getCalendars(function(calendars) {
            calendars = ((writableOnly) ? calendars.filter(function(cal) cal.isWritable) : calendars);
            calendars = ((!showUnSelected) ? calendars.filter(function(cal) cal.selected) : calendars);

            if (calendars.length == 1) {
                callback(calendars[0]);
                return;
            }

            let collection = calendars
                .map(function(cal) {
                    return [
                        pOptions['bullet_char'],
                        cal.summary,
                        cal
                    ];
                });

            prompt.selector({
                message   : 'calendars :',
                collection: collection,
                header    : ['', 'Summary'],
                flags     : [0, 0, HIDDEN|IGNORE],
                width     : [0, 100],
                stylist   : function (args, n, current) {
                    let style = "";
                    let cal = args[2];
                    if (n == 0) {
                        style += 'text-align:center;color:' + cal.color.foreground + ';background-color:' + cal.color.background + ';';
                        if (!cal.isWritable)
                            style += 'background-image:url("https://calendar.google.com/googlecalendar/images/ro_25.png"); background-repeat:repeat;';
                    }
                    if (!cal.selected)
                        style += 'opacity: 0.5;';
                    return style;
                },
                callback  : function(aIndex) callback(collection[aIndex][2])
            });
        });
    }

    function updateEvents(updateUnSelected, callback) {
        util.message('google calendar: updateEvents');
        getCalendars(function(calendars) {
            let count = 0;
            ((updateUnSelected) ? calendars : calendars.filter(function(cal) cal.selected)).
                forEach(function(cal, i, array) {
                    cal.updateEvents(function() {
                        count++;
                        if (count >= array.length)
                            if (callback) callback(calendars);
                    });
                });
        });
    }

    function showEvents(calendar, showUnSelected) {
        if (calendar) {
            calendar.updateEvents(function() {
                let collection = eventsToCollection(calendar);
                showSelector(collection);
            });
        } else {
            updateEvents(showUnSelected, function(calendars) {
                let collection = [];
                ((showUnSelected) ? calendars : calendars.filter(function(cal) cal.selected)).
                    forEach(function(cal) {
                        Array.prototype.push.apply(collection, eventsToCollection(cal));
                    });
                showSelector(collection);
            });
        }

        function eventsToCollection(calendar) {
            return calendar.events.map(function(ev) {
                let isDayEvent = (ev.start.date);
                let startTime = dateFromRfc3339(ev.start.date || ev.start.dateTime);
                let endTime = dateFromRfc3339(ev.end.date || ev.end.dateTime);
                if (isDayEvent)
                    endTime.setDate(endTime.getDate() - 1);
                return [
                    pOptions['bulletChar'],
                    ev.summary,
                    calendar.summary,
                    (!isDayEvent) ? startTime.toLocaleString() : startTime.toLocaleDateString(),
                    (!isDayEvent) ? endTime.toLocaleString() : endTime.toLocaleDateString(),
                    ev.htmlLink,
                    calendar.color,
                    calendar.isWritable,
                    calendar.selected,
                    startTime,
                ];
            });
        }

        function showSelector(collection) {
            if (collection.length == 0) {
                display.echoStatusBar('No event');
                return;
            }

            collection.sort(function (a, b) a[9] - b[9]);
            prompt.selector({
                message   : 'events :',
                collection: collection,
                header    : ['', 'Summary', 'Calendar', 'Start', 'End'],
                flags     : [0, 0, 0, 0, 0, HIDDEN|IGNORE, HIDDEN|IGNORE, HIDDEN|IGNORE, HIDDEN|IGNORE, HIDDEN|IGNORE],
                width     : [0, 30, 40, 15, 15],
                stylist   : function (args, n, current) {
                    let style = "";
                    if (n == 0) {
                        style += 'text-align:center; color:' + args[6].foreground + ';background-color:' + args[6].background + ';';
                        if (!args[7])
                            style += 'background-image:url("https://calendar.google.com/googlecalendar/images/ro_25.png"); background-repeat:repeat;';
                    }
                    if (!args[8])
                        style += 'opacity: 0.5;';
                    return style;
                },
                callback  : function(aIndex) openUILinkIn(collection[aIndex][5], 'tab')
            });
        }
    }

    function createEvent(calendar) {
        prompt.read(
            'New event :',
            function(str) {
                if (str)
                    calendar.quickAdd(str, function() display.echoStatusBar('Done.'));
            }
        );
    }

    let self = {
        showEvents: function(arg){
            if (!request.isAuthorized)
                request.authorization();
            else
                showEvents(null, arg);
        },

        showEventsOnCalendar: function(arg){
            if (!request.isAuthorized)
                request.authorization();
            else
                showCalendars(false, arg, showEvents);
        },

        updateCalendars: function(arg){
            if (!request.isAuthorized)
                request.authorization();
            else
                updateCalendars(function() display.echoStatusBar('Done.'));
        },

        createEvent: function(arg){
            if (!request.isAuthorized)
                request.authorization();
            else
                showCalendars(true, arg, createEvent);
        },

        reAuth: function(arg){
            pref.set('{}');
            delete share.googleCalendar.current;
            delete share.googleCalendar.accessToken;
            request.authorization();
        }
    };

    return self;
})();

// Add ext

plugins.withProvides(function (provide) {
    provide("google-calendar-show-all-events",
        function (ev, arg) {
            gcal.showEvents(arg);
        },
        M({en:'Google Calendar - Show all events', ja:'Google Calendar - 全てのイベント一覧'}));
    provide("google-calendar-show-events-on-calendar",
        function (ev, arg) {
            gcal.showEventsOnCalendar(arg);
        },
        M({en:'Google Calendar - Show events on calendar', ja:'Google Calendar - カレンダーのイベント一覧'}));
    provide("google-calendar-update-calendars",
        function (ev, arg) {
            gcal.updateCalendars(arg);
        },
        M({en:'Google Calendar - Update calendars', ja:'Google Calendar - カレンダーキャッシュを更新'}));
    provide("google-calendar-create-event",
        function (ev, arg) {
            gcal.createEvent(arg);
        },
        M({en:'Google Calendar - Create new event', ja:'Google Calendar - イベントを作成'}));
    provide("google-calendar-reauth",
        function (ev, arg) {
            gcal.reAuth(arg);
        },
        M({en:'Google Calendar - Reauthorize', ja:'Google Calendar - 再認証'}));
}, PLUGIN_INFO);
