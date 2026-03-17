const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
// const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const helmet = require("helmet");
const sanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const AppError = require("./utills/appError");
const compress = require("compression");
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const viewRoute = require("./routes/viewRoutes");
const bookingRoute = require('./routes/bookingRoutes');
const app = express();

app.use(morgan("dev"));
app.use(
  "/api",
  rateLimit.rateLimit({
    message: "try in an hour cause your limit",
    max: 100,
    windowMs: 60 * 60 * 1000,
  }),
);
app.use(express.json({ limit: "10kb" }));
const allowedOrigins = [
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
  }),
);

const addCorsHeaders = (req, res, next) => {
  const origin = req.headers.origin || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
};

// 1. Specific subfolders first
app.use("/uploads/users", addCorsHeaders, express.static(path.join(__dirname, "uploads/users")));
app.use("/uploads/games/cover", addCorsHeaders, express.static(path.join(__dirname, "uploads/games/cover")));
app.use("/uploads/games/description", addCorsHeaders, express.static(path.join(__dirname, "uploads/games/description")));

// 2. Fix the "root" /uploads request to look in the users folder too
app.use("/uploads", addCorsHeaders, express.static(path.join(__dirname, "uploads/users")));

// 3. Keep your fallback for games if needed
app.use("/uploads", addCorsHeaders, express.static(path.join(__dirname, "uploads/games/cover")));
app.use("/uploads", addCorsHeaders, express.static(path.join(__dirname, "uploads/games/description")));


app.use(helmet());
app.use(hpp());
app.use(sanitize());
app.use(compress());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "client/build")));
app.use("/api/nexus/users", userRoutes);
app.use("/api/nexus/games", gameRoutes);
app.use("/api/nexus/reviews", reviewRoutes);
app.use("/api/nexus/cart", cartRoutes);
app.use("/api/nexus/bookings", bookingRoute);
app.use("/api/nexus/views", viewRoute);

// catch all other GET requests and serve the React app (for client-side routing)
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.use((req, res, next) => {
  return next(new AppError(`invalid url not found ${req.originalUrl}`, 404));
});
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    const value = err.errmsg.match(/"([^"]*)"/g)[0];
    err.message = `dupicate filed value  ${value}`;
  }
  if (err.name === "castError") {
    err.statuscode = 400;
    err.status = "fail";
    err.message = `invalid value of id ${err.path}:${err.value}`;
  }
  if (err.name === "TokenExpiredError") {
    err.statuscode = 400;
    err.message = "token has expired try again";
  }
  if (err.name === "validationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    err.message = `dupicate filed value ${errors.join(". ")}`;
    err.statuscode = 400;
    err.status = "fail";
  }
  if (err.name === "handleJWTError") {
    err.statuscode = 401;
    err.message = "there is an issue with your jwt token sorry";
  }
  err.statuscode = err.statuscode || 500;
  err.status = err.status || "error";

  res.status(err.statuscode).json({
    message: err.message,
    status: err.status,
    stack: err.stack,
    error: err,
  });
});

module.exports = app;
