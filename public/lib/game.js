//Artikel Wort Präteritum Perfekt Reflexiv  Präposition Kasus Gegensatz Spanisch Beispiel Bemerkung
var sIDKey = "id";
var sArtikelKey = "article";
var sWordsKey = "word";
var sPrateritumKey = "preteritum";
var sPerfektKey = "perfect";
var sReflexivKey = "reflexive";
var sPrapositionKey = "preposition";
var sKasusKey = "case";
var sGegensatzKey = "opposite";
var sUbersetzungKey = "spanish";
var sPhraseKey = "phrase";
var sBemerkungKey = "comment";

//var  dynamic Arrays must to be Declared in a Module! Not in a UserForm
var aDictionary = [];
var aIndexPosition = [];
var aPraepositionList= [];   //All Available Präpositionen
var aPraepAkkList= [];   //All Available Präpositionen
var aPraepDatList= [];   //All Available Präpositionen

var aSustantiveList = [];
var aVerbenList = [];
var aAdjektivList = [];
var aSonstigeList = [];

var bRepeatQuestion;   //If we failed it once
var sPhraseDelimiter = "|";

var lCorrectAnswerIndex = 0;
var lRndIndexPosition = 0;
var sCorrectAnswer = "";
var sCorrectPhrase = "";	//Frase Original
var iCorrect = 0;
var iFail = 0;
var iUserInactive = 0;

//NEW
var sButtonOptionClass = ".btn-block";	//Clase que tienen SOLO los botones de opciones.
var sCorrectLabel = "correct-label";
var sFailLabel = "fail-label";
var sGameProgress = "game-progress";
var sWordToAskLabel = "#word-to-ask";
var sPhraseLabel = "#phrase";
var sPreteritumLabel = "#preteritum-label";
var sPerfectLabel = "#perfect-label";
var sCaseLabel = "#case-label";
var sTranslationLabel = "#translation-label";
var sOppositeLabel = "#opposite-label";

var sGameNameLabel = "#game-name";
var sGameDescriptionLabel = "#game-description";

var sPathDataBases = "data/";
var sDictionaryDatabase = "database";	//Añadimos la extensión en iniDataBase

var sFilterKey = sWordsKey;	//sWordsKey, sArtikelKey, sKasusKey, sGegensatzKey, sPerfektKey
var sCorrectAnswerKey = sUbersetzungKey;
var fProgressValue = 0;

//Classes
var sDefaultButtonClass = 'btn-primary';
var sSuccessButtonClass = 'btn-success';
var sAnimationSuccess = 'pulse';	// http://sevenx.de/demo/bootstrap-thumbnail-animation/animate.css_effekt.htm
var sAnimationFail = 'shake';

//Save/Load
var oGamesStatus = [];		//El status de todos los Juegos.
var oCurrentGameStatus = {};	//El status del Juego Actual.
var iCurrentGameId = 4;

//Timer
var sTimeProgress = "time-progress";
var iMaxTimer = 15;
var iCurrentTimer = 15;
var iAddTimer = 10;	//El tiempo que aÃ±adimos despuÃ©s de una respuesta correcta
var iTimerID;

//MISC
var bPause = false;


/*
NOTAS
	Attributo = Todos los campos que puede tener un elemento de DOM (class, id, href, etc.)
	Class = Attributo que define a quÃ© grupo pertenece un elemento dentro del DOM.
	ID = Attributo que identifica unequivocamente ese elemento dentro del DOM.

JQUERY
	Para usar JQuery encapsulamos el elemento --> $(elemento)
	A partir de aquÃ­ podemos usar las funciones JQuery
*/


//------------------------------------PAGE FULLY LOADED----------------------------------------------------------
//executes when complete page is fully loaded, including all frames, objects and images.
//Code included inside $( window ).load(function() { ... }) will run once the entire page (images or iframes), not just the DOM, is ready.
$(window).load(function () {

});

//Execute when HTML page is active in Browser
$(window).focus(function() {
	//Continue with Timer
	console.log('State: focus');
});

//Execute when HTML page is inactive in Browser
$(window).blur(function() {
	//Pause the Timer
	//Careful! When alert active the window is also blur!
	//alert("Spiel pausiert...");
	console.log('State: blur');
});

