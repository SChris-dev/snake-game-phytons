// menu
const mainMenu = document.querySelector('#mainMenu');
const theGame = document.querySelector('#theGame');

// input elements
const playerInput = document.querySelector('#playerName');
const hardMode = document.querySelector('#hardMode');

// buttons
const startBtn = document.querySelector('#startBtn');
const leaderboardBtn = document.querySelector('#leaderboardBtn');
const rewindBtn = document.querySelector('#rewindBtn');

// start button state
startBtn.disabled = true;

// force the user to fill the name input before playing
playerInput.addEventListener('input', () => {
    const playerName = playerInput.value.trim();
    if (playerName) {
        startBtn.disabled = false;
    }
    else {
        startBtn.disabled = true;
    }
})

// hardmode check
hardMode.addEventListener('change', () => {
    console.log(`Hard Mode is ${hardMode.checked ? 'ON' : 'OFF'}`);
})

// start game button
startBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    theGame.style.display = 'flex';
    gameStart();
})

leaderboardBtn.addEventListener('click', () => {
    alert('Coming soon!');
})



// game canvas
const myCanvas = document.querySelector('canvas');
const ctx = myCanvas.getContext('2d');

// grid settings
const gridW = 48;
const gridH = 30;
const gridCell = 20;

// drawing grid
function drawGrid() {
    for (let x = 0; x <= gridW; x++) {
        for (let y = 0; y <= gridH; y++) {
            // for checkered styling
            const isEven = (x + y) % 2 === 0;
            // conditional checking for color
            ctx.fillStyle = isEven ? '#214D66' : '#1E3849';
            ctx.fillRect(x * gridCell,  y * gridCell, gridCell, gridCell);
        }
    }
}

// rewind button
rewindBtn.addEventListener('click', () => {
    console.log('Click!')
})

// food setting
const foodPelets = [];
const foodDuration = 5000; // 5 seconds, this for hard mode dissapear
let foodTimer = 0; // timer for summon food

// making food pellet
function spawnFood() {
    if (foodPelets.length < 5) {
        const food = {
            x: Math.floor(Math.random() * gridW),
            y: Math.floor(Math.random() * gridH),
            createdAt: Date.now()
        }
        foodPelets.push(food);
    }
}

// drawing food on canvas
function drawFood() {
    foodPelets.forEach(food => {
        ctx.fillStyle = '#88B0D5';
        ctx.fillRect(food.x * gridCell, food.y * gridCell, gridCell, gridCell);
    })
}

// check if snake is eating (snake collision dengan food)
function checkFoodCollision() {
    const head = snake.body[0];

    foodPelets.forEach((food, index) => {
        if (head.x === food.x && head.y === food.y) {
            // snake eat food more panjang tubuhnya
            snake.body.push({ ...snake.body[snake.body.length - 1] });
            foodPelets.splice(index, 1); // remove food that eaten by snake
            // update score for now
            console.log('Score: ' + snake.body.length); 
        }
    });
}

// update food logic (muncul setiap 3 detik, hilang setelah 5 detik di hardmode)

function updateFood(time) {
    if (time - foodTimer > 3000) { // muncul tiap 3 detik food pelet
        spawnFood();
        foodTimer = time;
    }

    if (hardMode.checked) { // checking if hard mode
        foodPelets.forEach((food, index) => {
            if (time - food.createdAt > foodDuration) { // delete food after 5 second
                foodPelets.splice(index, 1);
            }
        })
    }
}

// snake setting
const snakeSpeed = 4; // 4 grid per second
let lastTime = 0; // Store the last time the snake moved
const snake = {
    // starting point
    body: [
        { x: Math.floor(gridW / 2), y: Math.floor(gridH / 2) },
        { x: Math.floor(gridW / 2), y: Math.floor(gridH / 2) + 1 },
        { x: Math.floor(gridW / 2), y: Math.floor(gridH / 2) + 2 },
        { x: Math.floor(gridW / 2), y: Math.floor(gridH / 2) + 3 },
        { x: Math.floor(gridW / 2), y: Math.floor(gridH / 2) + 4 },
        { x: Math.floor(gridW / 2), y: Math.floor(gridH / 2) + 5 },
    ],
    // move right default
    direction: {
        x: 1,
        y: 0
    }
}

// drawing the snake
function drawSnake() {
    snake.body.forEach((body, head) => {
        ctx.fillStyle = head === 0 ? '#795627' : '#795627';
        ctx.fillRect(body.x * gridCell, body.y * gridCell, gridCell, gridCell);
    });
}


// moving snake
function moveSnake() {
    const head = {
        ...snake.body[0]
    }
    head.x += snake.direction.x;
    head.y += snake.direction.y;

    // making sure snake no go away
    if (head.x < 0) {
        head.x = gridW - 1;
    }
    if (head.x >= gridW) {
        head.x = 0;
    }
    if (head.y < 0) {
        head.y = gridH - 1;
    }
    if (head.y >= gridH) {
        head.y = 0;
    }

    snake.body.unshift(head);
    snake.body.pop();
}

// movement snake
document.addEventListener('keydown', (e) => {
    //check the key presses
    const keyPressed = e.key;
    switch (keyPressed) {
        case 'w':
            if (snake.direction.y === 0) {
                snake.direction = {
                    x: 0,
                    y: -1
                }
            }
            break;
        case 's':
            if (snake.direction.y === 0) {
                snake.direction = {
                    x:0,
                    y: 1
                }
            }
            break;
        case 'd':
            if (snake.direction.x === 0) {
                snake.direction = {
                    x: 1,
                    y: 0,
                }
            }
            break;
        case 'a':
            if (snake.direction.x === 0) {
                snake.direction = {
                    x: -1,
                    y: 0,
                }
            }
            break;
    }
})



function gameLoop(tick) {
    // time between fraems
    const deltaTime = tick - lastTime;
    const moveInterval = 100 / snakeSpeed; // how fast snake moving

    if (deltaTime > moveInterval) {
        // update and draw again after deltatime is finished
        lastTime = tick;
        moveSnake();
        checkFoodCollision();
    }

    updateFood(tick);

    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    drawGrid();
    drawSnake();
    drawFood();
    requestAnimationFrame(gameLoop);
}


function gameStart() {
    console.log('Game Started!');
    drawGrid();
    gameLoop();
}

