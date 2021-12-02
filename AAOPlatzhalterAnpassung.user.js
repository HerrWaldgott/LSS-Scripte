// ==UserScript==
// @name         AAOPlatzhalterAnpassung
// @version      1.0.0
// @description  Entfernt zusätzliche Infos in leeren Platzhaltern
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/missions/*
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/AAOPlatzhalterAnpassung.user.js
// ==/UserScript==

(async function() {
    'use strict';

    $('#mission_aao_no_category > div > a').each(function() {
        var $aao = $(this);
        if ($aao.text().includes("Platzhalter")) {
            var id = $aao.attr('id');
            $('#available_' + id).remove();
            $('#aao_timer_' + id.split('_')[1]).remove();

        }
    });
})();
