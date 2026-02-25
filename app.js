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
  moves: 0,
  firstCard: null,
  secondCard: null,
  boardLocked: false
};

const ingredients = [
  '🍕', '🍅', '🧀', '🍄', '🧅', '🥓', '🌶️', '🍍',
  '🌽', '🫒', '🧄', '🥫', '🫑', '🥬', '🍖', '🍤',
  '🐟', '🥚', '🥔', '🥕', '🥦', '🍞', '🧈', '🥛',
  '🍗', '🌿', '🫘', '🥜', '🍋', '🧂', '🫓', '🍝',
  '🍅', '🧆', '🥒', '🍠', '🫑', '🍆', '🥩', '🧇'
];

function shuffleArray(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array;
}

function createDeck(size) {
  const pairCount = (size * size) / 2;
  const uniqueIngredients = [...new Set(ingredients)].slice(0, pairCount);
  const pairedIngredients = [...uniqueIngredients, ...uniqueIngredients];
  return shuffleArray(pairedIngredients);
}

function clearTurnState() {
  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.boardLocked = false;
}

function showMistakeFeedback() {
  statusMessage.textContent = '¡Mamma Mia! Eso no combina.';
  board.classList.add('board-error');
}

function clearFeedback() {
  statusMessage.textContent = '';
  board.classList.remove('board-error');
}

function updateMoves() {
  gameState.moves += 1;
  hudMoves.textContent = String(gameState.moves);
}

function flipCard(cardElement) {
  cardElement.classList.add('flipped');
}

function unflipCards() {
  if (gameState.firstCard) {
    gameState.firstCard.classList.remove('flipped');
  }
  if (gameState.secondCard) {
    gameState.secondCard.classList.remove('flipped');
  }
}

function markCardsAsMatched() {
  gameState.firstCard.classList.add('matched');
  gameState.secondCard.classList.add('matched');
}

function checkMatch() {
  if (!gameState.firstCard || !gameState.secondCard) {
    return;
  }

  updateMoves();

  const firstIngredient = gameState.firstCard.dataset.ingredient;
  const secondIngredient = gameState.secondCard.dataset.ingredient;

  if (firstIngredient === secondIngredient) {
    markCardsAsMatched();
    clearFeedback();
    clearTurnState();
    return;
  }

  showMistakeFeedback();
  setTimeout(() => {
    unflipCards();
    clearFeedback();
    clearTurnState();
  }, 1000);
}

function onCardClick(event) {
  const selectedCard = event.currentTarget;

  if (gameState.boardLocked) {
    return;
  }

  if (selectedCard === gameState.firstCard) {
    return;
  }

  if (selectedCard.classList.contains('flipped') || selectedCard.classList.contains('matched')) {
    return;
  }

  flipCard(selectedCard);

  if (!gameState.firstCard) {
    gameState.firstCard = selectedCard;
    return;
  }

  gameState.secondCard = selectedCard;
  gameState.boardLocked = true;
  checkMatch();
}

function createCardElement(ingredient) {
  const cardButton = document.createElement('button');
  cardButton.type = 'button';
  cardButton.className = 'card';
  cardButton.dataset.ingredient = ingredient;
  cardButton.setAttribute('aria-label', 'Carta de memoria');

  const cardFront = document.createElement('span');
  cardFront.className = 'card-front';
  cardFront.textContent = '🍽️';

  const cardBack = document.createElement('span');
  cardBack.className = 'card-back';
  cardBack.textContent = ingredient;

  cardButton.appendChild(cardFront);
  cardButton.appendChild(cardBack);
  cardButton.addEventListener('click', onCardClick);

  return cardButton;
}

function renderBoard(size) {
  const deck = createDeck(size);
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;

  deck.forEach((ingredient) => {
    const cardElement = createCardElement(ingredient);
    board.appendChild(cardElement);
  });
}

function startNewGame() {
  resetVisualState();
  renderBoard(gameState.difficulty);
}

function resetVisualState() {
  gameState.moves = 0;
  clearTurnState();
  hudMoves.textContent = '0';
  clearFeedback();
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
  showGameScreen();
  startNewGame();
});

resetButton.addEventListener('click', () => {
  resetVisualState();
  showHomeScreen();
  configForm.reset();
  difficultySelect.value = '4';
  playerNameInput.focus();
});

startButton.setAttribute('aria-label', 'Iniciar partida de Mamma mia memory');
