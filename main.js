const canvas = document.getElementById('gameCanvas'); // Correction : "canva" -> "canvas"
const ctx = canvas.getContext('2d');

const tileSize = 79;
const player = {
    x: 1,
    y: 1,
    direction: 'down',
    posture: 'idle',
    frame: 1
};

const tileset = new Image(); // Correction : "sileset" -> "tileset"
tileset.src = 'Link/tileset.png'; // Correction : "tileset.Image" -> "tileset.src"

let mapData = {};

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Logique de mise à jour du jeu
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Correction : "cleaRect" -> "clearRect"

    // Dessiner la carte
    for (let y = 0; y < mapData.map.length; y++) { // Correction : "lenght" -> "length"
        for (let x = 0; x < mapData.map[y].length; x++) { // Correction : "lenght" -> "length"
            if (mapData.map[y][x] === 1) {
                ctx.fillStyle = 'gray';
            } else {
                ctx.fillStyle = 'green';
            }
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize); // Correction : "fillReact" -> "fillRect"
        }
    }

    // Dessiner le personnage
    const spriteX = player.frame * tileSize; // Correction : "tileset" -> "tileSize"
    const spriteY = getSpriteY(player.direction, player.posture); // Correction : "SpriteY" -> "spriteY"
    ctx.drawImage(tileset, spriteX, spriteY, tileSize, tileSize, player.x * tileSize, player.y * tileSize, tileSize, tileSize); // Correction : "player.x * player.y * tileSize" -> "player.x * tileSize, player.y * tileSize"
}

function getSpriteY(direction, posture) {
    let y = 0;
    switch (direction) {
        case 'up':
            y = 0;
            break;
        case 'down':
            y = tileSize;
            break;
        case 'left':
            y = tileSize * 2;
            break;
        case 'right':
            y = tileSize * 3;
            break;
    }
    if (posture === 'walking') {
        y += tileSize * 4; // Supposons que les sprites de marche sont 4 lignes plus bas
    }
    return y;
}

// Gestion des touches pour déplacer le personnage
window.addEventListener('keydown', (e) => {
    let newX = player.x;
    let newY = player.y;

    if (e.key === 'ArrowUp') {
        newY--;
        player.direction = 'up';
        player.posture = 'walking';
    }
    if (e.key === 'ArrowDown') {
        newY++;
        player.direction = 'down';
        player.posture = 'walking';
    }
    if (e.key === 'ArrowLeft') {
        newX--;
        player.direction = 'left';
        player.posture = 'walking';
    }
    if (e.key === 'ArrowRight') {
        newX++;
        player.direction = 'right';
        player.posture = 'walking';
    }

    // Vérifier si la nouvelle position est valide
    if (mapData.map[newY] && mapData.map[newY][newX] === 0) {
        player.x = newX;
        player.y = newY;
    }
});

window.addEventListener('keyup', (e) => {
    player.posture = 'idle'; // Revenir à la posture immobile lorsque la touche est relâchée
});

// Charger la carte depuis le fichier JSON
fetch('map.json')
    .then(response => response.json())
    .then(data => {
        mapData = data;
        gameLoop();
    });