//------------------------------------DOCUMENT READY----------------------------------------------------------
$(document).ready(function () {
//Code included inside $( document ).ready() will only run once the page Document Object Model (DOM) is ready for JavaScript code to execute
// executes when HTML-Document is loaded and DOM is ready.
// But before images and other resources have finished.

	//Select Game and iniGame
	iniGame();
	
	
	//Load IndexedDB
	startDB(function(){
		//Automatically Load Game as Callback
		loadGame();
	});

	/*LISTENERS*/ 
	$(document).on('click', sButtonOptionClass, function() {
		
		//Contador de inactividad a 0
		iUserInactive = 0;
		
		var sButtonOptionID = $(this).attr("id");
		var oButtonOption = document.getElementById(sButtonOptionID);
		
		if($(oButtonOption).hasClass('active')){	
			
			var sAnswer = $(oButtonOption).text();	//Without JQuery --> var sAnswer = oButtonOption.textContent;
			
			if (isCorrectAnswer(sAnswer)){
				
				//Paramos el Timer
				clearInterval(iTimerID);
				
				//Aumentamos puntuaciÃ³n
				iCorrect++;
				
				//Si la pregunta se ha respondido bien a la primera, la eliminamos para NO repetirla.
				if (!(bRepeatQuestion)) {
					//Eliminamos el elemento del array para que NO vuelva a aparecer
					deleteArrayElement(aIndexPosition, lRndIndexPosition);
				}
				
				var iAnswerShownTime = showCorrectAnswer(oButtonOption);
					
				//Dejamos un Timeout antes de pasar a la siguiente.
				setTimeout(function(){
					playGame();
				}, iAnswerShownTime);
			}
			else{	
				iFail++;
				
				//Si la respuesta es incorrecta inhabilitamos el boton
				$(oButtonOption).removeClass('active');
				$(oButtonOption).addClass('disabled');

				//Fail Animation
				$(oButtonOption).addClass(sAnimationFail + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
					$(this).removeClass(sAnimationFail + ' animated');
				});

				bRepeatQuestion = true;
			}
			updateScore();
		}
	});

	$(document).on('click','#save-game', function(e) {
		saveGame();
	});
	
	$(document).on('click','#new-game', function(e) {
		newGame();
	});
	
	$(document).on('click','#load-game', function(e) {
		//load Calendars Previously Saved
		loadGame();
		if(typeof oCurrentGameStatus === 'undefined'){	
			alert("There isn't any previous saved Game!");
		}
	});
	
	// attach events to the navigation buttons
	document.onkeypress = function(evt) {
		
		//Prevent to do the default funciÃ³n from this Key.
		evt.preventDefault();
		
		if (bPause){
			//If game is already paused then don't do anything
			console.log("Game already in Pause...");
		}
		else{
		
			evt = evt || window.event;
			var charCode = evt.which || evt.keyCode;
			
				switch (charCode) {
				case 27:	//"ESC" button 27
					//do something
					bPause = true;
					break;
				}
		}
		
		if(bPause){
			alert("Spiel pausiert...");
			bPause = false;
			console.log("Game Running...");
		}

	};
 
});

function newGame() {
	iCorrect = 0;
	iFail = 0;
	aIndexPosition = [];
	
	//Timer
	iCurrentTimer = iMaxTimer;
	clearInterval(iTimerID);
	
	//Creamos un array con las posiciones de cada indice en aDictionary	
	for (var j = 0; j < aDictionary.length; j++) {
		aIndexPosition.push(j);
	}
	
	playGame();
}

function saveGame() {

	//Update GameStatus
	gameStatusUpdate();
	
	//First delete the previous SavedGame.
	clearAll();
		
	//Save the current GameStatus as a SavedGame.
	addAll();
}
	
function loadGame() {
	
	//Everytime we load a game we have to iniValues
	oGamesStatus = [];
	oCurrentGameStatus = {};
	
	loadAll(function(g){
		//IMPORTANTE: La función loadAll es asincrona con lo cual tenemos que esperar a ejecutar el siguiente código cuando acabe de cargar todos los grupos "g". Esto lo hacemos con un callback en Load All!
		
		//Cargamos la partida del Juego que toque.
		oGamesStatus = g.filter(function (data) {
			return data.gameId == iCurrentGameId;
		});
		oCurrentGameStatus = oGamesStatus[0];	//En Filter siempre obtenemos un array... :(
		
		//OJO en oGameStatus tenemos también las partidas de los demás juegos! No podemos borrarlo.
		//Restauramos oGameStatus
		oGamesStatus = g;
		
		//Si hay algo que cargar
		if(typeof oCurrentGameStatus !== 'undefined'){	
			//Actualizamos los valores
			aIndexPosition = oCurrentGameStatus.gameIndexPosArr;
			fProgressValue = oCurrentGameStatus.gameProgress;
			iCorrect = oCurrentGameStatus.gameCorrect;
			iFail = oCurrentGameStatus.gameFail;
			
			//Timer
			iCurrentTimer = iMaxTimer;
			clearInterval(iTimerID);
			
			//StartGame
			playGame();		
		}
		else {
			newGame();
		}
	});
}

function iniGame(){
	
	//Usamos el ID del juego como Index de los Array.
	var aFilterKeys = [sArtikelKey, sGegensatzKey, sWordsKey, sPerfektKey, sPrapositionKey];	//sKasusKey --> sPrapositionKey
	var aCorrectAnswerKey = [sArtikelKey, sGegensatzKey, sUbersetzungKey, sPerfektKey, sPrapositionKey];
	
	//Extract GameID from URL <a href='game.html?id=2'>Wörterspiel</a>
	iCurrentGameId = getURLParameter('id');
	
	//Si NO hay id, cargamos por defecto el juego 0
	iCurrentGameId = (typeof iCurrentGameId !== "undefined") ? iCurrentGameId : 0;
	
	//Set Game Variables
	sFilterKey = aFilterKeys[iCurrentGameId];
	sCorrectAnswerKey = aCorrectAnswerKey[iCurrentGameId];
	
	//Update Game HTML name and description
	var sJSONPath = sPathDataBases + "gamedescription" + ".json"; 
	$.getJSON(sJSONPath, function(sGameLabels) {
		$(sGameNameLabel).text(sGameLabels[iCurrentGameId].name);	
		$(sGameDescriptionLabel).text(sGameLabels[iCurrentGameId].description);	
	});	
	
	//Load DataBase and Filter for gameID
	sJSONPath = sPathDataBases + sDictionaryDatabase + ".json"; 
	$.getJSON(sJSONPath, function(json) {		
		//Filtramos las palabras que sirven para el Juego
		aDictionary = json.filter(function(data) { 
				return (data[sFilterKey] !== "");
		});
		
		//Cargamos las preposiciones para el Juego 4
		if(iCurrentGameId == 4){ iniPrepositionList(); }	
	});	
}

