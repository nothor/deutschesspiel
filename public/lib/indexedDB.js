/************************************************************************************************************************
* INDEXEDDB FUNCTIONALITY
* Allows to save the current shown savedGames into the Browser Cach�.
*/

//El objeto indexedDB contiene todos los m�todos y propiedades necesarias para trabajar con nuestra base de datos local
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

var dataBase = null;
var bDataBaseAvailable = false;

// Conseguimos que en la variable dataBase tengamos el �conector� abierto a nuestra base de datos. Si no existe, se crea
function startDB(callback) {
	dataBase = indexedDB.open("object", 1);
	
	// Se ejecuta cuando se crea una nueva versi�n de una base de datos.
	// Deberemos incluir todas las instrucciones necesarias para crear o editar la estructura de nuestra base de datos.
	dataBase.onupgradeneeded = function (e) {

		//Primero recuperar el conector a la base de datos
		var active = dataBase.result;
	
		//D�nde savedGames es la "colecci�n" y "opciones" tiene KeyPath y autoincremento de Key, es decir, se tiene un ID que se autocompleta.
		var object = active.createObjectStore("savedGames", { keyPath : 'id', autoIncrement : true });
	
		//A�adimos m�s propiedades (keys) a nuestra colecci�n. Algunos con identificador �nico (unique : true) y Otros pueden estar repetidos.
		object.createIndex('by_gameId', 'gameId', { unique : true });
		object.createIndex('by_gameIndexPosArr', 'gameIndexPosArr', { unique : false });
		object.createIndex('by_gameProgress', 'gameProgress', { unique : false });
		object.createIndex('by_gameCorrect', 'gameCorrect', { unique : false });
		object.createIndex('by_gameFail', 'gameFail', { unique : false });
	
	};
	
	dataBase.onsuccess = function (e) {
		console.log('IndexedDB: Base de datos cargada correctamente');
		
		//As� de simple se a�ade un Callback! Para hacerlo opcional he de ver primero si es una funci�n!
		//Hacemos CALLBACK SOLO si se ha cargado correctamente la DataBase!
		typeof callback == "function" && callback();
	};
		
	dataBase.onerror = function (e)  {
		console.log('IndexedDB: Error cargando la base de datos');
	};
}

function add(oCurrentGameStatus) {
	
	/*OJO! Para recuperar la conexi�n tenemos que estar seguros que se ha cargado correctamente la DataBase!*/
	//Llamar a la funci�n dentro del CallBack de startDB como muy pronto.
	
	//Primero recuperar el conector a la base de datos
	var active = dataBase.result;
	
	//Iniciamos transacci�n (de lectura y escritura)
	var data = active.transaction(["savedGames"], "readwrite");
	var object = data.objectStore("savedGames");
	var request = object.put({
		// no se ha introducido la propiedad �id� puesto que es un valor autoincremental y no tenemos que preocuparnos por �l
        gameId: oCurrentGameStatus.gameId,
        gameIndexPosArr: oCurrentGameStatus.gameIndexPosArr,
		gameProgress: oCurrentGameStatus.gameProgress,
		gameCorrect: oCurrentGameStatus.gameCorrect,
		gameFail: oCurrentGameStatus.gameFail						
	});
	
	request.onerror = function (e) {
		console.log('IndexedDB: ' + request.error.name + '\n\n' + request.error.message);
		return -1;
	};
	
	data.oncomplete = function (e) {
		console.log('IndexedDB: Objeto ' + oCurrentGameStatus.id + ' agregado a IndexedDB correctamente');
	};
}

function addAll() {

	var iResult = 0;
	for(var i = 0 ; i < oGamesStatus.length; i++ ){
		//Fijamos el Orden (gameCorrect: i) por defecto del Array (definido Alfab�ticamente)
		iResult = add(oGamesStatus[i]);
	}
	
	if(iResult<0){
		alert('IndexedDB: Not all Games Correctly Saved');
	}
	else {
		alert('IndexedDB: All Current Games Correctly Saved');
	}
}

function loadAll(callback) {
	
	/*OJO! Para recuperar la conexi�n tenemos que estar seguros que se ha cargado correctamente la DataBase!*/
	//Llamar a la funci�n dentro del CallBack de startDB como muy pronto.
	
	//Primero recuperar el conector a la base de datos
	var active = dataBase.result;
	
	//Iniciamos transacci�n (solo de lectura)
	var data = active.transaction(["savedGames"], "readonly");
	
	//Indicar qu� almac�n queremos utilizar en la transacci�n
	var object = data.objectStore("savedGames");
	
	//Como vamos a recuperar la informaci�n en base a la clave primaria del almac�n, 
	//s�lo debemos empezar a recorrer el almac�n, puesto que �ste ya nos devolver� los objetos ordenados por su clave primaria.
	
	//openCursor es una especie de "forEach"
	var elements = [];
    object.openCursor().onsuccess = function (e) {
		var result = e.target.result;
		
		//Si no es nulo, agregarlo a elements
		if (result === null) {
			return;
		}

		//las Keys de los elements los defino como mejor me sirve luego para cargarlo en variables.
		elements.push({
			gameId: result.value.gameId,
			gameIndexPosArr: result.value.gameIndexPosArr,			//Important!! We can put HTML code inside! i.e. "<div>bar<br><br><b>Custom<br>Elements<br>Making<br>Group<br>Content<br>Tall<br></b></div>"
			gameProgress: result.value.gameProgress,		//NEW Key used to have the last Update of every group.
			gameCorrect:	result.value.gameCorrect,		//gameCorrect can be a property name (alphabetic) a number (iPosition) or a sorting function
			gameFail: result.value.gameFail		//NEW Key used to have the user who exported the group.
		});
		result.continue();
	};

	
	data.oncomplete = function () {
		for (var key in elements) {
			console.log(elements[key]);
		}
		//Retorno una funci�n con los elements
		typeof callback == "function" && callback(elements);

	};

}

function clearAll(){
		
	var active = dataBase.result;
	var data = active.transaction(["savedGames"], "readwrite");
	var objectReq = data.objectStore("savedGames").clear();
		
	objectReq.onsuccess = function () {
		console.log('IndexedDB: Previous Database Cleared successfully');
	};
	objectReq.onerror = function(event) {
		console.log('IndexedDB: Error clearing database.');
	};
}