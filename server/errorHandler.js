// errorHandler.js
export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;

    console.error('----------------------------------------');
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} – ${status}`);
    console.error(`Erreur: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error('Stack trace:', err.stack);
    }
    console.error('----------------------------------------');

    if (process.env.NODE_ENV === 'development') {
        return res.status(status).json({
            message: err.message,
            stack: err.stack
        });
    }

    // En production : message générique pour les 500, message explicite pour les 4xx
    const message = status >= 500 ? 'Internal Server Error' : err.message;
    res.status(status).json({ message });
};
  