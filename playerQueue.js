var socketToCookie = new Map()
var onlineQueue = []
var vocabSet = new Map()
const state = require('./gameState')


module.exports = {
	getSocketToCookie: function() {
		return socketToCookie
	},
	getOnlineQueue: function() {
		return onlineQueue
	},
	getVocab: function(socket) {
		return vocabSet.get(socket)
	},
	addVocab: function(socketId, vocab) {
		vocabList = vocabSet.get(socketId)
		if(vocabList == undefined ){ 
			vocabList = []
		}
		vocabList.push(vocab)
		vocabSet.set(socketId, vocabList)
	},
	clearVocab: function(socketId) {
		vocabSet.delete(socketId)
	},
	getSocketFromMap: function(cookie) {
		for(socketCookie of socketToCookie.entries()) {
			if(cookie == socketCookie[1]) {
				return socketCookie[0]
			}
		}
	},
	getCookieFromMap: function(socketId) {
		for(socketCookie of socketToCookie.entries()) {
			if(socketId == socketCookie[0]) {
				return socketCookie[1]
			}
		}
	},
	addPlayer: function(socketId, cookie) {
		socketToCookie.set(socketId, cookie)
		onlineQueue.push(socketId)
	},
	removeFromOnlineQueue: function(socketId) {
		var removeIdx = onlineQueue.indexOf(socketId)
	    if(removeIdx > -1) {
	    	onlineQueue.splice(removeIdx, 1)
	    }
	},
	reset: function() {
	    socketToCookie = new Map()
	    onlineQueue = []
  	},
  	reconnect: function(newSocket, cookie) {
  		//replace socket in Map
  		var oldSocket;
		for(socketCookie of socketToCookie.entries()) {
	        if(cookie == socketCookie[1]) {
	          oldSocket = socketCookie[0]
	          socketToCookie.delete(oldSocket)
	          break
	        }
	  	}

	    socketToCookie.set(newSocket, cookie)
      	onlineQueue.push(newSocket)

      	if(state.runGame) {
      		//transfer hand to new socket
	      	transferHand = vocabSet.get(oldSocket)
	      	vocabSet.delete(oldSocket)
	      	vocabSet.set(newSocket, transferHand)
      	}
    },
  	isInMap: function(sockedId) {
  		return socketToCookie.has(socketId)
  	},
  	isCookieInMap: function(cookie) {
  		for( sCookie of socketToCookie.values()) {
			if(cookie == sCookie) {
				return true
			}
		}
		return false
  	},
  	onlineQueueSize: function() {
  		return onlineQueue.length
  	}
}

