    var socket = io()
    firstUpdate = true
    socket.emit('add player', document.cookie);

    socket.on('update lobby', function(msg) {
      document.body.innerHTML = ""
      var container = $('<div></div>', {class: 'container py-4 '})

      var title = $("<h1></h1>",{class:'text-center'}).text("Welcome to the Memory Verse Game")
      var playerCountTitle = $("<h2></h2>", {class:'text-center'}).text("Players in the Game")
      var playerCount = $("<h2></h2>", {class:'text-center'}).text(msg)
      var startButton = $("<div></div>",{class:'text-center'}).append($("<button></button>", {class: 'btn btn-outline-success'}).text("Start Game"))
      $("body").append(container.append(title).append(playerCountTitle).append(playerCount).append(startButton))
      $("button").click(() => {
        socket.emit('start game');
      });
    });

    socket.on('game on', function() {
      document.body.innerHTML = ""
      var container = $('<div></div>', {class: 'container py-4', id:'jumboContainer'})
      var jumbotron = $('<div></div>', {class: 'p-5 mb-4 rounded-3', id:'jumbo'})
      var runningVerse = "<h1 id='run'></h1>"
      container.append(jumbotron.append(runningVerse))
      var livesHeader = "<h2 id='lives'></h2>"
      var locHeader = "<h2 id='loc'></h2>"
      $("body").append(livesHeader,container,locHeader)
    });

    socket.on('update table top', function(runningVerse, loc, lives, vocabList) {
      console.log(runningVerse, loc, lives)
      if(firstUpdate) {
         //Update Hand
        displayVocab(vocabList)
        firstUpdate = false
        currLives = lives
      }
      $("#run").text(runningVerse.join(' '))
      $("#lives").text(lives + " Lives")
      $("#loc").text(loc)
    });

    function displayVocab(vocabList) {
      var row = $('<div></div>', {class: 'row fixed-top'})
      var col1 = $('<div></div>', {class: 'col'})
      var col2 = $('<div></div>', {class: 'col'})
      col1.append($("#loc"))
      col2.append($("#lives"))

      var container = $('<div></div>', {class: 'container text-center fixed-bottom bg-dark rounded-lg', id:'keyboard'})
      container.append(row.append(col1).append(col2))

      for(word of vocabList) {
        var item = $('<button></button>', {class: 'btn vocab bg-primary text-white'}).text(word)
        item.click((event) => {
          socket.emit('guess', event.target.innerHTML)
        })
        container.append(item)
      }
      $("body").append(container)
    }

    socket.on('game over', function(isWin) {
      $('#keyboard').remove()
      var finishHeader = $('<h1></h1>')
      if(isWin){
        finishHeader.text("Wowwwww Big Brain")
      } else {
        finishHeader.text("Big oof :'( You got it nex time! 加油!")
      }
      $("#jumboContainer").append(finishHeader)
      firstUpdate = false
    });
