// 🐍 Змейка - Игровая логика
(function() {
    'use strict';

    // Настройки игры
    const CELL_SIZE = 20;
    const GRID = 20; // 400 / 20 = 20 клеток по ширине/высоте
    const INITIAL_SPEED = 150;
    const MIN_SPEED = 50;
    const SPEED_DECREMENT = 2;

    // DOM элементы
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const scoreEl = document.getElementById('current-score');
    const highScoreEl = document.getElementById('high-score');
    const finalScoreEl = document.getElementById('final-score-display');
    const gameOverScreen = document.getElementById('game-over-screen');

    // Игровое состояние
    let snake = [];
    let food = { x: 0, y: 0 };
    let direction = { x: 0, y: 0 };
    let nextDirection = { x: 0, y: 0 };
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameRunning = false;
    let gameLoop = null;
    let speed = INITIAL_SPEED;

    // Инициализация
    function init() {
        highScoreEl.textContent = highScore;
        
        // Обработчики событий
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', restartGame);
        
        document.addEventListener('keydown', handleKeyPress);
        
        // Мобильные кнопки
        document.querySelectorAll('.d-pad-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleMobileButton(btn.dataset.dir);
            });
            btn.addEventListener('mousedown', (e) => {
                handleMobileButton(btn.dataset.dir);
            });
        });
    }

    function handleMobileButton(dir) {
        const moves = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
        const move = moves[dir];
        if (move) {
            changeDirection(move.x, move.y);
        }
    }

    function handleKeyPress(e) {
        if (!gameRunning) return;
        
        const keyMap = {
            'ArrowUp': { x: 0, y: -1 }, 'W': { x: 0, y: -1 },
            'ArrowDown': { x: 0, y: 1 }, 'S': { x: 0, y: 1 },
            'ArrowLeft': { x: -1, y: 0 }, 'A': { x: -1, y: 0 },
            'ArrowRight': { x: 1, y: 0 }, 'D': { x: 1, y: 0 }
        };
        
        const move = keyMap[e.key] || keyMap[e.key.toUpperCase()];
        if (move) {
            changeDirection(move.x, move.y);
        }
    }

    function changeDirection(x, y) {
        // Запоминаем следующее направление
        const validMoves = [
            { x: 0, y: -1 }, { x: 0, y: 1 },     // вверх/вниз
            { x: -1, y: 0 }, { x: 1, y: 0 }       // влево/вправо
        ];
        
        const isValid = validMoves.some(m => m.x === x && m.y === y);
        if (isValid) {
            // Нельзя пойти в противоположную сторону
            if (direction.x !== -x || direction.y !== -y) {
                nextDirection = { x, y };
            }
        }
    }

    function startGame() {
        resetGame();
        gameRunning = true;
        startBtn.disabled = true;
        restartBtn.disabled = false;
        gameLoop = setInterval(updateGame, speed);
    }

    function restartGame() {
        stopGame();
        resetGame();
        gameRunning = true;
        startBtn.disabled = true;
        restartBtn.disabled = false;
        gameLoop = setInterval(updateGame, speed);
    }

    function resetGame() {
        // Начальная змейка (3 сегмента)
        snake = [
            { x: 10, y: 10 },
            { x: 10, y: 11 },
            { x: 10, y: 12 }
        ];
        direction = { x: 0, y: -1 }; // Начинаем движение вверх
        nextDirection = { x: 0, y: -1 };
        score = 0;
        speed = INITIAL_SPEED;
        scoreEl.textContent = score;
        placeFood();
        draw();
    }

    function stopGame() {
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = null;
    }

    function updateGame() {
        // Применяем следующее направление
        direction = nextDirection;
        
        // Вычисляем новую голову
        const head = { 
            x: snake[0].x + direction.x, 
            y: snake[0].y + direction.y 
        };
        
        // Проверка столкновений
        if (checkCollision(head)) {
            gameOver();
            return;
        }
        
        // Добавляем новую голову
        snake.unshift(head);
        
        // Проверка еды
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreEl.textContent = score;
            
            // Ускоряем игру
            if (speed > MIN_SPEED) {
                speed -= SPEED_DECREMENT;
                clearInterval(gameLoop);
                gameLoop = setInterval(updateGame, speed);
            }
            
            placeFood();
        } else {
            // Удаляем хвост
            snake.pop();
        }
        
        draw();
    }

    function checkCollision(head) {
        // Стены
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
            return true;
        }
        
        // Самa змейка
        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }

    function placeFood() {
        // Случайная позиция без змеи
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID),
                y: Math.floor(Math.random() * GRID)
            };
        } while (checkCollision(newFood));
        
        food = newFood;
    }

    function gameOver() {
        stopGame();
        gameRunning = false;
        
        // Обновляем рекорд
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreEl.textContent = highScore;
        }
        
        finalScoreEl.textContent = score;
        gameOverScreen.classList.remove('hidden');
        startBtn.disabled = false;
    }

    function draw() {
        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Фон уже есть в CSS - не рисуем заново
        
        // Еда
        const foodX = food.x * CELL_SIZE;
        const foodY = food.y * CELL_SIZE;
        
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(foodX + CELL_SIZE/2, foodY + CELL_SIZE/2, CELL_SIZE/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Блеск еды
        ctx.fillStyle = 'rgba(255, 71, 87, 0.7)';
        ctx.beginPath();
        ctx.arc(foodX + CELL_SIZE/3, foodY + CELL_SIZE/4, CELL_SIZE/6, 0, Math.PI * 2);
        ctx.fill();
        
        // Змейка
        snake.forEach((segment, index) => {
            const segX = segment.x * CELL_SIZE;
            const segY = segment.y * CELL_SIZE;
            
            // Голова другого цвета
            if (index === 0) {
                ctx.fillStyle = '#00f5d4';
            } else {
                ctx.fillStyle = '#00bbf9';
            }
            
            // Рисуем сегмент змеи с небольшим отступом
            ctx.fillRect(segX + 1, segY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            
            // Глаза на голове
            if (index === 0) {
                drawEyes({ x: snake[0].x, y: snake[0].y });
            }
        });
    }

    function drawEyes(seg) {
        const segX = seg.x * CELL_SIZE;
        const segY = seg.y * CELL_SIZE;
        
        ctx.fillStyle = '#0a0a0a';
        
        // Вычисляем позицию глаз в зависимости от направления (абсолютные координаты относительно клетки сегмента)
        const eyeSize = 3.5;
        const eyeOffset = 6;
        
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        if (direction.x === 1) { // Вправо
            leftEyeX = segX + CELL_SIZE - eyeOffset;
            leftEyeY = segY + eyeOffset;
            rightEyeX = segX + CELL_SIZE - eyeOffset;
            rightEyeY = segY + CELL_SIZE - eyeOffset;
        } else if (direction.x === -1) { // Влево
            leftEyeX = segX + eyeOffset;
            leftEyeY = segY + eyeOffset;
            rightEyeX = segX + eyeOffset;
            rightEyeY = segY + CELL_SIZE - eyeOffset;
        } else if (direction.y === -1) { // Вверх
            leftEyeX = segX + eyeOffset;
            leftEyeY = segY + eyeOffset;
            rightEyeX = segX + CELL_SIZE - eyeOffset;
            rightEyeY = segY + eyeOffset;
        } else { // Вниз или стоит
            leftEyeX = segX + eyeOffset;
            leftEyeY = segY + CELL_SIZE - eyeOffset;
            rightEyeX = segX + CELL_SIZE - eyeOffset;
            rightEyeY = segY + CELL_SIZE - eyeOffset;
        }
        
        // Рисуем глаза (абсолютные координаты, без двойного смещения!)
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Запуск при загрузке
    init();
})();
