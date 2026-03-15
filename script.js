// Плавный скролл для навигации
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Анимация при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Применяем анимацию ко всем карточкам и секциям
document.querySelectorAll('.feature-card, .service-card, .benefit-item, .portfolio-item, .stat-item, .pricing-card, .process-item, .important-item, .minigame-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Обработка выбора тарифа
document.querySelectorAll('.select-tariff').forEach(button => {
    button.addEventListener('click', function() {
        const tariff = this.getAttribute('data-tariff');
        const tariffInput = document.getElementById('tariff');
        tariffInput.value = tariff;
        
        // Плавный скролл к форме заказа
        document.querySelector('#order').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Подсветка поля
        tariffInput.focus();
    });
});

// Обработка формы заказа
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const contact = document.getElementById('contact').value.trim();
    const tariff = document.getElementById('tariff').value.trim();
    const deadline = document.getElementById('deadline').value.trim();
    const service = document.getElementById('service').value.trim();
    const script = document.getElementById('script').value.trim();

    const message = `🎮 *Новая заявка на разработку!*

📱 *Контакт:* ${contact}
💰 *Тариф:* ${tariff || 'Не выбран'}
📅 *Дата готовности:* ${deadline || 'Не указана'}
🛠️ *Услуга:* ${service}
📝 *Описание:* ${script}`;

    // Отправка в Telegram
    if (TG_BOT_TOKEN !== 'YOUR_BOT_TOKEN' && TG_CHAT_ID !== 'YOUR_CHAT_ID') {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: TG_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            const data = await response.json();
            console.log('Telegram response:', data);

            if (!data.ok) {
                throw new Error(data.description || 'Ошибка отправки');
            }

            alert('✅ Заявка успешно отправлена! Я свяжусь с вами в указанном мессенджере.');
            this.reset();

        } catch (error) {
            console.error('Error:', error);
            alert('❌ Ошибка: ' + error.message);
        }
    } else {
        alert('⚠️ Telegram не настроен!');
    }
});

// Эффект параллакса для частиц
document.addEventListener('mousemove', (e) => {
    const particles = document.getElementById('particles');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    particles.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
});

// Анимация хедера при скролле
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.background = 'rgba(10, 10, 15, 0.98)';
        header.style.boxShadow = '0 5px 30px rgba(0, 245, 255, 0.2)';
    } else {
        header.style.background = 'rgba(10, 10, 15, 0.95)';
        header.style.boxShadow = '0 5px 30px rgba(0, 245, 255, 0.1)';
    }

    lastScroll = currentScroll;
});

// Добавляем эффект свечения при наведении на карточки
document.querySelectorAll('.service-card, .feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 245, 255, 0.15), rgba(20, 20, 35, 0.6))`;
    });

    card.addEventListener('mouseleave', function() {
        card.style.background = 'rgba(20, 20, 35, 0.6)';
    });
});

// Console easter egg
console.log('%c🎮 BerkovStudio - Professional Development', 'color: #00f5ff; font-size: 20px; font-weight: bold;');
console.log('%cСоздал Антон Чигур', 'color: #7b2fff; font-size: 14px;');

// ========== MINI GAMES ==========
const gameModal = document.getElementById('gameModal');
const modalClose = document.getElementById('modalClose');
const gameTitle = document.getElementById('gameTitle');
const gameContainer = document.getElementById('gameContainer');
const gameControls = document.getElementById('gameControls');
const gameBalanceDisplay = document.getElementById('gameBalanceDisplay');
const gameTariffsDisplay = document.getElementById('gameTariffsDisplay');
const viewInventoryBtn = document.getElementById('viewInventoryBtn');

// Telegram настройки
const TG_BOT_TOKEN = '8415434289:AAGyWPDpIIGF19DYIr20Jd4XArtuMLcMRKY';
const TG_CHAT_ID = '5017662184';

// Inventory Modal
const inventoryModal = document.getElementById('inventoryModal');
const inventoryClose = document.getElementById('inventoryClose');
const inventoryGrid = document.getElementById('inventoryGrid');
const inventoryBalance = document.getElementById('inventoryBalance');
const inventoryTariffs = document.getElementById('inventoryTariffs');
const inventoryWheelBalance = document.getElementById('inventoryWheelBalance');

// Game State
let currentGame = null;
let snakeInterval = null;
let snake = [];
let snakeDirection = 'right';
let food = {};
let snakeScore = 0;

// Persistent Game Data
let gameData = {
    balance: 1000,
    wheelBalance: 500,
    tariffs: 0,
    inventory: []
};

// Load saved data
if (localStorage.getItem('berkovStudioGameData')) {
    const savedData = JSON.parse(localStorage.getItem('berkovStudioGameData'));
    gameData = { ...gameData, ...savedData }; // Объединяем с данными по умолчанию
}

function saveGameData() {
    localStorage.setItem('berkovStudioGameData', JSON.stringify(gameData));
    updateBalanceDisplay();
}

