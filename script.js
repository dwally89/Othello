const Game = (function () {
    const numberOfRows = 8;
    const numberOfColumns = 8;
    const white = 'White';
    const black = 'Black';
    const unset = '_';
    const human = 'h';
    const computer = 'c';
    let board = [];
    let currentPlayer = human;
    let currentTurn = black;
    let isComputerGame = false;
    function changeNeighbours(
        startRow, startCol, targetColour,
        rowTransform, colTransform, dryRun) {
        let row = startRow;
        let col = startCol;
        let finalRow = -1;
        let finalCol = -1;
        let doChange = false;
        while (row >= 0 && row < numberOfRows &&
            col >= 0 && col < numberOfColumns) {
            if (board[row][col] == unset) {
                break;
            }

            if (board[row][col] != targetColour) {
                doChange = true;
            } else if (doChange) {
                finalRow = row;
                finalCol = col;
                break;
            } else {
                break;
            }


            row = rowTransform(row);
            col = colTransform(col);
        }

        if (finalRow != -1 && finalCol != -1) {
            row = startRow;
            col = startCol;

            while (!dryRun && (row != finalRow || col != finalCol)) {
                board[row][col] = targetColour;
                row = rowTransform(row);
                col = colTransform(col);
            }

            return true;
        }

        return false;
    }

    function changeAllNeighbours(rowIndex, colIndex, currentTurn, dryRun) {
        let didChange = false;
        didChange = changeNeighbours(rowIndex, colIndex - 1, currentTurn, row => row, col => col - 1, dryRun) || didChange;
        didChange = changeNeighbours(rowIndex, colIndex + 1, currentTurn, row => row, col => col + 1, dryRun) || didChange;
        didChange = changeNeighbours(rowIndex + 1, colIndex, currentTurn, row => row + 1, col => col, dryRun) || didChange;
        didChange = changeNeighbours(rowIndex - 1, colIndex, currentTurn, row => row - 1, col => col, dryRun) || didChange;
        didChange = changeNeighbours(rowIndex + 1, colIndex + 1, currentTurn, row => row + 1, col => col + 1, dryRun) || didChange;
        didChange = changeNeighbours(rowIndex + 1, colIndex - 1, currentTurn, row => row + 1, col => col - 1, dryRun) || didChange;
        didChange = changeNeighbours(rowIndex - 1, colIndex + 1, currentTurn, row => row - 1, col => col + 1, dryRun) || didChange;
        didChange = changeNeighbours(rowIndex - 1, colIndex - 1, currentTurn, row => row - 1, col => col - 1, dryRun) || didChange;
        return didChange;
    }

    function canMove(targetColour) {
        for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
            for (let colIndex = 0; colIndex < numberOfColumns; colIndex++) {
                if (board[rowIndex][colIndex] == unset &&
                    changeAllNeighbours(rowIndex, colIndex, targetColour, true)) {
                    return true;
                }
            }
        }

        return false;
    }

    function countColour(colour) {
        let count = 0;
        for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
            for (let colIndex = 0; colIndex < numberOfColumns; colIndex++) {
                if (board[rowIndex][colIndex] == colour) {
                    count++;
                }
            }
        }

        return count;
    }

    function getAllPossibleMoves() {
        const moves = [];
        for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
            for (let colIndex = 0; colIndex < numberOfColumns; colIndex++) {
                if (board[rowIndex][colIndex] == unset &&
                    changeAllNeighbours(rowIndex, colIndex, currentTurn, true)) {
                    moves.push([rowIndex, colIndex]);
                }
            }
        }

        return moves;
    }

    function getBestMove() {
        const moves = getAllPossibleMoves();

        // Try corner move
        for (let i = 0; i < moves.length; i++) {
            const rowIndex = moves[i][0];
            const colIndex = moves[i][1];
            if ((rowIndex == 0 || rowIndex == (numberOfRows-1)) &&
                (colIndex == 0 || colIndex == (numberOfColumns-1))) {
                return moves[i];
            }
        }

        // Try the edge pairs
        for (let i = 0; i < moves.length; i++) {
            const rowIndex = moves[i][0];
            const colIndex = moves[i][1];
            if (((rowIndex == 0 || rowIndex == (numberOfRows-1)) &&
                (colIndex == 2 || colIndex == 5)) ||
                ((colIndex == 0 || colIndex == (numberOfColumns-1)) &&
                    (rowIndex == 2 || rowIndex == 5))) {
                return moves[i];
            }
        }

        // Try outside of danger zone
        for (let i = 0; i < moves.length; i++) {
            const rowIndex = moves[i][0];
            const colIndex = moves[i][1];
            if ((rowIndex > 1 && rowIndex < 6) ||
                (colIndex > 1 && colIndex < 6)) {
                return moves[i];
            }
        }

        // Try danger zone if corner piece is already taken
        for (let i = 0; i < moves.length; i++) {
            const rowIndex = moves[i][0];
            const colIndex = moves[i][1];
            if (rowIndex < 2) {
                if ((colIndex < 2 && board[0][0] != unset) ||
                    (colIndex > 5 && board[0][numberOfColumns-1] != unset)) {
                    return moves[i];
                }
            } else if (rowIndex > 5) {
                if ((colIndex < 2 && board[numberOfRows-1][0] != unset) ||
                    (colIndex > 5 && board[numberOfRows-1][numberOfColumns-1] != unset)) {
                    return moves[i];
                }
            }
        }

        // Use any move
        return moves[0];
    }

    function getFirstPossibleMove() {
        return getAllPossibleMoves()[0];
    }

    function getNextComputerMove() {
        return getBestMove();
    }

    function move(rowIndex, colIndex) {
        if (board[rowIndex][colIndex] != unset) {
            throw new Error('Cell is already in use');
        }

        if (changeAllNeighbours(rowIndex, colIndex, currentTurn, false)) {
            board[rowIndex][colIndex] = currentTurn;
            const nextTurn = currentTurn == black ? white : black;
            const nextPlayer = currentPlayer == human && isComputerGame ? computer : human;
            if (canMove(nextTurn)) {
                currentTurn = nextTurn;
                currentPlayer = nextPlayer;
            } else {
                alert(nextTurn + ' has no possible moves, back to ' + currentTurn);
            }
        }
    }

    return {
        reset: function (isComputer) {
            currentTurn = black;
            board = [];
            for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
                const row = [];
                for (let colIndex = 0; colIndex < numberOfColumns; colIndex++) {
                    row.push(unset);
                }
                board.push(row);
            };

            board[(numberOfRows / 2) - 1][numberOfColumns / 2] = black;
            board[numberOfRows / 2][numberOfColumns / 2] = white;
            board[(numberOfRows / 2) - 1][(numberOfColumns / 2) - 1] = white;
            board[numberOfRows / 2][(numberOfColumns / 2) - 1] = black;

            isComputerGame = isComputer;
            currentPlayer = human;
        },
        getCurrentTurn: function () {
            return currentTurn;
        },
        getCurrentPlayer: function() {
            return currentPlayer;
        },
        white: function () {
            return white;
        },
        black: function () {
            return black;
        },
        unset: function () {
            return unset;
        },
        computer: function() {
            return computer;
        },
        human: function() {
            return human;
        },
        getNumberOfRows: function () {
            return numberOfRows;
        },
        getNumberOfColumns: function () {
            return numberOfColumns;
        },
        isCellUnset: function (rowIndex, colIndex) {
            return board[rowIndex][colIndex] == unset;
        },
        move: function (rowIndex, colIndex) {
            move(rowIndex, colIndex);
        },
        getColour: function (rowIndex, colIndex) {
            return board[rowIndex][colIndex];
        },
        getNumberOfBlacks: function () {
            return countColour(black);
        },
        getNumberOfWhites: function () {
            return countColour(white);
        },
        isComputerGame: function () {
            return isComputerGame;
        },
        doComputerMove: function () {
            const nextMove = getNextComputerMove();
            move(nextMove[0], nextMove[1]);
        },
    };
}());

