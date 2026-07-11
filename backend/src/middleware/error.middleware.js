/**
 * Central Express error handler.
 * Must be registered AFTER all routes with exactly 4 params.
 */
function errorHandler(err, _req, res, _next) {
  console.error('[Error]', err.message);

  // Multer-specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File size exceeds the 20 MB limit.' });
  }
  if (err.message === 'Only CSV files are allowed') {
    return res.status(415).json({ error: err.message });
  }

  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    error: err.message || 'Internal server error.',
  });
}

module.exports = { errorHandler };
