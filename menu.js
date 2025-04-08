// menu
const menuContainer = document.getElementById('menuContainer');
const gameContainer = document.getElementById('gameContainer');

// elements
// menu
const usernameInput = document.getElementById('usernameInput');
const startBtn = document.getElementById('startBtn');

// ingame
const scoreText = document.getElementById('scoreText');
const timerText = document.getElementById('timerText');
const rewindBtn = document.getElementById('rewindBtn');
const rewindBar = document.getElementById('rewindBar');
const cancelRewind = document.getElementById('cancelRewind');
const confirmRewind = document.getElementById('confirmRewind');
const afterGame = document.getElementById('afterGame');

function validateInput() {
    let username = usernameInput.value;

    startBtn.disabled = username.trim() === '';
}

usernameInput.addEventListener('input', validateInput);

validateInput();

startBtn.addEventListener('click', () => {
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'flex';

    gameStart();
})