function iniPrepositionList(){

	$.each(aDictionary, function(i, el){
		if($.inArray(el[sPrapositionKey], aPraepositionList) === -1) aPraepositionList.push(el[sPrapositionKey]);
		
		//Además las separamos por Kasus.
		var sTempKasus = el[sKasusKey]
		if(sTempKasus.indexOf("Dativ") == 0) {	
			if($.inArray(el[sPrapositionKey], aPraepDatList) === -1) aPraepDatList.push(el[sPrapositionKey]);
		}
		else if (sTempKasus.indexOf("Akkusativ") == 0) {
			if($.inArray(el[sPrapositionKey], aPraepAkkList) === -1) aPraepAkkList.push(el[sPrapositionKey]);
		}
	});
}

function iniButtons(){
	
	$(sButtonOptionClass).each (function() {
		//$(this).show();	//Si los hubieramos ocultado
		$(this).removeClass('disabled').addClass('active');
	});
}

function endGame(){
		
	//Antes de salir tenemos que actualizar la puntuación!
	updateScore(); 
	
	//Actualizamos Contador Preguntas que faltan
	setGameProgressBar();
	
	if(aIndexPosition.length>0){
		alert("Sie mÃ¼ssen schneller antworten! Sie kÃ¶nnen speichern und erneut anfangen...");
	}
	else{
		alert("Erfolgt! Sie haben alle Fragen richtig geantwortet!");
	}
	
	//Disable all buttons
	$(sButtonOptionClass).each (function() {
		$(this).removeClass('active').addClass('disabled');
	});
}

function gameStatusUpdate(){
	
	//Update Game Status in with the info that can be saved.
	
	//We define an Object {} with keys instead of an Array []
	oCurrentGameStatus = {};
	
	//Variables To Save/Load
	oCurrentGameStatus["gameId"] = iCurrentGameId;
	oCurrentGameStatus["gameIndexPosArr"] = aIndexPosition;			
	oCurrentGameStatus["gameProgress"] = fProgressValue;	
	oCurrentGameStatus["gameCorrect"] = iCorrect;
	oCurrentGameStatus["gameFail"] = iFail;
	
	//Update Inside oGamesStatus Array
	var bFound = false;
	for(var i=0; i< oGamesStatus.length; i++){
		if(oGamesStatus[i].gameId == oCurrentGameStatus.gameId){
			oGamesStatus[i].gameIndexPosArr = oCurrentGameStatus.gameIndexPosArr;		
			oGamesStatus[i].gameProgress = oCurrentGameStatus.gameProgress;		
			oGamesStatus[i].gameCorrect = oCurrentGameStatus.gameCorrect;	
			oGamesStatus[i].gameFail = oCurrentGameStatus.gameFail;
			bFound = true;
			break;
		}
	}
	//If Not Found we add this game...
	if(!bFound){
		oGamesStatus.push(oCurrentGameStatus);
	}
}

//Loop del Juego
function playGame(){
	
	var aOptions = [];

	//Primero miramos si se cumplen condiciones para continuar
	if (!(aIndexPosition.length > 0)) {	//Se puede aÃ±adir la condicion vidas == 0
		endGame();
	} else {	

	//AÃ±adimos a la cuenta atrÃ¡s 2s
	setTimer();
	
	//Actualizamos Puntuación
	updateScore();  

	//Actualizamos Contador Preguntas que faltan
	setGameProgressBar();

	//Inicializamos Repeat Question
	bRepeatQuestion = false;

	//Habilitamos Todos los botones de nuevo
	iniButtons();

	//Cogemos un Indice de Palabra al Azar
	lRndIndexPosition = randomIntFromInterval(0, aIndexPosition.length - 1);

	//Miramos a qué indice corresponde en el diccionario
	lCorrectAnswerIndex = aIndexPosition[lRndIndexPosition];

	//Cogemos la Palabra en el Diccionario, que será la Respuesta Correcta
	sCorrectAnswer = aDictionary[lCorrectAnswerIndex][sCorrectAnswerKey];
	
	//Rellenamos la opciones a preguntar con la respuesta correcta incluída.
	createOptions(aOptions);
	
	//Desordenamos las Opciones (excepto para Artikel)
	if(iCurrentGameId != 0){
		shuffle(aOptions);
	}

	//Añadimos las opciones en el anterior orden aleatorio a los botones
	insertOptions(aOptions);

	//Añadimos la palabra a preguntar y todos sus Labels.
	insertLabels();
	
	}
}

