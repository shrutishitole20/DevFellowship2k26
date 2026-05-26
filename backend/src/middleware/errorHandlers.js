function apiErrorHandler(err, req, res, next) {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'An internal server error occurred while processing your request.',
    details: err.message
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found.' });
}

module.exports = {
  apiErrorHandler,
  notFoundHandler
};
