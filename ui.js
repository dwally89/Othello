const UI = (function() {
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
                        cell.style.color = 'black';
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

        if (!Game.isGameOver() && Game.isComputerGame()) {
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
                const cellContainer = document.createElement('td');
                const cell = document.createElement('div');
                cellContainer.appendChild(cell);
                cell.id = 'cell_' + rowIndex + '_' + colIndex;
                cell.style.textAlign = 'center';
                cell.style.borderRadius = '50%';
                cell.style.height = '95%';
                cell.style.width = '95%';
                row.appendChild(cellContainer);
            }

            tbody.appendChild(row);
        }
        document.body.appendChild(board);
    }

    return {
        startHumanGame: function() {
            Game.reset(false);
            drawBoard();
        },
        startComputerGame: function() {
            Game.reset(true);
            drawBoard();
        },
        createBoard: function() {
            createBoard();
        },
    };
}());