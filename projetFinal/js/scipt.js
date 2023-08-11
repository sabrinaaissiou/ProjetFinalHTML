function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createGrid() {
    const gridElement = document.getElementById('grid');
    const grid = [];

    for (let y = 0; y < 15; y++) {
        const row = [];
        for (let x = 0; x < 25; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', 'empty');
            row.push(cell);
            gridElement.appendChild(cell);
        }
        grid.push(row);
    }

    // Ajouter une fonction pour générer un labyrinthe à l'aide de l'algorithme Recursive Backtracking
    function generateMaze(x, y) {
        const directions = [
            [0, -2], // Up
            [0, 2],  // Down
            [-2, 0], // Left
            [2, 0]   // Right
        ];

        shuffle(directions); // Mélanger les directions pour éviter les circuits fermés

        for (const direction of directions) {
            const dx = direction[0];
            const dy = direction[1];

            const newX = x + dx;
            const newY = y + dy;

            if (newX >= 0 && newX < 25 && newY >= 0 && newY < 15) {
                if (!grid[newY][newX].classList.contains('wall')) {
                    grid[newY][newX].classList.add('wall');
                    grid[y + dy / 2][x + dx / 2].classList.add('wall');
                    generateMaze(newX, newY);
                }
            }
        }
    }

    // Générer le labyrinthe en commençant depuis une position aléatoire
    const startX = Math.floor(Math.random() * 12) * 2 + 1;
    const startY = Math.floor(Math.random() * 7) * 2 + 1;
    generateMaze(startX, startY);

    // Placer les monstres aléatoirement à l'intérieur du labyrinthe
    for (let i = 0; i < 3; i++) {
        let randomX, randomY;
        do {
            randomX = Math.floor(Math.random() * 23) + 1; // Limiter les positions pour éviter les bords
            randomY = Math.floor(Math.random() * 13) + 1;
        } while (grid[randomY][randomX].classList.contains('wall') || grid[randomY][randomX].classList.contains('monster'));

        grid[randomY][randomX].classList.add('monster');
    }

    // Placer les trésors aléatoirement à l'intérieur du labyrinthe
    for (let i = 0; i < 5; i++) {
        let randomX, randomY;
        do {
            randomX = Math.floor(Math.random() * 23) + 1;
            randomY = Math.floor(Math.random() * 13) + 1;
        } while (grid[randomY][randomX].classList.contains('wall') || grid[randomY][randomX].classList.contains('monster') || isCellSurroundedByWalls(grid, randomX, randomY));

        grid[randomY][randomX].classList.add('treasure-cell'); // Ajouter la classe spécifique aux cases des trésors
        grid[randomY][randomX].classList.add('treasure'); // Conserver également la classe 'treasure' pour gérer le comportement des trésors
    }

    return grid;
}

// Vérifier si une cellule est entourée de murs dans toutes les directions
function isCellSurroundedByWalls(grid, x, y) {
    const directions = [
        [0, -1], // Up
        [0, 1],  // Down
        [-1, 0], // Left
        [1, 0]   // Right
    ];

    for (const direction of directions) {
        const dx = direction[0];
        const dy = direction[1];

        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < 25 && newY >= 0 && newY < 15) {
            if (!grid[newY][newX].classList.contains('wall')) {
                return false;
            }
        }
    }

    return true;
}


// Classe Monstre pour représenter les monstres
class Monstre {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function checkCollision() {
    if (donjon.isGameOver()) {
        // Le jeu s'est déjà terminé, n'effectuez pas de vérification supplémentaire.
        return;
    }

    const playerCell = donjon.grid[donjon.playerY][donjon.playerX];

    // Vérifier si la case du joueur contient un monstre
    if (playerCell.classList.contains('monster')) {
        donjon.gameOver = true;
        alert('Game Over! Votre score : ' + donjon.score);
        return;
    }