function drawBoard() {
    document.getElementById('current_move').innerHTML = 'Current move: ' + Game.getCurrentTurn();
    document.getElementById('num_blacks').innerHTML = 'Number of blacks: ' + Game.getNumberOfBlacks();
    document.getElementById('num_whites').innerHTML = 'Number of white: ' + Game.getNumberOfWhites();

    for (let rowIndex = 0; rowIndex < Game.getNumberOfRows(); rowIndex++) {
        for (let colIndex = 0; colIndex < Game.getNumberOfColumns(); colIndex++) {
            cell = document.getElementById('cell_' + rowIndex + '_' + colIndex);
            switch (Game.getColour(rowIndex, colIndex)) {
                case Game.white():
                    cell.style.backgroundColor = 'white';
                    cell.style.color = 'white';
                    cell.innerHTML = '_';
                    cell.onclick = null;
                    break;
                case Game.black():
                    cell.style.backgroundColor = 'black';
                    cell.style.color = 'black';
                    cell.innerHTML = '_';
                    cell.onclick = null;
                    break;
                case Game.unset():
                    cell.style.backgroundColor = '';
                    cell.innerHTML = '_';
                    cell.onclick = () => move(rowIndex, colIndex);
                    break;
            }
        }
    }
}

function doComputerMove() {
    if (!Game.isComputerGame()) {
        throw new Error(`Can't do computer move if game isn't computer game`);
    }

    if (Game.getCurrentPlayer() == Game.computer()) {
        setTimeout(() => {
            Game.doComputerMove();
            drawBoard();
            doComputerMove();
        }, 750);
    }
}

function move(rowIndex, colIndex) {
    if (!Game.isCellUnset(rowIndex, colIndex)) {
        throw new Error('Cell is already in use');
    }

    Game.move(rowIndex, colIndex);
    drawBoard();

    if (Game.isComputerGame()) {
        doComputerMove();
    }
}

function createBoard() {
    const currentMove = document.createElement('div');
    currentMove.id = 'current_move';
    document.body.appendChild(currentMove);

    const numBlacks = document.createElement('div');
    numBlacks.id = 'num_blacks';
    document.body.appendChild(numBlacks);

    const numWhites = document.createElement('div');
    numWhites.id = 'num_whites';
    document.body.appendChild(numWhites);

    const board = document.createElement('table');
    board.style.backgroundColor = 'green';
    board.style.width = '90vw';
    board.style.height = '90vw';
    const tbody = board.createTBody();
    for (let rowIndex = 0; rowIndex < Game.getNumberOfRows(); rowIndex++) {
        const row = document.createElement('tr');
        row.id = 'row_' + rowIndex;
        for (let colIndex = 0; colIndex < Game.getNumberOfColumns(); colIndex++) {
            const cell = document.createElement('td');
            cell.id = 'cell_' + rowIndex + '_' + colIndex;
            cell.style.textAlign = 'center';
            cell.style.borderRadius = '50%';
            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }
    document.body.appendChild(board);
}

function startHumanGame() {
    Game.reset(false);
    drawBoard();
}

function startComputerGame() {
    Game.reset(true);
    drawBoard();
}

document.getElementById('btn_start_human').onclick = startHumanGame;
document.getElementById('btn_start_computer').onclick = startComputerGame;
createBoard();