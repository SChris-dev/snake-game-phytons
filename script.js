// canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 960;
canvas.height = 600;

// game

// scoring and timer
let score = 6;
let timer = 0;
let timerInterval;

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;

        const hours = String(Math.floor(timer / 3600)).padStart(1, '0');
        const minutes = String(Math.floor((timer % 3600) / 60)).padStart(2, '0');
        const seconds = String(timer % 60).padStart(2, '0');

        timerText.innerHTML = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

function updateTimerDisplay() {
    const hours = String(Math.floor(timer / 3600));
    const minutes = String(Math.floor((timer % 3600) / 60)).padStart(2, '0');
    const seconds = String(timer % 60).padStart(2, '0');
    timerText.innerHTML = `${hours}:${minutes}:${seconds}`;
}

// grid
const rows = 30;
const cols = 48;
const cellSize = canvas.width / cols;

function createGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? '#00278a' : '#001b5f';
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }
};

// snake

let startX = Math.floor(cols / 2);
let startY = Math.floor(rows / 2);

const snake = [
    {
        x: startX,
        y: startY
    },
    {
        x: startX - 1,
        y: startY,
    },
    {
        x: startX - 2,
        y: startY
    },
    {
        x: startX - 3,
        y: startY,
    },
    {
        x: startX - 4,
        y: startY
    },
    {
        x: startX - 5,
        y: startY,
    },
    {
        x: startX - 6,
        y: startY
    }
]

// snake directions

let direction = 'right';

function moveSnake() {
    const head = { ...snake[0] };

    if (direction === 'right') head.x++;
    else if (direction === 'left') head.x--;
    else if (direction === 'up') head.y--;
    else if (direction === 'down') head.y++;

    head.x = (head.x + cols) % cols;
    head.y = (head.y + rows) % rows;

    snake.unshift(head);

    if (!checkPelletCollision()) {
        snake.pop();
    }
}

document.addEventListener('keydown', (e) => {
    const keyname = e.key;

    if ((keyname === 'w' || keyname === 'ArrowUp') && direction !== 'down') direction = 'up';
    else if ((keyname === 's' || keyname === 'ArrowDown') && direction !== 'up') direction = 'down';
    else if ((keyname === 'a' || keyname === 'ArrowLeft') && direction !== 'right') direction = 'left';
    else if ((keyname === 'd' || keyname === 'ArrowRight') && direction !== 'left') direction = 'right';
})

function drawSnake() {
    ctx.fillStyle = 'orange';
    snake.forEach(body => {
        ctx.fillRect(body.x * cellSize, body.y * cellSize, cellSize, cellSize)
    })
}

// food pellets
let pellets = [];
const minPellets = 3;
const maxPellets = 5;

function spawnPellet() {
    if (pellets.length >= maxPellets) return;

    let x;
    let y;
    let safe = false;

    while (!safe) {
        x = Math.floor(Math.random() * cols);
        y = Math.floor(Math.random() * rows);

        safe = !snake.some(body => body.x === x && body.y === y);
    }

    const newPellet = {
        x, 
        y,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5000
    }

    pellets.push(newPellet);
}

function cleanPellets() {
    const now = Date.now();
    pellets = pellets.filter(p => now < p.expiresAt);
}

function makePellets() {
    while (pellets.length < minPellets) {
        spawnPellet();
    }
}

function drawPellets() {
    ctx.fillStyle = 'skyblue';
    pellets.forEach(pellet => {
        ctx.fillRect(pellet.x * cellSize, pellet.y * cellSize, cellSize, cellSize);
    })
}

// collision functions
function checkPelletCollision() {
    const head = snake[0];

    for (let i = 0; i < pellets.length; i++) {
        if (pellets[i].x === head.x && pellets[i].y === head.y) {
            pellets.splice(i, 1);
            score += 1;
            scoreText.innerHTML = score;
            return true;
        }
    }

    return false;
}

function checkSnakeCollision() {
    const head = snake[0];

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }

    return false;
}

// rewind functions
const gameHistory = [];
const maxHistoryDuration = 5;
const framesPerSecond = 4;
const maxHistoryLength = maxHistoryDuration * framesPerSecond;
let isRewinding = false;