    // Vérifier si la case du joueur contient un trésor
    if (playerCell.classList.contains('treasure')) {
        donjon.score++;
        playerCell.classList.remove('treasure');
        if (donjon.score >= 5) {
            donjon.gameOver = true;
            alert('Vous avez gagné! Votre score : ' + donjon.score);
        }
    }
}

// Classe Donjon pour gérer la logique du jeu
class Donjon {
    constructor(grid) {
        this.grid = grid;
        this.playerX = 0;
        this.playerY = 0;
        this.score = 0;
        this.gameOver = false;
        this.grid[0][0].classList.add('player');

        this.monsters = [];
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 25; x++) {
                if (this.grid[y][x].classList.contains('monster')) {
                    this.monsters.push(new Monstre(x, y));
                }
            }
        }
    }

    movePlayer(dx, dy) {
        if (this.gameOver) return;

        const newX = this.playerX + dx;
        const newY = this.playerY + dy;
        const newCell = this.grid[newY][newX];

        if (newX >= 0 && newX < 25 && newY >= 0 && newY < 15 && !newCell.classList.contains('wall')) {
            // Vérifier si la nouvelle cellule contient un monstre
            if (newCell.classList.contains('monster')) {
                this.gameOver = true;
                alert('Game Over! Votre score : ' + this.score);
                return;
            }

            this.grid[this.playerY][this.playerX].classList.remove('player');
            newCell.classList.add('player');
            this.playerX = newX;
            this.playerY = newY;

            this.checkCollision(); // Vérifier également la collision après chaque déplacement du joueur
        }
    }

    checkCollision() {
        const playerCell = this.grid[this.playerY][this.playerX];
        if (playerCell.classList.contains('monster')) {
            this.gameOver = true;
            alert('Game Over! Votre score : ' + this.score);
        }

        if (playerCell.classList.contains('treasure')) {
            this.score++;
            playerCell.classList.remove('treasure');
            if (this.score >= 5) {
                this.gameOver = true;
                alert('Vous avez gagné! Votre score : ' + this.score);
            }
        }
    }

    moveMonsters() {
        if (this.gameOver) return;

        const playerX = this.playerX;
        const playerY = this.playerY;

        for (const monster of this.monsters) {
            const dx = playerX - monster.x;
            const dy = playerY - monster.y;

            let newX, newY;

            // Déterminer quelle direction est la plus proche du joueur (horizontal ou vertical)
            if (Math.abs(dx) > Math.abs(dy)) {
                newX = monster.x + Math.sign(dx); // Se rapprocher horizontalement
                newY = monster.y;
            } else {
                newX = monster.x;
                newY = monster.y + Math.sign(dy); // Se rapprocher verticalement
            }

            if (newY >= 0 && newY < 15 && !this.grid[newY][newX].classList.contains('wall') && !this.grid[newY][newX].classList.contains('monster')) {
                this.grid[monster.y][monster.x].classList.remove('monster');
                monster.x = newX;
                monster.y = newY;
                this.grid[monster.y][monster.x].classList.add('monster');
            }
        }
    }

    getGrid() {
        return this.grid.map(row => row.map(cell => cell.className));
    }

    getScore() {
        return this.score;
    }

    isGameOver() {
        return this.gameOver;
    }
}

// Initialiser la grille et le jeu
const grid = createGrid();
let donjon = new Donjon(grid); // Changer "const" en "let" pour pouvoir réinitialiser la variable

// Fonction pour mettre à jour l'affichage de la grille et du score
function updateGridAndScore() {
    // Mettre à jour l'affichage de la grille
    const grid = donjon.getGrid();
    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 25; x++) {
            const cellType = grid[y][x];
            grid[y][x].className = cellType;
        }
    }

    // Mettre à jour l'affichage du score
    document.getElementById('score').innerText = 'Score: ' + donjon.getScore();
}
donjon.moveMonsters(); // Appel à moveMonsters après le déplacement du joueur
// Gérer les déplacements du joueur avec les boutons de contrôle
btnUp.addEventListener('click', () => {
    donjon.movePlayer(0, -1);
    donjon.moveMonsters();
    checkCollision(); // Ajouter cet appel ici
    updateGridAndScore();
});

btnDown.addEventListener('click', () => {
    donjon.movePlayer(0, 1);
    donjon.moveMonsters();
    checkCollision(); // Ajouter cet appel ici
    updateGridAndScore();
});

btnLeft.addEventListener('click', () => {
    donjon.movePlayer(-1, 0);
    donjon.moveMonsters();
    checkCollision(); // Ajouter cet appel ici
    updateGridAndScore();
});

btnRight.addEventListener('click', () => {
    donjon.movePlayer(1, 0);
    donjon.moveMonsters();
    checkCollision(); // Ajouter cet appel ici
    updateGridAndScore();
});

// Gérer les déplacements du joueur avec les flèches du clavier
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        donjon.movePlayer(0, -1);
        donjon.moveMonsters();
        checkCollision(); // Ajouter cet appel ici
        updateGridAndScore();
    } else if (event.key === 'ArrowDown') {
        donjon.movePlayer(0, 1);
        donjon.moveMonsters();
        checkCollision(); // Ajouter cet appel ici
        updateGridAndScore();
    } else if (event.key === 'ArrowLeft') {
        donjon.movePlayer(-1, 0);
        donjon.moveMonsters();
        checkCollision(); // Ajouter cet appel ici
        updateGridAndScore();
    } else if (event.key === 'ArrowRight') {
        donjon.movePlayer(1, 0);
        donjon.moveMonsters();
        checkCollision(); // Ajouter cet appel ici
        updateGridAndScore();
    }
});

// Récupérer le bouton "Recommencer"
const btnRestart = document.getElementById('btnRestart');

// Gérer le clic sur le bouton "Recommencer"
btnRestart.addEventListener('click', () => {
    // Réinitialiser la grille et le jeu
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = ''; // Effacer la grille existante
    const newGrid = createGrid();
    donjon = new Donjon(newGrid);
    donjon.score = 0;

    // Mettre à jour l'affichage du score
    document.getElementById('score').innerText = 'Score: 0';
});