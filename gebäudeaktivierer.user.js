// ==UserScript==
// @name         GebäudeAktivierer
// @version      1.1.5
// @description  Gebäudetypen auf einem Klick aktiveren oder deaktiveren
// @author       HerrWaldgott
// @include      *://www.leitstellenspiel.de/
// @grant        none
// @namespace    https://github.com/HerrWaldgott/LSS-Scripte/raw/main/geb%C3%A4udeaktivierer.js
// ==/UserScript==
async function sendPost(url) {
    await new Promise(resolve => {
    	await $.post(url,
	{
		"authenticity_token": $("meta[name=csrf-token]").attr("content"),
		"_method": "post"
	});
	window.setTimeout(resolve, 100);
    });
}

async function sendGet(Url) {
    await new Promise(resolve => {
	$.ajax({
		url: Url,
		cache: true
	});
	window.setTimeout(resolve, 100);
    });
}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

var aBuildings = aBuildings || [];
var aBuildingTypes = aBuildingTypes || [];

(async function () {
	'use strict';

    await $.getScript("https://api.lss-cockpit.de/lib/utf16convert.js");

    if (!sessionStorage.aBuildings || JSON.parse(sessionStorage.aBuildings).lastUpdate < (new Date().getTime() - 5 * 1000 * 60) || JSON.parse(sessionStorage.aBuildings).userId != user_id) {
        await $.getJSON('/api/buildings').done(data => sessionStorage.setItem('aBuildings', JSON.stringify({ lastUpdate: new Date().getTime(), value: LZString.compressToUTF16(JSON.stringify(data)), userId: user_id })));
    }
    var aBuildings = JSON.parse(LZString.decompressFromUTF16(JSON.parse(sessionStorage.aBuildings).value));

    if (!sessionStorage.aBuildingTypes || JSON.parse(sessionStorage.aBuildingTypes).lastUpdate < (new Date().getTime() - 5 * 1000 * 60) || JSON.parse(sessionStorage.aBuildingTypes).userId != user_id) {
        await $.getJSON('https://proxy.lss-manager.de/v4/api/de_DE/buildings.json').done(data => sessionStorage.setItem('aBuildingTypes', JSON.stringify({ lastUpdate: new Date().getTime(), value: LZString.compressToUTF16(JSON.stringify(data)), userId: user_id })));
    }
    var aBuildingTypes = JSON.parse(LZString.decompressFromUTF16(JSON.parse(sessionStorage.aBuildingTypes).value));

    function activate(type, enabled) {
        var blob = new Blob([`onmessage = function(e){
                                 var buildingType = null;
                                 var aBuildingTypes = e.data[3];
                                 var aBuildings = e.data[2];
                                 var type = e.data[0];
                                 var enabled = e.data[1];
                                 for (var i = 0; i < aBuildings.length; i++) {
			                         var b = aBuildings[i];
                                     b.extensions.forEach((e, ind) => {
                                         if (e.caption.includes(type) && e.enabled == enabled){
                                             aBuildingTypes[b.building_type].extensions.forEach((apiE, apiInd) => {
                                                 if (e.caption == apiE.caption) {
                                                     var url = "https://www.leitstellenspiel.de/buildings/" + b.id + "/extension_ready/" + apiInd + "/" + b.id;
                                                     self.postMessage(['url', url, i]);
                                                     e.enabled = !enabled;
                                                 }
                                             });
                                         }
                                     });
                                     self.postMessage(['status', i]);
                                 }
                                 self.postMessage(['finish', aBuildings]);
                             }`], {type: 'text/javascript'})
        var url = URL.createObjectURL(blob)
        var worker = new Worker(url)
        worker.onmessage = function(e){
            if (e.data[0] == 'status') {
                document.getElementById('counter').innerHTML = ((e.data[1] + 1) + " / " + aBuildings.length + " Gebäude überprüft");
            } else if (e.data[0] == 'url') {
                sendPost(e.data[1]);
                sleep(200);
            } else if (e.data[0] == 'finish') {
                document.getElementById('counter').innerHTML = ("alle Gebäude überprüft");
                aBuildings = e.data[1];
            }
        }
        worker.postMessage([type, enabled, aBuildings, aBuildingTypes]);
    }

	function activateBuilding(type, enabled) {
		document.getElementById('counter').innerHTML = ("0 / " + aBuildings.length + " Gebäude überprüft");
        var blob = new Blob([`onmessage = function(e){
                                 var aBuildingTypes = e.data[3];
                                 var aBuildings = e.data[2];
                                 var type = e.data[0];
                                 var enabled = e.data[1];
                                 var this = e.data[4];
                                 for (var i = 0; i < aBuildings.length; i++) {
                                     var b = aBuildings[i];
                                     if (b.building_type == type) {
                                     	self.postMessage(['url', b.id]);
                                     }
                                     self.postMessage(['status', i]);
                                     }
                                 self.postMessage(['finish', aBuildings]);
                             }`], {type: 'text/javascript'})
        var url = URL.createObjectURL(blob)
        var worker = new Worker(url)
        worker.onmessage = function(e){
            if (e.data[0] == 'status') {
                document.getElementById('counter').innerHTML = ((e.data[1] + 1) + " / " + aBuildings.length + " Gebäude überprüft");
            } else if (e.data[0] == 'url') {
		var bid = e.data[1];
                this.get("https://www.leitstellenspiel.de/buildings/" + bid, function (data, status) {
		     var parser = new DOMParser();
		     var htmlDoc = parser.parseFromString(data, 'text/html');
		     var div = htmlDoc.getElementById('iframe-inside-container');
		     var div2 = div.childNodes[9];
		     var dd = div2.childNodes[7];
		     var url = "";
		     var btn = dd.childNodes[3];
		     if ((dd.innerHTML.includes("Nicht Einsatzbereit") && !enabled) || (!dd.innerHTML.includes("Nicht Einsatzbereit") && enabled)){
			 if (!enabled){
			     var url = (btn.href);
			     sendGet(url);
			     b.enabled = !b.enabled;
			 }
		     }
		 });
                sleep(300);
            } else if (e.data[0] == 'finish') {
                document.getElementById('counter').innerHTML = ("alle Gebäude überprüft");
                aBuildings = e.data[1];
            }
        }
        worker.postMessage([type, enabled, aBuildings, aBuildingTypes, $]);
	}

	$('body').append(`
		<div id="lightbox_box_activater" iframewidth="1331" iframeheight="512" style="position: fixed; z-index: 999999;background-color: #c9302c; width: 800px; display: none; left: calc(100vw / 2 - 400px); top: 15px; border: 3px solid rgb(0, 0, 0);">
			<button type="button" class="close" style="width: 32px; height: 32px; float: right; cursor: pointer; color: #fff; opacity: 0.9;"id="lightbox_close_activater" aria-label="Close"><span aria-hidden="true">×</span></button>
			<ul id="tabs" class="nav nav-tabs" role="tablist" style="padding: 30px 15px 0px;">
				<li role="presentation" class="active">
					<a href="#fw" aria-controls="fw" role="tab" data-toggle="tab" aria-expended="true" style="background-color: #c9302c;">Feuerwehr</a>
				</li>
				<li role="presentation">
					<a href="#rd" aria-controls="rd" role="tab" data-toggle="tab" style="background-color: #c9302c;">Rettungsdienst</a>
				</li>
				<li role="presentation">
					<a href="#pd" aria-controls="pd" role="tab" data-toggle="tab" style="background-color: #c9302c;">Polizei</a>
				</li>
				<li role="presentation">
					<a href="#thw" aria-controls="thw" role="tab" data-toggle="tab" style="background-color: #c9302c;">THW</a>
				</li>
				<li role="presentation">
					<a href="#bd" aria-controls="bd" role="tab" data-toggle="tab" style="background-color: #c9302c;">Gebäude</a>
				</li>
			</ul>
			<div class="tab-content">
				<div role="tabpanel" class="tab-pane active" id="fw" style="padding: 15px;">
					<div class="row">
						<div class="col-md-6">
							<button href="#"  id="fw_abroll_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Abrollbehälter deaktivieren</button>
							<button href="#"  id="fw_sani_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Rettungsdienst deaktivieren</button>
							<button href="#"  id="fw_was_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Wasserrettung deaktivieren</button>
							<button href="#"  id="fw_flu_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Flughafen deaktivieren</button>
							<button href="#"  id="fw_gro_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Großwache deaktivieren</button>
							<button href="#"  id="fw_wer_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Werkfeuerwehr deaktivieren</button>
						</div>
						<div class="col-md-6">
							<button href="#"  id="fw_abroll_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Abrollbehälter aktivieren</button>
							<button href="#"  id="fw_sani_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Rettungsdienst aktivieren</button>
							<button href="#"  id="fw_was_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Wasserrettung aktivieren</button>
							<button href="#"  id="fw_flu_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Flughafen aktivieren</button>
							<button href="#"  id="fw_gro_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Großwache aktivieren</button>
							<button href="#"  id="fw_wer_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Werkfeuerwehr aktivieren</button>
						</div>
					</div>
				</div>
				<div role="tabpanel" class="tab-pane" id="bd" style="padding: 15px;">
					<div class="row">
						<div class="col-md-6">
							<button href="#"  id="rth_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Rettungshelikopter deaktivieren</button>
							<button href="#"  id="pth_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Polizeihelikopter deaktivieren</button>
							<button href="#"  id="was_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Wasserrettung deaktivieren</button>
							<button href="#"  id="rhs_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Rettungshundestaffel deaktivieren</button>
						</div>
						<div class="col-md-6">
							<button href="#"  id="rth_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Rettungshelikopter aktivieren</button>
							<button href="#"  id="pth_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Polizeihelikopter aktivieren</button>
							<button href="#"  id="was_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Wasserrettung aktivieren</button>
							<button href="#"  id="rhs_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Rettungshundestaffel aktivieren</button>
						</div>
					</div>
				</div>
				<div role="tabpanel" class="tab-pane" id="pd" style="padding: 15px;">
					<div class="row">
						<div class="col-md-6">
							<button href="#"  id="pd_dhs_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Diensthundestaffel deaktivieren</button>
							<button href="#"  id="pd_kri_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Kriminalpolizei deaktivieren</button>
							<button href="#"  id="pd_2z1_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">2. Zug der 1. Hundertschaft deaktivieren</button>
							<button href="#"  id="pd_3z1_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">3. Zug der 1. Hundertschaft deaktivieren</button>
							<button href="#"  id="pd_gef_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Gefangenenkraftwagen deaktivieren</button>
							<button href="#"  id="pd_was_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Wasserwerfer deaktivieren</button>
							<button href="#"  id="pd_se1_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">SEK: 1. Zug deaktivieren</button>
							<button href="#"  id="pd_se2_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">SEK: 2. Zug deaktivieren</button>
							<button href="#"  id="pd_me1_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">MEK: 1. Zug deaktivieren</button>
							<button href="#"  id="pd_me2_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">MEK: 2. Zug deaktivieren</button>
						</div>
						<div class="col-md-6">
							<button href="#"  id="pd_dhs_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Diensthundestaffel aktivieren</button>
							<button href="#"  id="pd_kri_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Kriminalpolizei aktivieren</button>
							<button href="#"  id="pd_2z1_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">2. Zug der 1. Hundertschaft aktivieren</button>
							<button href="#"  id="pd_3z1_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">3. Zug der 1. Hundertschaft aktivieren</button>
							<button href="#"  id="pd_gef_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Gefangenenkraftwagen aktivieren</button>
							<button href="#"  id="pd_was_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Wasserwerfer aktivieren</button>
							<button href="#"  id="pd_se1_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">SEK: 1. Zug aktivieren</button>
							<button href="#"  id="pd_se2_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">SEK: 2. Zug aktivieren</button>
							<button href="#"  id="pd_me1_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">MEK: 1. Zug aktivieren</button>
							<button href="#"  id="pd_me2_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">MEK: 2. Zug aktivieren</button>
						</div>
					</div>
				</div>
				<div role="tabpanel" class="tab-pane" id="thw" style="padding: 15px;">
					<div class="row">
						<div class="col-md-6">
							<button href="#"  id="thw_1zb_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">1. Zug: Bergungsgruppe 2 deaktivieren</button>
							<button href="#"  id="thw_1zz_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">1. Zug: Zugtrupp deaktivieren</button>
							<button href="#"  id="thw_2zg_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">2. Zug: Grundvorraussetzung deaktivieren</button>
							<button href="#"  id="thw_2zb_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">2. Zug: Bergungsgruppe 2 deaktivieren</button>
							<button href="#"  id="thw_2zz_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">2. Zug: Zugtrupp deaktivieren</button>
							<button href="#"  id="thw_fgr_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Fachgruppe Räumen deaktivieren</button>
							<button href="#"  id="thw_fgw_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Fachgruppe Wassergefahren deaktivieren</button>
							<button href="#"  id="thw_fgo_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Fachgruppe Ortung deaktivieren</button>
							<button href="#"  id="thw_fwp_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Fachgruppe Wasserschaden/Pumpen deaktivieren</button>
						</div>
						<div class="col-md-6">
							<button href="#"  id="thw_1zb_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">1. Zug: Bergungsgruppe 2 aktivieren</button>
							<button href="#"  id="thw_1zz_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">1. Zug: Zugtrupp aktivieren</button>
							<button href="#"  id="thw_2zg_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">2. Zug: Grundvorraussetzung aktivieren</button>
							<button href="#"  id="thw_2zb_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">2. Zug: Bergungsgruppe 2 aktivieren</button>
							<button href="#"  id="thw_2zz_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">2. Zug: Zugtrupp aktivieren</button>
							<button href="#"  id="thw_fgr_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Fachgruppe Räumen aktivieren</button>
							<button href="#"  id="thw_fgw_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Fachgruppe Wassergefahren aktivieren</button>
							<button href="#"  id="thw_fgo_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Fachgruppe Ortung aktivieren</button>
							<button href="#"  id="thw_fwp_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Fachgruppe Wasserschaden/Pumpen aktivieren</button>
						</div>
					</div>
				</div>
				<div role="tabpanel" class="tab-pane" id="rd" style="padding: 15px;">
					<div class="row">
						<div class="col-md-6">
							<button href="#"  id="rd_fuh_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Führung deaktivieren</button>
							<button href="#"  id="rd_sani_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Sanitätsdienst deaktivieren</button>
							<button href="#"  id="rd_was_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Wasserrettung deaktivieren</button>
							<button href="#"  id="rd_rhs_de" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Rettungshundestaffel (SEG) deaktivieren</button>
						</div>
						<div class="col-md-6">
							<button href="#"  id="rd_fuh_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Führung aktivieren</button>
							<button href="#"  id="rd_sani_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Sanitätsdienst aktivieren</button>
							<button href="#"  id="rd_was_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Wasserrettung aktivieren</button>
							<button href="#"  id="rd_rhs_ac" class="btn btn-success" style="display:block; margin-bottom:.5rem;">Rettungshundestaffel (SEG) aktivieren</button>
						</div>
					</div>
				</div>
			</div>
			<span style="margin-left: auto; margin-right: auto" id="counter"></span>
		</div>
	`);
	
	$('#counter').html(aBuildings.length + " Gebäude");

	$('.nav.navbar-nav.navbar-right').append(`
		<li class="dropdown" id="builActivate">
            <a href="#" id="menu_builActivate" role="button" class="dropdown-toggle" data-toggle="dropdown">
              <span>Aktivierer</span>
            </a>
        </li>`);

	$('#lightbox_close_activater').on('click', function() {
		$('#lightbox_box_activater').css("display", "none");
	});

	$('#menu_builActivate').on('click', function() {
		$('#lightbox_box_activater').css("display", "block");
	});

	$('#rd_sani_de').on('click', function(){
        activate("Sanitätsdienst", true);
    });

    $('#rd_sani_ac').on('click', function(){
        activate("Sanitätsdienst", false);
    });

	$('#rd_fuh_de').on('click', function(){
        activate("Führung", true);
    });

    $('#rd_fuh_ac').on('click', function(){
        activate("Führung", false);
    });

	$('#rd_was_de').on('click', function(){
        activate("Wasserrettung", true);
    });

    $('#rd_was_ac').on('click', function(){
        activate("Wasserrettung", false);
    });

	$('#rd_rhs_de').on('click', function(){
        activate("Rettungshundestaffel", true);
    });

    $('#rd_rhs_ac').on('click', function(){
        activate("Rettungshundestaffel", false);
    });

	$('#thw_1zb_de').on('click', function(){
        activate("1. Technischer Zug: Bergungsgruppe 2", true);
    });

    $('#thw_1zb_ac').on('click', function(){
        activate("1. Technischer Zug: Bergungsgruppe 2", false);
    });

	$('#thw_1zz_de').on('click', function(){
        activate("1. Technischer Zug: Zugtrupp", true);
    });

    $('#thw_1zz_ac').on('click', function(){
        activate("1. Technischer Zug: Zugtrupp", false);
    });

	$('#thw_2zg_de').on('click', function(){
        activate("2. Technischer Zug - Grundvorraussetzungen", true);
    });

    $('#thw_2zg_ac').on('click', function(){
        activate("2. Technischer Zug - Grundvorraussetzungen", false);
    });

	$('#thw_2zb_de').on('click', function(){
        activate("2. Technischer Zug: Bergungsgruppe 2", true);
    });

    $('#thw_2zb_ac').on('click', function(){
        activate("2. Technischer Zug: Bergungsgruppe 2", false);
    });

	$('#thw_2zz_de').on('click', function(){
        activate("2. Technischer Zug: Zugtrupp", true);
    });

    $('#thw_2zz_ac').on('click', function(){
        activate("2. Technischer Zug: Zugtrupp", false);
    });

	$('#thw_fgr_de').on('click', function(){
        activate("Fachgruppe Räumen", true);
    });

    $('#thw_fgr_ac').on('click', function(){
        activate("Fachgruppe Räumen", false);
    });

	$('#thw_fgw_de').on('click', function(){
        activate("Fachgruppe Wassergefahren", true);
    });

    $('#thw_fgw_ac').on('click', function(){
        activate("Fachgruppe Wassergefahren", false);
    });

	$('#thw_fgo_de').on('click', function(){
        activate("Fachgruppe Ortung", true);
    });

    $('#thw_fgo_ac').on('click', function(){
        activate("Fachgruppe Ortung", false);
    });

	$('#thw_fwp_de').on('click', function(){
        activate("Fachgruppe Wasserschaden/Pumpen", true);
    });

    $('#thw_fwp_ac').on('click', function(){
        activate("Fachgruppe Wasserschaden/Pumpen", false);
    });

	$('#pd_dhs_de').on('click', function(){
        activate("Diensthundestaffel", true);
    });

    $('#pd_dhs_ac').on('click', function(){
        activate("Diensthundestaffel", false);
    });

	$('#pd_kri_de').on('click', function(){
        activate("Kriminalpolizei", true);
    });

    $('#pd_kri_ac').on('click', function(){
        activate("Kriminalpolizei", false);
    });

	$('#pd_2z1_de').on('click', function(){
        activate("2. Zug der 1. Hundertschaft", true);
    });

    $('#pd_2z1_ac').on('click', function(){
        activate("2. Zug der 1. Hundertschaft", false);
    });

	$('#pd_3z1_de').on('click', function(){
        activate("3. Zug der 1. Hundertschaft", true);
    });

    $('#pd_3z1_ac').on('click', function(){
        activate("3. Zug der 1. Hundertschaft", false);
    });

	$('#pd_gef_de').on('click', function(){
        activate("Gefangenenkraftwagen", true);
    });

    $('#pd_gef_ac').on('click', function(){
        activate("Gefangenenkraftwagen", false);
    });

	$('#pd_was_de').on('click', function(){
        activate("Wasserwerfer", true);
    });

    $('#pd_was_ac').on('click', function(){
        activate("Wasserwerfer", false);
    });

	$('#pd_se1_de').on('click', function(){
        activate("SEK: 1. Zug", true);
    });

    $('#pd_se1_ac').on('click', function(){
        activate("SEK: 1. Zug", false);
    });

	$('#pd_se2_de').on('click', function(){
        activate("SEK: 2. Zug", true);
    });

    $('#pd_se2_ac').on('click', function(){
        activate("SEK: 2. Zug", false);
    });

	$('#pd_me1_de').on('click', function(){
        activate("MEK: 1. Zug", true);
    });

    $('#pd_me1_ac').on('click', function(){
        activate("MEK: 1. Zug", false);
    });

	$('#pd_me2_de').on('click', function(){
        activate("MEK: 2. Zug", true);
    });

    $('#pd_me2_ac').on('click', function(){
        activate("MEK: 2. Zug", false);
    });

	$('#rth_de').on('click', function(){
        activateBuilding(5, true);
    });

    $('#rth_ac').on('click', function(){
        activateBuilding(5, false);
    });

	$('#pth_de').on('click', function(){
        activateBuilding(13, true);
    });

    $('#pth_ac').on('click', function(){
        activateBuilding(13, false);
    });

	$('#was_de').on('click', function(){
        activateBuilding(15, true);
    });

    $('#was_ac').on('click', function(){
        activateBuilding(15, false);
    });

	$('#rhs_de').on('click', function(){
        activateBuilding(21, true);
    });

    $('#rhs_ac').on('click', function(){
        activateBuilding(21, false);
    });

	$('#fw_abroll_de').on('click', function(){
        activate("Abrollbehälter", true);
    });

    $('#fw_abroll_ac').on('click', function(){
        activate("Abrollbehälter", false);
    });

	$('#fw_sani_de').on('click', function(){
        activate("Rettungsdienst", true);
    });

    $('#fw_sani_ac').on('click', function(){
        activate("Rettungsdienst", false);
    });

	$('#fw_was_de').on('click', function(){
        activate("Wasserrettungs", true);
    });

    $('#fw_was_ac').on('click', function(){
        activate("Wasserrettungs", false);
    });

	$('#fw_flu_de').on('click', function(){
        activate("Flughafen", true);
    });

    $('#fw_flu_ac').on('click', function(){
        activate("Flughafen", false);
    });

	$('#fw_gro_de').on('click', function(){
        activate("Großwache", true);
    });

    $('#fw_gro_ac').on('click', function(){
        activate("Großwache", false);
    });

	$('#fw_wer_de').on('click', function(){
        activate("Werkfeuerwehr", true);
    });

    $('#fw_wer_ac').on('click', function(){
        activate("Werkfeuerwehr", false);
    });
})();