function updateBalanceDisplay() {
    if (gameBalanceDisplay) gameBalanceDisplay.textContent = gameData.balance + '$';
    if (gameTariffsDisplay) gameTariffsDisplay.textContent = gameData.tariffs;
    if (inventoryBalance) inventoryBalance.textContent = gameData.balance + '$';
    if (inventoryTariffs) inventoryTariffs.textContent = gameData.tariffs;
    if (inventoryWheelBalance) inventoryWheelBalance.textContent = gameData.wheelBalance + '$';
    
    // Обновляем баланс колеса в интерфейсе
    const wheelBalanceEl = document.getElementById('wheelBalanceDisplay');
    if (wheelBalanceEl) wheelBalanceEl.textContent = gameData.wheelBalance + '$';
}

// Открытие модального окна
document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const game = this.getAttribute('data-game');
        openGame(game);
    });
});

// Закрытие модального окна
modalClose.addEventListener('click', closeGame);
gameModal.addEventListener('click', function(e) {
    if (e.target === gameModal) closeGame();
});

// Инвентарь
inventoryClose.addEventListener('click', closeInventory);
inventoryModal.addEventListener('click', function(e) {
    if (e.target === inventoryModal) closeInventory();
});

// Просмотр инвентаря
if (viewInventoryBtn) {
    viewInventoryBtn.addEventListener('click', openInventory);
}

function openGame(game) {
    gameModal.classList.add('active');
    currentGame = game;
    updateBalanceDisplay();
    
    switch(game) {
        case 'snake':
            startSnakeGame();
            break;
        case 'minesweeper':
            startMinesweeper();
            break;
        case 'slots':
            startSlots();
            break;
        case 'wheel':
            startWheel();
            break;
    }
}

function closeGame() {
    if (!gameModal) return;
    gameModal.classList.remove('active');
    
    // Полная очистка
    if (gameContainer) gameContainer.innerHTML = '';
    if (gameControls) gameControls.innerHTML = '';
    
    currentGame = null;

    if (snakeInterval) {
        clearInterval(snakeInterval);
        snakeInterval = null;
    }
    
    // Удаляем обработчик клавиатуры
    document.removeEventListener('keydown', handleKeyPress);
}

function openInventory() {
    inventoryGrid.innerHTML = '';

    if (gameData.inventory.length === 0) {
        inventoryGrid.innerHTML = '<p style="color: var(--gray); text-align: center; grid-column: 1/-1;">Инвентарь пуст</p>';
    } else {
        gameData.inventory.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            
            // Кнопка использования для тарифов
            let useButton = '';
            if (item.name.includes('Тариф')) {
                useButton = `<button class="btn btn-sm inventory-use-btn" data-index="${index}">Использовать</button>`;
            }
            
            itemEl.innerHTML = `
                <div class="inventory-item-icon">${item.icon}</div>
                <div class="inventory-item-name">${item.name}</div>
                <div class="inventory-item-count">x${item.count}</div>
                ${useButton}
            `;
            inventoryGrid.appendChild(itemEl);
        });
        
        // Обработчики кнопок использования
        inventoryGrid.querySelectorAll('.inventory-use-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const item = gameData.inventory[index];

                if (item.name.includes('Тариф')) {
                    // Определяем название тарифа для применения
                    let tariffValue = 'Базовый ($1-$5)';
                    if (item.name.includes('Стандарт')) {
                        tariffValue = 'Стандарт ($6-$12)';
                    } else if (item.name.includes('Премиум')) {
                        tariffValue = 'Премиум ($13-$20)';
                    }
                    
                    // Применяем тариф к форме заказа
                    const tariffInput = document.getElementById('tariff');
                    if (tariffInput) {
                        tariffInput.value = tariffValue;
                        // Плавный скролл к форме заказа
                        document.querySelector('#order').scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        tariffInput.focus();
                    }

                    // Уменьшаем количество в инвентаре
                    item.count--;
                    if (item.count <= 0) {
                        gameData.inventory.splice(index, 1);
                    }
                    gameData.tariffs = gameData.inventory
                        .filter(i => i.name.includes('Тариф'))
                        .reduce((sum, i) => sum + i.count, 0);
                    saveGameData();
                    openInventory(); // Обновляем отображение
                    closeInventory();
                    alert(`✅ Тариф "${tariffValue}" применён! Выберите форму заказа.`);
                }
            });
        });
    }

    updateBalanceDisplay();
    inventoryModal.classList.add('active');
}

function closeInventory() {
    inventoryModal.classList.remove('active');
}

function addToInventory(icon, name, count = 1) {
    const existing = gameData.inventory.find(i => i.name === name);
    if (existing) {
        existing.count += count;
    } else {
        gameData.inventory.push({ icon, name, count });
    }
    saveGameData();
}

