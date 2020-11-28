
var sProgressBarClass = ".progress";
var sCorrectLabel = "correct-label";
var sFailLabel = "fail-label";
var sGameProgress = "game-progress";

var	oGamesStatus = [];


//------------------------------------PAGE FULLY LOADED----------------------------------------------------------
//executes when complete page is fully loaded, including all frames, objects and images.
//Code included inside $( window ).load(function() { ... }) will run once the entire page (images or iframes), not just the DOM, is ready.
$(window).load(function () {

});

//------------------------------------DOCUMENT READY----------------------------------------------------------
$(document).ready(function () {
//Code included inside $( document ).ready() will only run once the page Document Object Model (DOM) is ready for JavaScript code to execute
// executes when HTML-Document is loaded and DOM is ready.
// But before images and other resources have finished.
	
	//Inicializamos los scores
	iniGameStatus();
	
	//Load IndexedDB
	startDB(function(){
		//Llamamos en el Callback para asegurarnos que se ha cargado antes la DB.
		loadGameStatus();
	});
	
});

function iniGameStatus(){
	
	var i = 0;
	$(sProgressBarClass).each (function() {
		var oIniGameStatus = {
			gameId: i,
			gameProgress: 0,
			gameCorrect: 0,
			gameFail: 0
		};
		
		oGamesStatus.push(oIniGameStatus);
		i++;
	});
	
	//Update HTML Labels
	updateGameStatus();
}


function loadGameStatus() {
	
	loadAll(function(g){
		//IMPORTANTE: La función loadAll es asincrona con lo cual tenemos que esperar a ejecutar el siguiente código cuando acabe de cargar todos los grupos "g". Esto lo hacemos con un callback en Load All!
		oGamesStatus = g;
				
		//Update HTML Labels
		updateGameStatus();
	});
}

function updateGameStatus() {
	
	for (i = 0; i < oGamesStatus.length; i++){
		//Actualizamos los valores
		var iGameId = oGamesStatus[i].gameId;
		var fProgressValue = oGamesStatus[i].gameProgress;
		var iCorrect = oGamesStatus[i].gameCorrect;
		var iFail = oGamesStatus[i].gameFail;
		
		//Game Score
		document.getElementById(sCorrectLabel + "-" + iGameId).innerHTML = iCorrect; 
		document.getElementById(sFailLabel + "-" + iGameId).innerHTML = iFail; 
		
		//Progress Bar
		iMinWidth = 3;	//Mínima anchura para que se vean los números por debajo del 3%
		var oGameProgress = document.getElementById(sGameProgress + "-" + iGameId);
		$(oGameProgress).attr("aria-valuenow", fProgressValue);
		$(oGameProgress).attr("style","min-width: " + iMinWidth + "%; width: "+ (iMinWidth + (fProgressValue*(100-iMinWidth)/100)) +"%;");
		$(oGameProgress).text(fProgressValue + "%");		
	}
}