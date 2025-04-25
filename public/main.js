import '../pages/index.css';

class DrawingApp {
    constructor(canvasId, colorInputId, sizeInputId, fillButtonId, saveButtonId, clearButtonId, loginButtonId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.colorInput = document.getElementById(colorInputId);
        this.sizeInput = document.getElementById(sizeInputId);
        this.fillButton = document.getElementById(fillButtonId);
        this.saveButton = document.getElementById(saveButtonId);
        this.clearButton = document.getElementById(clearButtonId);
        this.loginButton = document.getElementById(loginButtonId);

        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.shapeMode = null; // null, 'rectangle', 'circle'
        this.currentShape = null;
        this.shapes = [];

        this.bc = new BroadcastChannel('drawing-channel');

        this.init();
    }

    init() {
        this.setCanvasSize();
        this.addEventListeners();
        this.loadDrawingData();
        this.styleButtons();
        this.loginButton.addEventListener('click', this.showLoginForm.bind(this)); // Добавляем обработчик для кнопки "Войти"
    }

    showLoginForm() {
        const loginForm = document.getElementById('loginForm');
        loginForm.style.display = 'block'; // Показываем форму
    
        // Добавляем обработчик события для закрытия формы при отправке
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Предотвращаем стандартное поведение формы
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
    
            // Здесь можно добавить логику для проверки данных формы
            console.log(`Username: ${username}, Password: ${password}`);
    
            loginForm.style.display = 'none'; // Скрываем форму после отправки
        });
    }
    
    setCanvasSize() {
        this.canvas.width = window.innerWidth - 50;
        this.canvas.height = window.innerHeight - 200;
    }

    draw(e) {
        if (!this.isDrawing) return;
        this.ctx.strokeStyle = this.colorInput.value;
        this.ctx.lineWidth = this.sizeInput.value;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.stroke();
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];

        this.bc.postMessage({
            type: 'draw',
            data: {
                lastX: this.lastX,
                lastY: this.lastY,
                offsetX: e.offsetX,
                offsetY: e.offsetY,
                color: this.colorInput.value,
                size: this.sizeInput.value
            }
        });

        this.saveDrawingData(this.lastX, this.lastY, e.offsetX, e.offsetY, this.colorInput.value, this.sizeInput.value);
    }

    startDrawing(e) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    addEventListeners() {
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        this.colorInput.addEventListener('change', () => {
            this.ctx.strokeStyle = this.colorInput.value;
        });

        this.sizeInput.addEventListener('change', () => {
            this.ctx.lineWidth = this.sizeInput.value;
        });

        this.fillButton.addEventListener('click', () => {
            this.fillShape();
        });

        this.saveButton.addEventListener('click', () => {
            this.saveImage();
        });

        this.clearButton.addEventListener('click', () => {
            this.clearCanvas();
            this.bc.postMessage({ type: 'clear' });
        });



        this.bc.onmessage = (event) => {
            const { type, data } = event.data;
            if (type === 'draw') {
                this.ctx.strokeStyle = data.color;
                this.ctx.lineWidth = data.size;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(data.lastX, data.lastY);
                this.ctx.lineTo(data.offsetX, data.offsetY);
                this.ctx.stroke();
                this.saveDrawingData(data.lastX, data.lastY, data.offsetX, data.offsetY, data.color, data.size);
            } else if (type === 'clear') {
                this.clearCanvas();
                this.clearDrawingData();
            } else if (type === 'fill') {
                this.ctx.fillStyle = data.color;
                this.ctx.beginPath();
                this.ctx.moveTo(data.lastX, data.lastY);
                this.ctx.lineTo(data.offsetX, data.offsetY);
                this.ctx.fill();
                this.saveDrawingData(data.lastX, data.lastY, data.offsetX, data.offsetY, data.color, 1);
            }
        };

        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.canvas.addEventListener('mousedown', this.handleShapeClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleShapeDrag.bind(this));
        this.canvas.addEventListener('mouseup', this.handleShapeRelease.bind(this));
    }

    handleDoubleClick(e) {
        if (this.shapeMode === 'rectangle') {
            this.currentShape = this.createRectangle(e.offsetX, e.offsetY);
        } else if (this.shapeMode === 'circle') {
            this.currentShape = this.createCircle(e.offsetX, e.offsetY);
        }
        if (this.currentShape) {
            this.shapes.push(this.currentShape);
            this.redrawShapes();
            this.saveShapesData();
        }
    }

    createRectangle(x, y) {
        const width = 100; // Размеры прямоугольника
        const height = 50;
        return {
            type: 'rectangle',
            x: x - width / 2,
            y: y - height / 2,
            width: width,
            height: height,
            color: this.colorInput.value,
            isDragging: false
        };
    }

    createCircle(x, y) {
        const radius = 50; // Радиус круга
        return {
            type: 'circle',
            x: x,
            y: y,
            radius: radius,
            color: this.colorInput.value,
            isDragging: false
        };
    }

    redrawShapes() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.shapes.forEach(shape => {
            this.ctx.strokeStyle = shape.color;
            this.ctx.fillStyle = shape.color;
            if (shape.type === 'rectangle') {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.fill();
            }
        });
    }

    fillShape() {
        const fillColor = this.colorInput.value;
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixelStack = [[this.lastX, this.lastY]];

        const targetColor = this.getPixel(imageData, this.lastX, this.lastY);
        const replacementColor = [parseInt(fillColor.substring(1, 3), 16), parseInt(fillColor.substring(3, 5), 16), parseInt(fillColor.substring(5, 7), 16), 255];

        if (targetColor.toString() === replacementColor.toString()) return;

        while (pixelStack.length) {
            const [x, y] = pixelStack.pop();
            if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) continue;

            const index = (y * this.canvas.width + x) * 4;
            if (imageData.data[index] !== targetColor[0] ||
                imageData.data[index + 1] !== targetColor[1] ||
                imageData.data[index + 2] !== targetColor[2] ||
                imageData.data[index + 3] !== targetColor[3]) continue;

            imageData.data[index] = replacementColor[0];
            imageData.data[index + 1] = replacementColor[1];
            imageData.data[index + 2] = replacementColor[2];
            imageData.data[index + 3] = replacementColor[3];

            pixelStack.push([x - 1, y]);
            pixelStack.push([x + 1, y]);
            pixelStack.push([x, y - 1]);
            pixelStack.push([x, y + 1]);
        }

        this.ctx.putImageData(imageData, 0, 0);

        // Отправляем сообщение о заливке через BroadcastChannel
        this.bc.postMessage({
            type: 'fill',
            data: {
                lastX: this.lastX,
                lastY: this.lastY,
                offsetX: this.lastX,
                offsetY: this.lastY,
                color: fillColor
            }
        });

        this.saveDrawingData(this.lastX, this.lastY, this.lastX, this.lastY, fillColor, 1);
    }

    getPixel(imageData, x, y) {
        const index = (y * imageData.width + x) * 4;
        return [
            imageData.data[index],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3]
        ];
    }

    handleShapeClick(e) {
        this.shapes.forEach(shape => {
            if (this.isPointInShape(e.offsetX, e.offsetY, shape)) {
                shape.isDragging = true;
                this.dragOffsetX = e.offsetX - shape.x;
                this.dragOffsetY = e.offsetY - shape.y;
            }
        });
    }

    handleShapeDrag(e) {
        this.shapes.forEach(shape => {
            if (shape.isDragging) {
                shape.x = e.offsetX - this.dragOffsetX;
                shape.y = e.offsetY - this.dragOffsetY;
                this.redrawShapes();
                this.saveShapesData();
            }
        });
    }

    handleShapeRelease(e) {
        this.shapes.forEach(shape => {
            shape.isDragging = false;
        });
    }

    isPointInShape(x, y, shape) {
        if (shape.type === 'rectangle') {
            return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
        } else if (shape.type === 'circle') {
            const dx = x - shape.x;
            const dy = y - shape.y;
            return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
        }
        return false;
    }

    styleButtons() {
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
    }

    loadDrawingData() {
        const drawingData = JSON.parse(localStorage.getItem('drawingData')) || [];
        drawingData.forEach(data => {
            this.ctx.strokeStyle = data.color;
            this.ctx.lineWidth = data.size;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(data.lastX, data.lastY);
            this.ctx.lineTo(data.offsetX, data.offsetY);
            this.ctx.stroke();
        });
    }

    saveDrawingData(lastX, lastY, offsetX, offsetY, color, size) {
        let drawingData = JSON.parse(localStorage.getItem('drawingData')) || [];
        drawingData.push({
            lastX,
            lastY,
            offsetX,
            offsetY,
            color,
            size
        });
        localStorage.setItem('drawingData', JSON.stringify(drawingData));
    }

    clearDrawingData() {
        localStorage.removeItem('drawingData');
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.shapes = [];
        this.saveShapesData();
    }

    saveShapesData() {
        localStorage.setItem('shapesData', JSON.stringify(this.shapes));
    }

    loadShapesData() {
        const shapesData = JSON.parse(localStorage.getItem('shapesData')) || [];
        this.shapes = shapesData;
        this.redrawShapes();
    }

    saveImage() {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

// Создание экземпляра класса DrawingApp
const drawingApp = new DrawingApp(
    'drawingCanvas',
    'color',
    'size',
    'fillButton',
    'saveButton',
    'clearButton',
    'loginButton'
);

// Загрузка сохраненных фигур при загрузке страницы
drawingApp.loadShapesData();