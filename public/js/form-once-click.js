const form = document.querySelector('form')
const btn = document.querySelector('form button')
form.addEventListener('submit', function (e) {
    btn.disabled = true;
}, {once: true})