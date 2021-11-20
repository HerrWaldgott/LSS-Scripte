// ==UserScript==
// @name         AutoAuswahlSchule
// @version      1.1.1
// @description  automatisches Auswählen für Lehrgänge (max Personen mit Lehrgang pro Wache)
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/buildings/*
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/AutoAuswahlSchule.user.js
// ==/UserScript==

(async function() {
    'use strict';

    await $.getScript("https://api.lss-cockpit.de/lib/utf16convert.js");

    if (!sessionStorage.cBuildings || JSON.parse(sessionStorage.cBuildings).lastUpdate < (new Date().getTime() - 5 * 1000 * 60) || JSON.parse(sessionStorage.cBuildings).userId != user_id) {
        await $.getJSON('/api/buildings').done(data => sessionStorage.setItem('cBuildings', JSON.stringify({ lastUpdate: new Date().getTime(), value: LZString.compressToUTF16(JSON.stringify(data)), userId: user_id })));
    }
    var cBuildings = JSON.parse(LZString.decompressFromUTF16(JSON.parse(sessionStorage.cBuildings).value));

    if (!sessionStorage.aSchoolings || JSON.parse(sessionStorage.aSchoolings).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) {
        await $.getJSON('https://proxy.lss-manager.de/v4/api/de_DE/schoolings.json').done(data => sessionStorage.setItem('aSchoolings', JSON.stringify({ lastUpdate: new Date().getTime(), value: data })));
    }

    var buildingID = (window.location.href.split("/")[4]).replace("#", "");
    var building = cBuildings.filter(b => b.id == buildingID)[0];

    if ((building.building_type == 1 || building.building_type == 3 || building.building_type == 8 || building.building_type == 10) && window.location.href == "https://www.leitstellenspiel.de/buildings/" + buildingID){
        $('#navbar-building-schooling-collapse').append(`
            <div class="navbar-text navbar-right">
                <p style="display: inline-block">Max. Personal / Wache:</p>
                <input style="display:inline-block; color: #000; width:50px;" type="number" id="maxPerBuilding" min="1" value="1"></input>
                <a id="btnAutoSelect" class="btn btn-success">Auswählen</a>
                <input id="noEduc" name="noEduc" type="checkbox">
                <label class="" for="noEduc">nur Personal ohne Ausbildung</label>
            </div>
        `);

        $('#accordion > div > div.personal-select-heading').each(function() {
            var $this = $(this);
            $this.click();
            $this.click();
        });

        $('#btnAutoSelect').on('click', function() {
            var aSchoolings = JSON.parse(sessionStorage.aSchoolings).value;
            var education_key = "";
            var education_caption = "";
            var maxPerBuilding = $('#maxPerBuilding').val();
            $('div.radio > label').each(function() {
                var $label = $(this);
                var $radio = $($label.find("input")[0]);
                if (document.getElementById($radio.attr('id')).checked){
                    education_key = $($label.find('input')[0]).attr("education_key");
                    education_caption = $label.text().replace(/\s/g, "");
                    return;
                }
            });

            if (education_key == ""){
                return;
            }
            var staffList = "";
            $.each(aSchoolings, function(i, val) {
                $.each(val, function(j, type) {
                    var education_Name = (type.caption + " (" + type.duration + ")").replace(/\s/g, "");
                    if (education_Name == education_caption){
                        staffList = type.staffList;
                        return;
                    }
                });
                if (staffList != ""){
                    return;
                }
            });

            $('#accordion > div').each(function() {
                var $building = $(this);
                var $tableBody = $($($($building.find('div.panel-body')[0]).find('table')[0]).find('tbody')[0]);
                var currCount = 0;
                $tableBody.find('tr').each(function() {
                    var $row = $(this);
                    var schoolings = $($row.find('td[id^="school_personal_education"]')[0]).text().replace(/\s/g, "").split(',');
                    if(schoolings.includes(staffList)){
                        currCount++;
                    }
                });

                var free = maxPerBuilding - currCount;
                if (free > 0){
                    $tableBody.find('tr').each(function() {
                        if (free > 0 || $('#schooling_free').text() == "0") {
                            var $row = $(this);
                            var $input = $($($row.find("td")[0]).find("input")[0]);
                            var currSchoolings = $($row.find('td[id^="school_personal_education"]')[0]).text().replace(/\s/g, "");
                            if (!document.getElementById("noEduc").checked){
                                if ($input.length && $input.attr(education_key) == "false" && !document.getElementById($input.attr("id")).checked){
                                    $input.click();
                                    free--;
                                }
                            } else {
                                if ($input.length && currSchoolings == "" && !document.getElementById($input.attr("id")).checked){
                                    $input.click();
                                    free--;
                                }
                            }
                        } else {
                            return;
                        }
                    });
                }

                if ($('#schooling_free').text() == "0") {
                    return;
                }
            });
        });
    }
})();
