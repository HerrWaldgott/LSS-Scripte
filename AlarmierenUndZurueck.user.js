// ==UserScript==
// @name         AlarmierenUndZurueck
// @version      1.0.0
// @description  Erstellt einen Knopf zum Alarmieren und zum vorherigen Einsatz springen
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/missions/*
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/blob/main/AlarmierenUndZurueck.user.js
// ==/UserScript==

(function() {
    'use strict';

    $('#mission_alarm_btn').after(`
        <a href="#" class="btn btn-success navbar-btn hidden-xs btn-sm alert_back" id="alert_back_btn" title="Alarmieren und zurück"><img class="icon icons8-Phone-Filled" src="/images/icons8-phone_filled.svg" width="18" height="18"> <span class="glyphicon glyphicon-arrow-left"></span></a>
    `);
    var path = "";
    if (sessionStorage.redirectMission) {
        path = sessionStorage.redirectMission;
        sessionStorage.setItem('redirectMission', "");
    }

    if (path != "") {
        window.location.replace(path);
    }

    $(".alert_back").click(async function(){
        showLoading();
        await new Promise(resolve => {
            setTimeout(function() { $("#mission-form").submit(); sessionStorage.setItem('redirectMission', $('#mission_previous_mission_btn').attr('href')); }, 10);
        }).then(function(value) {

        });

        return false;
    });
})();
