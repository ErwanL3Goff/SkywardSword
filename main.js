const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuration constants
const CONFIG = {
    CANVAS_WIDTH: canvas.width,
    CANVAS_HEIGHT: canvas.height,
    TILE_WIDTH: 120,
    TILE_HEIGHT: 130,
    PLAYER_SPEED: 20,
    WORLD_WIDTH: 2400, 
    WORLD_HEIGHT: 780  
};

// Camera object
const camera = {
    x: 0,
    y: 0,
    width: CONFIG.CANVAS_WIDTH,
    height: CONFIG.CANVAS_HEIGHT,
    
    centerOn(playerX, playerY) {
        this.x = playerX - this.width / 2 + CONFIG.TILE_WIDTH / 2;
        this.y = playerY - this.height / 2 + CONFIG.TILE_HEIGHT / 2;
        
        this.x = Math.max(0, Math.min(this.x, CONFIG.WORLD_WIDTH - this.width));
        this.y = Math.max(0, Math.min(this.y, CONFIG.WORLD_HEIGHT - this.height));
    }
};

// Player object with more modular structure
const player = {
    position: { x: CONFIG.TILE_WIDTH, y: CONFIG.TILE_HEIGHT },
    movement: {
        direction: 'down',
        posture: 'idle',
        frame: 0,
        isMoving: false,
        keys: {
            up: false,
            down: false,
            left: false,
            right: false
        }
    },
    sprite: {
        tileset: null,
        currentSprite: null
    }
};

// Map configuration
const mapData = {
    tileSize: CONFIG.TILE_WIDTH,
    layout: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
};

let spriteData = {}; 
let lastTime = 0;

function initGame() {
    player.sprite.tileset = new Image();
    player.sprite.tileset.src = 'Link/tileset.png';

    fetch('sprites.json')
        .then(response => response.json())
        .then(data => {
            spriteData = data;
            requestAnimationFrame(gameLoop);
        });
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    updatePlayerMovement();
    updateCamera();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateCamera() {
    camera.centerOn(player.position.x, player.position.y);
}

function updatePlayerMovement() {
    const { keys } = player.movement;
    const diagonalSpeed = CONFIG.PLAYER_SPEED * 0.7;

    player.movement.isMoving = false;
    player.movement.posture = 'idle';

    // Diagonal movement with improved sprite selection
    if (keys.up && keys.right) {
        player.position.y -= diagonalSpeed;
        player.position.x += diagonalSpeed;
        // Prioritize vertical sprite (up in this case)
        player.movement.direction = 'up';
        updateMovementState();
    } else if (keys.up && keys.left) {
        player.position.y -= diagonalSpeed;
        player.position.x -= diagonalSpeed;
        // Prioritize vertical sprite (up in this case)
        player.movement.direction = 'up';
        updateMovementState();
    } else if (keys.down && keys.right) {
        player.position.y += diagonalSpeed;
        player.position.x += diagonalSpeed;
        // Prioritize vertical sprite (down in this case)
        player.movement.direction = 'down';
        updateMovementState();
    } else if (keys.down && keys.left) {
        player.position.y += diagonalSpeed;
        player.position.x -= diagonalSpeed;
        // Prioritize vertical sprite (down in this case)
        player.movement.direction = 'down';
        updateMovementState();
    }
    // Cardinal directions
    else if (keys.up) {
        player.position.y -= CONFIG.PLAYER_SPEED;
        player.movement.direction = 'up';
        updateMovementState();
    } else if (keys.down) {
        player.position.y += CONFIG.PLAYER_SPEED;
        player.movement.direction = 'down';
        updateMovementState();
    } else if (keys.left) {
        player.position.x -= CONFIG.PLAYER_SPEED;
        player.movement.direction = 'left';
        updateMovementState();
    } else if (keys.right) {
        player.position.x += CONFIG.PLAYER_SPEED;
        player.movement.direction = 'right';
        updateMovementState();
    }

    checkCollisions();
}

function updateMovementState() {
    player.movement.isMoving = true;
    player.movement.posture = 'walking';
    player.movement.frame = (player.movement.frame + 1) % 3;
}

function checkCollisions() {
    const gridX = Math.floor(player.position.x / CONFIG.TILE_WIDTH);
    const gridY = Math.floor(player.position.y / CONFIG.TILE_HEIGHT);
    const diagonalSpeed = CONFIG.PLAYER_SPEED * 0.7;

    // Collision detection
    if (mapData.layout[gridY][gridX] === 1) {
        // Revert movement on collision
        switch (player.movement.direction) {
            case 'up': player.position.y += CONFIG.PLAYER_SPEED; break;
            case 'down': player.position.y -= CONFIG.PLAYER_SPEED; break;
            case 'left': player.position.x += CONFIG.PLAYER_SPEED; break;
            case 'right': player.position.x -= CONFIG.PLAYER_SPEED; break;
            case 'up-right':
            case 'up-left':
                player.position.y += diagonalSpeed;
                player.position.x += player.movement.direction === 'up-right' ? -diagonalSpeed : diagonalSpeed;
                break;
            case 'down-right':
            case 'down-left':
                player.position.y -= diagonalSpeed;
                player.position.x += player.movement.direction === 'down-right' ? -diagonalSpeed : diagonalSpeed;
                break;
        }
        player.movement.isMoving = false;
        player.movement.posture = 'idle';
    }
}

function draw() {
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Draw map
    for (let y = 0; y < mapData.layout.length; y++) {
        for (let x = 0; x < mapData.layout[y].length; x++) {
            const drawX = x * CONFIG.TILE_WIDTH - camera.x;
            const drawY = y * CONFIG.TILE_HEIGHT - camera.y;

            if (
                drawX + CONFIG.TILE_WIDTH > 0 && 
                drawX < CONFIG.CANVAS_WIDTH && 
                drawY + CONFIG.TILE_HEIGHT > 0 && 
                drawY < CONFIG.CANVAS_HEIGHT
            ) {
                ctx.fillStyle = mapData.layout[y][x] === 1 ? 'green' : 'yellow';
                ctx.fillRect(drawX, drawY, CONFIG.TILE_WIDTH, CONFIG.TILE_HEIGHT);
            }
        }
    }

    // Draw player
    const currentSprite = getSprite(player.movement.direction, player.movement.posture, player.movement.frame);
    if (currentSprite) {
        ctx.drawImage(
            player.sprite.tileset,
            currentSprite.x,
            currentSprite.y,
            currentSprite.width,
            currentSprite.height,
            player.position.x - camera.x,
            player.position.y - camera.y,
            CONFIG.TILE_WIDTH,
            CONFIG.TILE_HEIGHT
        );
    }
}

function getSprite(direction, posture, frame) {
    const sprites = spriteData.sprites.filter(sprite => 
        sprite.direction === direction && sprite.posture === posture
    );
    return sprites[frame % sprites.length];
}

// Event listeners for keyboard input
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': player.movement.keys.up = true; break;
        case 'ArrowDown': player.movement.keys.down = true; break;
        case 'ArrowLeft': player.movement.keys.left = true; break;
        case 'ArrowRight': player.movement.keys.right = true; break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp': player.movement.keys.up = false; break;
        case 'ArrowDown': player.movement.keys.down = false; break;
        case 'ArrowLeft': player.movement.keys.left = false; break;
        case 'ArrowRight': player.movement.keys.right = false; break;
    }
});

// Initialize the game
initGame();