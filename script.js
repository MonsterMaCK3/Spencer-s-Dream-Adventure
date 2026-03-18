// --- START MENU SCENE ---
class StartScene extends Phaser.Scene {
    constructor() { super("StartScene"); }

    preload() {
        this.load.image("startBG", "./assets/svPmCV.png");
        this.load.audio("menuMusic", "./assets/menu-theme.mp3");
    }

    create() {
        // Create star texture for particles
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1).fillRect(0, 0, 2, 2);
        graphics.generateTexture('starPixel', 2, 2);
        graphics.destroy();

        // Darkened city background for menu
        let bg = this.add.image(200, 300, "startBG").setDisplaySize(400, 600);
        bg.setTint(0x222266);

        this.add.text(200, 300, 'FLAPPY GF\nTap to Start', {
            fontSize: '40px', fill: '#fff', align: 'center', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        this.music = this.sound.add("menuMusic", { volume: 0.5, loop: true });
        
        // Mobile-friendly interaction to start
        this.input.once('pointerdown', () => {
            if (this.music) this.music.play();
            this.scene.start("GameScene");
        });
    }
}

// --- MAIN GAMEPLAY SCENE ---
class GameScene extends Phaser.Scene {
    constructor() { super("GameScene"); }

    preload() {
        this.load.image("cityBG", "./assets/svPmCV.png");
        this.load.image("gf", "./assets/gf.png");
        this.load.image("pipe", "./assets/38-388476_flappy-bird-pipes-png-bottle.jpg");
    }

    create() {
        this.isGameStarted = false;

        // 1. Scrolling Night Background
        this.bg = this.add.tileSprite(200, 300, 400, 600, "cityBG");
        this.bg.setTint(0x222266, 0x222266, 0x444488, 0x444488);

        // 2. Persistent Score Logic
        this.score = 0;
        this.highScore = localStorage.getItem('flappyHighScore') || 0;
        this.scoreText = this.add.text(20, 20, `Score: 0\nBest: ${this.highScore}`, { 
            fontSize: '18px', fill: '#fff', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 3 
        }).setDepth(10);

        this.instructionText = this.add.text(200, 300, 'TAP or SPACE\nTO JUMP', {
            fontSize: '30px', fill: '#fff', align: 'center', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(20);

        // 3. Effects
        this.emitter = this.add.particles(0, 0, 'starPixel', {
            speed: { min: -100, max: 100 }, scale: { start: 2, end: 0 },
            alpha: { start: 1, end: 0 }, lifespan: 800, gravityY: 200, emitting: false
        });

        // 4. Player & Physics
        this.player = this.physics.add.sprite(100, 300, "gf").setScale(0.8);
        this.player.setCollideWorldBounds(true);
        this.player.body.allowGravity = false;

        // 5. Unified Controls (Mobile Tap + Spacebar)
        const jump = () => {
            if (!this.isGameStarted) this.startGame();
            this.player.setVelocityY(-350);
            if (this.sound.context.state === 'suspended') this.sound.context.resume();
        };

        this.input.on("pointerdown", jump);
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down", jump);

        this.obstacles = this.physics.add.group();
        this.physics.add.collider(this.player, this.obstacles, () => this.scene.restart());
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

        // Dynamic Rotation
        if (this.player.body.velocity.y < 0) {
            this.player.angle = -20;
        } else if (this.player.angle < 90) {
            this.player.angle += 3;
        }

        // Scoring & Cleanup Loop
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

        if (this.player.y > 600 || this.player.y < 0) this.scene.restart();
    }

    addPipes() {
        const gap = 165;
        const x = 450;
        const gapCenter = Phaser.Math.Between(150, 450);

        // Create Top Pipe (Flipped)
        let top = this.obstacles.create(x, gapCenter - (gap / 2), "pipe");
        top.setOrigin(0.5, 1).setFlipY(true);
        this.setupPipePhysics(top);
        top.isTop = true;
        top.hasScored = false;

        // Create Bottom Pipe
        let bottom = this.obstacles.create(x, gapCenter + (gap / 2), "pipe");
        bottom.setOrigin(0.5, 0);
        this.setupPipePhysics(bottom);
    }

    setupPipePhysics(pipe) {
        pipe.body.allowGravity = false;
        pipe.setVelocityX(-200);
        pipe.setDisplaySize(60, 640);
        pipe.body.setSize(pipe.width, pipe.height);
    }
}

// --- CORE CONFIG ---
const config = {
    type: Phaser.AUTO,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 400, height: 600, parent: "game-container" },
    pixelArt: true,
    render: { antialias: false, roundPixels: true },
    physics: { default: "arcade", arcade: { gravity: { y: 1000 }, debug: false } },
    scene: [StartScene, GameScene]
};
new Phaser.Game(config);