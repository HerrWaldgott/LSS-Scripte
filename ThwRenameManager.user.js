// ==UserScript==
// @name         ThwRenameManager
// @version      1.1.1
// @description  Benennt alle Fahrzeuge auf der Wache nach BOS-Richtlinien um
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/buildings/*
// @grant        none
// ==/UserScript==
async function renameVehicle(vID, vName) {
    await $.post("/vehicles/" + vID, { "vehicle": { "caption": vName }, "authenticity_token": $("meta[name=csrf-token]").attr("content"), "_method": "put" });
}

(async function() {
    'use strict';

    await $.getScript("https://api.lss-cockpit.de/lib/utf16convert.js");

    if (!sessionStorage.cBuildings || JSON.parse(sessionStorage.cBuildings).lastUpdate < (new Date().getTime() - 5 * 1000 * 60) || JSON.parse(sessionStorage.cBuildings).userId != user_id) {
        await $.getJSON('/api/buildings').done(data => sessionStorage.setItem('cBuildings', JSON.stringify({ lastUpdate: new Date().getTime(), value: LZString.compressToUTF16(JSON.stringify(data)), userId: user_id })));
    }
    var cBuildings = JSON.parse(LZString.decompressFromUTF16(JSON.parse(sessionStorage.cBuildings).value));

    if (!sessionStorage.cVehicles || JSON.parse(sessionStorage.cVehicles).lastUpdate < (new Date().getTime() - 5 * 1000 * 60) || JSON.parse(sessionStorage.cVehicles).userId != user_id) {
        await $.getJSON('/api/vehicles').done(data => sessionStorage.setItem('cVehicles', JSON.stringify({ lastUpdate: new Date().getTime(), value: LZString.compressToUTF16(JSON.stringify(data)), userId: user_id })));
    }
    var cVehicles = JSON.parse(LZString.decompressFromUTF16(JSON.parse(sessionStorage.cVehicles).value));

    var buildingID = (window.location.href.split("/")[4]).replace("#", "");
    var building = cBuildings.filter(b => b.id == buildingID)[0];

    if (building.building_type == 9){
        $('dl.dl-horizontal').append(`
            <dt><strong>Fahrz. umbenennen:</strong></dt>
            <dd>
                <input type="text" class="form-controls" id="initialName" placeholder="Heros XY...">
                <a href="#" id="btnRename" class="btn btn-xs btn-default">Nach BOS umbenennen</a>
                <input id="withType" name="withType" type="checkbox">
                <label class="" for="withType">Typ hinzufügen</label>
            </dd>
            `);

        $('#btnRename').on('click', function() {
            $('#vehicle_table > tbody').children().each(async function() {
                var $vehicleRow = $(this);
                var $vehicleNameColumn = $vehicleRow.children()[1];
                var vehicleID = $vehicleNameColumn.childNodes[1].href.split("/")[4];
                var vehicleType = cVehicles.filter(v => v.id == vehicleID)[0].vehicle_type;
                var org = "";
                var type = "";
                var typeName = "";
                var firstGKW = true;
                var firstMzKw = true;
                var firstMtwTz = true;
                var firstMtwOv = true;
                switch (vehicleType){
                    case 39:
                        if (firstGKW) {
                            org = "22";
                            firstGKW = false;
                        } else {
                            org = "27";
                        }
                        type = "/52";
                        typeName = "(GKW)";
                        break;
                    case 41:
                        if (firstMzKw) {
                            org = "24";
                            firstMzKw = false;
                        } else {
                            org = "28";
                        }
                        type = "/54";
                        typeName = "(MzKw)";
                        break;
                    case 40:
                        if (firstMtwTz) {
                            org = "21";
                            firstMtwTz = false;
                        } else {
                            org = "26";
                        }
                        type = "/10";
                        typeName = "(MTW-TZ)";
                        break;
                    case 93:
                        org = "44";
                        if (firstMtwOv){
                            type = "/22";
                        } else {
                            type = "/23";
                        }
                        typeName = "(MTW-OV)";
                        break;
                    case 92:
                        org = "";
                        type = "Anh Hund";
                        break;
                    case 44:
                        org = "";
                        type = "Anh DLE";
                        break;
                    case 45:
                        org = "41";
                        type = "/35";
                        typeName = "(MLW 5)";
                        break;
                    case 43:
                        org = "41";
                        type = "/72";
                        typeName = "(BRmG R)";
                        break;
                    case 42:
                        org = "41";
                        type = "/62";
                        typeName = "(LKW K 9)";
                        break;
                    case 69:
                        org = "36";
                        type = "/56";
                        typeName = "(Tauchkraftwagen)";
                        break;
                    case 65:
                        org = "36";
                        type = "/64";
                        typeName = "(LKW 7 Lkr 19 tm)";
                        break;
                    case 66:
                        org = "";
                        type = "Anh MzB";
                        break;
                    case 67:
                        org = "";
                        type = "Anh SchlB";
                        break;
                    case 68:
                        org = "";
                        type = "Anh MzAB";
                        break;
                    case 102:
                        org = "";
                        type = "Anh 7";
                        break;
                    case 101:
                        org = "";
                        type = "Anh SwPu";
                        break;
                    case 99:
                        org = "47";
                        type = "/43";
                        typeName = "(LKW 7 Lbw)";
                        break;
                    case 100:
                        org = "47";
                        type = "/34";
                        typeName = "(MLW 4)";
                        break;
                }
                var vName = "";
                if (document.getElementById('withType').checked) {
                    vName = $('#initialName').val() + " " + org + type + " " + typeName;
                } else {
                    vName = $('#initialName').val() + " " + org + type;
                }
                await new Promise(resolve => {
                    renameVehicle(vehicleID, vName);
                    window.setTimeout(resolve, 100);
                });
            });
            location.reload();
        });
    }
})();
