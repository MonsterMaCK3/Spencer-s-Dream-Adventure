// 1. Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 }, // Gravity pulls her down
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// 2. Start the Engine
const game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', './assets/sky.png');
    this.load.image('gf', './assets/gf.png');
}

function create() {
    // --- LAYERING MATTERS HERE ---
    
    // 3. Add the Background FIRST (so it stays in the back)
    // We center it at (200, 300) and stretch it to fit the 400x600 screen
    this.add.image(200, 300, 'sky').setDisplaySize(400, 600);

    // 4. Add the Player SECOND (so she stays on top)
    this.player = this.physics.add.sprite(100, 300, 'gf');
    
    // Adjust this number (0.1 to 0.5) until she fits the screen perfectly
    this.player.setScale(1.1); 
    
    // Keep her from falling off the screen
    this.player.setCollideWorldBounds(true);

    // 5. INPUT: Click or Tap to Jump
    this.input.on('pointerdown', () => {
        this.player.setVelocityY(-350); // Negative moves UP
    });
}

function update() {
    // This is where we will eventually move the "obstacles" (like alarm clocks)
}
