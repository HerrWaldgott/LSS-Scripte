// ==UserScript==
// @name         FilterMissionEvent
// @version      1.1.0
// @description  Filtert die Einsätze nach dem Icon vor der Bezeichnung
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var showPersonMission = true;
    var showStarMission = true;
    var sortAbc = null;

    $('#btn-group-mission-select').after(`
        <div style="margin-top: 5px;">
            <strong>Filter</strong>
            <a href="#" class="btn btn-xs btn-success" id="btnFilterPerson"><span class="glyphicon glyphicon-user"></span></a>
            <a href="#" class="btn btn-xs btn-success" id="btnFilterStar"><span class="glyphicon glyphicon-asterisk"></span></a>
            <a href="#" class="btn btn-xs btn-danger" id="btnSortAbc" ><span class="glyphicon glyphicon-sort-by-alphabet"></span></a>
        </div>`);

    $( "#btnFilterStar" ).click(function() {
        if (!showStarMission) {
            $('#btnFilterStar').addClass("btn-success");
            $('#btnFilterStar').removeClass("btn-danger");
            showStarMission = true;

        } else {
            $('#btnFilterStar').removeClass("btn-success");
            $('#btnFilterStar').addClass("btn-danger");
            showStarMission = false;
        }
        filterMissions();
    });

    $( "#btnFilterPerson" ).click(function() {
        if (!showPersonMission) {
            $('#btnFilterPerson').addClass("btn-success");
            $('#btnFilterPerson').removeClass("btn-danger");
            showPersonMission = true;
        } else {
            $('#btnFilterPerson').removeClass("btn-success");
            $('#btnFilterPerson').addClass("btn-danger");
            showPersonMission = false;
        }
        filterMissions();
    });

    $( "#btnSortAbc" ).click(function() {
        if (sortAbc == null){
            $('#btnSortAbc').addClass("btn-success");
            $('#btnSortAbc').removeClass("btn-danger");
            sortAbc = false;
        }

        if (!sortAbc) {
            $('#btnSortAbc').children().addClass("glyphicon-sort-by-alphabet");
            $('#btnSortAbc').children().removeClass("glyphicon-sort-by-alphabet-alt");
            sortAbc = true;
        } else {
            $('#btnSortAbc').children().removeClass("glyphicon-sort-by-alphabet");
            $('#btnSortAbc').children().addClass("glyphicon-sort-by-alphabet-alt");
            sortAbc = false;
        }
        sortMissions("abc");
    });

    function filterMissions (){
        $(`#mission_list_sicherheitswache > .missionSideBarEntry,
           #mission_list_krankentransporte > .missionSideBarEntry,
           #mission_list > .missionSideBarEntry,
           #mission_list_alliance > .missionSideBarEntry,
           #mission_list_alliance_event > .missionSideBarEntry`).each(function(){
            var $this = $(this);
            var $attributes = $this[0].attributes;
            var missionId = +($attributes).mission_id.value;
            var id = "mission_participant_new_" + missionId;
            var classes = document.getElementById(id).classList;
            if (classes.contains("glyphicon-asterisk") && classes.contains("hidden")){
                 if(!showPersonMission) {
                     $this.css("display", "none");
                 } else {
                     $this.css("display", "block");
                 }
            }

            if (document.getElementById(id).classList.contains("glyphicon-asterisk") && !document.getElementById(id).classList.contains("hidden")){
                if (!showStarMission) {
                    $this.css("display", "none");
                } else {
                    $this.css("display", "block");
                }
            }
        });
    }

    function sortMissions (order){
        if (order == "abc") {
            var allLists = [];
            var mL = $("#mission_list > .missionSideBarEntry"), mA = $("#mission_list_alliance > .missionSideBarEntry"),
                mK = $("#mission_list_krankentransporte > .missionSideBarEntry"), mAE = $("#mission_list_alliance_event > .missionSideBarEntry"),
                mS = $("#mission_list_sicherheitswache > .missionSideBarEntry");
            allLists.push(mL);
            allLists.push(mS);
            allLists.push(mK);
            allLists.push(mA);
            allLists.push(mAE);
            if (sortAbc) {
                allLists.forEach(list => {
                    list.sort(function (e, t) {
                        var one = $(e).find("a.map_position_mover").clone().children().remove().end().text();
                        var two = $(t).find("a.map_position_mover").clone().children().remove().end().text();
                        return one < two ? -1 : one > two ? 1 : 0
                    });
                });
                mL.appendTo("#mission_list");
                mK.appendTo("#mission_list_krankentransporte");
                mS.appendTo("#mission_list_sicherheitswache");
                mA.appendTo("#mission_list_alliance");
                mAE.appendTo("#mission_list_alliance_event");
            } else {
                allLists.forEach(list => {
                    list.sort(function (e, t) {
                        var one = $(e).find("a.map_position_mover").clone().children().remove().end().text();
                        var two = $(t).find("a.map_position_mover").clone().children().remove().end().text();
                        return one < two ? 1 : one > two ? -1 : 0
                    });
                });
                mL.appendTo("#mission_list");
                mK.appendTo("#mission_list_krankentransporte");
                mS.appendTo("#mission_list_sicherheitswache");
                mA.appendTo("#mission_list_alliance");
                mAE.appendTo("#mission_list_alliance_event");
            }
        }
    }
})();
