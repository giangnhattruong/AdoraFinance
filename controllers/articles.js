const wrapAsync = require("../ultils/wrapAsync");
const Article = require("../models/articles");
const { cloudinary } = require("../cloudinary/index");

const date = Date.now();
const paginate = (array, page, size) => {
  return array.slice((page - 1) * size, page * size);
}

module.exports.renderIndex = wrapAsync(async (req, res, next) => {
  const { page = 1, size = 9 } = req.query;
  // Pagination with mongoose-pagination-v2
  // const getPagination = (page, size) => {
  //   const limit = size ? +size : 9;
  //   const offset = page ? (page-1) * limit : 0;
  //   return { limit, offset };
  // };
  // const { limit, offset } = getPagination(page, size);
  // const paginatedArticles = await Article.paginate({}, { limit, offset, sort:{date: "desc"}});
  // const { totalPages } = paginatedArticles;
  // const articles = paginatedArticles.docs;
  const articles = await Article.find({}).sort({ date: "desc"});
  const paginateArticles = paginate(articles, page, size);
  const totalArticles = articles.length;
  const totalPages = (totalArticles % size) !== 0 ? (Math.floor(totalArticles / size) + 1) : (totalArticles / size);
  const groupLimit = 6;
  const totalPaginateGroups = (totalPages % groupLimit) !== 0 ? (Math.floor(totalPages / groupLimit) + 1) : (totalPages / groupLimit);
  const group = (page % groupLimit) !==0 ? (Math.floor(page / groupLimit) + 1) : (page / groupLimit);
  const paginateOffset = (group-1) * groupLimit;
  res.render("news/index", { paginateArticles, totalPages, page, groupLimit, totalPaginateGroups, group, paginateOffset });
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
  const { page = 1, size = 9, q } = req.query;
  const articles = await Article.find({}).sort({ date: "desc"});
  const foundArticles = [];
  articles.forEach((article) => {
    if (article.title.toLowerCase().includes(q.toLowerCase())) {
      foundArticles.push(article);
    }
  });
  const paginateFoundArticles = paginate(foundArticles, page, size);
  const totalArticles = foundArticles.length;
  const totalPages = (totalArticles % size) !== 0 ? (Math.floor(totalArticles / size) + 1) : (totalArticles / size);
  const groupLimit = 6;
  const totalPaginateGroups = (totalPages % groupLimit) !== 0 ? (Math.floor(totalPages / groupLimit) + 1) : (totalPages / groupLimit);
  const group = (page % groupLimit) !==0 ? (Math.floor(page / groupLimit) + 1) : (page / groupLimit);
  const paginateOffset = (group-1) * groupLimit;
  res.render("news/searchArticle", { paginateFoundArticles, q, totalPages, page, groupLimit, totalPaginateGroups, group, paginateOffset });
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
