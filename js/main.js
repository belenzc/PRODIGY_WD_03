const gameOptionsContainer = document.querySelector('.gameOptions-container');
const boardContainer = document.querySelector('.board-container');

let gameResult = document.querySelector('.result');
let cells = Array.from(document.querySelectorAll('.cell'));

const playerOne = 'X';
const playerTwo = 'O'; // Other player || AI
let currentPlayer = playerOne;
let selectGameMode;
let origBoard;
let gameWon;

const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
    [0, 4, 8], [2, 4, 6]             // diagonal
];

const startGame = (gameMode) => {
    origBoard = Array.from(Array(9).keys());

    gameOptionsContainer.classList.add("hide");
    boardContainer.classList.remove("hide");
    selectGameMode = gameMode;

    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.style.removeProperty('color');
        cell.style.cursor = "pointer";

        if (selectGameMode === "pvp") {
            cell.addEventListener('click', turnClickedPvP);
        } else if (selectGameMode === "pvc") {
            cell.addEventListener('click', turnClickedPvC);
        }
    });
};

const emptySquares = () => {
    // return origBoard.filter(s => s === null);
    return origBoard.filter(s => typeof s == 'number');
};

//Player vs Player
function turnClickedPvP(e) {
    const squareClicked = e.target.id;

    if (typeof origBoard[squareClicked] == 'number') {
        turn(squareClicked, currentPlayer);

        if (!checkTie() && gameWon === false) {
            // If statement short version
            currentPlayer = currentPlayer == playerOne ? playerTwo : playerOne;
        }
    }
}

// Player vs Computer
function turnClickedPvC(e) {
    const squareClicked = e.target.id;

    if (typeof origBoard[squareClicked] == 'number') {
        turn(squareClicked, playerOne);

        if (!checkTie() && gameWon === false) {
            turn(bestSpot(), playerTwo);
        }
    }
}

// Human turn (for PvP or PvC)
function turn(index, player) {
    origBoard[index] = player;
    document.getElementById(index).innerText = player;
    gameWon = checkWin(origBoard, player);
    if (gameWon) { gameOver(gameWon) }
}

// AI turn (for PvC)
function bestSpot() {
    return minimax(origBoard, playerTwo).index;
}

// Unbeatable AI
function minimax(newBoard, player) {
    let availSpots = emptySquares();

    if (checkWin(newBoard, playerOne)) {
        return { score: -10 };
    } else if (checkWin(newBoard, playerTwo)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player == playerTwo) {
            let result = minimax(newBoard, playerOne);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, playerTwo);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    }

    let bestMove;
    if (player === playerTwo) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

// -- Game status --
function checkWin(board, player) {
    for (const condition of winCombos) {
        let [a, b, c] = condition;
        if (board[a] == player && (board[a] == board[b] && board[a] == board[c])) {
            let winnerPlay = { index: [a, b, c], player: player };
            return winnerPlay;
        }
    }

    return false;
}

function gameOver(gameWon) {
    console.log(gameWon);
    gameResult.innerHTML = `${gameWon.player} has won!`;

    for (let index of gameWon.index) {
        let elem = document.getElementById(index);
        elem.style.color = gameWon.player == playerOne ? "#2a8c4a" : "#e4717a";
    }

    removeClickEvent();
}

function checkTie() {
    if (emptySquares().length == 0) {
        removeClickEvent();
        gameResult.innerHTML = "Tie Game!";
        cells.forEach(cell => { cell.style.color = "#bbbbbb" });
        return true;
    }
    return false;
}

// -- Restarts --
// Restart game
function restart() {
    gameResult.innerHTML = 'Tic Tac Toe';
    currentPlayer = playerOne;
    startGame(selectGameMode);
}

// Goes back to change game mode
function changeSettings() {
    gameOptionsContainer.classList.remove("hide");
    boardContainer.classList.add("hide");

    removeClickEvent();

    gameResult.innerHTML = 'Tic Tac Toe';
    currentPlayer = playerOne;
}

function removeClickEvent() {
    cells.forEach(cell => {
        cell.style.cursor = "default";

        if (selectGameMode === "pvp") {
            cell.removeEventListener('click', turnClickedPvP);
        } else if (selectGameMode === "pvc") {
            cell.removeEventListener('click', turnClickedPvC);
        }
    });
}