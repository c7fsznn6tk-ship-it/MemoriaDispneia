const frontCardImage = "assets/00.png";

const allPairs = [
  {
    pairId: "1",
    cards: [
      { pairId: "1", side: "A", image: "assets/1A.png" },
      { pairId: "1", side: "B", image: "assets/1B.png" },
    ],
  },
  {
    pairId: "2",
    cards: [
      { pairId: "2", side: "A", image: "assets/2A.png" },
      { pairId: "2", side: "B", image: "assets/2B.png" },
    ],
  },
  {
    pairId: "3",
    cards: [
      { pairId: "3", side: "A", image: "assets/3A.png" },
      { pairId: "3", side: "B", image: "assets/3B.png" },
    ],
  },
  {
    pairId: "4",
    cards: [
      { pairId: "4", side: "A", image: "assets/4A.png" },
      { pairId: "4", side: "B", image: "assets/4B.png" },
    ],
  },
  {
    pairId: "5",
    cards: [
      { pairId: "5", side: "A", image: "assets/5A.png" },
      { pairId: "5", side: "B", image: "assets/5B.png" },
    ],
  },
  {
    pairId: "6",
    cards: [
      { pairId: "6", side: "A", image: "assets/6A.png" },
      { pairId: "6", side: "B", image: "assets/6B.png" },
    ],
  },
  {
    pairId: "7",
    cards: [
      { pairId: "7", side: "A", image: "assets/7A.png" },
      { pairId: "7", side: "B", image: "assets/7B.png" },
    ],
  },
  {
    pairId: "8",
    cards: [
      { pairId: "8", side: "A", image: "assets/8A.png" },
      { pairId: "8", side: "B", image: "assets/8B.png" },
    ],
  },
  {
    pairId: "9",
    cards: [
      { pairId: "9", side: "A", image: "assets/9A.png" },
      { pairId: "9", side: "B", image: "assets/9B.png" },
    ],
  },
  {
    pairId: "10",
    cards: [
      { pairId: "10", side: "A", image: "assets/10A.png" },
      { pairId: "10", side: "B", image: "assets/10B.png" },
    ],
  },
  {
    pairId: "11",
    cards: [
      { pairId: "11", side: "A", image: "assets/11A.png" },
      { pairId: "11", side: "B", image: "assets/11B.png" },
    ],
  },
  {
    pairId: "12",
    cards: [
      { pairId: "12", side: "A", image: "assets/12A.png" },
      { pairId: "12", side: "B", image: "assets/12B.png" },
    ],
  },
];

const boardElement = document.getElementById("game-board");
const roundElement = document.getElementById("round");
const attemptsElement = document.getElementById("attempts");
const matchesElement = document.getElementById("matches");
const gameCompleteElement = document.getElementById("game-complete");
const finalStatsElement = document.getElementById("final-stats");
const learnButton = document.getElementById("learn-button");
const restartButton = document.getElementById("restart-button");
const restartButtonFinish = document.getElementById("restart-button-finish");
const learningModalElement = document.getElementById("learning-modal");
const learningSlideImageElement = document.getElementById("learning-slide-image");
const prevSlideButton = document.getElementById("prev-slide-button");
const nextSlideButton = document.getElementById("next-slide-button");
const closeLearningButton = document.getElementById("close-learning-button");

const learningModules = {
  1: { folder: "1A", totalSlides: 21 },
  2: { folder: "2A", totalSlides: 19 },
  3: { folder: "3A", totalSlides: 26 },
  4: { folder: "4A", totalSlides: 31 },
};

let firstCard = null;
let secondCard = null;
let attempts = 0;
let matches = 0;
let boardLocked = false;
let waitingForNextPick = false;
let currentRound = 0;
let roundPairs = [];
let isLearningMode = true;
let currentSlideIndex = 0;
let pendingRoundAdvance = false;
let activeLearningSlides = [];

