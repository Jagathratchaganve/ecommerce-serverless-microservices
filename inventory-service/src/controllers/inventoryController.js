const inventoryService =
require('../services/inventoryService');

async function getAllInventory(req, res) {

    try {

        const inventory =
        await inventoryService.getInventory();

        res.status(200).json(inventory);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function createInventory(req, res) {

    try {

        const inventory =
        await inventoryService.createInventory(
            req.body
        );

        res.status(201).json(inventory);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function getInventoryByProductId(req, res) {

    const item =
    await inventoryService.getInventoryByProductId(
        req.params.productId
    );

    if (!item) {

        return res.status(404).json({
            message: 'Inventory not found'
        });

    }

    res.json(item);
}

async function updateInventory(req, res) {

    const updatedItem =
    await inventoryService.updateInventory(
        req.params.productId,
        req.body
    );

    if (!updatedItem) {

        return res.status(404).json({
            message: 'Inventory not found'
        });

    }

    res.json(updatedItem);
}

async function deleteInventory(req, res) {

    const deletedItem =
    await inventoryService.deleteInventory(
        req.params.productId
    );

    if (!deletedItem) {

        return res.status(404).json({
            message: 'Inventory not found'
        });

    }

    res.json({
        message:
        'Inventory deleted successfully'
    });
}

module.exports = {
    getAllInventory,
    createInventory,
    getInventoryByProductId,
    updateInventory,
    deleteInventory
};