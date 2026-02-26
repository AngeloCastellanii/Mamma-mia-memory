const configForm = document.getElementById('config-form');
const playerNameInput = document.getElementById('player-name');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');

const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const hudPlayer = document.getElementById('hud-player');
const hudMoves = document.getElementById('hud-moves');
const hudPairs = document.getElementById('hud-pairs');
const statusMessage = document.getElementById('status-message');
const board = document.getElementById('grid-tablero');
const victoryModal = document.getElementById('victory-modal');
const modalPlayer = document.getElementById('modal-player');
const modalMoves = document.getElementById('modal-moves');
const modalPlayAgainButton = document.getElementById('modal-play-again');
const modalBackHomeButton = document.getElementById('modal-back-home');

const difficultyConfig = {
  4: { size: 4, pairCount: 8 },
  6: { size: 6, pairCount: 18 },
  8: { size: 8, pairCount: 32 }
};

const gameState = {
  playerName: '',
  difficulty: 4,
  moves: 0,
  matchedPairs: 0,
  totalPairs: 0,
  firstCard: null,
  secondCard: null,
  boardLocked: false,
  pendingUnflipTimeout: null
};

const ingredients = [
  '🍕', '🍅', '🧀', '🍄', '🧅', '🥓', '🌶️', '🍍',
  '🌽', '🫒', '🧄', '🥫', '🫑', '🥬', '🍖', '🍤',
  '🐟', '🥚', '🥔', '🥕', '🥦', '🍞', '🧈', '🥛',
  '🍗', '🌿', '🫘', '🥜', '🍋', '🧂', '🫓', '🍝',
  '🍅', '🧆', '🥒', '🍠', '🫑', '🍆', '🥩', '🧇'
];

function getDifficultySetup(size) {
  return difficultyConfig[size] ?? difficultyConfig[4];
}

function shuffleArray(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array;
}

function createDeck(size) {
  const { pairCount } = getDifficultySetup(size);
  const uniqueIngredients = [...new Set(ingredients)];

  if (uniqueIngredients.length < pairCount) {
    throw new Error('No hay suficientes ingredientes únicos para esta dificultad.');
  }

  const selectedIngredients = uniqueIngredients.slice(0, pairCount);
  const pairedIngredients = [...selectedIngredients, ...selectedIngredients];
  return shuffleArray(pairedIngredients);
}

function clearTurnState() {
  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.boardLocked = false;
}

function closeVictoryModal() {
  victoryModal.classList.add('hidden');
}

function openVictoryModal() {
  modalPlayer.textContent = gameState.playerName;
  modalMoves.textContent = String(gameState.moves);
  victoryModal.classList.remove('hidden');
}

function hasPlayerWon() {
  const matchedCards = board.querySelectorAll('.card.matched').length;
  const totalCards = board.children.length;
  return totalCards > 0 && matchedCards === totalCards;
}

function showMistakeFeedback() {
  statusMessage.textContent = '¡Mamma Mia! Eso no combina.';
  statusMessage.classList.remove('status-success');
  statusMessage.classList.add('status-error');
  board.classList.add('board-error');
}

function showSuccessFeedback() {
  statusMessage.textContent = '¡Buonissimo! Pareja encontrada.';
  statusMessage.classList.remove('status-error');
  statusMessage.classList.add('status-success');
}

function clearFeedback() {
  statusMessage.textContent = '';
  statusMessage.classList.remove('status-success', 'status-error');
  board.classList.remove('board-error');
}

function updateMoves() {
  gameState.moves += 1;
  hudMoves.textContent = String(gameState.moves);
}

function updatePairsHud() {
  hudPairs.textContent = `${gameState.matchedPairs} / ${gameState.totalPairs}`;
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
  gameState.matchedPairs += 1;
  updatePairsHud();
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
    showSuccessFeedback();

    gameState.pendingUnflipTimeout = setTimeout(() => {
      clearFeedback();
      gameState.pendingUnflipTimeout = null;
    }, 700);

    if (hasPlayerWon()) {
      gameState.boardLocked = true;
      openVictoryModal();
      return;
    }

    clearTurnState();
    return;
  }

  showMistakeFeedback();
  gameState.pendingUnflipTimeout = setTimeout(() => {
    unflipCards();
    clearFeedback();
    clearTurnState();
    gameState.pendingUnflipTimeout = null;
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

  const cardInner = document.createElement('span');
  cardInner.className = 'card-inner';

  const cardFront = document.createElement('span');
  cardFront.className = 'card-front';
  cardFront.textContent = '🍽️';

  const cardBack = document.createElement('span');
  cardBack.className = 'card-back';
  const ingredientBadge = document.createElement('span');
  ingredientBadge.textContent = ingredient;
  cardBack.appendChild(ingredientBadge);

  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardButton.appendChild(cardInner);
  cardButton.addEventListener('click', onCardClick);

  return cardButton;
}

function renderBoard(size) {
  const { size: boardSize, pairCount } = getDifficultySetup(size);
  const deck = createDeck(boardSize);
  gameState.totalPairs = pairCount;
  gameState.matchedPairs = 0;
  updatePairsHud();

  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${boardSize}, minmax(0, 1fr))`;
  board.classList.remove('board-enter');
  void board.offsetWidth;
  board.classList.add('board-enter');

  deck.forEach((ingredient) => {
    const cardElement = createCardElement(ingredient);
    board.appendChild(cardElement);
  });
}

function startNewGame() {
  resetVisualState();
  closeVictoryModal();
  renderBoard(gameState.difficulty);
}

function resetVisualState() {
  if (gameState.pendingUnflipTimeout) {
    clearTimeout(gameState.pendingUnflipTimeout);
    gameState.pendingUnflipTimeout = null;
  }

  gameState.moves = 0;
  gameState.matchedPairs = 0;
  gameState.totalPairs = 0;
  clearTurnState();
  hudMoves.textContent = '0';
  updatePairsHud();
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

  if (!difficultyConfig[gameState.difficulty]) {
    statusMessage.textContent = 'Selecciona una dificultad válida para continuar.';
    difficultySelect.focus();
    return;
  }

  hudPlayer.textContent = gameState.playerName;
  showGameScreen();
  startNewGame();
});

resetButton.addEventListener('click', () => {
  closeVictoryModal();
  resetVisualState();
  showHomeScreen();
  configForm.reset();
  difficultySelect.value = '4';
  playerNameInput.focus();
});

modalPlayAgainButton.addEventListener('click', () => {
  startNewGame();
});

modalBackHomeButton.addEventListener('click', () => {
  closeVictoryModal();
  resetVisualState();
  showHomeScreen();
  configForm.reset();
  difficultySelect.value = '4';
  playerNameInput.focus();
});

startButton.setAttribute('aria-label', 'Iniciar partida de Mamma mia memory');
