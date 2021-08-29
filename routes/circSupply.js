const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin} = require('../middleware');
const {renderCircApi, renderEditCirc, editCirc} = require("../controllers/circSupply");

router.get("/", renderCircApi)

router
    .route("/edit")
    .get(isLoggedIn, isAdmin, renderEditCirc)
    .put(isLoggedIn, isAdmin, editCirc)

module.exports = router;