// Глобальные переменные:                            
var FIELD_SIZE_X = 20;//строки
var FIELD_SIZE_Y = 20;//столбцы
var SNAKE_SPEED = 200; // Интервал между перемещениями змейки
var snake = []; // Сама змейка
var direction = 'y+'; // Направление движения змейки
var gameIsRunning = false; // Запущена ли игра
var snake_timer; // Таймер змейки
var food_timer; // Таймер для еды
var score = 0; // Результат

function init() {
    prepareGameField(); // Генерация поля

    var wrap = document.getElementsByClassName('wrap')[0];
    // Подгоняем размер контейнера под игровое поле
    
	/*
	if (16 * (FIELD_SIZE_X + 1) < 380) {
        wrap.style.width = '380px';
    }
    else {
        wrap.style.width = (16 * (FIELD_SIZE_X + 1)).toString() + 'px';
    }
    */
    wrap.style.width = '400px';
    // События кнопок Старт и Новая игра
    document.getElementById('snake-start').addEventListener('click', startGame);
    document.getElementById('snake-renew').addEventListener('click', refreshGame);

// Отслеживание клавиш клавиатуры
    addEventListener('keydown', changeDirection);
}

/**
 * Функция генерации игрового поля
 */
function prepareGameField() {
    // Создаём таблицу
    var game_table = document.createElement('table');
    game_table.setAttribute('class', 'game-table');

    // Генерация ячеек игровой таблицы
    for (var i = 0; i < FIELD_SIZE_X; i++) {
        // Создание строки
        var row = document.createElement('tr');
        row.className = 'game-table-row row-' + i;

        for (var j = 0; j < FIELD_SIZE_Y; j++) {
            // Создание ячейки
            var cell = document.createElement('td');
            cell.className = 'game-table-cell cell-' + i + '-' + j;

            row.appendChild(cell); // Добавление ячейки
        }
        game_table.appendChild(row); // Добавление строки
    }

    document.getElementById('snake-field').appendChild(game_table); // Добавление таблицы
}

/**
 * Старт игры
 */
function startGame() {
    gameIsRunning = true;
    respawn();//создали змейку

    snake_timer = setInterval(move, SNAKE_SPEED);
    setTimeout(createFood, 1000);
    setTimeout(createBarrier, 1000);
}

/**
 * Функция расположения змейки на игровом поле
 */
function respawn() {
    // Змейка - массив td
    // Стартовая длина змейки = 2

    // Respawn змейки из центра
    var start_coord_x = Math.floor(FIELD_SIZE_X / 2);
    var start_coord_y = Math.floor(FIELD_SIZE_Y / 2);

    // Голова змейки
    var snake_head = document.getElementsByClassName('cell-' + start_coord_y + '-' + start_coord_x)[0];
    snake_head.setAttribute('class', snake_head.getAttribute('class') + ' snake-unit');
    // Тело змейки
    var snake_tail = document.getElementsByClassName('cell-' + (start_coord_y - 1) + '-' + start_coord_x)[0];
    snake_tail.setAttribute('class', snake_tail.getAttribute('class') + ' snake-unit');

    snake.push(snake_head);
    snake.push(snake_tail);
}

/**
 * Движение змейки
 */
function move(next) {
    //console.log('move',direction);
    // Сборка классов
    var snake_head_classes = snake[snake.length - 1].getAttribute('class').split(' ');

    // Сдвиг головы
    var new_unit;
    var snake_coords = snake_head_classes[1].split('-');
    var coord_y = parseInt(snake_coords[1]);
    var coord_x = parseInt(snake_coords[2]);

    // Определяем новую точку
    if (direction == 'x-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x - 1))[0];
        // console.log(new_unit);
    }
    else if (direction == 'x+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x + 1))[0];
    }
    else if (direction == 'y+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y - 1) + '-' + (coord_x))[0];
    }
    else if (direction == 'y-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y + 1) + '-' + (coord_x))[0];
    }

    // При достижений края экрана переходим на противоположную сторону.
    if ((direction == 'x-') && coord_x == 0){
        coord_x = 19;
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x))[0];
    }
    if ((direction == 'x+') && coord_x == 19){
        coord_x = 0;
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x))[0];
    }
    if ((direction == 'y+') && coord_y == 0){
        coord_y = 19;
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x))[0];
    }
    if ((direction == 'y-') && coord_y == 19){
        coord_y = 0;
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x))[0];
    }

    // Проверки
    // 1) new_unit не часть змейки
    // 2) Змейка не ушла за границу поля
    //console.log(new_unit);
    // if (new_unit !== undefined){
    //     console.log('ura');
    // }
    if (!isSnakeUnit(new_unit)) { // && new_unit !== undefined
        // Добавление новой части змейки
        new_unit.setAttribute('class', new_unit.getAttribute('class') + ' snake-unit');
        snake.push(new_unit);

        // Проверяем, надо ли убрать хвост
        if (!haveFood(new_unit)) {
            // Находим хвост
            var removed = snake.splice(0, 1)[0];
            var classes = removed.getAttribute('class').split(' ');

            // удаляем хвост
            removed.setAttribute('class', classes[0] + ' ' + classes[1]);
        }
        // Проверяем столкнулись ли с препятствием
        if (barrierContact(new_unit)) {
            finishTheGame();
        }
    }
    else {
        finishTheGame();
    }
}

