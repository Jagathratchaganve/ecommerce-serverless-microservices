const logger = require('../services/logger');

function requestLogger(req, res, next) {

    logger.info({
        method: req.method,
        url: req.originalUrl
    });

    next();
}

module.exports = requestLogger;