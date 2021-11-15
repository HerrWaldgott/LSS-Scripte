// ==UserScript==
// @name         DatumNebenEinsatz
// @version      1.0.2
// @description  Erstelldatum des Einsatzes in Einsatzliste anzeigen
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/blob/main/DatumNebenEinsatz.user.js
// ==/UserScript==

(async function() {
    'use strict';
    
    $('#mission_list_sicherheitswache > .missionSideBarEntry, #mission_list_krankentransporte > .missionSideBarEntry, #mission_list > .missionSideBarEntry').each(async function(){
        var $this = $(this);
        var $attributes = $this[0].attributes;
        var missionId = +($attributes).mission_id.value;
        await new Promise(resolve => {
          $.get("https://www.leitstellenspiel.de/missions/" + missionId, function (data, status) {
                var parser = new DOMParser();
                var htmlDoc = parser.parseFromString(data, 'text/html');
                var div = htmlDoc.getElementById('mission_general_info');
                var date = div.getAttribute('data-generation-time');
                const generateDate = new Date(date);
                var dd = String(generateDate.getDate()).padStart(2, '0');
                var mm = String(generateDate.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = generateDate.getFullYear();
                var hour = String(generateDate.getHours()).padStart(2, "0");
                var minute = String(generateDate.getMinutes()).padStart(2, "0");
                var second = String(generateDate.getSeconds()).padStart(2, "0");

                var d = dd + '.' + mm + '.' + yyyy + " - " + hour + ":" + minute + ":" + second;

                var id = "mission_panel_heading_" + missionId;
                $('#' + id).append("<small> (" + d + ")</span>");
                window.setTimeout(resolve, 100);
            });
        });
    });
})();
