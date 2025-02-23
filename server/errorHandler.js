// errorHandler.js
export const errorHandler = (err, req, res, next) => {
    // Log détaillé de l'erreur avec stack trace
    console.error('----------------------------------------');
    console.error(`Erreur: ${err.message}`);
    console.error('Stack trace:', err.stack);
    console.error('----------------------------------------');
  
    // En développement, renvoyer le message et le stack trace
    if (process.env.NODE_ENV === 'development') {
      res.status(err.status || 500).json({
        message: err.message,
        stack: err.stack
      });
    } else {
      // En production, on peut renvoyer un message générique
      res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
      });
    }
  };
  