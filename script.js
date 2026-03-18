class StartScene extends Phaser.Scene {
    constructor() {
        super("StartScene");
    }

    preload() {
        // Only load the background; no external star image needed
        this.load.image("startBG", "./assets/start-screen.png"); 
    }

    create() {
        // 1. Generate the Star Texture programmatically
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 2, 2);
        graphics.generateTexture('starPixel', 2, 2);
        graphics.destroy(); // Clean up the temporary graphics object

        // 2. Background
        let bg = this.add.image(200, 300, "startBG").setDisplaySize(400, 600);

        // 3. Drifting particles (Now using the generated 'starPixel')
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

        // 4. Subtle Title Float
        this.tweens.add({
            targets: bg,
            y: 305, 
            duration: 4000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            loop: -1
        });

        // 5. Start Game Listener
        this.input.on("pointerdown", () => {
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
        
        this.player = this.physics.add.sprite(100, 300, "gf");
        this.player.setScale(1.2); 
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
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle && obstacle.x < -100) {
                obstacle.destroy();
            }
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