// ========== SNAKE GAME ==========
function startSnakeGame() {
    if (!gameTitle || !gameContainer || !gameControls) {
        console.error('Game elements not found!');
        return;
    }
    
    gameTitle.textContent = '🐍 Змейка';

    const canvas = document.createElement('canvas');
    canvas.id = 'snakeCanvas';
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.cssText = 'border: 2px solid var(--primary); border-radius: 10px; background: #0a0a0f; box-shadow: 0 0 30px rgba(0, 245, 255, 0.3);';
    gameContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const gridSize = 20;

    snake = [{x: 10, y: 10}];
    snakeDirection = 'right';
    snakeScore = 0;
    let gameSpeed = 150;
    placeFood(gridSize);

    // Счёт
    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'snakeScore';
    scoreDisplay.style.cssText = 'font-size: 24px; color: var(--primary); margin: 10px 0; font-weight: bold; text-shadow: 0 0 10px var(--primary);';
    scoreDisplay.textContent = '🍎 Счёт: 0';
    gameControls.appendChild(scoreDisplay);

    // Рекорд
    const highScore = localStorage.getItem('snakeHighScore') || 0;
    const highScoreDisplay = document.createElement('div');
    highScoreDisplay.style.cssText = 'font-size: 18px; color: var(--secondary); margin: 5px 0;';
    highScoreDisplay.textContent = '🏆 Рекорд: ' + highScore;
    gameControls.appendChild(highScoreDisplay);

    // Кнопки управления - улучшенная раскладка
    const controls = document.createElement('div');
    controls.style.cssText = 'display: grid; grid-template-columns: repeat(3, 60px); grid-template-rows: repeat(2, 50px); gap: 8px; margin: 20px auto; justify-content: center;';
    controls.innerHTML = `
        <div style="grid-column: 2; grid-row: 1;">
            <button class="btn btn-outline" id="upBtn" style="width: 100%; height: 100%; font-size: 24px; padding: 0;">▲</button>
        </div>
        <div style="grid-column: 1; grid-row: 2;">
            <button class="btn btn-outline" id="leftBtn" style="width: 100%; height: 100%; font-size: 24px; padding: 0;">◀</button>
        </div>
        <div style="grid-column: 2; grid-row: 2;">
            <button class="btn btn-outline" id="downBtn" style="width: 100%; height: 100%; font-size: 24px; padding: 0;">▼</button>
        </div>
        <div style="grid-column: 3; grid-row: 2;">
            <button class="btn btn-outline" id="rightBtn" style="width: 100%; height: 100%; font-size: 24px; padding: 0;">▶</button>
        </div>
    `;
    gameControls.appendChild(controls);

    // Кнопки действий
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-top: 15px; flex-wrap: wrap;';
    
    let isPaused = false;
    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'btn btn-outline';
    pauseBtn.textContent = '⏸️';
    pauseBtn.style.cssText = 'min-width: 50px; font-size: 20px;';
    pauseBtn.title = 'Пауза (Пробел)';
    pauseBtn.onclick = () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? '▶️' : '⏸️';
    };
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-outline';
    closeBtn.textContent = '✖';
    closeBtn.style.cssText = 'min-width: 50px; font-size: 20px;';
    closeBtn.title = 'Закрыть игру';
    closeBtn.onclick = () => {
        clearInterval(snakeInterval);
        document.removeEventListener('keydown', handleKeyPress);
        closeGame();
    };
    
    actionButtons.appendChild(pauseBtn);
    actionButtons.appendChild(closeBtn);
    gameControls.appendChild(actionButtons);

    // Управление кнопками
    document.getElementById('upBtn').addEventListener('click', () => changeDirection('up'));
    document.getElementById('downBtn').addEventListener('click', () => changeDirection('down'));
    document.getElementById('leftBtn').addEventListener('click', () => changeDirection('left'));
    document.getElementById('rightBtn').addEventListener('click', () => changeDirection('right'));

    // Блокировка повторных нажатий
    let lastDirection = 'right';

    // Управление клавиатурой
    document.addEventListener('keydown', handleKeyPress);

    function changeDirection(dir) {
        if (isPaused) return;
        
        // Запрет на разворот на 180°
        if (dir === 'up' && lastDirection !== 'down') snakeDirection = 'up';
        if (dir === 'down' && lastDirection !== 'up') snakeDirection = 'down';
        if (dir === 'left' && lastDirection !== 'right') snakeDirection = 'left';
        if (dir === 'right' && lastDirection !== 'left') snakeDirection = 'right';
    }

    function handleKeyPress(e) {
        // Предотвращаем прокрутку страницы стрелками
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDirection('up');
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDirection('down');
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDirection('left');
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDirection('right');
        if (e.key === ' ' || e.key === 'Escape') {
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? '▶️' : '⏸️';
        }
    }

    function placeFood() {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
        // Проверка чтобы еда не появилась на змейке
        while (snake.some(s => s.x === food.x && s.y === food.y)) {
            food = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)),
                y: Math.floor(Math.random() * (canvas.height / gridSize))
            };
        }
    }

    function draw() {
        if (isPaused) return;

        // Очистка
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Сетка
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width / gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        // Еда (пульсирующая)
        const pulse = Math.sin(Date.now() / 200) * 2;
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 15 + pulse;
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2 + pulse/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Змейка
        snake.forEach((segment, index) => {
            const isHead = index === 0;
            ctx.fillStyle = isHead ? '#00f5ff' : '#7b2fff';
            ctx.shadowColor = isHead ? '#00f5ff' : '#7b2fff';
            ctx.shadowBlur = isHead ? 15 : 5;
            ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
            ctx.shadowBlur = 0;
            
            // Глаза у головы
            if (isHead) {
                ctx.fillStyle = '#ffffff';
                const eyeSize = 4;
                const eyeOffset = 5;
                if (snakeDirection === 'right' || snakeDirection === 'left') {
                    ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + 4, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + gridSize - 8, eyeSize, eyeSize);
                } else {
                    ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * gridSize + gridSize - 8, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                }
            }
        });

        // Движение
        const head = {x: snake[0].x, y: snake[0].y};

        if (snakeDirection === 'up') head.y--;
        if (snakeDirection === 'down') head.y++;
        if (snakeDirection === 'left') head.x--;
        if (snakeDirection === 'right') head.x++;

        // Проверка столкновений со стенами - СМЕРТЬ
        if (head.x < 0 || head.x >= canvas.width / gridSize ||
            head.y < 0 || head.y >= canvas.height / gridSize) {
            gameOver();
            return;
        }

        // Проверка на столкновение с хвостом - СМЕРТЬ
        if (snake.some(s => s.x === head.x && s.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        // Обновляем последнее направление
        lastDirection = snakeDirection;

        // Проверка еды
        if (head.x === food.x && head.y === food.y) {
            snakeScore += 10;
            scoreDisplay.textContent = '🍎 Счёт: ' + snakeScore;
            
            // Ускорение каждые 50 очков
            if (snakeScore % 50 === 0 && gameSpeed > 50) {
                gameSpeed -= 10;
                clearInterval(snakeInterval);
                snakeInterval = setInterval(draw, gameSpeed);
            }
            
            placeFood();
        } else {
            snake.pop();
        }
    }

    function gameOver() {
        clearInterval(snakeInterval);
        snakeInterval = null;
        document.removeEventListener('keydown', handleKeyPress);

        // Сохранение рекорда
        const currentHighScore = localStorage.getItem('snakeHighScore') || 0;
        if (snakeScore > currentHighScore) {
            localStorage.setItem('snakeHighScore', snakeScore);
            highScoreDisplay.textContent = '🏆 Рекорд: ' + snakeScore + ' (НОВЫЙ!)';
            highScoreDisplay.style.color = '#00ff00';
        }

        // Очищаем контейнер перед показом экрана смерти
        const existingGameOver = gameControls.querySelector('.game-over-screen');
        if (existingGameOver) {
            existingGameOver.remove();
        }

        // Создаём экран смерти
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        gameOverScreen.style.cssText = 'text-align: center;';
        
        const gameOverText = document.createElement('div');
        gameOverText.style.cssText = 'font-size: 28px; color: #ff0000; font-weight: bold; margin: 20px 0; text-shadow: 0 0 10px #ff0000;';
        gameOverText.textContent = '💀 Игра окончена!';
        gameOverScreen.appendChild(gameOverText);

        const scoreText = document.createElement('div');
        scoreText.style.cssText = 'font-size: 24px; color: var(--primary); margin: 15px 0;';
        scoreText.textContent = '🍎 Ваш счёт: ' + snakeScore;
        gameOverScreen.appendChild(scoreText);

        if (snakeScore >= currentHighScore && snakeScore > 0) {
            const newRecordText = document.createElement('div');
            newRecordText.style.cssText = 'font-size: 20px; color: #00ff00; margin: 10px 0; font-weight: bold;';
            newRecordText.textContent = '🎉 НОВЫЙ РЕКОРД!';
            gameOverScreen.appendChild(newRecordText);
        }

        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn btn-primary';
        restartBtn.textContent = '🔄 Играть снова';
        restartBtn.style.cssText = 'margin-top: 20px;';
        restartBtn.onclick = () => {
            gameOverScreen.remove();
            startSnakeGame();
        };
        gameOverScreen.appendChild(restartBtn);

        gameControls.appendChild(gameOverScreen);
    }

    snakeInterval = setInterval(draw, gameSpeed);
}

