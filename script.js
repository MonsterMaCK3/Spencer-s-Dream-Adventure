// ===========================
// Spencer's Dream Adventure
// Mobile-friendly, scalable Phaser 3 template
// ===========================

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: "game-container",

    width: 800,          // base game width
    height: 600,         // base game height

    scale: {
        mode: Phaser.Scale.ENVELOP,   // fill screen while keeping aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },

    scene: { preload, create, update }
};

// Create the Phaser game instance
const game = new Phaser.Game(config);

// ===========================
// Global variables
// ===========================
let player;
let cursors;
let platforms;
let stars;
let score = 0;
let scoreText;

// ===========================
// Preload assets
// ===========================
function preload() {
    // Background
    this.load.image('sky', 'assets/background.png');

    // Platform
    this.load.image('ground', 'assets/platform.png');

    // Collectibles
    this.load.image('star', 'assets/star.png');

    // Player sprite (static for now, can add animations)
    this.load.image('spencer', 'assets/spencer.png');
}

// ===========================
// Create the scene
// ===========================
function create() {
    // Background
    this.add.image(400, 300, 'sky').setScrollFactor(1);

    // Platforms group
    platforms = this.physics.add.staticGroup();

    // Ground + floating platforms
    platforms.create(400, 580, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Player setup
    player = this.physics.add.sprite(100, 450, 'spencer');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Collide with platforms
    this.physics.add.collider(player, platforms);

    // Input
    cursors = this.input.keyboard.createCursorKeys();

    // Stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 10,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.physics.add.collider(stars, platforms);

    // Collect stars
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // Camera follows player
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, 2000, 600);  // world width
    this.physics.world.setBounds(0, 0, 2000, 600);

    // Score display
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#ffffff'
    });
    scoreText.setScrollFactor(0); // keep score fixed on screen
}

// ===========================
// Update loop
// ===========================
function update() {
    // Horizontal movement
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    // Jump
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-350);
    }
}

// ===========================
// Collect star function
// ===========================
function collectStar(player, star) {
    star.disableBody(true, true); // hide collected star
    score += 10;
    scoreText.setText('Score: ' + score);
}