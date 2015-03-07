var DEBUG = true, Tetris = {
    intro: 0,
    playing: 1,
    paused: 2,
    over: 3,
    win: 4
},
debug = function(){
	if(DEBUG){
		console.log(arguments);	
	}	
}
Tetris.Boot = function (game) {
};
Tetris.Boot.prototype = {
    preload: function () {
        this.load.image('preload', 'assets/preload.png');
    },
    create: function () {
        this.input.maxPointers = 1;
        this.state.start('Preloader');
    }
};
Tetris.Preloader = function (game) {
    this.logo = null;
    this.preloadBar = null;
    this.ready = false;
};
Tetris.Preloader.prototype = {
    init: function () {
    },
    preload: function () {
        this.preloadBar = this.add.sprite(120, 260, 'preload');
        this.load.setPreloadSprite(this.preloadBar);
        var i, v, 
        	imagesrc = 'assets/',
        	audiosrc = 'assets/', 
        	images = [
	            {"name": "intro", "source": 'intro.png' },
		        {"name": "playing", "source": 'playing.png' },
		        {"name": "paused", "source": 'paused.png' },
		        {"name": "over", "source": 'over.png' },
		        {"name": "win", "source": 'win.png' }
    		],
    		audio = [
	            {"name": "reload", "source": 'reload.mp3'}
    		];

        this.load.bitmapFont('font', imagesrc+'font.png', imagesrc+'font.xml');

        for (i in images){
        	v = images[i];
        	this.load.image(v.name, imagesrc+v.source);
    	}
        
        for (i in audio){
        	v = audio[i];
        	this.load.audio(v.name, audiosrc+v.source);
    	}
    },
    create: function () {
    },
    update: function () {
        if (!this.ready)
        {
            if (this.cache.isSoundDecoded('reload'))
            {
                this.ready = true;
                this.state.start('Game');
            }
        }
    }
};
Tetris.Game = function (game) {
    this.mode = Tetris.intro;
    this.surface = null;
};
Tetris.Game.prototype = {
    create: function () {
        this.surface = this.add.sprite(0, 0, 'intro');
        this.helpText = this.add.bitmapText(630, 350, 'font', "Tetris inspired game of Tetris", 16);
        this.helpText.align = 'right';
        this.scoreText = this.add.bitmapText(320, 50, 'font', "Score ", 16);
        this.scoreText.visible = false;
        this.pausedText = this.add.bitmapText(320, 70, 'font', "Paused!", 16);
        this.pausedText.visible = false;
		this.keyText = this.add.bitmapText(320, 90, 'font', "-", 16);
        this.keyText.visible = false;
		this.nextText = this.add.bitmapText(320, 110, 'font', "Next", 16);
        this.nextText.visible = false;
        this.mode = Tetris.intro;
        this.omode = Tetris.intro;
        this.score = 0;
        this.grid = [];
		this.cursors = this.input.keyboard.createCursorKeys();
        this.input.onDown.add(this.onDown, this);
    },
    mood: function(){
    	switch (this.mode)
        {
            case Tetris.intro:
                this.start();
                break;
            case Tetris.playing:
                this.main();
                break;
            case Tetris.paused:
                this.paused();
                break;
            case Tetris.win:
            	this.win();
            	break;
            case Tetris.over:
                this.quit();
                break;
        }
    },
    onDown: function () {
    	this.mood();
    },
    update: function () {
		debug("update", this.mode);
		this.scoreText.text = "Score: "+this.score;
		this.omode = this.mode;
    	if(this.score > 250){
        	this.mode = Tetris.win;
        }
       	if (this.mode == Tetris.paused) {
     		if(this.input.keyboard.isDown(Phaser.Keyboard.P)){
        		this.keyText.text = "P";
        		this.mode = Tetris.playing;
        	}
    	} else if (this.mode == Tetris.win) {
        	if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        		this.mode = Tetris.intro;
	        }
	    } else {
			if(this.input.keyboard.isDown(Phaser.Keyboard.P)){
        		this.keyText.text = "P";
        		this.mode = Tetris.paused;
        	}
    		if(this.input.keyboard.isDown(Phaser.Keyboard.ESC)){
        		debug("esc");
        		this.mode = Tetris.over;
			}
        	if (this.cursors.left.isDown ) {
            	this.keyText.text = "Left";
            	this.moveLeft();
            } else if (this.cursors.right.isDown ) {
            	this.keyText.text = "Right";
            	this.moveRight();
            } else if (this.cursors.up.isDown ) {
            	this.keyText.text = "Rotate";
            	this.rotate();
            } else if (this.cursors.down.isDown) {
            	this.keyText.text = "Down";
            	this.moveDown();
            } 
			if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
	       		this.keyText.text = "Drop";
	       		this.drop();
	        }
    	}
        if(this.mode !== this.omode){
        	this.mood();
        }
	},
	drop: function () {
		debug("drop");

	},
	rotate: function () {
		debug("rotate");

	},
	moveDown: function () {
		debug("moveDown");

	},
	moveRight: function () {
		debug("moveRight");

	},
	moveLeft: function () {
		debug("moveLeft");

	},
    start: function () {
        debug("start");
        this.mode = Tetris.playing;
        this.sound.play('walk');
        this.score = 0;
        this.grid = [];
        this.mood();
    },
	main: function (){
        debug("main");
        this.surface.loadTexture('playing');
        this.helpText.text = "Keys Esc-Quit P-Pause Arrows \n And Space to drop";
        this.scoreText.visible = true;
		this.keyText.visible = true;
		this.nextText.visible = true;
		this.pausedText.visible = false;
	},
    paused: function (){
        debug("paused");
        this.surface.loadTexture('paused');
        this.pausedText.visible = true;
        this.keyText.visible = false;            
    },
	win: function (){
        debug("Win");
        this.surface.loadTexture('win');
        this.keyText.visible = false;
        this.pausedText.visible = false;
        this.helpText.text  = "You WIN! Press Space to restart";
	},
    quit: function () {
		debug("quit");
        this.mode = Tetris.intro;
        this.omode = Tetris.intro;
        this.surface.loadTexture('intro');
        this.helpText.text = "Game over Restart the game";
		this.helpText.visible = true;
        this.scoreText.visible = false;
		this.keyText.visible = false;
		this.nextText.visible = false;
		this.pausedText.visible = false;
        this.score = 0;
        this.sound.play('reload');            
    },
    preRender: function () {
        if (this.helpText)
        {
            this.helpText.pivot.x = this.helpText.textWidth;
        }
    }
};
if (document.readyState === 'complete' || document.readyState === 'interactive')
{
    start();
}
else
{
    document.addEventListener('DOMContentLoaded', start, false);
}
function start () {
    document.removeEventListener('DOMContentLoaded', start, false);
    var game = new Phaser.Game(640, 480, Phaser.AUTO, 'game');
    game.state.add('Boot', Tetris.Boot);
    game.state.add('Preloader', Tetris.Preloader);
    game.state.add('Game', Tetris.Game);
    game.state.start('Boot');
}