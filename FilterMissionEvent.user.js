// ==UserScript==
// @name         FilterMissionEvent
// @version      1.3.1
// @description  Filtert die Einsätze nach dem Icon vor der Bezeichnung
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    var showPersonMission = true;
    var showStarMission = true;
    var sortAbc = null;
    var sortCredits = null;
    var sortTime = null;

    //if (!sessionStorage.aMissions || JSON.parse(sessionStorage.aMissions).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) {
        await $.getJSON('/einsaetze.json').done(data => sessionStorage.setItem('aMissions', JSON.stringify({ lastUpdate: new Date().getTime(), value: data})));
    //}
    var aMissions = JSON.parse(sessionStorage.aMissions).value;

    $('#btn-group-mission-select').after(`
        <div style="margin-top: 5px;">
            <strong>Filter</strong>
            <a href="#" class="btn btn-xs btn-success" id="btnFilterPerson"><span class="glyphicon glyphicon-user"></span></a>
            <a href="#" class="btn btn-xs btn-success" id="btnFilterStar"><span class="glyphicon glyphicon-asterisk"></span></a>
            <a href="#" class="btn btn-xs btn-danger" id="btnSortAbc" ><span class="glyphicon glyphicon-sort-by-alphabet"></span></a>
            <a href="#" class="btn btn-xs btn-danger" id="btnSortCredits"><span class="glyphicon glyphicon-sort-by-attributes"></span></a>
            <a href="#" class="btn btn-xs btn-danger" id="btnSortTime"><span class="glyphicon glyphicon-time"></span></a>
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

            $('#btnSortCredits').removeClass("btn-success");
            $('#btnSortCredits').addClass("btn-danger");
            sortCredits = null;

            $('#btnSortTime').removeClass("btn-success");
            $('#btnSortTime').addClass("btn-danger");
            sortTime = null;
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

    $( "#btnSortCredits" ).click(function() {
        if (sortCredits == null){
            $('#btnSortCredits').addClass("btn-success");
            $('#btnSortCredits').removeClass("btn-danger");
            sortCredits = false;

            $('#btnSortAbc').removeClass("btn-success");
            $('#btnSortAbc').addClass("btn-danger");
            sortAbc = null;

            $('#btnSortTime').removeClass("btn-success");
            $('#btnSortTime').addClass("btn-danger");
            sortTime = null;
        }

        if (!sortCredits) {
            $('#btnSortCredits').children().addClass("glyphicon-sort-by-attributes");
            $('#btnSortCredits').children().removeClass("glyphicon-sort-by-attributes-alt");
            sortCredits = true;
        } else {
            $('#btnSortCredits').children().removeClass("glyphicon-sort-by-attributes");
            $('#btnSortCredits').children().addClass("glyphicon-sort-by-attributes-alt");
            sortCredits = false;
        }
        sortMissions("credits");
    });

    $( "#btnSortTime" ).click(function() {
        if (sortTime == null){
            $('#btnSortTime').addClass("btn-success");
            $('#btnSortTime').removeClass("btn-danger");
            sortTime = false;

            $('#btnSortAbc').removeClass("btn-success");
            $('#btnSortAbc').addClass("btn-danger");
            sortAbc = null;

            $('#btnSortCredits').removeClass("btn-success");
            $('#btnSortCredits').addClass("btn-danger");
            sortCredits = null;
        }

        if (!sortTime) {
            sortTime = true;
        } else {
            sortTime = false;
        }
        sortMissions("time");
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
        var allLists = [];
        var mL = $("#mission_list > .missionSideBarEntry"), mA = $("#mission_list_alliance > .missionSideBarEntry"),
            mK = $("#mission_list_krankentransporte > .missionSideBarEntry"), mAE = $("#mission_list_alliance_event > .missionSideBarEntry"),
            mS = $("#mission_list_sicherheitswache > .missionSideBarEntry");
        allLists.push(mL);
        allLists.push(mS);
        allLists.push(mK);
        allLists.push(mA);
        allLists.push(mAE);
        if (order == "abc") {
            if (sortAbc) {
                allLists.forEach(list => {
                    list.sort(function (e, t) {
                        var one = $(e).find("a.map_position_mover").clone().children().remove().end().text();
                        var two = $(t).find("a.map_position_mover").clone().children().remove().end().text();
                        return one < two ? -1 : one > two ? 1 : 0
                    });
                });
            } else {
                allLists.forEach(list => {
                    list.sort(function (e, t) {
                        var one = $(e).find("a.map_position_mover").clone().children().remove().end().text();
                        var two = $(t).find("a.map_position_mover").clone().children().remove().end().text();
                        return one < two ? 1 : one > two ? -1 : 0
                    });
                });
            }
        } else if (order == "credits"){
            if (sortCredits) {
                allLists.forEach(list => {
                    for (var i = 0; i < list.length; i++) {
                        if (isNaN(+$(list[i]).attr("average_credits"))) {
                            var typeID = +$(list[i]).attr('mission_type_id');
                            var missionType = aMissions.filter(m => m.id == typeID)[0];
                            var credits = 0;
                            if (missionType === undefined) {
                                credits = 0;
                            } else if (missionType.average_credits == null){
                                var patients = missionType.additional.possible_patient_min;
                                credits = 250 * patients;
                            } else {
                                credits = missionType.average_credits;
                            }
                            +$(list[i]).attr('average_credits', credits);
                        }
                    }
                    list.sort(function (e, t) {
                        var one = +$(e).attr("average_credits");
                        var two = +$(t).attr("average_credits");
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
                    for (var i = 0; i < list.length; i++) {
                        if (isNaN(+$(list[i]).attr("average_credits"))) {
                            var typeID = +$(list[i]).attr('mission_type_id');
                            var missionType = aMissions.filter(m => m.id == typeID)[0];
                            if (missionType === undefined) {
                                var credits = 0;
                            } else {
                                var credits = missionType.average_credits;
                            }
                            +$(list[i]).attr('average_credits', credits);
                        }
                    }
                    list.sort(function (e, t) {
                        var one = +$(e).attr("average_credits");
                        var two = +$(t).attr("average_credits");
                        return one < two ? 1 : one > two ? -1 : 0
                    });
                });
                mL.appendTo("#mission_list");
                mK.appendTo("#mission_list_krankentransporte");
                mS.appendTo("#mission_list_sicherheitswache");
                mA.appendTo("#mission_list_alliance");
                mAE.appendTo("#mission_list_alliance_event");
            }
        } else if (order == "time") {
            if (sortTime) {
                allLists.forEach(list => {
                    list.sort(function (e, t) {
                        var one = +$(e).attr('mission_id');
                        var two = +$(t).attr('mission_id');
                        return one < two ? -1 : one > two ? 1 : 0
                    });
                });
            } else {
                allLists.forEach(list => {
                    list.sort(function (e, t) {
                        var one = +$(e).attr('mission_id');
                        var two = +$(t).attr('mission_id');
                        return one < two ? 1 : one > two ? -1 : 0
                    });
                });
            }
        }
        mL.appendTo("#mission_list");
        mK.appendTo("#mission_list_krankentransporte");
        mS.appendTo("#mission_list_sicherheitswache");
        mA.appendTo("#mission_list_alliance");
        mAE.appendTo("#mission_list_alliance_event");
    }
})();
