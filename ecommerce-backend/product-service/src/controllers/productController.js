const productService = require('../services/productService');

async function getAllProducts(req, res) {
    try {
        const products = await productService.getProducts();

        res.status(200).json(products);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function createProduct(req, res) {
    try {
        const product = await productService.createProduct(
            req.body,
            req.headers.authorization
        );

        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            message: error.message
        });
    }
}

async function getProductById(req, res) {

    const product =
    await productService.getProductById(
        req.params.id
    );

    if (!product) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    res.json(product);
}

async function updateProduct(req, res) {

    const updatedProduct =
    await productService.updateProduct(
        req.params.id,
        req.body
    );

    if (!updatedProduct) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    res.json(updatedProduct);
}

async function deleteProduct(req, res) {

    const deletedProduct =
    await productService.deleteProduct(
        req.params.id
    );

    if (!deletedProduct) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    res.json({
        message: 'Product deleted successfully'
    });
}

module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
};