var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;

function setOnkeydownEvent() {
	document.onkeydown = function(event) {
		if(event.keyCode === 13){
			startTheGame();
		}
	}
}

setOnkeydownEvent();

function startTheGame() {	
	document.getElementById("modal").style.display = 'none';
	game = new Game();
	game.runGame();
}

function stopTheGame() {
	clearInterval(gameInterval);
	var modal = document.getElementById("modal-content");
	var btn = document.getElementById("start-btn");
	modal.classList.remove('init');
	modal.classList.add('lose');
	modal.innerHTML = 'Score: ' + game.score;
	btn.innerHTML = "TRY AGAIN"
	modal.parentElement.style.display = 'block';
	setOnkeydownEvent();
}


var Snake = function () {
	this.startPoint = new Point(10, 200, 39);
	this.endPoint = new Point(210, 200, 39);
	this.breakingPoints = [];

	this.move = function() {
		this.startPoint.move();
		this.endPoint.move();
	}

	this.changeDirection = function(newDir) {
		if(this.endPoint.direction != newDir && Math.abs(this.endPoint.direction - newDir) != 2) {	
			var newBreakingPoint = new Point(this.endPoint.x, this.endPoint.y, newDir);
			var lastPoint =  this.breakingPoints[this.breakingPoints.length - 1];		
			if(this.breakingPoints.length && 
			(lastPoint.x === this.endPoint.x && lastPoint.y === this.endPoint.y)) {
				newBreakingPoint.move(lastPoint.direction);
				this.endPoint.move(lastPoint.direction);
			}
			this.breakingPoints.push(newBreakingPoint);
			this.endPoint.direction = newDir;
		}
	}

	document.onkeydown = function(event) {
		if ([LEFT, RIGHT, UP, DOWN].includes(event.keyCode)) {
			this.changeDirection(event.keyCode);
		};
	}.bind(this);

}

var Point = function(x, y, direction) {
	this.x = x;
	this.y = y;
	this.direction = direction;
	
	this.move = function(dir = null) {
		switch(dir ? dir : this.direction) {
			case LEFT:
				this.x = this.x - 5;
			break;
			case RIGHT:
				this.x = this.x + 5;
			break;
			case UP:
				this.y = this.y - 5;
			break;
			case DOWN:
				this.y = this.y + 5;
			break;
		}	
	}
}

var Canvas = function(canvasId) {
	this.c = document.getElementById("canvas");
	this.ctx = this.c.getContext("2d");
	
	this.drawSnake = function(snake) {
		this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.beginPath();
		this.ctx.strokeStyle = "#00A591";
		this.ctx.lineWidth = 5;
		this.ctx.moveTo(snake.startPoint.x, snake.startPoint.y);
		snake.breakingPoints.forEach(function(item) {	
			this.ctx.lineTo(item.x, item.y);
		}.bind(this));
		this.ctx.lineTo(snake.endPoint.x, snake.endPoint.y)
		this.ctx.stroke();

	}

	this.drawInsect = function(insect) {
		this.ctx.beginPath();
		this.ctx.strokeStyle = "#9E1030";
		this.ctx.arc(insect.position.x ,insect.position.y, 1, 0, 2 * Math.PI, true);
		this.ctx.stroke();
		this.ctx.fill();
	}
}

var Insect =  function(snake) {
	this.position = {};
	this.setPosition = function setPosition(snake) {		
		x = Math.floor((Math.random() * 79) + 1) * 5;
		y = Math.floor((Math.random() * 79) + 1) * 5;
		
		insectPosition = new InsectPosition(x, y);
		if (checkCollision(snake, insectPosition)) {
			return this.setPosition();
		}
		this.position = insectPosition;
	}
}

var InsectPosition = function(x,y) {
	this.x = x;
	this.y = y;
}

var Game = function() {
	this.speed = 50;
	this.score = 0;
	this.snake = new Snake();
	this.insect = new Insect();
	this.canvas = new Canvas();

	this.scoreUp = function() {	
		this.score += 5;
		scoreDiv =  document.getElementById('score');
		scoreDiv.innerHTML = this.score;
	}

	this.runGame = function() {	
		this.insect.setPosition(this.snake);
		gameInterval = setInterval(gameplay.bind(this), this.speed);
	}

	
	var gameplay = function() {
	
		this.snake.move();	
		if(checkCollision(this.snake)) {
			stopTheGame();
		}
		this.canvas.drawSnake(this.snake);
		this.canvas.drawInsect(this.insect);	
		
		if(this.snake.endPoint.x === this.insect.position.x && this.snake.endPoint.y === this.insect.position.y) {
			this.insect.setPosition(this.snake);
			this.snake.startPoint.move(calculateOpositeDirection(this.snake.startPoint.direction));
			this.scoreUp();
		}	

		if (this.snake.breakingPoints.length 
		&& (this.snake.startPoint.x === this.snake.breakingPoints[0].x 
		&& this.snake.startPoint.y === this.snake.breakingPoints[0].y) ) {
			this.snake.startPoint = this.snake.breakingPoints[0];
			this.snake.breakingPoints.shift();
		}
	};


}

function calculateOpositeDirection(direction) {
	if(direction < 39) {
		return direction + 2;
	} else {
		return direction - 2;
	}
}

function checkCollision(snake, point=null) {
		var a = JSON.parse(JSON.stringify(snake.startPoint));
		var checkingPoint = JSON.parse(JSON.stringify(point ? point : snake.endPoint));
		var snakePoints = JSON.parse(JSON.stringify(snake.breakingPoints));
		if (point) {	
			snakePoints.push(JSON.parse(JSON.stringify(snake.endPoint)));
		}
		
		if (checkingPoint.x === 0 
		|| checkingPoint.x === 400 
		|| checkingPoint.y === 0 
		|| checkingPoint.y === 400) {
			return true;
		}
	 	return snakePoints.some(function(b) {
			switch(a.direction) {
				case LEFT:	
					if(checkingPoint.y === a.y && (checkingPoint.x <= a.x && checkingPoint.x >= b.x)) {
					 return true;
					}
					break;
				case RIGHT:	
					if(checkingPoint.y === a.y 
					&& (checkingPoint.x >= a.x && checkingPoint.x <= b.x)){
						return true;
					}
					
					break;
				case UP:
					if(checkingPoint.x === a.x 
					&& (checkingPoint.y <= a.y && checkingPoint.y >= b.y)){
						return true;
					}
					break;
				case DOWN:
					if(checkingPoint.x === a.x 
					&& (checkingPoint.y >= a.y && checkingPoint.y <= b.y)){
						return true;
					}
					break;
			}	
			a=b;
		});
}

