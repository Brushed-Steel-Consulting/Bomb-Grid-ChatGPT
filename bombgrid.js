const BOMB_SYMBOL = "💣";
const FLAG_SYMBOL = "🚩";
const EMPTY_CELL_SYMBOL = "";

// Define game state variables
let boardSize = 9;
let numBombs = 10;
let gameOver = false;
let timer = 0;
let flaggedCells = 0;
let remainingBombs = numBombs;

// Generate the initial game board
const generateBoard = () => {
  const board = [];
  for (let i = 0; i < boardSize; i++) {
    board.push([]);
    for (let j = 0; j < boardSize; j++) {
      board[i].push({
        isBomb: false,
        isRevealed: false,
        isFlagged: false,
        neighboringBombs: 0,
      });
    }
  }

  // Place bombs randomly
  for (let i = 0; i < numBombs; i++) {
    let placedBomb = false;
    while (!placedBomb) {
      const row = Math.floor(Math.random() * boardSize);
      const col = Math.floor(Math.random() * boardSize);
      if (!board[row][col].isBomb) {
        board[row][col].isBomb = true;
        placedBomb = true;
      }
    }
  }

  // Calculate neighboring bombs for each cell
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j].isBomb) continue;

      let count = 0;
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          const neighborRow = i + rowOffset;
          const neighborCol = j + colOffset;
          if (
            neighborRow >= 0 &&
            neighborRow < boardSize &&
            neighborCol >= 0 &&
            neighborCol < boardSize &&
            board[neighborRow][neighborCol].isBomb
          ) {
            count++;
          }
        }
      }
      board[i][j].neighboringBombs = count;
    }
  }

  return board;
};

// Update the UI based on the game state
const updateUI = () => {
  const boardElement = document.getElementById("game-board");
  boardElement.innerHTML = "";

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = document.createElement("div");
      cell.classList.add("tile");

      if (gameOver) {
        cell.classList.add("revealed");
        if (board[i][j].isBomb) {
          cell.textContent = BOMB_SYMBOL;
        } else if (board[i][j].neighboringBombs > 0) {
          cell.textContent = board[i][j].neighboringBombs;
        } else {
          cell.textContent = "";
        }
      } else if (board[i][j].isFlagged) {
        cell.textContent = FLAG_SYMBOL;
      } else if (board[i][j].isRevealed) {
        if (board[i][j].isBomb) {
          cell.textContent = BOMB_SYMBOL;
        } else if (board[i][j].neighboringBombs > 0) {
          cell.textContent = board[i][j].neighboringBombs;
        } else {
          cell.textContent = EMPTY_CELL_SYMBOL;
        }
      } else {
        cell.textContent = "";
      }

      cell.addEventListener("click", () => handleClick(i, j));
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        handleRightClick(i, j);
      });

      boardElement.appendChild(cell);
    }
  }

  document.getElementById("timer").textContent = formatTime(timer);
  document.getElementById("flagged-mines").textContent = flaggedCells;
};

// Handle click events on cells
const handleClick = (row, col) => {
  if (gameOver) return;

  if (!board[row][col].isFlagged) {
    if (board[row][col].isBomb) {
      loseGame();
    } else {
      revealCell(row, col);
      checkWinCondition();
    }
  }
};

// Handle right-click events on cells
const handleRightClick = (row, col) => {
  if (gameOver) return;

  if (!board[row][col].isRevealed) {
    if (board[row][col].isFlagged) {
      flaggedCells--;
      remainingBombs++;
      board[row][col].isFlagged = false;
    } else {
      flaggedCells++;
      remainingBombs--;
      board[row][col].isFlagged = true;
    }
    updateUI();
  }
};

// Reveal a cell and its neighbors if they are empty
const revealCell = (row, col) => {
  if (board[row][col].isRevealed || board[row][col].isFlagged) return;

  board[row][col].isRevealed = true;

  if (board[row][col].neighboringBombs === 0) {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        const neighborRow = row + rowOffset;
        const neighborCol = col + colOffset;
        if (
          neighborRow >= 0 &&
          neighborRow < boardSize &&
          neighborCol >= 0 &&
          neighborCol < boardSize
        ) {
          revealCell(neighborRow, neighborCol);
        }
      }
    }
  }

  updateUI();
};

// Check if the player has won the game
const checkWinCondition = () => {
  let allCellsRevealed = true;
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (!board[i][j].isRevealed && !board[i][j].isBomb) {
        allCellsRevealed = false;
        break;
      }
    }
  }

  if (allCellsRevealed) {
    winGame();
  }
};

// Update timer every second
setInterval(() => {
  if (!gameOver) {
    timer++;
    updateUI();
  }
}, 1000);

// Reset the game
const restartGame = () => {
  gameOver = false;
  timer = 0;
  flaggedCells = 0;
  remainingBombs = numBombs;
  board = generateBoard();
  updateUI();
};

// Handle winning the game
const winGame = () => {
  gameOver = true;
  alert("Congratulations! You won the game.");
};

// Handle losing the game
const loseGame = () => {
  gameOver = true;
  alert("Game Over! You hit a bomb.");
  updateUI();
};

// Start the game
const board = generateBoard();
updateUI();
document.getElementById("restart-button").addEventListener("click", restartGame);