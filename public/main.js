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
});

loginButton.addEventListener('click', () => {
    window.location.href = '/login';
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