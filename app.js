const configForm = document.getElementById('config-form');
const playerNameInput = document.getElementById('player-name');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');

const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const hudPlayer = document.getElementById('hud-player');
const hudMoves = document.getElementById('hud-moves');
const statusMessage = document.getElementById('status-message');
const board = document.getElementById('grid-tablero');

const gameState = {
  playerName: '',
  difficulty: 4,
  moves: 0
};

function resetVisualState() {
  gameState.moves = 0;
  hudMoves.textContent = '0';
  statusMessage.textContent = '';
  board.innerHTML = '';
}

function showGameScreen() {
  homeScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
}

function showHomeScreen() {
  gameScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
}

configForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    statusMessage.textContent = 'Ingresa tu nombre para comenzar.';
    playerNameInput.focus();
    return;
  }

  gameState.playerName = playerName;
  gameState.difficulty = Number(difficultySelect.value);

  hudPlayer.textContent = gameState.playerName;
  resetVisualState();
  showGameScreen();
});

resetButton.addEventListener('click', () => {
  resetVisualState();
  showHomeScreen();
  configForm.reset();
  difficultySelect.value = '4';
  playerNameInput.focus();
});

startButton.setAttribute('aria-label', 'Iniciar partida de Mamma mia memory');
