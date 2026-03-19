// --- START MENU SCENE ---
class StartScene extends Phaser.Scene {
    constructor() { super("StartScene"); }
    
    preload() {
        // Keeps your specific filename intact
        this.load.image("startBG", "./assets/start-screen.png");
        this.load.audio("menuMusic", "./assets/menu-theme.mp3");
    }

    create() {
        // Generate Star Texture in memory for the score burst later
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1).fillRect(0, 0, 2, 2);
        graphics.generateTexture('starPixel', 2, 2);
        graphics.destroy();

        // Display original start screen
        this.add.image(200, 300, "startBG").setDisplaySize(400, 600);

        try {
            this.music = this.sound.add("menuMusic", { volume: 0.5, loop: true });
        } catch (e) { console.log("Audio not found."); }
        
        // Unified Start: Tap or Spacebar
        const startAction = () => {
            if (this.music && !this.music.isPlaying) this.music.play();
            this.scene.start("GameScene");
        };

        this.input.once('pointerdown', startAction);
        this.input.keyboard.once('keydown-SPACE', startAction);
    }
}

// --- MAIN GAMEPLAY SCENE ---
class GameScene extends Phaser.Scene {
    constructor() { super("GameScene"); }

    preload() {
        this.load.image("cityBG", "./assets/sky.png");
        this.load.image("gf", "./assets/gf.png");
        this.load.image("pipe", "./assets/pipe.png");
    }

    create() {
        this.isGameStarted = false;

        // 1. Scrolling Night Background (svPmCV.png)
        this.bg = this.add.tileSprite(200, 300, 400, 600, "cityBG");
        this.bg.setTint(0x222266, 0x222266, 0x444488, 0x444488); // Blue night tint

        // 2. Score & Storage
        this.score = 0;
        this.highScore = localStorage.getItem('flappyHighScore') || 0;
        this.scoreText = this.add.text(20, 20, `Score: 0\nBest: ${this.highScore}`, { 
            fontSize: '18px', fill: '#fff', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 3 
        }).setDepth(10);

        // 3. Instruction Overlay
        this.instructionText = this.add.text(200, 300, 'TAP OR SPACE\nTO JUMP', {
            fontSize: '32px', fill: '#fff', align: 'center', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(20);

        // 4. Effects Emitter
        this.emitter = this.add.particles(0, 0, 'starPixel', {
            speed: { min: -100, max: 100 }, scale: { start: 2, end: 0 },
            alpha: { start: 1, end: 0 }, lifespan: 800, gravityY: 200, emitting: false
        });

        // 5. Player Setup
        this.player = this.physics.add.sprite(100, 300, "gf").setScale(0.8);
        this.player.setCollideWorldBounds(true);
        this.player.body.allowGravity = false; // Stay still until first jump

        // 6. Unified Input Handling (Touch + Space)
        const doJump = () => {
            if (!this.isGameStarted) this.startGame();
            this.player.setVelocityY(-350);
            
            // Audio context resume for mobile
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        };

        this.input.on("pointerdown", doJump);
        this.input.keyboard.on("keydown-SPACE", doJump);

        this.obstacles = this.physics.add.group();
        this.physics.add.collider(this.player, this.obstacles, () => { this.scene.restart(); });
    }

    startGame() {
        this.isGameStarted = true;
        this.instructionText.setVisible(false);
        this.player.body.allowGravity = true;
        this.time.addEvent({ delay: 1500, callback: this.addPipes, callbackScope: this, loop: true });
    }

    update() {
        if (!this.isGameStarted) return;
        this.bg.tilePositionX += 1;

        // Rotation: Tilt up when jumping, dive when falling
        if (this.player.body.velocity.y < 0) {
            this.player.angle = -20;
        } else if (this.player.angle < 90) {
            this.player.angle += 3;
        }

        // Scoring & Logic
        this.obstacles.getChildren().forEach(pipe => {
            if (pipe.isTop && !pipe.hasScored && pipe.x < this.player.x) {
                pipe.hasScored = true;
                this.score++;
                this.emitter.explode(10, this.player.x, this.player.y);
                
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('flappyHighScore', this.highScore);
                }
                this.scoreText.setText(`Score: ${this.score}\nBest: ${this.highScore}`);
            }
            if (pipe.x < -100) pipe.destroy();
        });

        // Reset if off-screen
        if (this.player.y > 600 || this.player.y < 0) this.scene.restart();
    }

    addPipes() {
        const gap = 160;
        const x = 450;
        const gapCenter = Phaser.Math.Between(150, 450);

        // Top Pipe
        let top = this.obstacles.create(x, gapCenter - (gap / 2), "pipe");
        top.setOrigin(0.5, 1).setFlipY(true);
        this.setupPipePhysics(top);
        top.isTop = true;
        top.hasScored = false;

        // Bottom Pipe
        let bottom = this.obstacles.create(x, gapCenter + (gap / 2), "pipe");
        bottom.setOrigin(0.5, 0);
        this.setupPipePhysics(bottom);
    }

    setupPipePhysics(pipe) {
        pipe.body.allowGravity = false;
        pipe.setVelocityX(-200);
        // Ensure the JPG texture renders at the correct "pipe" proportions
        pipe.setDisplaySize(60, 640);
        pipe.body.setSize(60, 640);
    }
}

// --- CONFIG ---
const config = {
    type: Phaser.AUTO,
    scale: { 
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH, 
        width: 400, 
        height: 600, 
        parent: "game-container" 
    },
    pixelArt: true,
    render: { antialias: false, roundPixels: true },
    physics: { 
        default: "arcade", 
        arcade: { 
            gravity: { y: 1000 }, 
            debug: false // Set to true to see the hitboxes
        } 
    },
    scene: [StartScene, GameScene]
};
const game = new Phaser.Game(config);