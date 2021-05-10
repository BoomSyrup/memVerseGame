const playerQueue = require('./playerQueue')
const state = require('./gameState')
const csv = require('csv-parser');
const fs = require('fs');
var io
var memVerse
var lives = 10
var correctVerse = []
var runningVerse = []

module.exports =  {
	handleGameConnect: function (socket, socketIo) {
		//Cases for when someone enters page
		io = socketIo
		socket.on('start game', (cookie) => {
	    	io.emit('game on')
	    	initVocab()
	  	});
	  	handleGameLogic(socket)
	},
	reconnect: function(sockedId) {
		io.to(socketId).emit('update table top', runningVerse, memVerse.loc, lives, playerQueue.getVocab(socketId))
	}
}

function handleGameLogic (socket) {
	socket.on('guess', (word) => {
		guessVerse = [...runningVerse]
		guessVerse.push(word)
		for(i = 0 ; i < guessVerse.length ; i++) {
			if(guessVerse[i] != correctVerse[i]) {
				console.log("Wrong")
				lives--
				if(lives == 0) {
					io.emit('game over', false)
					state.gameOver()
					reset()
				} else {
					for(socketId of playerQueue.getOnlineQueue()){
						io.to(socketId).emit('update table top', runningVerse, memVerse.loc, lives, playerQueue.getVocab(socketId))
					}
				}
				return
			}
		}
		if(guessVerse.length == correctVerse.length) {
			console.log("win")
			io.emit('game over', true)
			state.gameOver()
			reset()

		} else {
			console.log("correct guess")
			runningVerse.push(word)
			for(socketId of playerQueue.getOnlineQueue()){
				io.to(socketId).emit('update table top', runningVerse, memVerse.loc, lives, playerQueue.getVocab(socketId))
			}

		}
		console.log(runningVerse)
	});
}

//Split QTD verse into words and distribute the words to the players
function initVocab() {
	var memoryVerses = []
	fs.createReadStream('memoryVerses.csv')
	.pipe(csv())
	.on('data', (row) => {
    	memoryVerses.push(row)
  	})
	.on('end', () => {
		//Once CSV has been read, choose mem verse and send it to players
	    memVerseIdx = Math.floor(Math.random() * (memoryVerses.length))
		memVerse = memoryVerses[memVerseIdx]
		//Split up words
		correctVerse = memVerse.verse.split(' ')
		uniqueWords = new Set(correctVerse)
		words = Array.from(uniqueWords)
		wordsTaken = new Map()
		words.forEach((word) => {
			wordsTaken.set(word, false)
		})
		onlineQueue = playerQueue.getOnlineQueue()
		//Distribute
		for( i = 0 ; i < words.length ; i++ ) {
			notSelected = true
			var randWord
			while(notSelected){
				randIdx = Math.floor(Math.random() * (words.length))
				randWord = words[randIdx]
				notSelected = wordsTaken.get(randWord)
			}
			wordsTaken.set(randWord, true)
			socketId = onlineQueue[i % onlineQueue.length]
			playerQueue.addVocab(socketId, randWord)
		}
		for( socketId of onlineQueue ) {
			io.to(socketId).emit('update table top',runningVerse, memVerse.loc, lives, playerQueue.getVocab(socketId))
		}
  	});

}
function reset() {
	lives = 10
	correctVerse = []
	runningVerse = []
}