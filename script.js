// 1. Game Configuration
const config = {
    type: Phaser.AUTO,
    // Helps with sharpness on high-DPI laptop screens
    resolution: window.devicePixelRatio || 1,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600,
        parent: "game-container", // Let Phaser handle the parent again
        expandParent: false       // CRITICAL: Stops Phaser from growing the <div>
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

const game = new Phaser.Game(config);

function preload() {
    this.load.image("sky", "./assets/sky.png");
    this.load.image("gf", "./assets/gf.png");
    this.load.image("topObstacle", "./assets/alarm.png"); 
    this.load.image("bottomObstacle", "./assets/coffee.png");
}

function create() {
    // LOCK: This prevents the 'infinite growth' bug on laptops
    // It tells Phaser to stick to the exact size of the container
    this.scale.setParentSize(400, 600);

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
