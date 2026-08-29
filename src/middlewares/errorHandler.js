export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || err.statusCode || (
    err.code === 'LIMIT_FILE_SIZE' ? 413 :
    err.code === 'LIMIT_UNEXPECTED_FILE' ? 400 :
    err.name === 'UnauthorizedError' ? 401 :
    err.message && err.message.includes('CORS') ? 403 :
    500
  );

  const message = err.message || 'Internal server error';

  res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
};
