if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const path = require("path");
const ejsMate = require("ejs-mate");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const flash = require("connect-flash");
const session = require("express-session");
// const { validateContact } = require("./middleware");
const ExpressError = require("./ultils/ExpressError");
const { sendEmail } = require("./controllers/contact");
const secret = process.env.SECRET || "simplesessionsecret";
const dbUrl = process.env.DB_URL;
const email = process.env.EMAIL;
const pass = process.env.PASS;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended:true }));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24*60*60,
  crypto: {
      secret
  }
});

const sessionOptions = {
  store,
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
const fontSrcUrls = [
  "https://fonts.gstatic.com",
];
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
        "https://res.cloudinary.com/jamestan/",
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.get("/", (req, res) => {
  res.render("home", { req });
});

app.get("/about", (req, res) => {
  res.render("about", { req });
});

app.get("/contact", (req, res) => {
  res.render("contact", { req });
});

// app.post("/send", sendEmail);

// POST route from contact form
app.post('/contact', (req, res) => {

  // Instantiate the SMTP server
  const smtpTrans = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: email,
      pass: pass,
    }
  })

  // Specify what the email will look like
  const mailOpts = {
    from: 'Your sender info here', // This is ignored by Gmail
    to: email,
    subject: 'New message from contact',
    text: `${req.body.name} (${req.body.email}) says: ${req.body.message}`
  }

  // Attempt to send the email
  smtpTrans.sendMail(mailOpts, (error, response) => {
    if (error) {
      req.flash("error", "Something went wrong."); // Show a page indicating failure
    }
    else {
      req.flash("success", "Successfully sent your message!"); // Show a page indicating success
    }
    res.redirect('/contact');
  })
})

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
