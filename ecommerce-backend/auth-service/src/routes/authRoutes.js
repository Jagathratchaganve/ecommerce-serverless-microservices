const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

// Health Check
router.get("/health", authController.healthCheck);

// Signup
router.post("/signup", authController.signUp);

// Confirm Signup
router.post("/confirm-signup", authController.confirmSignUp);

// Login
router.post("/login", authController.login);

router.post(
    "/admin/create-user",
    authController.adminCreateUser
);

module.exports = router;