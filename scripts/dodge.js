var dodgeGame = function (username) {

    var firebaseConfig = {
        apiKey: "AIzaSyA6XcBrdTRlldJCTLS54HP0NpChvBHRz4E",
        authDomain: "dodgegame-3834e.firebaseapp.com",
        databaseURL: "https://dodgegame-3834e.firebaseio.com",
        projectId: "dodgegame-3834e",
        storageBucket: "dodgegame-3834e.appspot.com",
        messagingSenderId: "161895663276",
        appId: "1:161895663276:web:4a2059774d6b427f5b8109"
      };
     firebase.initializeApp(firebaseConfig);
    
     myDatabase = firebase.database();



    //Set player size and board height dynamically
   
    $('#gameBoard').css('height', $('#gameBoard').width()*.75+'px');
    $('#gameBoard').css('display', 'block');
    

    const FRAMERATE = 30;

    var self = this;
    this.options = {
        minY: 0,
        minX: 0,
        maxY: $('#gameBoard').height(),
        maxX: $('#gameBoard').width(),
        playerX: $('#gameBoard').width()/2 - $('#player').width(),
        playerY: $('#gameBoard').height()/2 -  $('#player').height(),
        speed: $('#gameBoard').width()/150,
        myDatabase: firebase.database(),
        username: username
    };

    this.state = {
        gameOver: false,
        player: new player(self.options.playerY, self.options.playerX, self.options.maxY, self.options.maxX),
        pointDot: new pointDot(self.options.maxY, self.options.maxX),
        enemyDots: [new enemyDot('enemy1', self.options.maxY, self.options.maxX, self.options.speed)],
        enemyCount: 1,
        score: 0,
        highscore: 0,
        scoreboard: [],
        pressedKeys: {
            left: false,
            right: false,
            up: false,
            down: false
        },
    }

    myDatabase.ref('topten').once('value', ss => {
        //console.log(ss.val());
        self.state.scoreboard = ss.val();
        self.state.scoreboard.sort((a, b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
        self.state.highscore = self.state.scoreboard[0].score;
        //console.log(self.state.scoreboard);
        //console.log(self.state.highscore);
    });


    

    this.keyMap = {
        68: 'right',
        65: 'left',
        87: 'up',
        83: 'down'
    }
    
    
    //self.state.enemyDots.push(new enemyDot('enemy1', self.options.maxY, self.options.maxX));
    //console.log(self.state.enemyDots[0]);

    //this.player = new player(self.state.playerY, self.state.playerX, self.options.minY, self.options.maxY, self.options.minX, self.options.maxX);
    //console.log(self.player);

    function keydown(event) {
        var key = self.keyMap[event.keyCode]
        self.state.pressedKeys[key] = true
        if(event.key == 'Escape') {
            self.state.gameOver = true;
        }
        
    }

    function keyup(event) {
        var key = self.keyMap[event.keyCode]
        self.state.pressedKeys[key] = false
    }

    function updatewindowSize(event) {
        $('#gameBoard').css('height', $('#gameBoard').width()*.75+'px');
        $('#player').css('width', $('#gameBoard').width()/50+'px');
        $('#player').css('height', $('#gameBoard').width()/50+'px');
        $('#pointDot').css('height', $('#gameBoard').width()/50+'px');
        $('#pointDot').css('width', $('#gameBoard').width()/50+'px');

        self.options.speed = $('#gameBoard').width()/150
        self.options.maxX = $('#gameBoard').width();
        self.options.maxY = $('#gameBoard').height();

        self.state.player.sideLength = $('#gameBoard').width()/50;
        self.state.pointDot.diameter = $('#gameBoard').width()/50;

        self.state.player.maxY = self.options.maxY - self.state.player.sideLength;
        self.state.player.maxX = self.options.maxX - self.state.player.sideLength;
        self.state.pointDot.maxY = self.options.maxY - self.state.pointDot.diameter;
        self.state.pointDot.maxX = self.options.maxX - self.state.pointDot.diameter;

        self.state.pointDot.replace();

        for (let enemy of self.state.enemyDots) {
            enemy.diameter = $('#gameBoard').width()/40;
            enemy.maxY = self.options.maxY - enemy.diameter;
            enemy.maxX = self.options.maxX - enemy.diameter;
            enemy.maxSpeed = self.options.speed;
            enemy.updateSpeed();
        }
        
    }



    window.addEventListener("keydown", keydown, false);
    window.addEventListener("keyup", keyup, false);
    window.addEventListener("resize", updatewindowSize);
    


    function collision(player, pointDot) {
        return (player.xPos < pointDot.xPos + pointDot.diameter &&
            player.xPos + player.sideLength > pointDot.xPos &&
            player.yPos < pointDot.yPos + pointDot.diameter &&
            player.yPos + player.sideLength > pointDot.yPos);
    }


    function update(progress) {
        // Update the state of the world for the elapsed time since last render
        let speed = Math.round(self.options.speed * progress/16);
        if(self.state.pressedKeys.left) {
            self.state.player.moveX(speed * -1);
        }
        if(self.state.pressedKeys.right) {
            self.state.player.moveX(speed);
        }
        if(self.state.pressedKeys.up) {
            self.state.player.moveY(speed * -1);
        }
        if(self.state.pressedKeys.down) {
            self.state.player.moveY(speed);
        }
        
        for(let enemy of self.state.enemyDots){
            enemy.move(progress);
        }

        if(self.state.score > 0 && self.state.score % 7 == 0 && self.state.enemyCount == Math.floor(self.state.score/7)) {
            self.state.enemyCount++;
            self.state.enemyDots.push(new enemyDot('enemy'+self.state.enemyCount, self.options.maxY, self.options.maxX, self.options.speed));
            //console.log(self.state.enemyDots);
        }
        
        if(collision(self.state.player, self.state.pointDot)) {
            self.state.score = self.state.pointDot.collect(self.state.score);
            //console.log(self.state.score);
        }

        for(let enemy of self.state.enemyDots) {
            if(collision(self.state.player, enemy)) {
                self.state.gameOver = true;
            }
        }
    }


    function draw() {
        // Draw the state of the world
        $('#player').css('top', self.state.player.yPos+'px');
        $('#player').css('left', self.state.player.xPos+'px');

        for(let enemy of self.state.enemyDots){
            enemy.drawEnemy();
        }

        $('#totalScore').text(self.state.score);
        $('#highScore').text(self.state.highscore);
        $('#scoreBoard').html('<h3>Top ten:</h3>');
        for(let score of self.state.scoreboard) {
            $('#scoreBoard').append(`<p>${score.username}: ${score.score}<p>`);
        }
    }

    function loop(timestamp) {
        
        var progress = timestamp - lastRender

        update(progress)
        draw()

        if( self.state.gameOver == true ) {
            

            myDatabase.ref('topten').once('value', ss => {
                //console.log(ss.val());
                self.state.scoreboard = ss.val();
            });

            self.state.scoreboard.sort((a, b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
            //console.log(self.state.scoreboard);

            let newScore = {
                score: self.state.score,
                username: self.options.username
            };

            for (let i = 0; i < self.state.scoreboard.length; i++) {
                if (newScore.score > self.state.scoreboard[i].score) {
                    self.state.scoreboard.splice(i, 0, newScore);
                    self.state.scoreboard.pop();
                    break;
                } 
            }

            //console.log(self.state.scoreboard);

            myDatabase.ref('topten').set(self.state.scoreboard);

            self.state.highscore = self.state.scoreboard[0].score;

            //console.log('Game Over!');
            $('#playAgain').css('display', 'block');
            $('#playAgain').on('click', self.playAgain);
            return 0;
        }

        lastRender = timestamp
        window.requestAnimationFrame(loop)

    }

    var lastRender = 0
    var myReq = window.requestAnimationFrame(loop)


     this.playAgain = function() {

        cancelAnimationFrame(myReq);
        $('#playAgain').css('display', 'none');
        for(let enemy of self.state.enemyDots){
            $(`#${enemy.name}`).remove();
        }

        self.options = {
            minY: 0,
            minX: 0,
            maxY: $('#gameBoard').height() - $('#player').height(),
            maxX: $('#gameBoard').width() - $('#player').width(),
            playerX: $('#gameBoard').width()/2 - $('#player').width(),
            playerY: $('#gameBoard').height()/2 -  $('#player').height(),
            speed: $('#gameBoard').width()/150,
            username: username
        };

        let highscore = self.state.highscore;
        let scoreboard = self.state.scoreboard;
        self.state = {
            gameOver: false,
            player: new player(self.options.playerY, self.options.playerX, self.options.maxY, self.options.maxX),
            pointDot: new pointDot(self.options.maxY, self.options.maxX),
            enemyDots: [new enemyDot('enemy1', self.options.maxY, self.options.maxX, self.options.speed)],
            enemyCount: 1,
            score: 0,
            highscore: highscore,
            scoreboard: scoreboard,
            pressedKeys: {
                left: false,
                right: false,
                up: false,
                down: false
            },
        }

        //console.log(self.state);
        lastRender = 0;
        myReq = window.requestAnimationFrame(loop);
    }

    
}





var player = function (yPos, xPos, boardHeight, boardWidth) {
    var self = this;
    this.yPos = yPos;
    this.xPos = xPos;
    this.minY = 0;
    this.minX = 0;

    this.sideLength = $('#gameBoard').width()/50;

    this.maxY = boardHeight - this.sideLength;
    this.maxX = boardWidth - this.sideLength;
    $('#player').css({ 
        'width': this.sideLength+'px',
        'height': this.sideLength+'px'
    });


    this.setY = function (newY) {
        if (newY < self.minY) {
            self.yPos = self.minY;
        }
        else if (newY > self.maxY) {
            self.yPos = self.maxY;
        }
        else {
            self.yPos = newY;
        }
    };

    this.setX = function (newX) {
        if (newX < self.minX) {
            self.xPos = self.minX;
        }
        else if (newX > self.maxX) {
            self.xPos = self.maxX;
        }
        else {
            self.xPos = newX;
        }
    }

    this.moveX = function (amount) {
        self.setX(self.xPos + amount);
    };

    this.moveY = function (amount) {
        self.setY(self.yPos + amount);
    };
}



var pointDot = function(boardHeight, boardWidth) {
    var self = this;

    this.diameter = $('#gameBoard').width()/50;
    this.maxY = boardHeight - self.diameter;
    this.maxX = boardWidth - self.diameter;

    this.xPos = Math.floor(Math.random() * (Math.floor(self.maxX) - self.diameter));
    this.yPos = Math.floor(Math.random() * (Math.floor(self.maxY) - self.diameter));

    $('#pointDot').css({
        "height":self.diameter, 
        "width": self.diameter, 
        "top": self.yPos, 
        "left": self.xPos});
    
    this.replace = function() {
        let prevY = self.yPos;
        let prevX = self.xPos;
        //console.log(self.maxX, self.maxY);
        while( self.xPos == prevX && self.yPos == prevY){
            self.yPos = Math.floor(Math.random() * (Math.floor(self.maxY) - self.diameter));
            self.xPos = Math.floor(Math.random() * (Math.floor(self.maxX) - self.diameter));
        } 
        $('#pointDot').css({
            "top": self.yPos,
            "left": self.xPos
        })
    }

    this.collect = function(score) {
        this.replace();    
        return ++score;
    }
}
    

    var enemyDot = function (name, maxY, maxX, maxSpeed) {
        var self = this;
        this.name = name;
        this.diameter = $('#gameBoard').width() / 40;
        this.maxY = maxY - self.diameter;
        this.maxX = maxX - self.diameter;

        this.xPos = Math.floor(Math.random() * (Math.floor(self.maxX) - self.diameter));
        this.yPos = Math.floor(Math.random() * (Math.floor(self.maxY) - self.diameter));

        this.maxSpeed = maxSpeed

        //random vel between -5 and 5, should exclude 0
        this.xVel = Math.floor(Math.random() * Math.floor(maxSpeed)) + 1;
        if (this.xVel > 5) {
            this.xVel -= 11
        };
        this.yVel = Math.floor(Math.random() * Math.floor(maxSpeed)) + 1;
        if (this.yVel > 5) {
            this.yVel -= 11
        };

        $(`#gameBoard`).append(`<div id="${self.name}"></div>`);

        this.moveY = function (p) {
            if (self.yPos < 0) {
                self.yPos = 0;
                self.yVel *= -1
                self.yPos += Math.round(self.yVel * p/16);
            } else if (self.yPos > self.maxY) {
                self.yPos = self.maxY;
                self.yVel *= -1;
                self.yPos += Math.round(self.yVel * p/16);
            } else {
                self.yPos += Math.round(self.yVel * p/16);
            }
        }

        this.moveX = function (p) {
            if (self.xPos < 0) {
                self.xPos = 0;
                self.xVel *= -1
                self.xPos += Math.round(self.xVel * p/16);
            } else if (self.xPos > self.maxX) {
                self.xPos = self.maxX;
                self.xVel *= -1;
                self.xPos += Math.round(self.xVel * p/16);
            } else {
                self.xPos += Math.round(self.xVel * p/16);
            }
        }

        this.move = function (progress) {
            self.moveY(progress);
            self.moveX(progress);
        }

        this.replace = function () {
            let prevY = self.yPos;
            let prevX = self.xPos;
            //console.log(self.maxX, self.maxY);
            while (self.xPos == prevX && self.yPos == prevY) {
                self.yPos = Math.floor(Math.random() * (Math.floor(self.maxY) - self.diameter));
                self.xPos = Math.floor(Math.random() * (Math.floor(self.maxX) - self.diameter));
            }
        }

        this.updateSpeed = function () {
            self.xVel = Math.floor(Math.random() * Math.floor(self.maxSpeed)) + 1;
            if (self.xVel > 5) {
                self.xVel -= 11
            };
            self.yVel = Math.floor(Math.random() * Math.floor(self.maxSpeed)) + 1;
            if (self.yVel > 5) {
                self.yVel -= 11
            };
        }

        this.drawEnemy = function () {
            $(`#${self.name}`).css({
                "height": self.diameter,
                "width": self.diameter,
                "top": self.yPos,
                "left": self.xPos,
                "border-radius": '50%',
                'background-color': 'red',
                'position': 'absolute'
            });
        }
    }
