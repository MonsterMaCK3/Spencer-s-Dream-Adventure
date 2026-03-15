// 1. Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    parent: "game-container", // Matches the ID in your index.html
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
    // this.load.image("alarm", "./assets/alarm.png"); // Uncomment this when you have the image!
}

// 4. Create Game Objects
function create() {
    // Add background (centered)
    this.add.image(200, 300, "sky").setDisplaySize(400, 600);

    // Create player sprite with physics
    this.player = this.physics.add.sprite(100, 300, "gf");

    // Adjust player size (1.1 makes her slightly larger than original)
    this.player.setScale(1.1);

    // Prevent player from leaving screen
    this.player.setCollideWorldBounds(true);

    // Input: Click / tap to jump
    this.input.on("pointerdown", () => {
        this.player.setVelocityY(-350);
    });

    // --- NEW: OBSTACLE GROUP ---
    // This creates a "bucket" to hold all future alarm clocks
    this.obstacles = this.physics.add.group();

    // This timer will call 'addObstacle' every 1500ms (1.5 seconds)
    this.time.addEvent({
        delay: 1500,
        callback: addObstacle,
        callbackScope: this,
        loop: true
    });
}

// 5. Game Loop
function update() {
    // Logic for checking if obstacles go off-screen goes here
}

// 6. Spawn Obstacles
function addObstacle() {
    // We will fill this with "Alarm Clock" logic once your live link is working!
    console.log("A new obstacle would spawn now!");
}
