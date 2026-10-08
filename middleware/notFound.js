// JSON 404 catch-all. Registered after all routes, before errorHandler.
module.exports = function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};
