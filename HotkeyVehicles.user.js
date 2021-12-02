// ==UserScript==
// @name         HotkeyVehicles
// @version      1.0.0
// @description  A - vorheriges Gebäude, D - nächstes Fahrzeug
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/vehicles/*
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/HotkeyVehicles.user.js
// ==/UserScript==

(function() {
    'use strict';
    window.addEventListener("keydown", function (event) {
        if (event.keyCode == 68) {
            var $nav = $('#iframe-inside-container > div.btn-group.pull-right');
            var $button = $($nav.children()[1]);
            window.location.replace($button.attr('href'));
        } else if (event.keyCode == 65) {
            $nav = $('#iframe-inside-container > div.btn-group.pull-right');
            $button = $($nav.children()[0]);
            window.location.replace($button.attr('href'));
        }
    });
})();
