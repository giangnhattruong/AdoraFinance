const mongoose = require("mongoose");
const { Schema } = mongoose;
const { cloudinary } = require("../cloudinary");

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

articleSchema.post("findOneAndDelete", async function (article) {
  if (article.images.length) {
    article.images.forEach(function (image) {
      cloudinary.uploader.destroy(image.filename);
    });
  }
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article
