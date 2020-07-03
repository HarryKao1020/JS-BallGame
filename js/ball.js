// 遊戲物件  1.板子  2.球

// 初始化函式
var GameObject = function (position, size, selector) {
	this.$el = $(selector);
	this.position = position;
	this.size = size;
	this.$el.css("position", "absolute");

	// 	呼叫更新css函式
	this.updateCss();
};

// 更新css函式
GameObject.prototype.updateCss = function () {
	this.$el.css("left", this.position.x);
	this.$el.css("top", this.position.y);
	this.$el.css("width", this.size.width);
	this.$el.css("height", this.size.height);
};

// 碰撞偵測函式   (otherObject是小球)
GameObject.prototype.collide = function (otherObject) {
	// 	球的postion.x的範圍在板子左距與板子左距+板子寬度之間
	var inRangeX =
		otherObject.position.x > this.position.x &&
		otherObject.position.x < this.position.x + this.size.width;

	// 	球的postion.x的範圍在板子左距與板子左距+板子寬度之間
	var inRangeY =
		otherObject.position.y > this.position.y &&
		otherObject.position.y < this.position.y + this.size.height;

	//回傳inRangeX,inRangeY
	return inRangeX && inRangeY;
};

// 測試套用 GameObject
// var board = new GameObject(
// 	{x:50,y:50},
// 	{width:50,height:50},
// 	".b1"
// )
// board.position.x=300
// board.updateCss()

// 球球的instance

// var ballObject = new GameObject(
// 	{x:250,y:250},
// 	{width:10,height:10},
// 	".ball"
// )

// ---------------------- ball 繼承 GameObject -------------
var Ball = function () {
	// 	事先定義大小跟位置
	this.size = { width: 30, height: 30 };
	this.position = { x: 250, y: 250 };

	// 	呼叫母類別
	GameObject.call(this, this.position, this.size, ".ball");

	// 	Ball 自己擁有的屬性 ， 速度
	this.velocity = { x: -3, y: 5 };
};

// 連結母類別的函式
Ball.prototype = Object.create(GameObject.prototype);
Ball.prototype.constructor = Ball.constructor;

// 創造一個速度的函式
Ball.prototype.updateVelocity = function () {
	this.position.x += this.velocity.x;
	this.position.y += this.velocity.y;

	// 	呼叫更新在CSS的函式
	this.updateCss();

	if (this.position.x < 0 || this.position.x > 500) {
		this.velocity.x = -this.velocity.x;
	}
	if (this.position.y < 0 || this.position.y > 500) {
		this.velocity.y = -this.velocity.y;
	}
};

// 遊戲重新開始。球回到最一開始的位置
Ball.prototype.initPos = function () {
	this.position = { x: 250, y: 250 };
	var speed = 6;
	var angle = Math.random() * Math.PI * 2;
	this.velocity = {
		x: speed * Math.cos(angle),
		y: speed * Math.sin(angle)
	};
	this.updateVelocity();
};

var ball = new Ball();
// --- 球的速度函數
// setInterval(function(){
// 	ball.updateVelocity()
// },50)

// ----------------板子繼承GameObject -----------------------
var Board = function (position, selector) {
	this.size = { width: 100, height: 15 };
	GameObject.call(this, position, this.size, selector);
};

Board.prototype = Object.create(GameObject.prototype);
Board.prototype.constructor = Board.constructor;

// 碰牆不超出範圍
Board.prototype.update = function () {
	if (this.position.x < 0) {
		this.position.x = 0;
	}
	if (this.position.x + this.size.width > 500) {
		this.position.x = 500 - this.size.width;
	}
	this.updateCss();
};

var board1 = new Board({ x: 0, y: 30 }, ".b1");
var board2 = new Board({ x: 0, y: 455 }, ".b2");

// ------------遊戲邏輯 ----------------

var Game = function () {
	this.timer = null;
	this.grade = 0;
	// 	放入控制
	this.initControl();
	//  裝鍵盤的物件 裡面放陣列
	this.control = {};
};

// 遊戲控制方法(玩家鍵盤控制)
Game.prototype.initControl = function () {
	let _this = this;

	$(window).keydown(function (evt) {
		_this.control[evt.key] = true;
		console.log(_this.control);
	});

	$(window).keyup(function (evt) {
		_this.control[evt.key] = false;
		console.log(_this.control);
	});
};

// 遊戲開始倒數
Game.prototype.startGame = function () {
	var time = 3;
	var _this = this;
	this.grade = 0;

	//呼叫球初始化方法
	ball.initPos();

	//按下後 按鈕隱藏
	$("button").hide();

	// 	倒數計時
	var timerCount = setInterval(function () {
		$(".infoText").text(time);
		time--;
		if (time < 0) {
			clearInterval(timerCount);
			_this.startGameMain();
			$(".info").hide();
		}
	}, 1000);
};

// 遊戲開始的方法
Game.prototype.startGameMain = function () {
	// 	这种情况就是在程式片段里this有可能代表不同的對象,而编码者希望_this代表最初的对象
	let _this = this;

	// 	球加速
	this.timer = setInterval(function () {
		// 	碰撞 b1
		if (board1.collide(ball)) {
			// console.log("hit board1")
			ball.velocity.y = -ball.velocity.y;
			ball.velocity.x *= 1.1;
			ball.velocity.y *= 1.1;
			ball.velocity.x += 0.5 - Math.random();
			ball.velocity.y += 0.5 - Math.random();
		}

		// 	碰撞 b2
		if (board2.collide(ball)) {
			// console.log("hit board2")
			ball.velocity.y = -ball.velocity.y;

			_this.grade += 10;
		}

		//碰牆判斷
		if (ball.position.y <= 0) {
			console.log("board1 lose");
			_this.endGame("Computer lose");
		}
		if (ball.position.y >= 500) {
			console.log("board2 lose");
			_this.endGame("You lose");
		}

		if (_this.control["ArrowLeft"]) {
			board2.position.x -= 10;
		}

		if (_this.control["ArrowRight"]) {
			board2.position.x += 10;
		}

		board1.position.x +=
			ball.position.x > board1.position.x + board1.size.width / 2 ? 12 : 0;

		board1.position.x +=
			ball.position.x < board1.position.x + board1.size.width / 2 ? -12 : 0;
		board1.update();
		board2.update();

		ball.updateVelocity();

		$(".grade").text(_this.grade);
	}, 35);
};

// 遊戲結束方法
Game.prototype.endGame = function (result) {
	clearInterval(this.timer);
	$(".info").show();
	$("button").show();
	$(".infoText").html(result + "<br> Score: " + this.grade);
};

var Game1 = new Game();
