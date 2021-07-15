const mongoose = require("mongoose");
const { Schema } = mongoose;
const { cloudinary } = require("../cloudinary");
const slug = require("mongoose-slug-generator");
const domPurifier = require("dompurify");
const { JSDOM } = require("jsdom");
const htmlPurify = domPurifier(new JSDOM().window);
const { stripHtml } = require("string-strip-html");

mongoose.plugin(slug);

const imageSchema = new Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const options = { toJSON: { virtuals: true } };

const articleSchema = new Schema(
  {
    category: String,
    title: String,
    images: [imageSchema],
    description: String,
    date: Number,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    snippet: String,
    slug: {
      type: String,
      slug: "title",
      unique: true,
      slug_padding_size: 2,
    },
  },
  options
);

articleSchema.virtual("dateModified").get(function () {
  const fullDate = new Date(this.date);
  const date = fullDate.getDate();
  const month = fullDate.getMonth() + 1;
  const year = fullDate.getFullYear();
  return `${date}/${month}/${year}`;
});

articleSchema.pre("validate", function (next) {
  if (this.description) {
    this.description = htmlPurify.sanitize(this.description);
    this.snippet = stripHtml(this.description.substring(0,300)).result
  }
  next();
});

articleSchema.post("findOneAndDelete", async function (article) {
  if (article.images.length) {
    article.images.forEach(function (image) {
      cloudinary.uploader.destroy(image.filename);
    });
  }
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
