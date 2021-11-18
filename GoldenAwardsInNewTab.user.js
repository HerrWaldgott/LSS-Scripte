// ==UserScript==
// @name         GoldenAwardsInNewTab
// @version      1.1.0
// @description  goldene Auszeichnungen im seperaten Tab anzeigen
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/profile/*
// @include      *://www.leitstellenspiel.de/auszeichnungen
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/GoldenAwardsInNewTab.user.js
// ==/UserScript==

(function() {
    'use strict';

    if(window.location.pathname.indexOf("profile/") > -1) {
        var golds = [];
        var div = $('#profile_awards');
        var childs = div.children();
        childs.each(function(index, item) {
            if ($(item).find('img').attr('src').includes("award_gold")) {
                golds.push(item);
                $(item).remove();
            }
        });

        $('#tabs').append(`<li role="presentation" class><a href="#profile_gold_awards" aria-controls="profile_gold_awards" role="tab" data-toggle="tab" aria-expanded="false">Goldene Auszeichnungen</a></li>`);

        $('.tab-content').append(`<div id="profile_gold_awards" role="tabpanel" class="tab-pane"></div>`);
        golds.forEach(award => $(award).appendTo('#profile_gold_awards'));
    }

    if(window.location.pathname.indexOf("auszeichnungen") > -1) {
        var awards = [];
        div = $('#iframe-inside-container > div.row');
        childs = div.children();
        childs.each(function(index, item) {
            awards.push(item);
            $(item).remove();
        });
        $('#iframe-inside-container > div.page-header').after(`
        <ul class="nav nav-tabs" role="tablist" id="tabs">
	        <li role="presentation" class="active">
                <a href="#profile_awards" aria-controls="profile_awards" role="tab" data-toggle="tab">Auszeichnungen</a>
            </li>
            <li role="presentation" class="">
                <a href="#profile_gold_awards" aria-controls="profile_gold_awards" role="tab" data-toggle="tab" aria-expanded="false">Goldene Auszeichnungen</a>
            </li>
        </ul>
        <div class="tab-content">
            <div id="profile_gold_awards" role="tabpanel" class="tab-pane"></div>
            <div id="profile_awards" role="tabpanel" class="tab-pane active"></div>
        </div>
        `);

        awards.forEach(award => {
            if ($(award).find('img').attr('src').includes("award_gold")) {
                $(award).appendTo('#profile_gold_awards')
            } else {
                $(award).appendTo('#profile_awards')
            }
        });
    }
})();
