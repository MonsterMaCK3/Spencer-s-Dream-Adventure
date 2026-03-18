// --- START MENU SCENE ---
class StartScene extends Phaser.Scene {
    constructor() {
        super("StartScene");
    }

    preload() {
        // Updated to match your filename
        this.load.image("startBG", "./assets/start-screen.png"); 
        // Ensure you have a small white square or star image here
        this.load.image("starPixel", "./assets/star.png"); 
    }

    create() {
        // 1. Background - Placed at center (200, 300) for a 400x600 canvas
        let bg = this.add.image(200, 300, "startBG").setDisplaySize(400, 600);

        // 2. Drifting particles (Stars)
        this.add.particles(0, 0, 'starPixel', {
            x: { min: 0, max: 400 },
            y: { min: 0, max: 600 },
            speed: { min: 5, max: 15 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.4, end: 0 },
            lifespan: 6000,
            frequency: 200, 
            blendMode: 'ADD'
        });

        // 3. PRESS START Glow Effect
        let glow = this.add.rectangle(200, 495, 120, 30, 0xffffff, 0.3);
        glow.setBlendMode(Phaser.BlendModes.SCREEN);

        this.tweens.add({
            targets: glow,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            yoyo: true,
            loop: -1
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

        // 5. Transition to Game
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