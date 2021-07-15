const form = document.querySelector('form')
const btn = document.querySelector('form button')
form.addEventListener('submit', function (e) {
    btn.disabled = true;
    return this.submit();
})

// (function () {
//     const form = document.querySelector('form')
//     let allowSubmit = true;
//     form.onsubmit = function () {
//        if (allowSubmit)
//            allowSubmit = false;
//        else 
//            return false;
//     }
// })();