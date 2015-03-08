var DEBUG = true, Tetris = {
    intro: 0,
    playing: 1,
    paused: 2,
    over: 3,
    win: 4
},
debug = function() {
	if (DEBUG) {
		console.log(arguments);	
	}	
};
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

        for (i in images) {
        	v = images[i];
        	this.load.image(v.name, imagesrc+v.source);
    	}
        
        for (i in audio) {
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
	    var r, fragmentSrc = [
        "precision mediump float;",
        "uniform float     time;",
        "uniform vec2      resolution;",
        "uniform vec2      mouse;",
        "float length2(vec2 p) { return dot(p, p); }",
        "float noise(vec2 p) {",
            "return fract(sin(fract(sin(p.x) * (46.13311)) + p.y) * 31.0011);",
        "}",
        "float worley(vec2 p) {",
            "float d = 1e30;",
            "for (int xo = -1; xo <= 1; ++xo) {",
                "for (int yo = -1; yo <= 1; ++yo) {",
                    "vec2 tp = floor(p) + vec2(xo, yo);",
                    "d = min(d, length2(p - tp - vec2(noise(tp))));",
                "}",
            "}",
            "return 3.0*exp(-4.0*abs(2.0*d - 1.0));",
        "}",
        "float fworley(vec2 p) {",
            "return sqrt(sqrt(sqrt(",
            "1.1 * // light",
            "worley(p*5. + .3 + time*.0525) *",
            "sqrt(worley(p * 50. + 0.3 + time * -0.15)) *",
            "sqrt(sqrt(worley(p * -10. + 9.3))))));",
        "}",
        "void main() {",
            "vec2 uv = gl_FragCoord.xy / resolution.xy;",
            "float t = fworley(uv * resolution.xy / 1500.0);",
            "t *= exp(-length2(abs(0.7*uv - 1.0)));",
            "gl_FragColor = vec4(t * vec3(0.2*t, 1.5*t, 0.2*t ), 1.0);",
        "}"
	    ];
        this.surface = this.add.sprite(0, 0, 'intro');
        this.helpText = this.add.bitmapText(630, 350, 'font', "Tetris inspired game of Tetris", 16);
        this.helpText.align = 'right';
        this.scoreText = this.add.bitmapText(320, 50, 'font', "Score ", 16);
        this.scoreText.visible = false;
        this.pausedText = this.add.bitmapText(320, 70, 'font', "Paused!", 16);
        this.pausedText.visible = false;
		this.keyText = this.add.bitmapText(320, 90, 'font', "-", 16);
        this.keyText.visible = false;
		this.tetText = this.add.bitmapText(320, 110, 'font', "Stat: ", 16);
        this.tetText.visible = false;
        this.realText = this.add.bitmapText(320, 230, 'font', "R ", 16);
        this.realText.visible = false;
        this.nextText = this.add.bitmapText(320, 130, 'font', "Next", 16);
        this.nextText.visible = false;
        this.filter = new Phaser.Filter(this, null, fragmentSrc);
	    this.filter.setResolution(240, 480);
        this.sprite = this.add.sprite(62,0);
	    this.sprite.width = 240;
	    this.sprite.height = 480;
	    this.sprite.visible = true;
	    this.sprite.filters = [ this.filter ];
        
        this.gridMatrixText = this.add.bitmapText(62, -40, 'font', "", 18);
        this.gridMatrixText.visible = false;
        
        this.mode = Tetris.intro;
        this.omode = Tetris.intro;
        this.score = 0;
        this.gridMatrix = [];
        this.tetList = [ "I","O","T","S","Z","J","L" ];
        this.tets = {
            "I": [ [ [0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0] ],
                   [ [1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0] ] ],
                   
            "O": [ [ [0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0] ] ],
            
            "T": [ [ [0,0,0,0],[0,1,1,1],[0,0,1,0],[0,0,0,0] ] ,
                   [ [0,0,1,0],[0,0,1,1],[0,0,1,0],[0,0,0,0] ] ,
                   [ [0,0,1,0],[0,1,1,1],[0,0,0,0],[0,0,0,0] ] ,
                   [ [0,0,1,0],[0,1,1,0],[0,0,1,0],[0,0,0,0] ] ],
                   
            "S": [ [ [0,0,0,0],[0,1,1,0],[0,0,1,1],[0,0,0,0] ] ,
                   [ [0,0,1,0],[0,1,1,0],[0,1,0,0],[0,0,0,0] ] ],
                   
            "Z": [ [ [0,0,0,0],[0,1,1,0],[1,1,0,0],[0,0,0,0] ] ,
                   [ [0,1,0,0],[0,1,1,0],[0,0,1,0],[0,0,0,0] ] ],
                   
            "L": [ [ [0,0,0,0],[0,1,1,1],[0,1,0,0],[0,0,0,0] ] ,
                   [ [0,0,1,0],[0,0,1,0],[0,0,1,1],[0,0,0,0] ] ,
                   [ [0,0,0,1],[0,1,1,1],[0,0,0,0],[0,0,0,0] ] ,
                   [ [0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0] ] ],
                   
            "J": [ [ [0,0,0,0],[0,1,1,1],[0,0,0,1],[0,0,0,0] ] ,
                   [ [0,0,1,1],[0,0,1,0],[0,0,1,0],[0,0,0,0] ] ,
                   [ [0,0,1,1],[0,0,1,0],[0,0,1,0],[0,0,0,0] ] ,
                   [ [0,0,1,0],[0,0,1,0],[0,1,1,0],[0,0,0,0] ] ]
        };
        r = this.tetList[Math.floor(Math.random()*7)];
        this.tet = { x: 5, y: 22, id: r, tet: this.tets[r], step: 0};
        this.cursors = this.input.keyboard.createCursorKeys();
        this.real = { step: 0, ox: 62 };
        this.input.onDown.add(this.onDown, this);
    },
    mood: function() {
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
		// debug("update", this.mode);
		/* update the game and handle user interaction */
		var i, j, t;
		if (this.mode == Tetris.playing) {
    		this.scoreText.text = "Score: "+this.score;
    		this.tetText.text = "Stat: [ "+ this.tet.id +", "+ (this.real.ox + this.tet.x * 20) +", "+ 20 * this.tet.y +", "+ this.tet.step +" ]";
    		this.realText.text = this.real.step + "\n";
    		this.gridMatrixText.visible = true;
    		t = this.tet.tet[this.tet.step];
    		for( i in t ) {
        	    for( j in t[i] ) {
        	        if (t[i][j]) {
        	            this.realText.text += "o";
        	        } else {
        	            this.realText.text += "-";
        	        }
        	    }
        	    this.realText.text += "\n";
    		}
    		this.filter.update();
		    this.add.sprite ( (this.real.ox + this.tet.x * 20) , 20 * this.tet.y, "" );
		    this.real.step += 1;
    		if (this.real.step % 30 == 0) {
    		    this.moveDown();
    		}
    		this.checkRows();
		}
		this.omode = this.mode;
    	if (this.score > 250) {
        	this.mode = Tetris.win;
        }
       	if (this.mode == Tetris.paused) {
     		if (this.input.keyboard.isDown(Phaser.Keyboard.P)) {
        		this.keyText.text = "P";
        		this.mode = Tetris.playing;
        	}
    	} else if (this.mode == Tetris.win) {
        	if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        		this.mode = Tetris.intro;
	        }
	    } else {
    	    if (this.input.keyboard.isDown(Phaser.Keyboard.P)) {
        		this.keyText.text = "P";
        		this.mode = Tetris.paused;
        	}
    		if (this.input.keyboard.isDown(Phaser.Keyboard.ESC)) {
        		debug("esc");
        		if (this.real.step % 5 == 0) {
        		    this.mode = Tetris.over;
        		}
			}
        	if (this.cursors.left.isDown ) {
            	this.keyText.text = "Left";
            	this.moveLeft();
            } 
            if (this.cursors.right.isDown ) {
            	this.keyText.text = "Right";
            	this.moveRight();
            } 
            if (this.cursors.up.isDown ) {
            	this.keyText.text = "Rotate";
            	if (this.real.step % 5 == 0) {
            	    this.rotate();    
            	}
            } 
            if (this.cursors.down.isDown) {
            	this.keyText.text = "Down";
            	this.moveDown();
            } 
			if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
	       		this.keyText.text = "Drop";
	       		this.drop();
	        }
    	}
    	if (this.mode !== this.omode) {
        	this.mood();
        }
	},
	checkRows: function () {
	    debug("checkRows");
	    var t = this.gridMatrix.slice(0), i, j, counter;
	    
	    this.gridMatrixText.text = "";
	    for( i in t ) {
    	    counter = 0;
    	    for( j in t[i] ) {
    	        if ( i == this.tet.x && j == 22-this.tet.y ) {
    	            debug( this.tet.tet[ this.tet.step ] );
    	        }
    	        
    	        if (t[i][j]) {
    	            counter += 1;
    	            this.gridMatrixText.text += "oo";
    	        } else {
    	            this.gridMatrixText.text += "--";
    	        }
    	    }
    	    this.gridMatrixText.text += "\n";
    	    if (counter == 10) {
    	        /* clear this row */
    	        this.score += 1;
    	        /* and move it down */
    	        this.gridMatrix[i] = [0,0,0,0,0,0,0,0,0,0];
    	        counter = 0;
    	    }
	    }
	},
	drop: function () {
		debug("drop",this.tet);
		/* move tet to lowest location and create new tet */
		
		this.checkTet();
	},
	checkTet: function(){
	    debug("checkTet");
        /* Check the grid to see if the piece is going to hit */
        var i, j, collide = false,
		    t = this.tet.tet[this.tet.step];
		for( i in t ) {
    	    for( j in t[i] ) {
    	        if (t[i][j]) {
    	            /* Translate the tet matrix into the grid */
    	            debug("T: ", this.tet.x, j, i, this.tet.y);
    	        }
    	    }
		}
		if (collide) {
		    this.newTet();
		}
	},
    newTet: function(){
        debug("newTet");
        /* new tet */
        var r = this.tetList[Math.floor(Math.random()*7)];
        this.tet = { "x": 5, "y": 22, "id": r, "tet": this.tets[r], "step": 0};
	},
	rotate: function () {
		debug("rotate",this.tet.step);
		/* Check the tet can rotate then rotate */
  	    this.tet.step += 1;
  	    this.tet.step = this.tet.step % this.tet.tet.length;
    },
	moveDown: function () {
		debug("moveDown",this.tet);
		/* Check the tet can move then move */
		if (this.tet.y > 0) {
		    this.tet.y -= 1;
		} else {
    	    this.newTet();
    	}
	},
	moveRight: function () {
		debug("moveRight",this.tet);
		/* Check the tet can move then move */
		/* Check the grid for collisions */
		if (this.tet.x < 10) {
		    this.tet.x += 1;    
		}
	},
	moveLeft: function () {
		debug("moveLeft",this.tet);
		/* Check the tet can move then move */
		if (this.tet.x > 0) {
		    this.tet.x -= 1;
		} 
	},
    start: function () {
        debug("Start");
        /* Begin the game loop */
        this.mode = Tetris.playing;
        this.score = 0;
        this.gridMatrix = [
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,1,0,0,1,0,0,0],
            [0,0,0,1,0,0,1,0,0,0],
            [0,0,0,1,0,0,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,1,0,0,0,0,1,0,0],
            [0,0,0,1,0,0,1,0,0,0],
            [0,0,0,0,1,1,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,1,1],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,0,1,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0] ];
        this.mood();
    },
	main: function () {
        debug("Main");
        /* Main game state */
        this.surface.loadTexture('playing');
        this.helpText.text = "Keys Esc-Quit P-Pause Arrows \n And Space to drop";
        this.scoreText.visible = true;
		this.keyText.visible = true;
		this.nextText.visible = true;
		this.pausedText.visible = false;
		this.tetText.visible = true;
		this.realText.visible = true;
	},
    paused: function () {
        debug("Paused");
        /* Stop its paused */
        this.surface.loadTexture('paused');
        this.pausedText.visible = true;
        this.keyText.visible = false;            
    },
	win: function () {
        debug("Win");
        /* Display a winning message */
        this.surface.loadTexture('win');
        this.keyText.visible = false;
        this.pausedText.visible = false;
        this.helpText.text  = "You WIN! Press Space to restart";
	},
    quit: function () {
		debug("Quit");
		/* Esc pressed get rid of the game */
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
        this.gridMatrix = [ 
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0]
        ];
        this.real = { step: 0, ox: 62 };
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
	/* Launch the game */
    document.removeEventListener('DOMContentLoaded', start, false);
    var game = new Phaser.Game(640, 480, Phaser.AUTO, 'game');
    game.state.add('Boot', Tetris.Boot);
    game.state.add('Preloader', Tetris.Preloader);
    game.state.add('Game', Tetris.Game);
    game.state.start('Boot');
}