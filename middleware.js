const { contactSchema, articleSchema } = require('./joiSchema');
const ExpressError = require('./ultils/ExpressError');
const Article = require("./models/articles")
const multer = require('multer');
const { storage } = require('./cloudinary/index');
const upload = multer({ storage });
const uploadMany = upload.array('image', 6);
const adminId = process.env.ADORA_ADMIN_ID;

module.exports.validateContact = (req, res, next) => {
    const { error } = contactSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.validateArticle = (req, res, next) => {
    const { error } = articleSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must login first!');
        return res.redirect('/user/login');
    }
    next();
};

module.exports.isAuthor = async (req, res, next) => {
    const article = await Article.findById(req.params.id);
    if (!article.author.equals(req.user._id) && !article.author.equals(adminId)) {
        req.flash('error', 'You do not have permission.');
        return res.redirect(`/news/article/${req.params.id}`);
    };
    next();
};

module.exports.uploadImages = (req, res, next) => {
    uploadMany(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            req.flash('error', 'Uploading failed.')
            return res.redirect(`/news/`);
        } else if (err) {
            // An unknown error occurred when uploading.
            req.flash('error', 'Uploading failed.')
            return res.redirect(`/news/`);
        }
        next();
    })
};