function shuffle(array) {
  const shuffled = [...array];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function updateStatus() {
  roundElement.textContent = `Rodada: ${currentRound + 1} / ${roundPairs.length}`;
  attemptsElement.textContent = `Tentativas: ${attempts}`;
  matchesElement.textContent = `Pares: ${matches} / 6`;
}

function showGameComplete() {
  finalStatsElement.textContent = `Total de tentativas: ${attempts}`;
  gameCompleteElement.hidden = false;
}

function isGameInProgress() {
  return roundPairs.length > 0 && gameCompleteElement.hidden;
}

function confirmRestartGame() {
  if (!isGameInProgress()) {
    return true;
  }

  return window.confirm("Reiniciar o jogo atual? O progresso desta partida sera perdido.");
}

function updateLearningButton() {
  learnButton.classList.toggle("is-active", isLearningMode);
  learnButton.setAttribute("aria-pressed", String(isLearningMode));
}

function updateLearningSlide() {
  learningSlideImageElement.src = activeLearningSlides[currentSlideIndex];
  prevSlideButton.disabled = currentSlideIndex === 0;
  nextSlideButton.disabled = currentSlideIndex === activeLearningSlides.length - 1;
}

function buildLearningSlides(pairId) {
  const learningModule = learningModules[pairId];

  if (!learningModule) {
    return [];
  }

  return Array.from(
    { length: learningModule.totalSlides },
    (_, index) => `assets/${learningModule.folder}/${index + 1}.png`,
  );
}

function closeLearningModal() {
  learningModalElement.hidden = true;
  learningSlideImageElement.src = "";

  if (pendingRoundAdvance) {
    pendingRoundAdvance = false;
    advanceRound();
    return;
  }

  boardLocked = false;
}

function openLearningModal(pairId) {
  activeLearningSlides = buildLearningSlides(pairId);
  currentSlideIndex = 0;
  updateLearningSlide();
  learningModalElement.hidden = false;
  boardLocked = true;
}

function showPreviousSlide() {
  if (currentSlideIndex === 0) {
    return;
  }

  currentSlideIndex -= 1;
  updateLearningSlide();
}

function showNextSlide() {
  if (currentSlideIndex === activeLearningSlides.length - 1) {
    return;
  }

  currentSlideIndex += 1;
  updateLearningSlide();
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  boardLocked = false;
  waitingForNextPick = false;
}

function shouldShowExplanation(pairId) {
  return isLearningMode && Boolean(learningModules[pairId]?.totalSlides);
}

function hideMatchedCards(pairId) {
  boardLocked = true;

  window.setTimeout(() => {
    firstCard.classList.add("is-hidden");
    secondCard.classList.add("is-hidden");
    firstCard.disabled = true;
    secondCard.disabled = true;
    matches += 1;
    updateStatus();
    const completedRound = matches === 6;
    const needsExplanation = shouldShowExplanation(pairId);

    resetTurn();

    if (needsExplanation) {
      pendingRoundAdvance = completedRound;
      openLearningModal(pairId);
      return;
    }

    if (completedRound) {
      advanceRound();
    }
  }, 500);
}

function advanceRound() {
  boardLocked = true;

  if (currentRound === roundPairs.length - 1) {
    showGameComplete();
    return;
  }

  window.setTimeout(() => {
    currentRound += 1;
    matches = 0;
    resetTurn();
    updateStatus();
    renderBoard();
  }, 900);
}

function prepareNextPick(nextCard) {
  if (firstCard) {
    firstCard.classList.remove("is-flipped");
  }

  if (secondCard) {
    secondCard.classList.remove("is-flipped");
  }

  firstCard = nextCard;
  secondCard = null;
  waitingForNextPick = false;
  nextCard.classList.add("is-flipped");
}

function evaluateTurn() {
  attempts += 1;
  updateStatus();

  const firstPairId = firstCard.dataset.pairId;
  const secondPairId = secondCard.dataset.pairId;
  const firstSide = firstCard.dataset.side;
  const secondSide = secondCard.dataset.side;
  const isMatch = firstPairId === secondPairId && firstSide !== secondSide;

  if (isMatch) {
    hideMatchedCards(firstPairId);
    return;
  }

  waitingForNextPick = true;
}

function handleCardClick(event) {
  const selectedCard = event.currentTarget;

  if (
    boardLocked ||
    selectedCard === firstCard ||
    selectedCard.classList.contains("is-flipped") ||
    selectedCard.classList.contains("is-hidden")
  ) {
    return;
  }

  if (waitingForNextPick) {
    prepareNextPick(selectedCard);
    return;
  }

  selectedCard.classList.add("is-flipped");

  if (!firstCard) {
    firstCard = selectedCard;
    return;
  }

  secondCard = selectedCard;
  evaluateTurn();
}

function createCard({ id, code, frontImage, pairId, side, backImage }) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";
  card.dataset.pairId = pairId;
  card.dataset.side = side;
  card.setAttribute("aria-label", `Carta ${code}`);

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">
        <img src="${frontImage}" alt="">
        <span class="card-number" aria-hidden="true">${code}</span>
      </div>
      <div class="card-face card-back">
        <img src="${backImage}" alt="Combinacao ${pairId}${side}">
      </div>
    </div>
  `;

  card.id = id;
  card.addEventListener("click", handleCardClick);
  return card;
}

function renderBoard() {
  const shuffledPairs = shuffle(roundPairs[currentRound]);
  const deck = shuffledPairs.map((pairCard, index) => {
    const cardNumber = currentRound * 12 + index + 1;

    return {
      id: `${cardNumber}-${pairCard.pairId}${pairCard.side}`,
      code: cardNumber,
      frontImage: frontCardImage,
      pairId: pairCard.pairId,
      side: pairCard.side,
      backImage: pairCard.image,
    };
  });

  boardElement.replaceChildren(...deck.map(createCard));
}

function buildRounds() {
  const shuffledPairGroups = shuffle(allPairs).map((pairGroup) => pairGroup.cards);
  roundPairs = [
    shuffledPairGroups.slice(0, 6).flat(),
    shuffledPairGroups.slice(6, 12).flat(),
  ];
}

function startGame() {
  attempts = 0;
  matches = 0;
  currentRound = 0;
  boardLocked = false;
  firstCard = null;
  secondCard = null;
  waitingForNextPick = false;
  pendingRoundAdvance = false;
  activeLearningSlides = [];
  gameCompleteElement.hidden = true;
  learningModalElement.hidden = true;
  learningSlideImageElement.src = "";
  buildRounds();
  updateStatus();
  updateLearningButton();
  renderBoard();
}

learnButton.addEventListener("click", () => {
  isLearningMode = !isLearningMode;
  updateLearningButton();
});

prevSlideButton.addEventListener("click", showPreviousSlide);

nextSlideButton.addEventListener("click", showNextSlide);

closeLearningButton.addEventListener("click", closeLearningModal);

document.addEventListener("keydown", (event) => {
  if (learningModalElement.hidden) {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showPreviousSlide();
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    showNextSlide();
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeLearningModal();
  }
});

restartButton.addEventListener("click", () => {
  if (confirmRestartGame()) {
    startGame();
  }
});

restartButtonFinish.addEventListener("click", startGame);

window.addEventListener("beforeunload", (event) => {
  if (!isGameInProgress()) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
});

startGame();
