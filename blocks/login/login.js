import './/login.css';
import '../../pages/index.css';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Вход успешен!');
                window.close(); // Закрываем окно входа
                window.opener.location.reload(); // Перезагружаем родительское окно
            } else {
                alert('Неверное имя пользователя или пароль.');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при входе.');
        });
    });
});