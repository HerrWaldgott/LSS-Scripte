// ==UserScript==
// @name         KompakteWachenAnsichtInSchulen
// @version      1.1.1
// @description  Gegliederte Ansicht der Wachen in einer Schule
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/buildings/*
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/KompakteWachenAnsichtInSchulen.user.js
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
    }
})();
