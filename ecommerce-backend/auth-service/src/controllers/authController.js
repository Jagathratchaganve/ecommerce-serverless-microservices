const authService = require("../services/authService");
const logger = require("../config/logger");

// Health Check
exports.healthCheck = async (req, res) => {
    try {

        logger.info("Health Check API Invoked");

        const response = await authService.healthCheck();

        res.status(200).json(response);

    } catch (error) {

        logger.error(error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Signup
exports.signUp = async (req, res) => {

    try {

        logger.info("Signup API Invoked");

        const response = await authService.signUp(req.body);

        res.status(201).json(response);

    } catch (error) {

        logger.error(error.message);

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// Confirm Signup
exports.confirmSignUp = async (req, res) => {

    try {

        logger.info("Confirm Signup API Invoked");

        const response = await authService.confirmSignUp(req.body);

        res.status(200).json(response);

    } catch (error) {

        logger.error(error.message);

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// Login
exports.login = async (req, res) => {

    try {

        logger.info("Login API Invoked");

        const response = await authService.login(req.body);

        res.status(200).json(response);

    } catch (error) {

        logger.error(error.message);

        res.status(401).json({
            success: false,
            message: error.message
        });

    }

};

exports.adminCreateUser = async (req, res) => {

    try {

        const response = await authService.adminCreateUser(req.body);

        res.status(201).json(response);

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};