const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const io = new Server(server);
const game = require('./game')
const state = require('./gameState')
const playerQueue = require('./playerQueue')


app.use(cookieParser());
app.use(express.static('static'))


// sentTokenCookie creates a cookie which expires after one day
function sendCookie (ID, res) {
 	res.cookie('userData', {"id" : ID}),{maxAge: 360000}
};

function handleNewUser(req, res) {
	if(Object.getPrototypeOf(req.cookies) == null || !'userData' in req.cookies){
		sendCookie(uuidv4(), res);
		return true
	} else {
		cookie = req.cookies['userData']['id']
		if(!playerQueue.isCookieInMap(cookie)) {
			sendCookie(uuidv4(), res);
		} else {
			return false
		}
		return false
	}
}

app.get('/', (req, res) => {
	newUser = handleNewUser(req, res)
	if(state.runGame) {
		console.log("Game Running")
		if(newUser){
			res.sendFile(__dirname + '/observe.html')
		} else {
			res.sendFile(__dirname + '/index.html')
		}
	}
	else {
		console.log("Game not started")
		res.sendFile(__dirname + '/index.html')
	}
});

io.sockets.on('connection', (socket) => {
	socket.on('add player', (rawCookie) => {
		cookie = rawCookie.substring(30,rawCookie.length - 6)
		inMap = playerQueue.isCookieInMap(cookie)
	    if(inMap && !state.runGame) {
	    	console.log("already been seen, just add to online queue")
			playerQueue.reconnect(socket.id, cookie)
			io.emit('update lobby', playerQueue.onlineQueueSize())
		} else if (inMap && state.runGame) {
			console.log("Already seen but game has alreayd started, reconnect")
			socketId = socket.id
			io.to(socketId).emit('game on')
			playerQueue.reconnect(socketId, cookie)
			game.reconnect(socketId)
		} else if (!inMap && !state.runGame ) {
			console.log("Never seen this player, save player")
			playerQueue.addPlayer(socket.id, cookie)
			io.emit('update lobby', playerQueue.onlineQueueSize())
		} else {
			return
		}
	});
    socket.on('start game', (cookie) => {
		state.gameStart()
	});
	socket.on('disconnect', () => {
    	playerQueue.removeFromOnlineQueue(socket.id)
    	if(!state.runGame){
    		io.emit('update lobby', playerQueue.onlineQueueSize())
    	}
  	});
	game.handleGameConnect(socket, io)
});


server.listen(process.env.PORT || 3000)
