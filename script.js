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
        // Center the image (200, 300 is center of 400x600 canvas)
        // setDisplaySize ensures it fits your game's aspect ratio
        this.add.image(200, 300, "startBG").setDisplaySize(400, 600);

        // Transition to GameScene on any click or tap
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
        // Force camera to logical size
        this.cameras.main.setSize(400, 600);
        
        // Background
        this.add.image(200, 300, "sky").setDisplaySize(400, 600);
        
        // Player (Spencer)
        this.player = this.physics.add.sprite(100, 300, "gf");
        this.player.setScale(1.2); 
        this.player.setCollideWorldBounds(true);

        // Jump Input
        this.input.on("pointerdown", () => {
            this.player.setVelocityY(-350);
        });

        // Obstacles Group
        this.obstacles = this.physics.add.group();
        
        // Obstacle Spawning Timer
        this.time.addEvent({
            delay: 1500,
            callback: this.addObstacle,
            callbackScope: this,
            loop: true
        });

        // Collision Logic - Restarts current scene on hit
        this.physics.add.collider(this.player, this.obstacles, () => {
            this.scene.restart();
        }, null, this);
    }

    update() {
        // Clean up off-screen obstacles
        this.obstacles.getChildren().slice().forEach(obstacle => {
            if (obstacle.x < -100) {
                obstacle.destroy();
            }
        });

        // Fail if player goes off top or bottom
        if (this.player.y > 600 || this.player.y < 0) {
            this.scene.restart();
        }
    }

    addObstacle() {
        const gap = 200; 
        const spawnX = 500; 
        const gapCenter = Phaser.Math.Between(150, 450);

        // Top Obstacle (Alarm)
        let top = this.obstacles.create(spawnX, gapCenter - (gap / 2), 'topObstacle');
        top.body.allowGravity = false;
        top.setVelocityX(-200);
        top.setOrigin(0.5, 1); 
        top.setScale(0.8); 

        // Bottom Obstacle (Coffee)
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
    // pixelArt: true makes sure your 8-bit assets stay crisp
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    // The engine starts with the first scene in this list
    scene: [StartScene, GameScene]
};

// Start the game
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
