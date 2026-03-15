// 1. Game Configuration
const config = {
    type: Phaser.AUTO,
    // Add Resolution for crisp rendering on high-DPR mobile screens
    resolution: window.devicePixelRatio || 1,
    scale: {
        mode: Phaser.Scale.FIT, // Auto-fits the screen while keeping aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game horizontally and vertically
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

// 3. Load Assets (Using relative paths for GitHub Pages)
function preload() {
    this.load.image("sky", "./assets/sky.png");
    this.load.image("gf", "./assets/gf.png");
    this.load.image("topObstacle", "./assets/alarm.png"); 
    this.load.image("bottomObstacle", "./assets/coffee.png");
}

// 4. Create Game Objects
function create() {
    // Add background (centered at middle of 400x600)
    this.add.image(200, 300, "sky").setDisplaySize(400, 600);

    // Create player sprite
    this.player = this.physics.add.sprite(100, 300, "gf");
    this.player.setScale(1.1); // Adjusted scale for mobile visibility
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

function update() {
    // Optimization: Destroy objects that leave the screen to save memory
    this.obstacles.getChildren().forEach(obstacle => {
        if (obstacle.x < -50) {
            obstacle.destroy();
        }
    });
}

// 6. Side-Scroller Obstacle Logic
function addObstacle() {
    const gap = 220; // Size of the space she flies through
    const spawnX = 450; 
    const gapCenter = Phaser.Math.Between(150, 450);

    // Top Obstacle
    let top = this.obstacles.create(spawnX, gapCenter - (gap / 2), 'topObstacle');
    top.body.allowGravity = false;
    top.setVelocityX(-200);
    top.setOrigin(0.5, 1); // Anchors to the bottom of the top obstacle

    // Bottom Obstacle
    let bottom = this.obstacles.create(spawnX, gapCenter + (gap / 2), 'bottomObstacle');
    bottom.body.allowGravity = false;
    bottom.setVelocityX(-200);
    bottom.setOrigin(0.5, 0); // Anchors to the top of the bottom obstacle
}
