// Obtém o elemento canvas e seu contexto 2D
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elemento para exibir mensagens de status
const messageElement = document.getElementById('message');

// Tamanho de cada célula no labirinto
const cellSize = 20;

// Definição do labirinto (0 = caminho, 1 = parede, 2 = jogador, 3 = saída, 4 = monstro)
// Um labirinto simples para começar. Você pode expandir isso!
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1], // Saída
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Posição inicial do jogador e do monstro
let player = { x: 1, y: 1 }; // Começa na célula (1,1)
let monster = { x: 18, y: 1 }; // Monstro começa perto do início, mas em outro canto
let monsterMoveDelay = 300; // Tempo em ms para o monstro se mover (mais rápido = mais difícil)
let lastMonsterMove = 0;

let gameEnded = false; // Flag para controlar o estado do jogo

// Função para desenhar o labirinto, jogador e monstro
function draw() {
    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o labirinto
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            const cell = maze[row][col];
            ctx.beginPath();
            ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);

            if (cell === 1) { // Parede
                ctx.fillStyle = '#444'; // Cor escura para paredes
                ctx.fill();
            } else if (cell === 3) { // Saída
                ctx.fillStyle = 'green'; // Cor verde para a saída
                ctx.fill();
            }
            // Para caminhos (0), não preenche, deixando o fundo preto do canvas
            ctx.closePath();
        }
    }

    // Desenha o jogador
    ctx.fillStyle = 'blue'; // Jogador azul
    ctx.beginPath();
    ctx.arc(player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Desenha o monstro
    ctx.fillStyle = 'red'; // Monstro vermelho
    ctx.beginPath();
    ctx.arc(monster.x * cellSize + cellSize / 2, monster.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

// Função para mover o jogador
function movePlayer(dx, dy) {
    if (gameEnded) return; // Não permite movimento se o jogo terminou

    const newX = player.x + dx;
    const newY = player.y + dy;

    // Verifica se a nova posição está dentro dos limites do labirinto
    if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length) {
        // Verifica se a nova posição não é uma parede
        if (maze[newY][newX] !== 1) {
            player.x = newX;
            player.y = newY;
            checkGameStatus(); // Verifica se o jogo terminou após o movimento
        }
    }
}

// Função para mover o monstro (movimento simples, aleatório ou em direção ao jogador)
function moveMonster() {
    if (gameEnded) return;

    const possibleMoves = [];
    const directions = [
        { dx: 0, dy: -1 }, // Cima
        { dx: 0, dy: 1 },  // Baixo
        { dx: -1, dy: 0 }, // Esquerda
        { dx: 1, dy: 0 }   // Direita
    ];

    for (const dir of directions) {
        const newX = monster.x + dir.dx;
        const newY = monster.y + dir.dy;

        // Verifica se a nova posição é válida e não é uma parede
        if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length && maze[newY][newX] !== 1) {
            possibleMoves.push({ x: newX, y: newY });
        }
    }

    if (possibleMoves.length > 0) {
        // Escolhe um movimento aleatório entre os possíveis
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        monster.x = randomMove.x;
        monster.y = randomMove.y;
    }
    checkGameStatus(); // Verifica se o jogo terminou após o movimento do monstro
}

// Função para verificar o status do jogo (vitória ou derrota)
function checkGameStatus() {
    // Vitória: Jogador chegou à saída (célula com valor 3)
    if (maze[player.y][player.x] === 3) {
        messageElement.textContent = 'Parabéns! Você encontrou a saída!';
        messageElement.style.color = '#00ff00';
        gameEnded = true;
    }
    // Derrota: Monstro pegou o jogador
    else if (player.x === monster.x && player.y === monster.y) {
        messageElement.textContent = 'GAME OVER! O monstro te pegou!';
        messageElement.style.color = '#ff0000';
        gameEnded = true;
    }
}

// Event Listener para as setas do teclado
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
    }
    draw(); // Redesenha o jogo após o movimento do jogador
});

// Loop principal do jogo
function gameLoop(timestamp) {
    if (gameEnded) return; // Se o jogo terminou, não continua o loop

    // Move o monstro em intervalos de tempo
    if (timestamp - lastMonsterMove > monsterMoveDelay) {
        moveMonster();
        lastMonsterMove = timestamp;
    }

    draw(); // Redesenha o jogo constantemente

    requestAnimationFrame(gameLoop); // Chama o próximo frame
}

// Inicia o jogo
draw(); // Desenha o estado inicial
requestAnimationFrame(gameLoop); // Inicia o loop do jogo
