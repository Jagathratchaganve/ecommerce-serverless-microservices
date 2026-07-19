const express = require("express");

const router = express.Router();

const productController = require("../controllers/productController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.use(authenticate);

router.get(
    "/",
    authorize("Admin", "User"),
    productController.getAllProducts
);

router.get(
    "/:id",
    authorize("Admin", "User"),
    productController.getProductById
);

router.post(
    "/",
    authorize("Admin"),
    productController.createProduct
);

router.put(
    "/:id",
    authorize("Admin"),
    productController.updateProduct
);

router.delete(
    "/:id",
    authorize("Admin"),
    productController.deleteProduct
);

module.exports = router;