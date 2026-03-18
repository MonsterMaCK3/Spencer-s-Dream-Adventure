// --- START MENU SCENE ---
class StartScene extends Phaser.Scene {
    constructor() { super("StartScene"); }

    preload() {
        this.load.image("startBG", "./assets/start-screen.png");
        this.load.audio("menuMusic", "./assets/menu-theme.mp3");
    }

    create() {
        // Fix for missing textures: Generate a star pixel in memory
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1).fillRect(0, 0, 2, 2);
        graphics.generateTexture('starPixel', 2, 2);
        graphics.destroy();

        let bg = this.add.image(200, 300, "startBG").setDisplaySize(400, 600);
        
        // Particles for atmosphere
        this.add.particles(0, 0, 'starPixel', {
            x: { min: 0, max: 400 }, y: { min: 0, max: 600 },
            speed: { min: 5, max: 15 }, scale: { start: 1.5, end: 0 },
            alpha: { start: 0.6, end: 0 }, lifespan: 5000,
            frequency: 150, blendMode: 'ADD'
        });

        this.music = this.sound.add("menuMusic", { volume: 0.5, loop: true });
        this.music.play();
        
        // Audio unlock for browsers
        this.input.once('pointerdown', () => { if (!this.music.isPlaying) this.music.play(); });

        this.input.on("pointerdown", () => {
            if (this.music) this.music.stop();
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
        // 1. Scrolling Night Background
        this.bg = this.add.tileSprite(200, 300, 400, 600, "cityBG");
        this.bg.setTint(0x222266, 0x222266, 0x444488, 0x444488); // Blue/Purple Night Tint

        // 2. Player
        this.player = this.physics.add.sprite(100, 300, "gf").setScale(0.8);
        this.player.setCollideWorldBounds(true);

        // 3. Score UI (Small in corner)
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'Score: 0', { 
            fontSize: '20px', 
            fill: '#ffffff', 
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3 
        }).setDepth(10);

        // 4. Input & Obstacles
        this.input.on("pointerdown", () => { this.player.setVelocityY(-350); });
        
        this.obstacles = this.physics.add.group();
        this.time.addEvent({ delay: 1500, callback: this.addPipes, callbackScope: this, loop: true });

        this.physics.add.collider(this.player, this.obstacles, () => {
            this.scene.restart();
        });
    }

    update() {
        this.bg.tilePositionX += 1; // Infinite background scroll

        this.obstacles.getChildren().forEach(pipe => {
            // Scoring logic (triggers once per pipe pair)
            if (pipe.isTop && !pipe.hasScored && pipe.x < this.player.x) {
                pipe.hasScored = true;
                this.score++;
                this.scoreText.setText('Score: ' + this.score);
            }
            // Memory cleanup
            if (pipe.x < -100) pipe.destroy();
        });

        if (this.player.y > 600 || this.player.y < 0) this.scene.restart();
    }

    addPipes() {
        const gap = 160;
        const x = 450;
        const gapCenter = Phaser.Math.Between(150, 450);

        // Top Pipe (Flipped)
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
        pipe.setDisplaySize(60, 640); // Standardize size for the jpg asset
        pipe.body.setSize(pipe.width, pipe.height);
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
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 1000 }, debug: false }
    },
    scene: [StartScene, GameScene]
};

const game = new Phaser.Game(config);