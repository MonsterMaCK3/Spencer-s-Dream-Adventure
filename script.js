// --- START SCREEN SCENE ---
class StartScene extends Phaser.Scene {
    constructor() {
        super("StartScene");
    }

    preload() {
        // Load the Spencer's Dream Adventure image
        this.load.image("startBG", "./assets/start-screen.png");
    }

    create() {
        // 1. Create a tiny 2x2 white pixel for the particles
        let pixel = this.make.graphics({ x: 0, y: 0, add: false });
        pixel.fillStyle(0xffffff, 1);
        pixel.fillRect(0, 0, 2, 2);
        pixel.generateTexture('starPixel', 2, 2);

        // 2. Add the Background Image (Centered)
        let bg = this.add.image(200, 300, "startBG").setDisplaySize(400, 600);

        // 3. Add Drifting Dream Particles
        // These will float randomly across the screen like twinkling stars
        this.add.particles(0, 0, 'starPixel', {
            x: { min: 0, max: 400 },
            y: { min: 0, max: 600 },
            speed: { min: 5, max: 20 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 5000,
            frequency: 150, 
            blendMode: 'ADD'
        });

        // 4. Title Floating Animation (Subtle Bobbing)
        this.tweens.add({
            targets: bg,
            y: 305, 
            duration: 3000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            loop: -1
        });

        // 5. Classic Arcade "PRESS START" Blink
        // This black rectangle covers the text in your image to make it "flicker"
        let blinker = this.add.rectangle(200, 465, 180, 40, 0x000000);
        this.tweens.add({
            targets: blinker,
            alpha: 0,
            duration: 600,
            ease: 'Steps(1)', 
            yoyo: true,
            loop: -1
        });

        // Click to Start
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
}

// --- GAME CONFIGURATION ---
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600,
        parent: "game-container"
    },
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 900 },
            debug: false
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
