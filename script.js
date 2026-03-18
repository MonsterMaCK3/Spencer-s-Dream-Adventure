// --- START MENU SCENE ---
class StartScene extends Phaser.Scene {
    constructor() {
        super("StartScene");
    }

    preload() {
        // Essential: Load assets used in this scene
        this.load.image("startBG", "./assets/sky.png"); // Using sky as placeholder if needed
        this.load.image("starPixel", "./assets/star.png"); 
    }

    create() {
        // 2. Background Image
        let bg = this.add.image(200, 300, "startBG").setDisplaySize(400, 600);

        // 3. Drifting particles
        this.add.particles(0, 0, 'starPixel', {
            x: { min: 0, max: 400 },
            y: { min: 0, max: 600 },
            speed: { min: 5, max: 15 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.4, end: 0 },
            lifespan: 6000,
            frequency: 200, 
            blendMode: 'ADD'
        });

        // 4. PRESS START Glow
        let glow = this.add.rectangle(200, 495, 120, 30, 0xffffff, 0.3);
        glow.setBlendMode(Phaser.BlendModes.SCREEN);

        this.tweens.add({
            targets: glow,
            alpha: 0,
            duration: 800,
            ease: 'Linear',
            yoyo: true,
            loop: -1
        });

        // 5. Title Float
        this.tweens.add({
            targets: bg,
            y: 305, 
            duration: 4000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            loop: -1
        });

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
        this.cameras.main.setSize(400, 600);
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
        // Filter out destroyed objects and clean up off-screen
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < -100) {
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

        // TOP OBSTACLE
        let top = this.obstacles.create(spawnX, gapCenter - (gap / 2), 'topObstacle');
        this.setupObstaclePhysics(top, 1);

        // BOTTOM OBSTACLE
        let bottom = this.obstacles.create(spawnX, gapCenter + (gap / 2), 'bottomObstacle');
        this.setupObstaclePhysics(bottom, 0);
    }

    setupObstaclePhysics(obj, originY) {
        obj.body.allowGravity = false;
        obj.setVelocityX(-200);
        obj.setOrigin(0.5, originY); 
        obj.setScale(0.8);
        // Important: Reset hitboxes to match the new 0.8 scale
        obj.body.setSize(obj.width, obj.height);
    }
}

// --- GAME CONFIGURATION ---
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
        arcade: {
            gravity: { y: 1000 },
            debug: false 
        }
    },
    scene: [StartScene, GameScene]
};

const game = new Phaser.Game(config);