let grid, mineCount, timer;
const gridElement = document.getElementById('grid');
const timeElement = document.getElementById('time');
const minesCountElement = document.getElementById('mines-count');
const difficultySelector = document.getElementById('difficulty');

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewGame();
});

function setupEventListeners() {
    gridElement.addEventListener('click', handleCellClick);
    gridElement.addEventListener('contextmenu', handleRightClick);
}

function startNewGame() {
    clearInterval(timer);
    resetTimer();
    const difficulty = difficultySelector.value;
    const { rows, cols, mines } = getDifficultySettings(difficulty);
    mineCount = mines;
    minesCountElement.textContent = mineCount;
    grid = createGrid(rows, cols);
    placeMines(grid, mineCount);
    renderGrid(grid);
}

function getDifficultySettings(difficulty) {
    const settings = {
        easy: { rows: 9, cols: 9, mines: 10 },
        medium: { rows: 16, cols: 16, mines: 40 },
        hard: { rows: 24, cols: 24, mines: 99 }
    };
    return settings[difficulty];
}

function createGrid(rows, cols) {
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`; // Set grid columns based on cols
    gridElement.style.gridTemplateRows = `repeat(${rows}, 30px)`; // Set grid rows based on rows

    const grid = [];
    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('grid-cell');
            cellElement.dataset.x = x;
            cellElement.dataset.y = y;
            gridElement.appendChild(cellElement);
            row.push({ mine: false, revealed: false, flagged: false });
        }
        grid.push(row);
    }
    return grid;
}

function placeMines(grid, mineCount) {
    let placed = 0;
    while (placed < mineCount) {
        const x = Math.floor(Math.random() * grid[0].length);
        const y = Math.floor(Math.random() * grid.length);
        if (!grid[y][x].mine) {
            grid[y][x].mine = true;
            placed++;
        }
    }
}

function renderGrid(grid) {
    gridElement.innerHTML = '';
    grid.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('grid-cell');
            cellElement.dataset.x = x;
            cellElement.dataset.y = y;
            gridElement.appendChild(cellElement);
        });
    });
}

function handleCellClick(event) {
    if (!event.target.classList.contains('grid-cell')) return;
    const x = parseInt(event.target.dataset.x);
    const y = parseInt(event.target.dataset.y);
    revealCell(grid, x, y);
    checkWinCondition();
}

function handleRightClick(event) {
    event.preventDefault();
    if (!event.target.classList.contains('grid-cell')) return;
    const x = parseInt(event.target.dataset.x);
    const y = parseInt(event.target.dataset.y);
    toggleFlag(grid, x, y);
}

function revealCell(grid, x, y) {
    const cell = grid[y][x];
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    updateCellDisplay(x, y);

    if (cell.mine) {
        gameOver(false);
        return;
    }

    // Count adjacent mines
    const adjacentMines = countAdjacentMines(grid, x, y);
    cell.adjacentMines = adjacentMines;

    if (adjacentMines === 0) {
        // If there are no adjacent mines, reveal all adjacent cells
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length) {
                    revealCell(grid, nx, ny);
                }
            }
        }
    } else {
        // Update cell display with the number of adjacent mines
        updateCellDisplayWithNumber(x, y, adjacentMines);
    }
}

function countAdjacentMines(grid, x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length && grid[ny][nx].mine) {
                count++;
            }
        }
    }
    return count;
}

function updateCellDisplayWithNumber(x, y, number) {
    const cellElement = document.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
    if (number > 0) {
        cellElement.textContent = number;
        cellElement.classList.add(`num-${number}`);
    }
}

function toggleFlag(grid, x, y) {
    const cell = grid[y][x];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    updateCellDisplay(x, y);
    updateMineCountDisplay();
}

function updateCellDisplay(x, y) {
    const cellElement = document.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
    const cell = grid[y][x];

    cellElement.classList.toggle('flagged', cell.flagged);
    cellElement.classList.toggle('revealed', cell.revealed);

    if (cell.revealed) {
        if (cell.mine) {
            cellElement.classList.add('mine');
        } else if (cell.adjacentMines > 0) {
            cellElement.textContent = cell.adjacentMines;
        }
    }
}

function updateMineCountDisplay() {
    const flaggedCount = grid.flat().filter(cell => cell.flagged).length;
    minesCountElement.textContent = mineCount - flaggedCount;
}

function checkWinCondition() {
    const isWon = grid.every(row => row.every(cell => cell.mine === cell.flagged || (!cell.mine && cell.revealed)));
    if (isWon) gameOver(true);
}

function gameOver(won) {
    clearInterval(timer);
    if (won) {
        alert('Congratulations, you won!');
    } else {
        alert('Game Over. You hit a mine!');
        revealAllMines();
    }
}

function revealAllMines() {
    grid.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell.mine) {
                const cellElement = document.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
                cellElement.classList.add('mine');
            }
        });
    });
}

function resetTimer() {
    timeElement.textContent = '0';
    timer = setInterval(() => {
        timeElement.textContent = parseInt(timeElement.textContent) + 1;
    }, 1000);
}
