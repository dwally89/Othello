const Game = (function() {
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
            if ((rowIndex == 0 || rowIndex == (numberOfRows - 1)) &&
                (colIndex == 0 || colIndex == (numberOfColumns - 1))) {
                return moves[i];
            }
        }

        // Try the edge pairs
        for (let i = 0; i < moves.length; i++) {
            const rowIndex = moves[i][0];
            const colIndex = moves[i][1];
            if (((rowIndex == 0 || rowIndex == (numberOfRows - 1)) &&
                    (colIndex == 2 || colIndex == (numberOfColumns - 3))) ||
                ((colIndex == 0 || colIndex == (numberOfColumns - 1)) &&
                    (rowIndex == 2 || rowIndex == (numberOfRows - 3)))) {
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
                    (colIndex > (numberOfColumns - 3) && board[0][numberOfColumns - 1] != unset)) {
                    return moves[i];
                }
            } else if (rowIndex > (numberOfRows - 3)) {
                if ((colIndex < 2 && board[numberOfRows - 1][0] != unset) ||
                    (colIndex > (numberOfColumns - 3) && board[numberOfRows - 1][numberOfColumns - 1] != unset)) {
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

    function isGameOver() {
        return !canMove(white) && !canMove(black);
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
            } else if (canMove(currentTurn)) {
                alert(nextTurn + ' has no possible moves, back to ' + currentTurn);
            } else {
                alert('Game over!');
            }
        }
    }

    return {
        reset: function(isComputer) {
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
        getCurrentTurn: function() {
            return currentTurn;
        },
        getCurrentPlayer: function() {
            return currentPlayer;
        },
        white: function() {
            return white;
        },
        black: function() {
            return black;
        },
        unset: function() {
            return unset;
        },
        computer: function() {
            return computer;
        },
        human: function() {
            return human;
        },
        getNumberOfRows: function() {
            return numberOfRows;
        },
        getNumberOfColumns: function() {
            return numberOfColumns;
        },
        isCellUnset: function(rowIndex, colIndex) {
            return board[rowIndex][colIndex] == unset;
        },
        move: function(rowIndex, colIndex) {
            move(rowIndex, colIndex);
        },
        getColour: function(rowIndex, colIndex) {
            return board[rowIndex][colIndex];
        },
        getNumberOfBlacks: function() {
            return countColour(black);
        },
        getNumberOfWhites: function() {
            return countColour(white);
        },
        isComputerGame: function() {
            return isComputerGame;
        },
        doComputerMove: function() {
            const nextMove = getNextComputerMove();
            move(nextMove[0], nextMove[1]);
        },
        isGameOver: function() {
            return isGameOver();
        }
    };
}());