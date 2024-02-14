const NotFound = function (req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const ErrorHandler = function (err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stackc: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = {NotFound, ErrorHandler}