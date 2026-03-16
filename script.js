// 1. Game Configuration
const config = {
    type: Phaser.AUTO,
    // High-resolution support
    resolution: window.devicePixelRatio || 1,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600,
        // Set to null to prevent Phaser from auto-resizing your HTML container
        parent: null, 
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

// 3. FIX: Manually inject the game into the container after the window loads
// This "locks" the canvas inside your CSS boundaries
window.addEventListener('load', () => {
    const container = document.getElementById('game-container');
    if (container && game.canvas) {
        container.appendChild(game.canvas);
    }
});

// 4. Load Assets
function preload() {
    this.load.image("sky", "./assets/sky.png");
    this.load.image("gf", "./assets/gf.png");
    this.load.image("topObstacle", "./assets/alarm.png"); 
    this.load.image("bottomObstacle", "./assets/coffee.png");
}

// 5. Create Game Objects
function create() {
    // Add background (Centered at 200, 300)
    this.add.image(200, 300, "sky").setDisplaySize(400, 600);

    // Create player sprite
    this.player = this.physics.add.sprite(100, 300, "gf");
    this.player.setScale(1.2); 
    this.player.setCollideWorldBounds(true);

    // Input: Click / tap to jump
    this.input.on("pointerdown", () => {
        this.player.setVelocityY(-350);
    });

    // Obstacle Management
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
    // Memory management: Clean up off-screen obstacles
    // .slice() prevents errors when removing items from the array we are looping through
    this.obstacles.getChildren().slice().forEach(obstacle => {
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
    const gap = 200; 
    const spawnX = 500; 
    const gapCenter = Phaser.Math.Between(150, 450);

    // Top Obstacle
    let top = this.obstacles.create(spawnX, gapCenter - (gap / 2), 'topObstacle');
    top.body.allowGravity = false;
    top.setVelocityX(-200);
    top.setOrigin(0.5, 1); 
    top.setScale(0.8); 

    // Bottom Obstacle
    let bottom = this.obstacles.create(spawnX, gapCenter + (gap / 2), 'bottomObstacle');
    bottom.body.allowGravity = false;
    bottom.setVelocityX(-200);
    bottom.setOrigin(0.5, 0); 
    bottom.setScale(0.8); 
}
