// ==UserScript==
// @name         HotkeyBuildings
// @version      1.0.0
// @description  Hotkeys im Gebäude (A - vorheriges Gebäude, D - nächste Gebäude)
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/buildings/*
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/HotkeyBuildings.user.js
// ==/UserScript==

(function() {
    'use strict';
    window.addEventListener("keydown", function (event) {
        if (event.keyCode == 68) {
            var $nav = $('#building-navigation-container');
            var $button = $($nav.children()[2]);
            window.location.replace($button.attr('href'));
        } else if (event.keyCode == 65) {
            $nav = $('#building-navigation-container');
            $button = $($nav.children()[0]);
            window.location.replace($button.attr('href'));
        }
    });
})();
