const wrapAsync = require("../ultils/wrapAsync");
const Article = require("../models/articles");
const { cloudinary } = require("../cloudinary/index");

const date = Date.now();

module.exports.renderIndex = wrapAsync(async (req, res, next) => {
  const articles = await Article.find({});
  res.render("news/index", { articles });
});

module.exports.renderArticle = wrapAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id).populate("author");
  if (!article) {
    req.flash(
      "error",
      "Sorry, the article you are looking for does not exist!"
    );
    return res.redirect("/article");
  }
  res.render("news/article", { article });
});

module.exports.renderNewArticle = (req, res) => {
  res.render("news/newArticle");
};

module.exports.createNewArticle = wrapAsync(async (req, res, next) => {
  const images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  const article = new Article(req.body.article);
  article.author = req.user._id;
  article.images = images;
  article.date = Date.now();
  await article.save();
  req.flash("success", "Successfully created a new article!");
  res.redirect(`/news/article/${article._id}`);
});

module.exports.renderEditArticle = wrapAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    req.flash("error", "Sorry, we can not find this article!");
    return res.redirect("/news");
  }
  res.render("news/editArticle", { article });
});

module.exports.renderSearchArticle = wrapAsync(async (req, res, next) => {
  const articles = await Article.find({});
  const foundArticles = [];
  articles.forEach((article) => {
    if (article.name.toLowerCase().includes(req.query.q.toLowerCase())) {
      foundArticles.push(article);
    }
  });
  res.render("news/searchArticle", { foundArticles });
});

module.exports.editArticle = wrapAsync(async (req, res, next) => {
  console.log(`Deleting: ${req.body.deleteImages}`);
  const { id } = req.params;
  const { title, category, description } = req.body.article;
  const article = await Article.findById(id);
  const images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  article.images.push(...images);
  await Article.findByIdAndUpdate(
    id,
    {
      title,
      category,
      description,
      images: article.images,
      date: Date.now()
    },
    {
      runValidation: true,
      new: true,
    }
  );
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    };
    await article.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated a article!");
  res.redirect(`/news/article/${req.params.id}`);
});

module.exports.deleteArticle = wrapAsync(async (req, res, next) => {
  await Article.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted a article!");
  res.redirect("/news");
});