function createOptions(aOptions){

	var lTempIndex = 0;
	var sTempWordToAsk = "";
	
	if(iCurrentGameId == 0){
		//Artikel
		aOptions.push("der");
		aOptions.push("die");
		aOptions.push("das");
		aOptions.push("die (Pl.)");
		
	} else if (iCurrentGameId == 1){
		//Gegensätze
		aOptions[0] = sCorrectAnswer;
		
		//Seleccionamos 3 opiones.
		var i = 0;
		do{
			lTempIndex = randomIntFromInterval(0, aDictionary.length - 1);
			sTempWordToAsk = aDictionary[lTempIndex][sGegensatzKey].trim();
			//Miramos que la opción NO sea la propia pregunta.
			if (sTempWordToAsk.toUpperCase() != aDictionary[lCorrectAnswerIndex][sWordsKey].toUpperCase()) {
				//Y que esa opcion NO esté ya.
				if (aOptions.indexOf(sTempWordToAsk) == -1) {
					aOptions.push(sTempWordToAsk);
					i += 1;
				}
			}
		}while (i < 3);
		
		
	} else if (iCurrentGameId == 2){
		//Wörter
		aOptions[0] = sCorrectAnswer;
		
		//Analizamos qué tipo de Palabra es (si es un nombre o un verbo u otro.)
		iWordType = wordType(lCorrectAnswerIndex);

		//Seleccionamos 3 más del mismo tipo.
		var i = 0;
		do{
			lTempIndex = randomIntFromInterval(0, aDictionary.length - 1);
			iTempWordType = wordType(lTempIndex, aDictionary);
			//Miramos que sean del mismo tipo
			if (iTempWordType == iWordType) {
				sTempWordToAsk = aDictionary[lTempIndex][sUbersetzungKey].trim();
				//Miramos que la respuesta NO esté ya como opción.
				if (aOptions.indexOf(sTempWordToAsk) == -1) {
					aOptions.push(sTempWordToAsk);
					i += 1;
				}
			}
		}while (i < 3);
		
	} else if (iCurrentGameId == 3){
		//Perfektform
		var sVerb = aDictionary[lCorrectAnswerIndex][sWordsKey];
		var sPrateritum = aDictionary[lCorrectAnswerIndex][sPrateritumKey];
		
		aPerfektVariants = createPerfektVariants(sVerb, sCorrectAnswer, sPrateritum);

		//Mirar si la respuesta correcta está entre las Variantes Regulares
		if (aPerfektVariants.indexOf(sCorrectAnswer) == -1) {
			//Si NO creamos variantes a partir de la respuesta correcta como Irregulares
			aPerfektVariants = createIrregularPerfektVariants()
			if (aPerfektVariants.indexOf(sCorrectAnswer) == -1) {
				alert("OJO! Opción NO existe la opción correcta!");
			}
		}
		//Luego NO hace falta el Loop While ya que tendremos 4 opciones...
		for(i=0; i<4; i++){	
			aOptions.push(aPerfektVariants[i]);
		}
		
	} else if (iCurrentGameId == 4){
		//Prepositionen
		aOptions[0] = sCorrectAnswer;
		
		var sKasusAnswer = aDictionary[lCorrectAnswerIndex][sKasusKey];
		var aTmpPreapList = [];
		
		//Cogemos preposiciones del mismo tipo (mismo kasus)
		if (sKasusAnswer.indexOf("Dativ") == 0) {
			endIndex = aPraepDatList.length - 1;
			aTmpPreapList = aPraepDatList;
		}
		else if (sKasusAnswer.indexOf("Akkusativ") == 0) {
			endIndex = aPraepAkkList.length - 1;
			aTmpPreapList = aPraepAkkList;
		}
		else{
			endIndex = aPraepositionList.length - 1;
			aTmpPreapList = aPraepositionList;
		}

		//Seleccionamos 3 más de la lista de preposiciones.
		var i = 0;
		do{
			lTempIndex = randomIntFromInterval(0, endIndex);
			sTempWordToAsk = aTmpPreapList[lTempIndex];
			//Miramos que la respuesta NO esté ya como opción.
			if (aOptions.indexOf(sTempWordToAsk) == -1) {
				aOptions.push(sTempWordToAsk);
				i += 1;
			}
		}while (i < 3);
		
	} else {
		alert("Game ID not detected!");
		//default
	}
	
	return aOptions;
}

