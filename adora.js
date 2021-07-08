if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const flash = require("connect-flash");
const session = require("express-session");
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");
const ExpressError = require("./ultils/ExpressError");
const wrapAsync = require("./ultils/wrapAsync");
const { validateContact } = require("./middleware");
const secret = process.env.SECRET || "simplesectionsecret";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const sessionOptions = {
  name: "in_mkto", // set random name for sessionID
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,    // this should only turn on when we use HTTPS
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionOptions));

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

app.use(helmet());
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = ["https://fonts.gstatic.com"];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/jamestan/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587 || 2525,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

app.get("/", (req, res) => {
  res.render("home", { req });
});

app.get("/about", (req, res) => {
  res.render("about", { req });
});

app.get("/contact", (req, res) => {
  res.render("contact", { req });
});

app.post("/send", (req, res) => {
  //1.
  let form = new multiparty.Form();
  let data = {};
  form.parse(req, function (err, fields) {
    console.log(fields);
    Object.keys(fields).forEach(function (property) {
      data[property] = fields[property].toString();
    });

    //2. You can configure the object however you want
    const mail = {
      from: data.name,
      to: process.env.EMAIL,
      subject: "Request from Adora finance user",
      text: `${data.name} <${data.email}> \n${data.message}`,
    };

    //3.
    transporter.sendMail(mail, (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send("Something went wrong.");
        req.flash("error", "Something went wrong.");
      } else {
        res.status(200).send("Email successfully sent to recipient!");
        req.flash("success", "Successfully sent your message!");
      }
    });
  });
  res.redirect('/contact');
});

// app.post("/contact", validateContact, wrapAsync((req, res) => {}));

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found!", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(status).render("error", { req, err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`APP IS LISTENING ON PORT ${port}...`);
});
