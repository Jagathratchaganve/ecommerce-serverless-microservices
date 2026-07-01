const express = require('express');

const cartRoutes =
require('./routes/cartRoutes');

const requestLogger =
require('./middleware/requestLogger');

const errorHandler =
require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use(
    '/api/cart',
    cartRoutes
);

app.use(errorHandler);

module.exports = app;