function insertLabels(){
	
	var sWordToAsk = composeWordToAsk(lCorrectAnswerIndex, aDictionary);
	var sPreteritum = aDictionary[lCorrectAnswerIndex][sPrateritumKey];
	var sPerfect = aDictionary[lCorrectAnswerIndex][sPerfektKey];
	var sCase = aDictionary[lCorrectAnswerIndex][sKasusKey];
	var sTranslation = aDictionary[lCorrectAnswerIndex][sUbersetzungKey];
	var sOpposite = aDictionary[lCorrectAnswerIndex][sGegensatzKey];
	
	//Cojo una frase al azar de las que haya.
	var aPhrases = aDictionary[lCorrectAnswerIndex][sPhraseKey].split(sPhraseDelimiter);
	var sPhrase = aPhrases[randomIntFromInterval(0,aPhrases.length-1)];
		
	if(iCurrentGameId == 0){
		//Artikel
		//sPhrase = "";
		sCorrectPhrase = sPhrase;
		sPhrase = hideArticle(sPhrase, sCorrectAnswer, lCorrectAnswerIndex);
		
	} else if (iCurrentGameId == 1){
		//Gegensätze
		sOpposite = obtainTranslation(sCorrectAnswer);
		
	} else if (iCurrentGameId == 2){
		//Wörter
		sTranslation = "";
		
	} else if (iCurrentGameId == 3){
		//Perfektform
		sPerfect = "";
		
	} else if (iCurrentGameId == 4){
		//Prepositionen
		sCorrectPhrase = sPhrase;
		sPhrase = hidePreposition(sPhrase, sCorrectAnswer);
		
	} else {
		alert("Game ID not detected!");
		//default
	}
	
	/*OJO! la función .text(), escribe en HTML directamente al contenido del Objeto, así que si hemos puesto algun formato dentro, lo machacamos!
	POr lo tanto, es importante definir bien en el HTML el objeto, o en el .text() añadir código HTML
	*/
	
	//A la palabra le añadimos el Artículo, o el Reflexivo o la Preposición, si existen.
	$(sWordToAskLabel).text(sWordToAsk);	
	$(sPreteritumLabel).text(sPreteritum);
	$(sPerfectLabel).text(sPerfect);
	$(sCaseLabel).text(sCase);
	$(sTranslationLabel).text(sTranslation);
	$(sOppositeLabel).text(sOpposite);
	$(sPhraseLabel).text(sPhrase);
	
}

function insertOptions(aOptions){
	
	var n=0;
	$(sButtonOptionClass).each (function() {
		var sOption = aOptions[n];
		$(this).text(sOption);
		n += 1;
	});
}

function isCorrectAnswer(sAnswer){
	
	var bAnswerResult = true;

	if (sAnswer !== sCorrectAnswer){
		bAnswerResult = false
	}
	
	return bAnswerResult;
}

function updateScore(){
	document.getElementById(sCorrectLabel).innerHTML = iCorrect; 
	document.getElementById(sFailLabel).innerHTML = iFail; 
}

function setGameProgressBar (){
	
	iMinWidth = 3;	//Mínima anchura para que se vean los números por debajo del 3%
	
	fProgressValue = 100*(aDictionary.length - aIndexPosition.length)/aDictionary.length;
	fProgressValue = fProgressValue.toFixed(2);	//Limited to 2 decimals
	
	var oGameProgress = document.getElementById(sGameProgress);
	$(oGameProgress).attr("aria-valuenow", fProgressValue);
	$(oGameProgress).attr("style","min-width: " + iMinWidth + "%; width: "+ (iMinWidth + (fProgressValue*(100-iMinWidth)/100)) +"%;");
	$(oGameProgress).text(fProgressValue + "%");
	
}


function showCorrectAnswer(oButtonOption){
	
	if(typeof oButtonOption === 'undefined'){
		//we look for them
		$("." + sDefaultButtonClass).each(function() {
			if(isCorrectAnswer($(this).text())){
				oButtonOption = this;
				return false;	//break the loop
			}
		});
	}
	
	//Success Animation
	$(oButtonOption).removeClass(sDefaultButtonClass).addClass(sSuccessButtonClass);
	$(oButtonOption).addClass(sAnimationSuccess + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
		//Callback
		$(this).removeClass(sAnimationSuccess + ' animated');
		$(this).removeClass(sSuccessButtonClass).addClass(sDefaultButtonClass);
	});
				
	var iTimeOut = 500;
	
	//Podemos revelar la respuesta si la hemos guardado en sCorrectPhrase
	if(sCorrectPhrase !== ""){
		$(sPhraseLabel).text(sCorrectPhrase);
		//Despuê³ de 1 segundo se pasa a la siguiente pregunta.
		iTimeOut = 1000;
	}
	
	return iTimeOut;
}

function countdown(iNewTimer, callback) {
	
	var oTimeProgress = document.getElementById(sTimeProgress);
	
	//Initialize Color TimeBar
	setTimerFormat(iNewTimer);
	
	//First Time
	oTimeProgress.style.width = Math.floor(100 * iNewTimer / iMaxTimer) + '%';
	//$(oTimeProgress).attr("aria-valuenow", iCurrentTimer);
	$(oTimeProgress).text(iNewTimer + "s");	
	
    iCurrentTimer = iNewTimer-1; 
    iTimerID = setInterval(function() {
        oTimeProgress.style.width = Math.floor(100 * iCurrentTimer-- / iMaxTimer) + '%';
		//$(oTimeProgress).attr("aria-valuenow", iCurrentTimer);
		$(oTimeProgress).text(iCurrentTimer + 1 + "s");
		
		setTimerFormat(iCurrentTimer);
		
        if (iCurrentTimer < -1) {	
			iCurrentTimer = 0;
            clearInterval(iTimerID);
			callback();
            // 600ms - width animation time
            //callback && setTimeout(callback, 600);
        }

    }, 1000);
}

