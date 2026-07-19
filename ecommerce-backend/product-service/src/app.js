const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173"
        ],
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],
        credentials: true
    })
);

app.options("*", cors());

app.use(express.json());

app.use(requestLogger);

app.use("/api/products", productRoutes);

app.use(errorHandler);

module.exports = app;

/*const express = require('express');

const productRoutes =
require('./routes/productRoutes');

const requestLogger =
require('./middleware/requestLogger');

const errorHandler =
require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use('/api/products', productRoutes);

app.use(errorHandler);

module.exports = app;*/