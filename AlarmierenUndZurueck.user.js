// ==UserScript==
// @name         AlarmierenUndZurueck
// @version      1.1.1
// @description  Erstellt einen Knopf zum Alarmieren und zum vorherigen Einsatz springen
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/missions/*
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/AlarmierenUndZurueck.user.js
// ==/UserScript==

(function() {
    'use strict';

    $('#mission_alarm_btn').after(`
        <a href="#" class="btn btn-success navbar-btn hidden-xs btn-sm alert_back" id="alert_back_btn" title="Alarmieren und zurück"></a>
    `);
    var path = "";
    if (sessionStorage.redirectMission) {
        path = sessionStorage.redirectMission;
        sessionStorage.setItem('redirectMission', "");
    }

    if (path != "") {
        window.location.replace(path);
    }
    if ($('#mission_previous_mission_btn').attr('class').split(/\s+/).includes('btn-default')){
        document.getElementById('alert_back_btn').classList.add('btn-default');
        document.getElementById('alert_back_btn').classList.remove('btn-success');
        document.getElementById('alert_back_btn').innerHTML = '<img src="https://img.icons8.com/ios-filled/18/000000/phone.png"/> <span class="glyphicon glyphicon-arrow-left"></span>';
    } else {
        document.getElementById('alert_back_btn').innerHTML = '<img class="icon icons8-Phone-Filled" src="/images/icons8-phone_filled.svg" width="18" height="18"> <span class="glyphicon glyphicon-arrow-left"></span>';
        $(".alert_back").click(async function(){
            showLoading();
            await new Promise(resolve => {
                setTimeout(function() { $("#mission-form").submit(); sessionStorage.setItem('redirectMission', $('#mission_previous_mission_btn').attr('href')); }, 10);
            }).then(function(value) {

            });

            return false;
        });
    }
})();