function setTimer(){
	
	if(iUserInactive > 3){
		//Ver si hay el jugador...
		alert("Hallo? Ist jemand hier?");
	}
	
	var iNewTimer = iCurrentTimer + iAddTimer;
	if(iNewTimer > iMaxTimer){
		iNewTimer = iMaxTimer;
	} 	
	countdown(iNewTimer, function() {
		//Podemos acabar el Juego
		//endGame();
		
		//O podemos dar por incorrecta, mostrar la respuesta (y quitar vidas...)
		iFail ++;
		iUserInactive ++;
		var iAnswerShownTime = showCorrectAnswer();		
		//Dejamos un Timeout antes de pasar a la siguiente.
		setTimeout(function(){
			playGame();
		}, iAnswerShownTime);
	});
}

function setTimerFormat(iTimer){
	
	var oTimeProgress = document.getElementById(sTimeProgress);
	//Initialize Color TimeBar
	$(oTimeProgress).removeClass("progress-bar-danger progress-bar-warning progress-bar-success");
	
	if(iTimer > iMaxTimer*0.5) {
		//Normal ProgressBar
		$(oTimeProgress).addClass("progress-bar-success");
			
	} else if (iTimer > iMaxTimer*0.1)
		//Warning ProgressBar
		$(oTimeProgress).removeClass("progress-bar-success").addClass("progress-bar-warning");
			
	else {
		//Danger ProgressBar
		$(oTimeProgress).removeClass("progress-bar-warning").addClass("progress-bar-danger");
	}
	
}


function composeWordToAsk(lIndex, aDictionary){
	
	var aWordToAsk = [];
		
	var	sWord = aDictionary[lIndex][sWordsKey];
	var sArtikel = aDictionary[lIndex][sArtikelKey];	
	var sReflexive = aDictionary[lIndex][sReflexivKey];
  	var sPreposition = aDictionary[lIndex][sPrapositionKey];
    
	aWordToAsk.push(sArtikel);
	aWordToAsk.push(sWord);
	aWordToAsk.push(sReflexive);
	aWordToAsk.push(sPreposition);
	
	//Hide sCorrectAnswer si estuviera a no ser que sea la propia pregunta iIndex != 1
	var iIndex = aWordToAsk.indexOf(sCorrectAnswer);
	if((iIndex != 1) && (iIndex != -1)){
		deleteArrayElement(aWordToAsk, iIndex);
	}
	
	//Lo ponemos todo junto en el orden de push
	var sWordToAsk = aWordToAsk.join(" ").trim();
    
return sWordToAsk;
    
}

/*WÖRTER FUNCTIONS*/
function wordType(lIndex){

	var iWordType = 0;

	//Miramos si contiene artículo (función isSubstantive)
    if (isSubstantive(lIndex)){
        iWordType = 1;
	}
    else if (isVerben(lIndex)) {
        iWordType = 2;
	}
    else {
        iWordType = 3;
    }
    //Miramos si contiene conjunción (función isVerben)
    //Si no, otro.

	return iWordType;
}


function isSubstantive(lIndex){

	bResult = false;

    if (aDictionary[lIndex][sArtikelKey] != ""){
        bResult = true;
    }

	return bResult;
}

function isVerben(lIndex){

	var bResult = false;

    if (aDictionary[lIndex][sPerfektKey] != ""){
        bResult = true;
    }

	return bResult;
}

/*PERFEKT FUNCTIONS*/
function createPerfektVariants(sVerb, sPerfekt, sPrateritum, bCheckFestPrefix) {

	//http://www.mein-deutschbuch.de/perfekt.html

	var aPerfektVariants = [];
	var aFestenPrefixes = ["be", "emp", "ent", "er", "ge", "hinter", "miss", "ver", "zer"];

	var bCheckFestPrefix = typeof bCheckFestPrefix !== 'undefined' ?  bCheckFestPrefix : true;

	var sPrefix = "";

	/*************************************
	'TrennbarPrefix
	'*************************************/

	sPrateritum = sPrateritum.trim();
	var aPrateritum = sPrateritum.split(" ");

	//Si es un Trennbarverb
	if (aPrateritum.length > 1) {
		sVerb = sVerb.replace(aPrateritum[aPrateritum.length-1], "");	//  Replace(sVerb, aPrateritum(UBound(aPrateritum)), "")
		sPrefix = aPrateritum[aPrateritum.length-1];

	/*************************************
	'FestPrefix
	'*************************************/
	//Si tiene Festprefix no se pone el ge- delante
	}
	else{
		if (bCheckFestPrefix) {
			//Evitar casos como bitten --> gebeten --> begeten!
			for (var sFestPrefix of aFestenPrefixes) {
				if (sVerb.indexOf(sFestPrefix) == 0) {
					sVerb = sVerb.substr(sFestPrefix.length);
					sPrefix = sFestPrefix;
					break;
				}
			}
		}
	}

	//Option 1: ge+VERB
	var sTmp = sVerb;
	aPerfektVariants[0] = sPrefix + "ge" + sTmp;

	//Option 2: ge+VERB+t
	sTmp = sVerb;
	var iPos = sTmp.length - 2;

	//Si acaba en "en"
	if (sTmp.indexOf("en", iPos) !==-1) {
		sTmp = sTmp.substr(0, iPos) + "t";
		
	} else if (sTmp.indexOf("n", iPos+1) !==-1){
		sTmp = sTmp.substr(0, iPos) + "t";
	}
	else{
		alert("OJO! El verbo " + sVerb + " está en infinitivo?")
	}

	//Si antes del -en hay una t,d,m,n se ha de añadir una e.
	iPos = sTmp.length - 2;
	
	if (sTmp.indexOf("tt", iPos) !==-1) {
		sTmp = sTmp.substr(0, iPos) + "tet";
	}		
	else if (sTmp.indexOf("dt", iPos) !==-1) {
		sTmp = sTmp.substr(0, iPos) + "det";
	}
	else if((sTmp.indexOf("mt", iPos) !==-1) && (sPerfekt.indexOf("mt", sPerfekt.length-2) == -1)) {
		sTmp = sTmp.substr(0, iPos) + "met";
	}	
	else if((sTmp.indexOf("nt", iPos) !==-1) && (sPerfekt.indexOf("nt", sPerfekt.length-2) == -1)) {
		sTmp = sTmp.substr(0, iPos) + "net";

	}

	aPerfektVariants[1] = sPrefix + "ge" + sTmp;

	//Option 3: VERB+t
	aPerfektVariants[2] = sPrefix + sTmp;

	//Option 4: VERB
	aPerfektVariants[3] = sPrefix + sVerb;


	return aPerfektVariants;
}

