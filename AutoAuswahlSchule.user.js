// ==UserScript==
// @name         AutoAuswahlSchule
// @version      1.0.0
// @description  automatisches Auswählen für Lehrgänge (max Personen mit Lehrgang pro Wache)
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/buildings/*
// @grant        none
// @namespace    
// ==/UserScript==

(async function() {
    'use strict';

    await $.getScript("https://api.lss-cockpit.de/lib/utf16convert.js");

    if (!sessionStorage.cBuildings || JSON.parse(sessionStorage.cBuildings).lastUpdate < (new Date().getTime() - 5 * 1000 * 60) || JSON.parse(sessionStorage.cBuildings).userId != user_id) {
        await $.getJSON('/api/buildings').done(data => sessionStorage.setItem('cBuildings', JSON.stringify({ lastUpdate: new Date().getTime(), value: LZString.compressToUTF16(JSON.stringify(data)), userId: user_id })));
    }
    var cBuildings = JSON.parse(LZString.decompressFromUTF16(JSON.parse(sessionStorage.cBuildings).value));

    var buildingID = (window.location.href.split("/")[4]).replace("#", "");
    var building = cBuildings.filter(b => b.id == buildingID)[0];

    if ((building.building_type == 1 || building.building_type == 3 || building.building_type == 8 || building.building_type == 10) && window.location.href == "https://www.leitstellenspiel.de/buildings/" + buildingID){
        $('#navbar-building-schooling-collapse').append(`
            <div class="navbar-text navbar-right">
                <p style="display: inline-block">Max. Personal / Wache:</p>
                <input style="display:inline-block; color: #000; width:50px;" type="number" id="maxPerBuilding" min="1" value="1"></input>
                <a id="btnAutoSelect" class="btn btn-success">Auswählen</a>
            </div>
        `);

        $('#accordion > div > div.personal-select-heading').each(function() {
            var $this = $(this);
            $this.click();
            $this.click();
        });

        $('#btnAutoSelect').on('click', function() {
            var education_key = "";
            var maxPerBuilding = $('#maxPerBuilding').val();
            for (var i = 0; i < 50; i++){
                if ($('#education_' + i).length){
                    var $radio = $('#education_' + i);
                    if (document.getElementById($radio.attr('id')).checked){
                        education_key = $radio.attr('education_key');
                        break;
                    }
                }
            }

            $('#accordion > div > div.panel-body > table').each(function() {
                var $table = $(this);
                var $body = $($table.find('tbody')[0]);
                var countAlreadySchooling = 0;
                $body.find('tr').each(function () {
                    var $input = $($($(this).find('td')[0]).find('input')[0]);
                    if ($input.attr(education_key) !== undefined && $input.attr(education_key) == "true"){
                        countAlreadySchooling++;
                    }
                });

                if (countAlreadySchooling < maxPerBuilding){
                    $body.find('tr').each(function () {
                        var $input = $($($(this).find('td')[0]).find('input')[0]);
                        if (parseInt($('#schooling_free').text()) > 0 && countAlreadySchooling < maxPerBuilding && $input.attr(education_key) !== undefined && $input.attr(education_key) == "false" && !document.getElementById($input.attr('id')).checked){
                            $input.click();
                            countAlreadySchooling++;
                        }
                    });
                }
            });
        });
    }
})();
