// --- START SCREEN SCENE ---
class StartScene extends Phaser.Scene {
    constructor() {
        super("StartScene");
    }

    preload() {
        this.load.image("startBG", "./assets/start-screen.png");
    }

    create() {
        // 1. Particle Starfield
        let pixel = this.make.graphics({ x: 0, y: 0, add: false });
        pixel.fillStyle(0xffffff, 1);
        pixel.fillRect(0, 0, 2, 2);
        pixel.generateTexture('starPixel', 2, 2);

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
        // Positioned at Y: 495 to match the text in your provided image
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
        this.obstacles.getChildren().slice().forEach(obstacle => {
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

        // --- TOP OBSTACLE (ALARM) ---
        let top = this.obstacles.create(spawnX, gapCenter - (gap / 2), 'topObstacle');
        top.body.allowGravity = false;
        top.setVelocityX(-200);
        top.setOrigin(0.5, 1); 
        top.setScale(0.8);
        // FIX: Rescale physics body to match visual size
        top.body.setSize(top.width, top.height);

        // --- BOTTOM OBSTACLE (COFFEE) ---
        let bottom = this.obstacles.create(spawnX, gapCenter + (gap / 2), 'bottomObstacle');
        bottom.body.allowGravity = false;
        bottom.setVelocityX(-200);
        bottom.setOrigin(0.5, 0); 
        bottom.setScale(0.8); 
        // FIX: Rescale physics body to match visual size
        bottom.body.setSize(bottom.width, bottom.height);
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
            debug: false // Set to true to see if hitboxes align with the coffee
        }
    },
    scene: [StartScene, GameScene]
};

const game = new Phaser.Game(config);





function preload() {
    this.load.image("sky", "./assets/sky.png");
    this.load.image("gf", "./assets/gf.png");
    this.load.image("topObstacle", "./assets/alarm.png"); 
    this.load.image("bottomObstacle", "./assets/coffee.png");
}

function create() {
    // FIX: Force the internal camera to sync with the logical size 
    // regardless of the browser's zoom or laptop's DPI setting.
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
        callback: addObstacle,
        callbackScope: this,
        loop: true
    });

    this.physics.add.collider(this.player, this.obstacles, () => {
        this.scene.restart();
    }, null, this);
}

function update() {
    this.obstacles.getChildren().slice().forEach(obstacle => {
        if (obstacle.x < -100) {
            obstacle.destroy();
        }
    });

    if (this.player.y > 600 || this.player.y < 0) {
        this.scene.restart();
    }
}

function addObstacle() {
    const gap = 200; 
    const spawnX = 500; 
    const gapCenter = Phaser.Math.Between(150, 450);

    let top = this.obstacles.create(spawnX, gapCenter - (gap / 2), 'topObstacle');
    top.body.allowGravity = false;
    top.setVelocityX(-200);
    top.setOrigin(0.5, 1); 
    top.setScale(0.8); 

    let bottom = this.obstacles.create(spawnX, gapCenter + (gap / 2), 'bottomObstacle');
    bottom.body.allowGravity = false;
    bottom.setVelocityX(-200);
    bottom.setOrigin(0.5, 0); 
    bottom.setScale(0.8); 
}