function createIrregularPerfektVariants() {

	var sVerb = "";
	var bCheckFestPrefix = true;
	
	var aPrateritum = aDictionary[lCorrectAnswerIndex][sPrateritumKey];
	var sPerfekt = aDictionary[lCorrectAnswerIndex][sPerfektKey];

	sVerb = sPerfekt;

	//Quitamos el ge y el t, y lo dejamos como si fuera un infinitivo.
	//Por ejemplo gesessen --> sessen, gewusst --> wussen, gerannt --> rannen

	if (sVerb.indexOf("ge") == 0) {
		//gewusst --> wusst
		sVerb = sVerb.substr(2);
		bCheckFestPrefix = false;
	}

	if (sVerb.indexOf("t", sVerb.length-1) !== -1) {
		//wusst --> wussen
		sVerb = sVerb.substr(0, sVerb.length-1) + "en";
		
		if (sVerb.indexOf("een", sVerb.length-3) !== -1) {
			//Por si hubiera wusseen --> wussen
			sVerb = sVerb.substr(0, sVerb.length-3) + "en";
		}
	}

	return createPerfektVariants(sVerb, sPerfekt, aPrateritum, bCheckFestPrefix);

}

/*PREPOSITION FUNCTIONS*/

function hidePreposition(Phrase, WordToHide) {

	var PhraseToReturn = "";
	var sCodified = "__";
	var aWords = [];
	var aSigns = [",", ".", "?", "!", ":"];	//"(", ")","-", ":"

	var sWordToFind = WordToHide.toUpperCase(); 

	var bNotFound = true;

	var CodifiedPhrase = Phrase;	//OJO!!

	//Separar signos puntuación
	// palabra, --> palabra , | palabra? --> palabra ?

	for (var sSign of aSigns) {
	  CodifiedPhrase = CodifiedPhrase.replace(sSign, " " + sSign);
	}

	//Luego separamos por espacios
	aWords = CodifiedPhrase.split(" "); 

	do{
		for(i = 0; i < aWords.length; i++){
			var sWord = aWords[i].toUpperCase();
			
			//Si empieza por la palabra y no es más largo que la palabra + 1
			if ((sWord.indexOf(sWordToFind) == 0) && (sWord.length <= sWordToFind.length + 1)) {
				bNotFound = false;
				break;
			}
			//Empieza por DA o WO y acaba con la palabra. Darauf, darüber, Wofür
			else if ((sWord.indexOf("DA") == 0) || (sWord.indexOf("WO") == 0)) {
				iFoundPos = sWord.indexOf(sWordToFind);
				if ((iFoundPos !== -1) && (iFoundPos = sWord.length - sWordToFind.length + 1)) {
					bNotFound = false;
					break;
				}
			}
		}
		
		if (bNotFound) {
			if (sWordToFind === "IN" || sWordToFind === "AN" || sWordToFind === "VON") {
				sWordToFind = sWordToFind.replace("N", "M");
			}
			else{
				//Salida de emergencia, en teoría NO deberíamos llegar aquí.
				console.log("OJO! No encuentro la palabra " + WordToHide);
				bNotFound = false;
			}
		} else {
			aWords[i] = sCodified;
		}
	}while (bNotFound);

	PhraseToReturn = aWords.join(" ");

	//Restaurar signos puntuación
	for (var sSign of aSigns) {
		PhraseToReturn = PhraseToReturn.replace(" " + sSign, sSign);
	}

	return PhraseToReturn;

}

