const express = require('express');

const orderRoutes =
require('./routes/orderRoutes');

const requestLogger =
require('./middleware/requestLogger');

const errorHandler =
require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use(
    '/api/orders',
    orderRoutes
);

app.use(errorHandler);

module.exports = app;