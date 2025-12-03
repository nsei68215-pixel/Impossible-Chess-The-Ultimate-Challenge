// Initialize chess.js
var game = new Chess();

// Initialize chessboard.js
var board = Chessboard('board', {
    draggable: true,
    position: 'start',
    onDrop: handleMove
});

// Initialize Stockfish (via web worker)
var stockfish = new Worker('https://cdn.jsdelivr.net/gh/niklasf/stockfish.js/stockfish.js');

stockfish.onmessage = function(event) {
    if(event.data.startsWith('bestmove')) {
        var move = event.data.split(' ')[1];
        game.move({from: move.substring(0,2), to: move.substring(2,4)});
        board.position(game.fen());
        checkGameOver();
    }
};

function handleMove(source, target) {
    var move = game.move({from: source, to: target, promotion: 'q'});
    if(move === null) return 'snapback';

    // Bot move
    stockfish.postMessage('position fen ' + game.fen());
    stockfish.postMessage('go depth 15'); // high depth = almost impossible
}

function checkGameOver() {
    if(game.game_over()) {
        document.getElementById('status').innerText = 'Game Over! Try Again!';
    } else {
        document.getElementById('status').innerText = 'Your turn...';
    }
}

// New game button
document.getElementById('newGameBtn').addEventListener('click', function() {
    game.reset();
    board.start();
    document.getElementById('status').innerText = 'New Game Started!';
});
