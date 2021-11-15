// ==UserScript==
// @name         GoldenAwardsInNewTab
// @version      1.0.0
// @description  goldene Auszeichnungen im seperaten Tab anzeigen
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/profile/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

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
})();
