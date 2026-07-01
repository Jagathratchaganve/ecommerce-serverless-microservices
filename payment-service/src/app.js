const express = require('express');

const paymentRoutes =
require('./routes/paymentRoutes');

const requestLogger =
require('./middleware/requestLogger');

const errorHandler =
require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use(
    '/api/payments',
    paymentRoutes
);

app.use(errorHandler);

module.exports = app;