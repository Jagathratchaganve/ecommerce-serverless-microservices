const express = require('express');

const router = express.Router();

const inventoryController =
require('../controllers/inventoryController');

router.get(
    '/',
    inventoryController.getAllInventory
);

router.post(
    '/',
    inventoryController.createInventory
);

router.get(
    '/:productId',
    inventoryController.getInventoryByProductId
);

router.put(
    '/:productId',
    inventoryController.updateInventory
);

router.delete(
    '/:productId',
    inventoryController.deleteInventory
);

module.exports = router;