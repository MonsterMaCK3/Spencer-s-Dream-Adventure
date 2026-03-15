// 1. Game Configuration
const config = {
    type: Phaser.AUTO,
    // High-resolution support for crisp mobile sprites
    resolution: window.devicePixelRatio || 1,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600,
        parent: "game-container",
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// 2. Start the Phaser Game
const game = new Phaser.Game(config);

// 3. Load Assets
function preload() {
    this.load.image("sky", "./assets/sky.png");
    this.load.image("gf", "./assets/gf.png");
    this.load.image("topObstacle", "./assets/alarm.png"); 
    this.load.image("bottomObstacle", "./assets/coffee.png");
}

// 4. Create Game Objects
function create() {
    // Add background (Centered at 200, 300)
    this.add.image(200, 300, "sky").setDisplaySize(400, 600);

    // Create player sprite
    this.player = this.physics.add.sprite(100, 300, "gf");
    
    // Increased scale (1.2) to make her look "right-sized" on high-DPR mobile screens
    this.player.setScale(1.2); 
    this.player.setCollideWorldBounds(true);

    // Input: Click / tap to jump
    this.input.on("pointerdown", () => {
        this.player.setVelocityY(-350);
    });

    // 5. Obstacle Management
    this.obstacles = this.physics.add.group();

    // Spawn a new "Dream Gap" every 1.5 seconds
    this.time.addEvent({
        delay: 1500,
        callback: addObstacle,
        callbackScope: this,
        loop: true
    });

    // Collision detection: Restart game if hit
    this.physics.add.collider(this.player, this.obstacles, () => {
        this.scene.restart();
    }, null, this);
}

// 6. Game Loop
function update() {
    // Memory management: Destroy obstacles that leave the screen
    this.obstacles.getChildren().forEach(obstacle => {
        if (obstacle.x < -100) {
            obstacle.destroy();
        }
    });

    // Fall off screen = Game Over
    if (this.player.y > 600 || this.player.y < 0) {
        this.scene.restart();
    }
}

// 7. Side-Scroller Obstacle Logic
function addObstacle() {
    const gap = 200; // The space she flies through
    const spawnX = 500; 
    const gapCenter = Phaser.Math.Between(150, 450);

    // Top Obstacle (Alarm Clock)
    let top = this.obstacles.create(spawnX, gapCenter - (gap / 2), 'topObstacle');
    top.body.allowGravity = false;
    top.setVelocityX(-200);
    top.setOrigin(0.5, 1); // Anchors to bottom of the sprite
    top.setScale(0.8); // Adjust as needed for your specific image

    // Bottom Obstacle (Coffee Mug)
    let bottom = this.obstacles.create(spawnX, gapCenter + (gap / 2), 'bottomObstacle');
    bottom.body.allowGravity = false;
    bottom.setVelocityX(-200);
    bottom.setOrigin(0.5, 0); // Anchors to top of the sprite
    bottom.setScale(0.8); // Adjust as needed for your specific image
}
