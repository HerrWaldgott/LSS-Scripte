// ==UserScript==
// @name         LehrgangsanzeigeInPersonalWerben
// @version      1.0.0
// @description  Zeigt in dem Bereich zum Verschieben von Personal die Anzahl der Lehrgänge pro Wache an
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/buildings/*/hire
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/LehrgangsanzeigeInPersonalWerben.user.js
// ==/UserScript==

(async function() {
    'use strict';

    $('div.panel').each(async function(){
        var $building = $(this);
        var $buildingHeader = $($building.find("div.panel-heading")[0]);
        var buildingID = $buildingHeader.attr("building_id");
        console.log(buildingID);


        await new Promise(resolve => {
            $.get($buildingHeader.attr("href"), function(data) {
                var panelBody = $(".panel-body[building_id='" + buildingID + "']");
                panelBody.html(data);
            });
            window.setTimeout(resolve, 1000);
        });

        var $tableBody = $($($($building.find('div.panel-body')[0]).find('table')[0]).find('tbody')[0]);
        var currCount = 0;
        var allSchooling = [];
        $tableBody.find('tr').each(function() {
            var $row = $(this);
            var schoolings = $($row.find('td[id^="school_personal_education"]')[0]).text().replace(/\s/g, "").split(',');
            schoolings.forEach(s => {
                if (s != "") {
                    allSchooling.push(s);
                }
            });
        });

        var occ = allSchooling.reduce(function (acc, curr) {
            return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
        }, {});

        var appendStr = '<div class="pull-right">';
        for (const [key, value] of Object.entries(occ)) {
            var tmp = `<span class="label label-success" style="margin-right: 2px;">`;
            tmp += value + "x " + key;
            tmp += "</span>";
            appendStr += tmp;
        }
        appendStr += '</div>';
        $buildingHeader.append(appendStr);

    });
})();