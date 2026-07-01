const express = require('express');

const inventoryRoutes =
require('./routes/inventoryRoutes');

const requestLogger =
require('./middleware/requestLogger');

const errorHandler =
require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use(
    '/api/inventory',
    inventoryRoutes
);

app.use(errorHandler);

module.exports = app;