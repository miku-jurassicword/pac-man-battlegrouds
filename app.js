document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const width = 28;
    let score = 0;
    let timerId;
    let direction = 0; // 0: parado, 1: direita, -1: esquerda, etc.
    let nextDirection = 0;

    const layout = [
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
        1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1,
        1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,
        1,1,1,1,1,1,0,1,1,1,1,1,4,1,1,4,1,1,1,1,1,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,1,1,4,4,4,4,4,4,4,4,4,4,1,1,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,1,1,4,1,1,1,2,2,1,1,1,4,1,1,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,1,1,4,1,2,2,2,2,2,2,1,4,1,1,0,1,1,1,1,1,1,
        4,4,4,4,4,4,0,4,4,4,1,2,2,2,2,2,2,1,4,4,4,0,4,4,4,4,4,4,
        1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
        1,3,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,3,1,
        1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,
        1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,
        1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
    ];

    const squares = [];
    function createBoard() {
        layout.forEach(value => {
            const square = document.createElement('div');
            grid.appendChild(square);
            squares.push(square);
            if (value === 1) square.classList.add('wall');
            if (value === 0) square.classList.add('pac-dot');
            if (value === 3) square.classList.add('power-pellet');
        });
    }
    createBoard();

    // --- PAC-MAN ---
    let pacmanCurrentIndex = 435;
    squares[pacmanCurrentIndex].classList.add('pac-man');

    function handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowLeft': nextDirection = -1; break;
            case 'ArrowUp': nextDirection = -width; break;
            case 'ArrowRight': nextDirection = 1; break;
            case 'ArrowDown': nextDirection = width; break;
        }
    }

    function movePacman() {
        // Tenta mudar para a nova direção se não houver parede
        if (!squares[pacmanCurrentIndex + nextDirection].classList.contains('wall')) {
            direction = nextDirection;
        }

        if (!squares[pacmanCurrentIndex + direction].classList.contains('wall')) {
            squares[pacmanCurrentIndex].classList.remove('pac-man');
            pacmanCurrentIndex += direction;
            squares[pacmanCurrentIndex].classList.add('pac-man');
        }

        eatDot();
        checkGameOver();
    }
    
    // Inicia o loop do Pac-man (velocidade 200ms)
    setInterval(movePacman, 200);

    function eatDot() {
        if (squares[pacmanCurrentIndex].classList.contains('pac-dot')) {
            score++;
            scoreDisplay.innerHTML = score;
            squares[pacmanCurrentIndex].classList.remove('pac-dot');
        }
    }

    // --- FANTASMAS ---
    class Ghost {
        constructor(className, startIndex, speed) {
            this.className = className;
            this.startIndex = startIndex;
            this.speed = speed;
            this.currentIndex = startIndex;
            this.timerId = NaN;
        }
    }

    const ghosts = [
        new Ghost('blinky', 290, 250),
        new Ghost('pinky', 322, 300)
    ];

    ghosts.forEach(ghost => {
        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
        moveGhost(ghost);
    });

    function moveGhost(ghost) {
        const directions = [-1, +1, width, -width];
        let ghostDir = directions[Math.floor(Math.random() * directions.length)];

        ghost.timerId = setInterval(() => {
            if (!squares[ghost.currentIndex + ghostDir].classList.contains('wall') && 
                !squares[ghost.currentIndex + ghostDir].classList.contains('ghost')) {
                
                squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost');
                ghost.currentIndex += ghostDir;
                squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
            } else {
                ghostDir = directions[Math.floor(Math.random() * directions.length)];
            }
            checkGameOver();
        }, ghost.speed);
    }

    function checkGameOver() {
        if (squares[pacmanCurrentIndex].classList.contains('ghost')) {
            ghosts.forEach(ghost => clearInterval(ghost.timerId));
            document.removeEventListener('keydown', handleKeyPress);
            alert('Game Over! O fantasma te pegou.');
            location.reload(); // Reinicia o jogo
        }
    }

    document.addEventListener('keydown', handleKeyPress);
});