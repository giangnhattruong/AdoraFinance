const express = require("express");
const router = express.Router();
const { isLoggedIn, isAuthor, validateArticle, uploadImages } = require('../middleware');
const { renderIndex, renderNewArticle, createNewArticle, renderArticle, renderEditArticle, editArticle, deleteArticle, renderSearchArticle } = require('../controllers/articles');

router
    .route("/")
    .get(renderIndex)
    .post(isLoggedIn, uploadImages, validateArticle, createNewArticle)

router.get("/search", renderSearchArticle)

router.get("/article/new", isLoggedIn, renderNewArticle);

router
    .route("/article/:slug/:id")
    .get(renderArticle)
    .put(isLoggedIn, isAuthor, uploadImages, validateArticle, editArticle)
    .delete(isLoggedIn, isAuthor, deleteArticle)

router.get('/article/:slug/:id/edit', isLoggedIn, isAuthor, renderEditArticle)

module.exports = router;