// ========== MINESWEEPER ==========
function startMinesweeper() {
    gameTitle.textContent = '💣 Сапёр';
    
    const rows = 10;
    const cols = 10;
    const minesCount = 15;
    
    const grid = document.createElement('div');
    grid.className = 'minesweeper-grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameContainer.appendChild(grid);
    
    const info = document.createElement('div');
    info.id = 'minesInfo';
    info.style.cssText = 'font-size: 18px; color: var(--primary); margin: 10px 0;';
    info.textContent = '💣 Мин: ' + minesCount;
    gameControls.insertBefore(info, gameControls.firstChild);
    
    let cells = [];
    let mines = [];
    let revealed = 0;
    let gameOver = false;
    let flagged = 0;
    
    // Создание поля
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('button');
        cell.className = 'mine-cell';
        cell.dataset.index = i;
        cell.addEventListener('click', handleClick);
        cell.addEventListener('contextmenu', handleRightClick);
        grid.appendChild(cell);
        cells.push(cell);
    }
    
    // Размещение мин
    while (mines.length < minesCount) {
        const pos = Math.floor(Math.random() * rows * cols);
        if (!mines.includes(pos)) mines.push(pos);
    }
    
    function handleClick(e) {
        if (gameOver) return;
        
        const index = parseInt(e.target.dataset.index);
        
        if (e.target.classList.contains('revealed') || e.target.classList.contains('flagged')) return;
        
        if (mines.includes(index)) {
            // Взрыв!
            gameOver = true;
            cells.forEach((cell, i) => {
                if (mines.includes(i)) {
                    cell.classList.add('revealed', 'mine');
                    cell.textContent = '💣';
                }
            });
            
            const loseText = document.createElement('div');
            loseText.style.cssText = 'font-size: 24px; color: #ff0000; font-weight: bold; margin: 10px 0;';
            loseText.textContent = '💥 Вы проиграли!';
            gameControls.appendChild(loseText);
            
            const restartBtn = document.createElement('button');
            restartBtn.className = 'btn btn-primary';
            restartBtn.textContent = 'Играть снова';
            restartBtn.onclick = () => {
                loseText.remove();
                restartBtn.remove();
                startMinesweeper();
            };
            gameControls.appendChild(restartBtn);
        } else {
            revealCell(index, cells, mines, rows, cols);
            checkWin();
        }
    }
    
    function handleRightClick(e) {
        e.preventDefault();
        if (gameOver) return;
        
        const cell = e.target;
        if (cell.classList.contains('revealed')) return;
        
        if (cell.classList.contains('flagged')) {
            cell.classList.remove('flagged');
            cell.textContent = '';
            flagged--;
        } else {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
            flagged++;
        }
        
        info.textContent = '💣 Мин: ' + (minesCount - flagged);
    }
    
    function revealCell(index, cells, mines, rows, cols) {
        if (index < 0 || index >= rows * cols) return;
        const cell = cells[index];
        if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;
        
        cell.classList.add('revealed');
        revealed++;
        
        // Подсчёт мин вокруг
        const row = Math.floor(index / cols);
        const col = index % cols;
        let count = 0;
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    if (mines.includes(nr * cols + nc)) count++;
                }
            }
        }
        
        if (count > 0) {
            cell.textContent = count;
            cell.style.color = ['#00f5ff', '#00ff00', '#ffff00', '#ff8800', '#ff0000'][count - 1] || '#fff';
        } else {
            // Рекурсивное открытие пустых клеток
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        revealCell(nr * cols + nc, cells, mines, rows, cols);
                    }
                }
            }
        }
    }
    
    function checkWin() {
        if (revealed === rows * cols - minesCount) {
            gameOver = true;
            const winText = document.createElement('div');
            winText.style.cssText = 'font-size: 24px; color: #00ff00; font-weight: bold; margin: 10px 0;';
            winText.textContent = '🎉 Победа!';
            gameControls.appendChild(winText);
            
            const restartBtn = document.createElement('button');
            restartBtn.className = 'btn btn-primary';
            restartBtn.textContent = 'Играть снова';
            restartBtn.onclick = () => {
                winText.remove();
                restartBtn.remove();
                startMinesweeper();
            };
            gameControls.appendChild(restartBtn);
        }
    }
}