/*ARTIKEL FUNCTIONS*/
/*TO MODIFY*/
function hideArticle(Phrase, sArticleToHide, lIndex) {
	
	var sCodified = "_";
	var aSigns = [",", ".", "?", "!", ":"];	//"(", ")","-", ":"
		
	var aArticleToFind = [];
	var aDeclinationToFind = [];
	
	//Añadimos a todos el DIE por si hay plural
	var aArticleDER = ["DER", "DEN", "DEM", "DES", "ZUR", "ZUM", "IM", "AM", "VOM", "BEIM"];
	var aArticleDIE = ["DIE", "DER",, "DEN", "ZUR"];
	var aArticleDAS = ["DAS", "DEM", "DES", "ZUM", "IM", "INS", "AM", "ANS", "VOM", "BEIM"];
	var aDeclinationDER = ["E","EN","ER"]; 
	var aDeclinationDIE = ["E","EN"]; 
	var aDeclinationDAS = ["E","EN", "ES"]; 	
	
	//O contiene "EIN", "KEIN"
	
	if(sArticleToHide == "der"){
		aArticleToFind = aArticleDER;
		aDeclinationToFind = aDeclinationDER;
	}else if (sArticleToHide == "das"){
		aArticleToFind = aArticleDAS;
		aDeclinationToFind = aDeclinationDAS;
	}else {
		aArticleToFind = aArticleDIE;
		aDeclinationToFind = aDeclinationDIE;
	}

	var CodifiedPhrase = Phrase;	//OJO!!

	//Separar signos puntuación
	// palabra, --> palabra , | palabra? --> palabra ?

	for (var sSign of aSigns) {
	  CodifiedPhrase = CodifiedPhrase.replace(sSign, " " + sSign);
	}

	//Luego separamos por espacios
	var aWords = CodifiedPhrase.split(" ");
	var aWordsUpperCase = aWords.map(function(data){
		return data.toUpperCase();
	});
	
	//Empezamos la frase desde la palabra hacia atrás
	var	sWordToAsk = aDictionary[lIndex][sWordsKey];
	var iPosWord = -1;
	for (var sWord of aWordsUpperCase){
		//Si contiene --> sWord.indexOf(sWordToAsk.toUpperCase()) !=-1
		//Si es igual --> sWord == sWordToAsk.toUpperCase()
		//Si acaba en --> sWord.indexOf(sWordToAsk.toUpperCase()) + sWordToAsk.length == sWord.length
		//OJO! Las palabras en Genitivo (+S) NO se detectan...
		var iPosInsideWord = sWord.indexOf(sWordToAsk.toUpperCase())
		if((iPosInsideWord !=-1) && (iPosInsideWord + sWordToAsk.length == sWord.length)){
			iPosWord = aWordsUpperCase.indexOf(sWord.toUpperCase());
			break;
		}
	}

	//Buscamos el artÃ­culo, y si NO lo encontramos pues NO hacemos nada...
	//Si lo encontramos, entre la palabra y el artÃ­culo quitamos las declinaciones.
	//Tenemos que aÃ±adir como articulo el EIN o KEIN, con mÃ¡xima length + 2 (+e, , +er, +en, +em)
	
	var iPosArtikel = -1;
	for(var i = iPosWord - 1; i >= 0; i--){
		//Buscamos articulo directamente
		if(aArticleToFind.indexOf(aWordsUpperCase[i]) != -1){
			aWords[i] = sCodified + sCodified;	//Twice
			iPosArtikel = i;
			break;
		}
	}
	
	if(iPosArtikel != -1){
		var bDeclinationFound = false;
		var i = iPosWord - 1;
		for (var j = 0; j < aDeclinationToFind.length; j++){
			var iPosDeclination = aWordsUpperCase[i].length - aDeclinationToFind[j].length;
			//Si acaba en la declinaciÃ³n					
			if(aWordsUpperCase[i].indexOf(aDeclinationToFind[j], iPosDeclination) !== -1){
				var sDeclination = aDeclinationToFind[j];
				bDeclinationFound = true;
				break;
			}
		}
	}
	
	if(bDeclinationFound){
		for (var i = iPosWord - 1; i >= iPosArtikel; i--){
			//Buscamos declinaciones entre artÃ­culo y palabra
			iPosDeclination = aWordsUpperCase[i].length - sDeclination.length;
			if(aWordsUpperCase[i].indexOf(aDeclinationToFind[j], iPosDeclination) !== -1){
				aWords[i] = aWords[i].substr(0, iPosDeclination) + sCodified;
			}
		}
	}

	var PhraseToReturn = aWords.join(" ");

	//Restaurar signos puntuación
	for (var sSign of aSigns) {
		PhraseToReturn = PhraseToReturn.replace(" " + sSign, sSign);
	}
	return PhraseToReturn;
}

/*OPPOSITE FUNCTIONS*/
function obtainTranslation(sWord) {	//, sGegensatz

	var sUbersetzung = "";
	var bFound = false;

	for (j = 0; j< aDictionary.length; j++) {
		if (sWord == aDictionary[j][sWordsKey]) { //And (sGegensatz = aDictionary(j, lGegensatzCol))
			bFound = true;
			break;
		}
	}

	if (bFound) {
		sUbersetzung = aDictionary[j][sUbersetzungKey];
	}else {
		sUbersetzung = "<nicht gefunden>";
	}

	return sUbersetzung;

}

/*HELP FUNCTIONS*/

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function deleteArrayElement(array, index) {
	
	if (index > -1) {
		array.splice(index, 1);
	}

}

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

/**
* http://dummy.com/?technology=jquery&blog=jquerybyexample
* var tech = getURLParameter('technology');
* var blog = getURLParameter('blog');
*/

function getURLParameter(sParam) {
	
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}