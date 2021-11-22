// ==UserScript==
// @name         AuswahlSchule
// @version      2.0.6
// @description  Auswählen für Lehrgänge (max Personen mit Lehrgang pro Wache) / Kategorien für Gebäude
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/buildings/*
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/AuswahlSchule.user.js
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
        
        if ($('#tabsDiv').length) {
        } else {
            $('#accordion').after(`
                <div id="tabsDiv">
                    <ul id="tabsBuilding" class="nav nav-tabs" role="tablist">
                        <li role="presentation" id="feuerwehrTab">
                            <a href="#feuerwehr" aria-controls="feuerwehr" role="tab" data-toggle="tab">Feuerwehr</a>
                        </li>
                        <li role="presentation" class="" id="rettungsdienstTab">
                            <a href="#rettungsdienst" aria-controls="rettungsdienst" role="tab" data-toggle="tab">Rettungsdienst</a>
                        </li>
                        <li role="presentation" class="" id="polizeiTab">
                            <a href="#polizei" aria-controls="polizei" role="tab" data-toggle="tab">Polizei</a>
                        </li>
                        <li role="presentation" class="" id="thwTab">
                            <a href="#thw" aria-controls="thw" role="tab" data-toggle="tab">THW</a>
                        </li>
                    </ul>
                    <div class="tab-content">
                        <div role="tabpanel" class="tab-pane" id="feuerwehr"></div>
                        <div role="tabpanel" class="tab-pane" id="rettungsdienst">
                            <ul id="tabsBuilding" class="nav nav-tabs" role="tablist">
                                <li role="presentation" id="rdTab">
                                    <a href="#rd" aria-controls="rd" role="tab" data-toggle="tab">Rettungswache</a>
                                </li>
                                <li role="presentation" class="" id="rd_rhsTab">
                                    <a href="#rd_rhs" aria-controls="rd_rhs" role="tab" data-toggle="tab">Rettungshundestaffel</a>
                                </li>
                                <li role="presentation" class="" id="rd_segTab">
                                    <a href="#rd_seg" aria-controls="rd_seg" role="tab" data-toggle="tab">Schnelleinsatzgruppe</a>
                                </li>
                                <li role="presentation" class="" id="rd_rthTab">
                                    <a href="#rd_rth" aria-controls="rd_rth" role="tab" data-toggle="tab">Rettungshelikopter</a>
                                </li>
                                <li role="presentation" class="" id="rd_wrTab">
                                    <a href="#rd_wr" aria-controls="rd_wr" role="tab" data-toggle="tab">Wasserrettung</a>
                                </li>
                            </ul>
                            <div class="tab-content">
                                <div role="tabpanel" class="tab-pane" id="rd"></div>
                                <div role="tabpanel" class="tab-pane" id="rd_rhs"></div>
                                <div role="tabpanel" class="tab-pane" id="rd_seg"></div>
                                <div role="tabpanel" class="tab-pane" id="rd_rth"></div>
                                <div role="tabpanel" class="tab-pane" id="rd_wr"></div>
                            </div>
                        </div>
                        <div role="tabpanel" class="tab-pane" id="polizei">
                            <ul id="tabsBuilding" class="nav nav-tabs" role="tablist">
                                <li role="presentation" id="polTab">
                                    <a href="#pol" aria-controls="pol" role="tab" data-toggle="tab">Polizeiwache</a>
                                </li>
                                <li role="presentation" class="" id="pol_seTab">
                                    <a href="#pol_se" aria-controls="pol_se" role="tab" data-toggle="tab">Sondereinheiten</a>
                                </li>
                                <li role="presentation" class="" id="pol_pthTab">
                                    <a href="#pol_pth" aria-controls="pol_pth" role="tab" data-toggle="tab">Polizeihubschrauber</a>
                                </li>
                                <li role="presentation" class="" id="pol_bpTab">
                                    <a href="#pol_bp" aria-controls="pol_bp" role="tab" data-toggle="tab">Bereitschaftspolizei</a>
                                </li>
                            </ul>
                            <div class="tab-content">
                                <div role="tabpanel" class="tab-pane" id="pol"></div>
                                <div role="tabpanel" class="tab-pane" id="pol_se"></div>
                                <div role="tabpanel" class="tab-pane" id="pol_pth"></div>
                                <div role="tabpanel" class="tab-pane" id="pol_bp"></div>
                            </div>
                        </div>
                        <div role="tabpanel" class="tab-pane" id="thw"></div>
                    </div>
                </div>
            `);
        }

        $('#accordion > div.panel').each(function() {
            var $panel = $(this);
            var buildingID = $($panel.find("div.panel-heading")[0]).attr("building_id");
            var building = cBuildings.filter(b => b.id == buildingID)[0];
            switch(building.building_type){
                case 0:
                case 18:
                    $('#feuerwehr').append($panel);
                    break;
                case 20:
                case 2:
                    $('#rd').append($panel);
                    break;
                case 21:
                    $('#rd_rhs').append($panel);
                    break;
                case 15:
                    $('#rd_wr').append($panel);
                    break;
                case 12:
                    $('#rd_seg').append($panel);
                    break;
                case 5:
                    $('#rd_rth').append($panel);
                    break;
                case 17:
                    $('#pol_se').append($panel);
                    break;
                case 13:
                    $('#pol_pth').append($panel);
                    break;
                case 11:
                    $('#pol_bp').append($panel);
                    break;
                case 19:
                case 6:
                    $('#pol').append($panel);
                    break;
                case 9:
                    $('#thw').append($panel);
                    break;
                default:
                    console.log("Error: BuildingType " + building.building_type + " not found!");
                    break;
            }
        });

        $('#tabsDiv').find('div.tab-pane').each(function() {
            var $pane = $(this);
            if ($pane.text() == ""){
                $('#' + $pane.attr("id") + "Tab").addClass("hidden");
            }
        });

        if ($('#rettungsdienst > ul > li:not(.hidden)').length == 0){
            $('#rettungsdienstTab').addClass("hidden");
        }

        if ($('#polizei > ul > li:not(.hidden)').length == 0){
            $('#polizeiTab').addClass("hidden");
        }

        $('#btnAutoSelect').on('click', function() {
            var aSchoolings = JSON.parse(sessionStorage.aSchoolings).value;
            var education_caption = "";
            var maxPerBuilding = $('#maxPerBuilding').val();
            $('div.radio > label').each(function() {
                var $label = $(this);
                var $radio = $($label.find("input")[0]);
                if (document.getElementById($radio.attr('id')).checked){
                    education_caption = $label.text().replace(/\s/g, "");
                    return;
                }
            });

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

            $('#tabsDiv').find("div.panel").each(function() {
                var $building = $(this);
                var $tableBody = $($($($building.find('div.panel-body')[0]).find('table')[0]).find('tbody')[0]);
                var currCount = 0;
                if($tableBody.length) {
                    $tableBody.find('tr').each(function() {
                        var $row = $(this);
                        var schoolings = $($row.find('td[id^="school_personal_education"]')[0]).text().replace(/\s/g, "").split(',');
                        if(schoolings.includes(staffList)){
                            currCount++;
                        }
                    });

                    var free = maxPerBuilding - currCount;
                    console.log(free);
                    if (free > 0){
                        $tableBody.find('tr').each(function() {
                            if (free > 0 || $('#schooling_free').text() == "0") {
                                var $row = $(this);
                                var $input = $($($row.find("td")[0]).find("input")[0]);
                                var currSchoolings = $($row.find('td[id^="school_personal_education"]')[0]).text().replace(/\s/g, "");
                                if (!document.getElementById("noEduc").checked){
                                    if ($input.length && !document.getElementById($input.attr("id")).checked && !currSchoolings.includes(education_caption)){
                                        $input.click();
                                        free--;
                                    } else {
                                        if ($input.length && document.getElementById($input.attr("id")).checked){
                                            free--;
                                        }
                                    }
                                } else {
                                    if ($input.length && currSchoolings == "" && !document.getElementById($input.attr("id")).checked){
                                        console.log("clicked");
                                        $input.click();
                                        free--;
                                    } else {
                                        if ($input.length && document.getElementById($input.attr("id")).checked){
                                            free--;
                                        }
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
                }
            });
        });
    }
})();
