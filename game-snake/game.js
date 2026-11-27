// Z-Snake Game - HTML5 Snake Game
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [];
        this.food = {};
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.gameLoop = null;
        this.gameSpeed = 150;
        this.isPlaying = false;
        
        this.init();
    }

    init() {
        // Event listeners for keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Button handlers
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.resetGame());
        
        // Mobile controls
        document.querySelectorAll('.d-pad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const dir = e.currentTarget.dataset.dir;
                this.changeDirection(dir);
            });
            
            // Touch events for better mobile support
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const dir = e.currentTarget.dataset.dir;
                this.changeDirection(dir);
            });
        });

        // Update high score display
        document.getElementById('high-score').textContent = this.highScore;
    }

    handleKeyPress(e) {
        const keyMap = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right'
        };

        const direction = keyMap[e.key] || keyMap[e.code];
        if (direction) {
            e.preventDefault();
            this.changeDirection(direction);
        }
    }

    changeDirection(newDir) {
        const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
        const currentDir = this.direction === 'up' ? 'ArrowUp' : 
                          this.direction === 'down' ? 'ArrowDown' :
                          this.direction === 'left' ? 'ArrowLeft' : 'ArrowRight';

        if (opposites[newDir] !== this.nextDirection) {
            this.nextDirection = newDir;
            this.direction = newDir;
        }
    }

    startGame() {
        if (this.isPlaying) return;
        
        // Reset game state
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameSpeed = 150;
        this.isPlaying = true;
        
        this.updateScore();
        document.getElementById('start-btn').disabled = true;
        document.getElementById('restart-btn').disabled = false;
        document.getElementById('game-over-screen').classList.add('hidden');

        this.placeFood();
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    resetGame() {
        clearInterval(this.gameLoop);
        this.startGame();
    }

    updateScore() {
        document.getElementById('current-score').textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            document.getElementById('high-score').textContent = this.highScore;
        }
    }

    placeFood() {
        const positions = [];
        for (let x = 0; x < this.tileCount; x++) {
            for (let y = 0; y < this.tileCount; y++) {
                positions.push({x, y});
            }
        }

        // Remove snake positions
        this.snake.forEach(seg => {
            const idx = positions.findIndex(p => p.x === seg.x && p.y === seg.y);
            if (idx !== -1) positions.splice(idx, 1);
        });

        if (positions.length > 0) {
            const randomPos = positions[Math.floor(Math.random() * positions.length)];
            this.food = {x: randomPos.x, y: randomPos.y};
        }
    }

    update() {
        // Update direction
        this.direction = this.nextDirection;

        // Calculate new head position
        const head = {...this.snake[0]};
        if (this.direction === 'up') head.y--;
        else if (this.direction === 'down') head.y++;
        else if (this.direction === 'left') head.x--;
        else if (this.direction === 'right') head.x++;

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        for (let seg of this.snake) {
            if (head.x === seg.x && head.y === seg.y) {
                this.gameOver();
                return;
            }
        }

        // Move snake
        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.gameSpeed = Math.max(50, 150 - this.score / 2); // Increase speed
            this.updateScore();
            this.placeFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw food
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        const foodX = this.food.x * this.gridSize + this.gridSize / 2;
        const foodY = this.food.y * this.gridSize + this.gridSize / 2;
        this.ctx.arc(foodX, foodY, this.gridSize / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw snake
        this.snake.forEach((seg, idx) => {
            const isHead = idx === 0;
            this.ctx.fillStyle = isHead ? '#00f5d4' : '#00bbf9';
            
            this.ctx.fillRect(
                seg.x * this.gridSize + 1,
                seg.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );

            // Draw eyes on head
            if (isHead) {
                this.ctx.fillStyle = '#0a0a0a';
                const eyeSize = this.gridSize / 5;
                const offset = this.gridSize / 3;

                // Position eyes based on direction
                let eye1X, eye1Y, eye2X, eye2Y;
                if (this.direction === 'up') {
                    eye1X = seg.x * this.gridSize + offset; eye1Y = seg.y * this.gridSize + offset;
                    eye2X = seg.x * this.gridSize + offset + 2*offset; eye2Y = seg.y * this.gridSize + offset;
                } else if (this.direction === 'down') {
                    eye1X = seg.x * this.gridSize + offset; eye1Y = seg.y * this.gridSize + this.gridSize - offset - eyeSize;
                    eye2X = seg.x * this.gridSize + offset + 2*offset; eye2Y = seg.y * this.gridSize + this.gridSize - offset - eyeSize;
                } else if (this.direction === 'left') {
                    eye1X = seg.x * this.gridSize + offset; eye1Y = seg.y * this.gridSize + offset;
                    eye2X = seg.x * this.gridSize + offset; eye2Y = seg.y * this.gridSize + offset + 2*offset;
                } else { // right
                    eye1X = seg.x * this.gridSize + this.gridSize - offset - eyeSize; eye1Y = seg.y * this.gridSize + offset;
                    eye2X = seg.x * this.gridSize + this.gridSize - offset - eyeSize; eye2Y = seg.y * this.gridSize + offset + 2*offset;
                }

                this.ctx.beginPath();
                this.ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isPlaying = false;
        document.getElementById('final-score-display').textContent = this.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('start-btn').disabled = false;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SnakeGame();
});