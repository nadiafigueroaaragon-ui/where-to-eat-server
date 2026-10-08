// Registered LAST. Always replies { message }.
module.exports = function errorHandler(err, req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 400;
    message = `${Object.keys(err.keyValue || {})[0] || 'Value'} already exists`;
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Server error' : message });
};