// ========== WHEEL OF FORTUNE ==========
function startWheel() {
    gameTitle.textContent = '🎡 Колесо Фортуны';

    const segments = [
        { label: '1000$', value: 1000, color: '#ff0000', type: 'money', chance: 5 },
        { label: '500$', value: 500, color: '#ff8800', type: 'money', chance: 10 },
        { label: '200$', value: 200, color: '#ffff00', type: 'money', chance: 15 },
        { label: '100$', value: 100, color: '#00ff00', type: 'money', chance: 20 },
        { label: '50$', value: 50, color: '#00ffff', type: 'money', chance: 25 },
        { label: '25$', value: 25, color: '#0088ff', type: 'money', chance: 30 },
        { label: '10$', value: 10, color: '#8800ff', type: 'money', chance: 35 },
        { label: '0$', value: 0, color: '#666666', type: 'money', chance: 40 },
        { label: 'Тариф', value: 1, color: '#ff00ff', type: 'tariff', chance: 8 }
    ];

    let spinCost = 50;
    let isSpinning = false;
    let rotation = 0;

    // Информация
    const infoPanel = document.createElement('div');
    infoPanel.className = 'slots-info';
    infoPanel.innerHTML = `
        <div class="slots-balance">💰 Баланс колеса: <span id="wheelBalanceDisplay">${gameData.wheelBalance}$</span></div>
        <div class="slots-bet">🎲 Стоимость спина: <span>${spinCost}$</span></div>
    `;
    gameContainer.appendChild(infoPanel);

    // Колесо
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'wheel-container';
    wheelContainer.innerHTML = `
        <div class="wheel-pointer"></div>
        <canvas id="wheelCanvas" width="300" height="300"></canvas>
    `;
    gameContainer.appendChild(wheelContainer);

    const result = document.createElement('div');
    result.id = 'wheelResult';
    result.textContent = 'Крути колесо и выигрывай!';
    result.style.color = 'var(--primary)';
    gameContainer.appendChild(result);

    const spinBtn = document.createElement('button');
    spinBtn.className = 'btn btn-primary wheel-spin-btn';
    spinBtn.textContent = '🎡 Крутить колесо';
    spinBtn.onclick = spin;
    gameControls.appendChild(spinBtn);

    const customBetBtn = document.createElement('button');
    customBetBtn.className = 'btn btn-outline';
    customBetBtn.textContent = '💰 Своя ставка';
    customBetBtn.onclick = () => {
        const customBet = prompt('Введите сумму ставки ($1-$' + gameData.wheelBalance + '):', spinCost.toString());
        if (customBet && !isNaN(customBet) && parseInt(customBet) > 0) {
            spinCost = Math.min(gameData.wheelBalance, Math.max(1, parseInt(customBet)));
            infoPanel.innerHTML = `
                <div class="slots-balance">💰 Баланс колеса: <span id="wheelBalanceDisplay">${gameData.wheelBalance}$</span></div>
                <div class="slots-bet">🎲 Стоимость спина: <span>${spinCost}$</span></div>
            `;
        }
    };
    gameControls.appendChild(customBetBtn);

    // Рисуем колесо
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    const segmentAngle = (2 * Math.PI) / segments.length;

    // Добавляем эффект свечения при вращении
    function drawCenterIndicator() {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = isSpinning ? '#00f5ff' : '#0a0a0f';
        ctx.fill();
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        if (isSpinning) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    }

    function drawWheel(selectedIndex = -1) {
        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        segments.forEach((segment, i) => {
            const startAngle = i * segmentAngle - Math.PI / 2;
            const endAngle = startAngle + segmentAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.fill();
            ctx.strokeStyle = '#0a0a0f';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Подсветка выигрышного сегмента
            if (i === selectedIndex) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
                ctx.restore();
            }

            // Текст
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Orbitron';
            ctx.fillText(segment.label, radius - 20, 5);
            ctx.restore();
        });
        
        // Рисуем центральный индикатор
        drawCenterIndicator();
    }

    drawWheel();

    function spin() {
        if (isSpinning) return;
        if (gameData.wheelBalance < spinCost) {
            result.textContent = '❌ Недостаточно средств! Нужно ' + spinCost + '$';
            result.style.color = '#ff0000';
            return;
        }

        isSpinning = true;
        gameData.wheelBalance -= spinCost;
        saveGameData();
        updateBalanceDisplay();

        // Добавляем класс анимации
        canvas.classList.add('spinning');
        spinBtn.disabled = true;
        customBetBtn.disabled = true;
        result.textContent = '🔄 Крутим...';
        result.style.color = 'var(--primary)';

        // Определяем результат заранее (с учётом шансов)
        const totalChance = segments.reduce((sum, s) => sum + s.chance, 0);
        let random = Math.random() * totalChance;
        let selectedIndex = 0;

        for (let i = 0; i < segments.length; i++) {
            if (random < segments[i].chance) {
                selectedIndex = i;
                break;
            }
            random -= segments[i].chance;
        }

        // Вычисляем угол для остановки
        const segmentIndex = segments.length - selectedIndex;
        const targetRotation = rotation + (360 * 8) + (segmentIndex * (360 / segments.length));

        // Анимация
        let start = null;
        const duration = 5000;
        const startRotation = rotation;
        let lastTickSound = 0;

        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);

            rotation = startRotation + (targetRotation - startRotation) * easeOut;
            canvas.style.transform = `rotate(${rotation}deg)`;

            // Звук тиканья (каждые 50 градусов)
            const tickInterval = 50;
            const currentTick = Math.floor(rotation / tickInterval);
            if (currentTick > lastTickSound && progress < 0.8) {
                playTickSound();
                lastTickSound = currentTick;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isSpinning = false;
                canvas.classList.remove('spinning');
                spinBtn.disabled = false;
                customBetBtn.disabled = false;

                // Перерисовываем колесо с подсветкой выигрышного сегмента
                drawWheel(selectedIndex);

                const prize = segments[selectedIndex];

                if (prize.type === 'money') {
                    gameData.wheelBalance += prize.value;
                    saveGameData();
                    updateBalanceDisplay();
                    infoPanel.innerHTML = `
                        <div class="slots-balance">💰 Баланс колеса: <span id="wheelBalanceDisplay">${gameData.wheelBalance}$</span></div>
                        <div class="slots-bet">🎲 Стоимость спина: <span>${spinCost}$</span></div>
                    `;

                    if (prize.value >= 500) {
                        result.textContent = `🎉 ДЖЕКПОТ! ${prize.label}!`;
                        result.style.color = '#00ff00';
                        result.classList.add('jackpot');
                        playWinSound();
                    } else if (prize.value > 0) {
                        result.textContent = `✨ Выигрыш: ${prize.label}!`;
                        result.style.color = '#ffff00';
                        playWinSound();
                    } else {
                        result.textContent = '😢 Попробуй ещё раз!';
                        result.style.color = '#ff8800';
                    }
                } else if (prize.type === 'tariff') {
                    addToInventory('🎫', 'Базовый тариф ($1-$5)', 1);
                    gameData.tariffs += 1;
                    saveGameData();
                    updateBalanceDisplay();
                    infoPanel.innerHTML = `
                        <div class="slots-balance">💰 Баланс колеса: <span id="wheelBalanceDisplay">${gameData.wheelBalance}$</span></div>
                        <div class="slots-bet">🎫 Тарифы: <span>${gameData.tariffs}</span></div>
                    `;
                    result.textContent = '🎫 Вы выиграли Базовый тариф! Проверьте инвентарь.';
                    result.style.color = '#ff00ff';
                    playWinSound();
                }

                setTimeout(() => {
                    result.classList.remove('jackpot');
                }, 3000);
            }
        }

        requestAnimationFrame(animate);
    }
    
    // Звуковые эффекты
    function playTickSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    }
    
    function playWinSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        // Вторая нота
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 659.25; // E5
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            osc2.start();
            osc2.stop(audioContext.currentTime + 0.3);
        }, 150);
    }
}
function startSlots() {
    gameTitle.textContent = '🎰 Слоты';

    const symbols = [
        { icon: '🍒', value: 2, weight: 40 },
        { icon: '🍋', value: 3, weight: 35 },
        { icon: '🍇', value: 5, weight: 30 },
        { icon: '🍉', value: 8, weight: 25 },
        { icon: '⭐', value: 15, weight: 20 },
        { icon: '💎', value: 25, weight: 15 },
        { icon: '7️⃣', value: 50, weight: 10 }
    ];

    let currentBet = 10;
    let reels = [];
    let isSpinning = false;

    // Создаём интерфейс
    const infoPanel = document.createElement('div');
    infoPanel.className = 'slots-info';
    infoPanel.innerHTML = `
        <div class="slots-balance">💰 Баланс: <span>${gameData.balance}$</span></div>
        <div class="slots-bet">🎲 Ставка: <span>${currentBet}$</span></div>
    `;
    gameContainer.appendChild(infoPanel);
    
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'slots-container';
    
    for (let i = 0; i < 3; i++) {
        const reel = document.createElement('div');
        reel.className = 'slot-reel';
        reel.textContent = '❓';
        slotsContainer.appendChild(reel);
        reels.push(reel);
    }
    
    gameContainer.appendChild(slotsContainer);
    
    const result = document.createElement('div');
    result.id = 'slotsResult';
    result.textContent = 'Сделай ставку и крути!';
    result.style.color = 'var(--primary)';
    gameContainer.appendChild(result);
    
    // Контролы
    const controls = document.createElement('div');
    controls.className = 'slots-controls';

    const betMinusBtn = document.createElement('button');
    betMinusBtn.className = 'btn btn-outline';
    betMinusBtn.textContent = '-10$';
    betMinusBtn.onclick = () => changeBet(-10);

    const betPlusBtn = document.createElement('button');
    betPlusBtn.className = 'btn btn-outline';
    betPlusBtn.textContent = '+10$';
    betPlusBtn.onclick = () => changeBet(10);

    const spinBtn = document.createElement('button');
    spinBtn.className = 'btn btn-primary';
    spinBtn.textContent = '🎰 Крутить';
    spinBtn.onclick = spin;

    const maxBetBtn = document.createElement('button');
    maxBetBtn.className = 'btn btn-outline';
    maxBetBtn.textContent = 'MAX BET';
    maxBetBtn.onclick = () => { currentBet = Math.min(gameData.balance, 100); updateInfo(); };

    const customBetBtn = document.createElement('button');
    customBetBtn.className = 'btn btn-outline';
    customBetBtn.textContent = '💰 Своя ставка';
    customBetBtn.onclick = () => {
        const customBet = prompt('Введите сумму ставки ($1-$' + gameData.balance + '):', currentBet.toString());
        if (customBet && !isNaN(customBet) && parseInt(customBet) > 0) {
            currentBet = Math.min(gameData.balance, Math.max(1, parseInt(customBet)));
            updateInfo();
        }
    };

    controls.appendChild(betMinusBtn);
    controls.appendChild(betPlusBtn);
    controls.appendChild(spinBtn);
    controls.appendChild(maxBetBtn);
    controls.appendChild(customBetBtn);
    gameControls.appendChild(controls);

    function changeBet(amount) {
        if (isSpinning) return;
        currentBet = Math.max(10, Math.min(gameData.balance, currentBet + amount));
        updateInfo();
    }

    function updateInfo() {
        infoPanel.innerHTML = `
            <div class="slots-balance">💰 Баланс: <span>${gameData.balance}$</span></div>
            <div class="slots-bet">🎲 Ставка: <span>${currentBet}$</span></div>
        `;
    }

    function getRandomSymbol() {
        const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
        let random = Math.random() * totalWeight;

        for (const symbol of symbols) {
            if (random < symbol.weight) return symbol;
            random -= symbol.weight;
        }
        return symbols[0];
    }

    function spin() {
        if (isSpinning) return;
        if (gameData.balance < currentBet) {
            result.textContent = '❌ Недостаточно средств!';
            result.style.color = '#ff0000';
            return;
        }

        isSpinning = true;
        gameData.balance -= currentBet;
        saveGameData();
        updateInfo();

        spinBtn.disabled = true;
        betMinusBtn.disabled = true;
        betPlusBtn.disabled = true;
        maxBetBtn.disabled = true;

        result.textContent = '🔄 Крутим...';
        result.style.color = 'var(--primary)';
        result.classList.remove('jackpot');

        // Сбрасываем анимацию победителя
        reels.forEach(reel => reel.classList.remove('winner'));

        // Анимация вращения
        reels.forEach((reel, index) => {
            reel.classList.add('spinning');
            const spinInterval = setInterval(() => {
                reel.textContent = symbols[Math.floor(Math.random() * symbols.length)].icon;
            }, 100);
            reel.dataset.spinInterval = spinInterval;
        });

        // Остановка барабанов по очереди
        const results = [];
        reels.forEach((reel, index) => {
            setTimeout(() => {
                clearInterval(reel.dataset.spinInterval);
                reel.classList.remove('spinning');
                const symbol = getRandomSymbol();
                reel.textContent = symbol.icon;
                results.push(symbol);

                if (index === 2) {
                    checkWin(results);
                    isSpinning = false;
                    spinBtn.disabled = false;
                    betMinusBtn.disabled = false;
                    betPlusBtn.disabled = false;
                    maxBetBtn.disabled = false;
                }
            }, 500 + index * 300);
        });
    }
    
    function checkWin(results) {
        const values = results.map(r => r.icon);
        let winAmount = 0;
        let message = '';
        let color = '#ff8800';
        let isJackpot = false;

        if (values[0] === values[1] && values[1] === values[2]) {
            // 3 совпадения - джекпот!
            const symbol = results[0];
            winAmount = currentBet * symbol.value;
            message = `🎉 ДЖЕКПОТ! ${symbol.icon}${symbol.icon}${symbol.icon} +${winAmount}$!`;
            color = '#00ff00';
            isJackpot = true;

            reels.forEach(reel => reel.classList.add('winner'));
        } else if (values[0] === values[1] || values[1] === values[2] || values[0] === values[2]) {
            // 2 совпадения
            let matchingSymbol;
            if (values[0] === values[1]) matchingSymbol = results[0];
            else if (values[1] === values[2]) matchingSymbol = results[1];
            else matchingSymbol = results[0];

            winAmount = Math.floor(currentBet * matchingSymbol.value / 2);
            message = `✨ Пара совпала! +${winAmount}$`;
            color = '#ffff00';
        } else {
            message = '😢 Попробуй ещё раз!';
            color = '#ff8800';
        }

        if (winAmount > 0) {
            gameData.balance += winAmount;
            saveGameData();
            updateInfo();
        }

        result.textContent = message;
        result.style.color = color;

        if (isJackpot) {
            result.classList.add('jackpot');
        }

        // Проверка на банкротство
        if (gameData.balance < 10) {
            setTimeout(() => {
                const restartMsg = document.createElement('div');
                restartMsg.style.cssText = 'font-size: 20px; color: #ff0000; font-weight: bold; margin: 10px 0;';
                restartMsg.textContent = '💸 Деньги закончились! Начать заново?';
                gameContainer.appendChild(restartMsg);

                const restartBtn = document.createElement('button');
                restartBtn.className = 'btn btn-primary';
                restartBtn.textContent = '🔄 Начать заново (1000$)';
                restartBtn.onclick = () => {
                    restartMsg.remove();
                    restartBtn.remove();
                    gameData.balance = 1000;
                    currentBet = 10;
                    updateInfo();
                    result.textContent = 'Новая игра!';
                    result.style.color = 'var(--primary)';
                };
                gameControls.appendChild(restartBtn);
            }, 1000);
        }
    }
}
