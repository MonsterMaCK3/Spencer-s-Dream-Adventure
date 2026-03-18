// --- START MENU SCENE ---
class StartScene extends Phaser.Scene {
    constructor() {
        super("StartScene");
    }

    preload() {
        this.load.image("startBG", "./assets/start-screen.png");
        this.load.audio("menuMusic", "./assets/menu-theme.mp3");
    }

    create() {
        // Generate Star Texture (Fixes green boxes)
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 2, 2);
        graphics.generateTexture('starPixel', 2, 2);
        graphics.destroy();

        // Background & Particles
        let bg = this.add.image(200, 300, "startBG").setDisplaySize(400, 600);
        this.add.particles(0, 0, 'starPixel', {
            x: { min: 0, max: 400 }, y: { min: 0, max: 600 },
            speed: { min: 5, max: 15 }, scale: { start: 1.5, end: 0 },
            alpha: { start: 0.6, end: 0 }, lifespan: 5000,
            frequency: 150, blendMode: 'ADD'
        });

        // Audio logic
        this.music = this.sound.add("menuMusic", { volume: 0.5, loop: true });
        this.music.play();
        this.input.once('pointerdown', () => { if (!this.music.isPlaying) this.music.play(); });

        this.input.on("pointerdown", () => {
            if (this.music) this.music.stop();
            this.scene.start("GameScene");
        });
    }
}

// --- MAIN GAMEPLAY SCENE ---
class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.image("sky", "./assets/sky.png");
        this.load.image("gf", "./assets/gf.png");
        this.load.image("topObstacle", "./assets/alarm.png"); 
        this.load.image("bottomObstacle", "./assets/coffee.png");
    }

    create() {
        this.add.image(200, 300, "sky").setDisplaySize(400, 600);
        
        // Player setup
        this.player = this.physics.add.sprite(100, 300, "gf").setScale(1.2);
        this.player.setCollideWorldBounds(true);

        // Scoring setup
        this.score = 0;
        this.scoreText = this.add.text(200, 80, '0', {
            fontSize: '64px', fill: '#ffffff', fontFamily: 'Arial Black'
        }).setOrigin(0.5).setDepth(10);

        this.input.on("pointerdown", () => { this.player.setVelocityY(-350); });

        this.obstacles = this.physics.add.group();
        this.time.addEvent({
            delay: 1500, callback: this.addObstacle,
            callbackScope: this, loop: true
        });

        this.physics.add.collider(this.player, this.obstacles, () => {
            this.scene.restart();
        }, null, this);
    }

    update() {
        this.obstacles.getChildren().forEach(obstacle => {
            // Scoring Logic: Only check 'top' pipes to avoid double counting
            if (obstacle.isTopPipe && !obstacle.hasScored && obstacle.x < this.player.x) {
                obstacle.hasScored = true;
                this.score++;
                this.scoreText.setText(this.score);
            }

            if (obstacle.x < -100) obstacle.destroy();
        });

        if (this.player.y > 600 || this.player.y < 0) this.scene.restart();
    }

    addObstacle() {
        const gap = 170; 
        const spawnX = 450; 
        const gapCenter = Phaser.Math.Between(150, 450);

        // TOP PIPE
        let top = this.obstacles.create(spawnX, gapCenter - (gap / 2), 'topObstacle');
        this.setupPipe(top, 1);
        top.isTopPipe = true; // Mark for scoring
        top.hasScored = false;

        // BOTTOM PIPE
        let bottom = this.obstacles.create(spawnX, gapCenter + (gap / 2), 'bottomObstacle');
        this.setupPipe(bottom, 0);
    }

    setupPipe(pipe, originY) {
        pipe.body.allowGravity = false;
        pipe.setVelocityX(-200);
        pipe.setOrigin(0.5, originY);
        // Force height to 600 so it looks like a continuous pipe
        pipe.setDisplaySize(60, 600); 
        pipe.body.setSize(pipe.width, pipe.height);
    }
}

// --- CONFIG ---
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400, height: 600, parent: "game-container"
    },
    pixelArt: true, // Forces sharp pixel edges
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 1000 }, debug: false }
    },
    scene: [StartScene, GameScene]
};

const game = new Phaser.Game(config);