function storeGameState() {
    if (gameHistory.length >= maxHistoryLength) {
        gameHistory.shift();
    }

    gameHistory.push({
        snake: JSON.parse(JSON.stringify(snake)),
        pellets: JSON.parse(JSON.stringify(pellets)),
        direction,
        score,
        timer
    });
}

function restoreGameState(indexFromEnd) {
    const snapShot = gameHistory[gameHistory.length - indexFromEnd];
    if (!snapShot) return;

    snake.length = 0;
    snapShot.snake.forEach(segment => snake.push({ ...segment }));

    pellets = snapShot.pellets.map(p => ({ ...p }));
    direction = snapShot.direction;
    score = snapShot.score;
    timer = snapShot.timer;
}

let preRewindSnapshot = null;

function startRewind() {
    if (gameHistory.length < 2) return;

    pauseGame();
    preRewindSnapshot = cloneGameState();

    const availableSeconds = Math.floor(gameHistory.length / framesPerSecond);
    rewindBar.max = availableSeconds;
    rewindBar.value = availableSeconds;

    afterGame.style.display = 'flex';
    isRewinding = true;
    rewindBtn.style.display = 'none';

    // now
    restoreGameState(1);
    scoreText.textContent = score;
    updateTimerDisplay();
}

function cloneGameState() {
    return {
        snake: JSON.parse(JSON.stringify(snake)),
        pellets: JSON.parse(JSON.stringify(pellets)),
        direction,
        score,
        timer
    };
}

function applyGameState(snapshot) {
    snake.length = 0;
    snapshot.snake.forEach(segment => snake.push({ ...segment }));

    pellets = snapshot.pellets.map(p => ({ ...p }));
    direction = snapshot.direction;
    score = snapshot.score;
    timer = snapshot.timer;

    scoreText.textContent = score;
    updateTimerDisplay();
}

function renderSnapshot() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    createGrid();
    drawPellets();
    drawSnake();
}

// rewind event listeners

rewindBtn.addEventListener('click', startRewind);
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        startRewind();
    }
});

rewindBar.addEventListener('input', () => {
    const secondsBack = rewindBar.max - parseInt(rewindBar.value);
    const framesAgo = secondsBack * framesPerSecond;

    if (gameHistory.length >= framesAgo) {
        restoreGameState(framesAgo);
        scoreText.textContent = score;
        updateTimerDisplay();
        renderSnapshot();
    }
})

cancelRewind.addEventListener('click', () => {
    if (preRewindSnapshot) {
        applyGameState(preRewindSnapshot);
    }
    afterGame.style.display = 'none';
    isRewinding = false;
    rewindBtn.style.display = 'block';
    resumeGame();
})

confirmRewind.addEventListener('click', () => {
    const secondsAgo = parseInt(rewindBar.value);
    const framesAgo = secondsAgo * 5;

    restoreGameState(framesAgo);

    const newHistoryLength = gameHistory.length - framesAgo;
    gameHistory.splice(newHistoryLength);

    storeGameState();

    afterGame.style.display = 'none';
    isRewinding = false;
    rewindBtn.style.display = 'block';
    resumeGame();
})

// global game stuff

let gamePaused = false;

function pauseGame() {
    gamePaused = true;
    clearInterval(timerInterval);
}

function resumeGame() {
    if (!gamePaused) return;
    gamePaused = false;
    gameLoop();
    startTimer();
}

function gameLoop() {

    if (gamePaused) return;
    if (isRewinding) return;

    storeGameState();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    createGrid();
    drawPellets();
    moveSnake();
    drawSnake();

    cleanPellets();
    makePellets();

    if (checkSnakeCollision()) {
        gameOver();
        return;
    }

    setTimeout(gameLoop, 1000 / framesPerSecond);
}

function gameStart() {
    gameLoop();
    setInterval(spawnPellet, 3000);
    startTimer();
}

function gameOver() {
    clearInterval(timerInterval);
    
    const highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;

    if (score > highScore) {
        localStorage.setItem('snakeHighScore', score);
        alert(`Game Over! New Highscore: ${score}`);
        location.reload();
    } else {
        alert(`Game Over! Score: ${score}\nHighScore: ${highScore}`);
        location.reload();
    }
}