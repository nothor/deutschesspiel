# Deutsches Spiel
A Game made in HTML5
![picture](screenshot.png)

## DEMO
https://deutschesspiel.herokuapp.com/

## PREREQUISITES (Play Locally)
1) Install Node.js in your computer
$ sudo apt install nodejs npm

OPTIONAL: If you don't download the node-modules
2) Inside the "Root Server" folder install locally the following node-modules
$ npm init -f
$ npm install --save express
$ npm install --save socket.io

## EXECUTE (Play Locally)
Run the following command inside the "Root Server" folder in order to execute the game as a server
$ node server.js

Open a Browser with the following URL http://localhost:8081/ to see the game

## FAQ
Tested with the following versions (defined in package.json file)
	"express": "^4.17.1",
    "socket.io": "^2.3.0"
    
With socket.io": 3.0.3 appears the following error.
	TypeError: require(...).listen is not a function

