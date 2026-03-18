// --- START MENU SCENE ---
class StartScene extends Phaser.Scene {
    constructor() {
        super("StartScene");
    }

    preload() {
        this.load.image("startBG", "./assets/start-screen.png");
        // Verify this file exists at this exact path
        this.load.audio("menuMusic", "./assets/menu-theme.mp3");
    }

    create() {
        // 1. Generate Star Texture (Fixes green boxes)
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 2, 2);
        graphics.generateTexture('starPixel', 2, 2);
        graphics.destroy();

        // 2. Background & Particles
        let bg = this.add.image(200, 300, "startBG").setDisplaySize(400, 600);
        this.add.particles(0, 0, 'starPixel', {
            x: { min: 0, max: 400 },
            y: { min: 0, max: 600 },
            speed: { min: 5, max: 15 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 5000,
            frequency: 150,
            blendMode: 'ADD'
        });

        // 3. Audio Setup with Browser Unlock
        this.music = this.sound.add("menuMusic", { volume: 0.5, loop: true });
        
        // Function to handle the first user interaction to start audio
        const startAudio = () => {
            if (!this.music.isPlaying) {
                this.music.play();
            }
        };

        // Try playing immediately, otherwise play on first click
        this.music.play();
        this.input.once('pointerdown', startAudio);

        // 4. Background Animation
        this.tweens.add({
            targets: bg,
            y: 305,
            duration: 4000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            loop: -1
        });

        // 5. Transition to Game (Clean Audio Stop)
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
        this.player = this.physics.add.sprite(100, 300, "gf").setScale(1.2);
        this.player.setCollideWorldBounds(true);

        this.input.on("pointerdown", () => {
            this.player.setVelocityY(-350);
        });

        this.obstacles = this.physics.add.group();
        this.time.addEvent({
            delay: 1500,
            callback: this.addObstacle,
            callbackScope: this,
            loop: true
        });

        this.physics.add.collider(this.player, this.obstacles, () => {
            this.scene.restart();
        }, null, this);
    }

    update() {
        this.obstacles.getChildren().forEach(obs => {
            if (obs && obs.x < -100) obs.destroy();
        });

        if (this.player.y > 600 || this.player.y < 0) {
            this.scene.restart();
        }
    }

    addObstacle() {
        const gap = 180;
        const spawnX = 450;
        const gapCenter = Phaser.Math.Between(150, 450);

        let top = this.obstacles.create(spawnX, gapCenter - (gap / 2), 'topObstacle');
        this.setupObstacle(top, 1);

        let bottom = this.obstacles.create(spawnX, gapCenter + (gap / 2), 'bottomObstacle');
        this.setupObstacle(bottom, 0);
    }

    setupObstacle(obj, originY) {
        obj.body.allowGravity = false;
        obj.setVelocityX(-200);
        obj.setOrigin(0.5, originY);
        obj.setScale(0.8);
        obj.body.setSize(obj.width, obj.height);
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
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 1000 }, debug: false }
    },
    scene: [StartScene, GameScene]
};

const game = new Phaser.Game(config);