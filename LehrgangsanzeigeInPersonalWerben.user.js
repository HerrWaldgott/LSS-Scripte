// ==UserScript==
// @name         LehrgangsanzeigeInPersonalWerben
// @version      1.2.0
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

        var $data = await new Promise(resolve => {
            let $tmp = $.get($buildingHeader.attr("href"));
            setTimeout(function(){ resolve($tmp); }, 300);
        }).then(function(value) {
            return (value);
        });

        var $panelBody = $($.parseHTML($data));
        var $tableBody = $($panelBody.find("tbody")[0]);
        var currCount = 0;
        var allSchooling = [];
        var countAllPersonnel = 0;
        $tableBody.find('tr').each(function() {
            var $row = $(this);
            countAllPersonnel++;
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
        var tmp = `<span class="label label-default" style="margin-right: 2px;">`;
        tmp += countAllPersonnel + " Angestellte";
        tmp += "</span>";
        appendStr += tmp;
        appendStr += '</div>';
        $buildingHeader.append(appendStr);

    });
})();
