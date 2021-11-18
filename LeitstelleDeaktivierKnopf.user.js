// ==UserScript==
// @name         LeitstelleDeaktivierKnopf
// @version      1.0.0
// @description  Erstellt einen Knopf zum deaktivieren einer Leitstelle
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/buildings/*
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/LeitstelleDeaktivierKnopf.user.js
// ==/UserScript==

(function() {
    'use strict';

    if ($('#tabs').length && $('#tabs').html().includes('patrol')) {
        var buildingID = (window.location.href.split("/")[4]);

        var active = ($('.building-title > .disabled-dispatch-alert').length == 0);
        if ($('.building-title > .disabled-dispatch-alert').length) {
            $('.building-title > .disabled-dispatch-alert').css("display", "none");
        }

        if (active) {
            $('dl.dl-horizontal').append(`
            <dt><strong>Generiert Einsätze:</strong></dt>
            <dd><a href="/buildings/` + buildingID + `/active" id="btnDeactivate" class="btn btn-xs btn-success">Aktiviert</a></dd>
            `);
        }
        else {
            $('dl.dl-horizontal').append(`
            <dt><strong>Generiert Einsätze:</strong></dt>
            <dd><a href="/buildings/` + buildingID + `/active" id="btnDeactivate" class="btn btn-xs btn-danger">Nicht Aktiviert</a></dd>
            `);
        }
    }
})();
