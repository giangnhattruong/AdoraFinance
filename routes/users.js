const express = require('express');
const router = express.Router();
const { renderRegisterForm, register, renderLoginForm, authenticate, login, logout } = require('../controllers/users');

// router.route('/register')
//     .get(renderRegisterForm)
//     .post(register)

router.route('/login')
    .get(renderLoginForm)
    .post(authenticate, login)

router.get('/logout', logout)

module.exports = router;