/**
 * Проверка на змейку
 * @param unit
 * @returns {boolean}
 */
function isSnakeUnit(unit) {
    var check = false;

    if (snake.includes(unit)) {
        check = true;
    }
    return check;
}
/**
 * проверка на еду
 * @param unit
 * @returns {boolean}
 */
function haveFood(unit) {
    var check = false;

    var unit_classes = unit.getAttribute('class').split(' ');

    // Если еда
    if (unit_classes.includes('food-unit')) {
        check = true;
        createFood();
        createBarrier();

        score++;

        // Задание 1 - выводим сколько скушала змейка
        document.getElementById('score').innerText = score;
    }
    return check;
}

/**
 * Создание еды
 */
function createFood() {
    var foodCreated = false;

    while (!foodCreated) {
        // рандом
        var food_x = Math.floor(Math.random() * FIELD_SIZE_X);
        var food_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        var food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0];
        var food_cell_classes = food_cell.getAttribute('class').split(' ');

        // проверка на змейку
        if (!food_cell_classes.includes('snake-unit')) {
            var classes = '';
            for (var i = 0; i < food_cell_classes.length; i++) {
                classes += food_cell_classes[i] + ' ';
            }

            food_cell.setAttribute('class', classes + 'food-unit');
            foodCreated = true;
        }
    }
}

/**
 * Создание препятствий
 * Задание 2
 */
function createBarrier() {
    var barrierCreated = false; // создаем переменную со значение false

    if (document.getElementsByClassName('barrier-unit')[0]){ // проверяю есть ли такой клас
        var deleteBarrier = document.getElementsByClassName('barrier-unit')[0]; // присваеваю этот класс переменной
        deleteBarrier.classList.remove('barrier-unit'); // Удаляю класс
    }


    while (!barrierCreated) { // пока переменная не равна true выполняем функцию
        // рандом
        var food_x = Math.floor(Math.random() * FIELD_SIZE_X); // выбираем ячейку х
        var food_y = Math.floor(Math.random() * FIELD_SIZE_Y); // выбираем ячейку у

        var food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0]; // присваеваем нужную ячейку
        var food_cell_classes = food_cell.getAttribute('class').split(' '); // делаем массив из классов

        // проверка на змейку
        if (!food_cell_classes.includes('snake-unit') && !food_cell_classes.includes('food-unit')) { // если ячейка не содержит данные классы создаем припятстввие
            var classes = ''; // пустая строка
            for (var i = 0; i < food_cell_classes.length; i++) { // перебираем пока не будет количество равное количеству классов в массиве
                classes += food_cell_classes[i] + ' '; // к пустой стоке добаляем клас с пробелом из массива.
            }

            food_cell.setAttribute('class', classes + 'barrier-unit'); // добвляем для ячейки класс
            barrierCreated = true; // меняем переменную что бы выйти из цикла.
        }
    }
}

function barrierContact(unit) {
    var check = false;

    var unit_classes = unit.getAttribute('class').split(' ');

    // Если берьер
    if (unit_classes.includes('barrier-unit')) {
        check = true;
    }
    return check;
}

/**
 * Изменение направления движения змейки
 * @param e - событие
 */
function changeDirection(e) {
    console.log(e);
	switch (e.keyCode) {
        case 37: // Клавиша влево
            if (direction != 'x+') {
                direction = 'x-'
            }
            break;
        case 38: // Клавиша вверх
            if (direction != 'y-') {
                direction = 'y+'
            }
            break;
        case 39: // Клавиша вправо
            if (direction != 'x-') {
                direction = 'x+'
            }
            break;
        case 40: // Клавиша вниз
            if (direction != 'y+') {
                direction = 'y-'
            }
            break;
    }
}

/**
 * Функция завершения игры
 */
function finishTheGame() {
    gameIsRunning = false;
    clearInterval(snake_timer);
    alert('Вы проиграли! Ваш результат: ' + score.toString());
}

/**
 * Новая игра
 */
function refreshGame() {
    location.reload();
}

// Инициализация
window.onload = init;