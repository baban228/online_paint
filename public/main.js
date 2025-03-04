import '../pages/index.css';

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const sizeInput = document.getElementById('size');
const clearButton = document.getElementById('clearButton');
const loginButton = document.getElementById('loginButton');

// Устанавливаем размеры холста
canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 200;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Создаем BroadcastChannel для синхронизации данных между вкладками
const bc = new BroadcastChannel('drawing-channel');

function draw(e) {
    if (!isDrawing) return; // Если мышь не нажата, ничего не делаем
    ctx.strokeStyle = colorInput.value;
    ctx.lineWidth = sizeInput.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];

    // Сохраняем данные о рисовании в localStorage
    saveDrawingData(e.offsetX, e.offsetY);

    // Отправляем данные о рисовании через BroadcastChannel
    bc.postMessage({
        type: 'draw',
        data: {
            lastX,
            lastY,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            color: colorInput.value,
            size: sizeInput.value
        }
    });
}

function saveDrawingData(offsetX, offsetY) {
    let drawingData = JSON.parse(localStorage.getItem('drawingData')) || [];
    drawingData.push({
        lastX,
        lastY,
        offsetX,
        offsetY,
        color: colorInput.value,
        size: sizeInput.value
    });
    localStorage.setItem('drawingData', JSON.stringify(drawingData));
}

function loadDrawingData() {
    const drawingData = JSON.parse(localStorage.getItem('drawingData')) || [];
    drawingData.forEach(data => {
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(data.lastX, data.lastY);
        ctx.lineTo(data.offsetX, data.offsetY);
        ctx.stroke();
    });
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

colorInput.addEventListener('change', () => {
    ctx.strokeStyle = colorInput.value;
});

sizeInput.addEventListener('change', () => {
    ctx.lineWidth = sizeInput.value;
});

clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem('drawingData');
    bc.postMessage({ type: 'clear' });
});

loginButton.addEventListener('click', () => {
    window.open('/blocks/login/login.html', '_blank', 'width=400,height=300');
});

// Добавляем стили для кнопок через JavaScript
document.querySelectorAll('.controls__button').forEach(button => {
    button.style.padding = '10px 20px';
    button.style.margin = '10px 0';
    button.style.border = 'none';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.3s ease';

    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#0056b3';
    });

    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#007bff';
    });
});

// Обрабатываем сообщения от других вкладок
bc.onmessage = (event) => {
    const { type, data } = event.data;
    if (type === 'draw') {
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(data.lastX, data.lastY);
        ctx.lineTo(data.offsetX, data.offsetY);
        ctx.stroke();
    } else if (type === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
};

// Загружаем сохраненные данные при загрузке страницы
loadDrawingData();