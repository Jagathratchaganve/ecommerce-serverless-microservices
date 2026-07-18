const express = require('express');

const router = express.Router();

const inventoryController =
require('../controllers/inventoryController');

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.use(authenticate);

router.get(
    "/",
    authorize("Admin"),
    inventoryController.getAllInventory
);



router.get(
     "/:productId",
    authorize("Admin", "User"),
    inventoryController.getInventoryByProductId
);

router.post(
    "/",
    authorize("Admin"),
    inventoryController.createInventory
);

router.put(
     "/:productId",
    authorize("Admin"),
    inventoryController.updateInventory
);

router.delete(
    "/:productId",
    authorize("Admin"),
    inventoryController.deleteInventory
);

module.exports = router;