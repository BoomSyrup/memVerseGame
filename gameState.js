var State = module.exports = {
    runGame: false,
    gameStart: function() {
        State.runGame += true;
    },
    gameOver: function() {
        State.runGame = false;
    }
}