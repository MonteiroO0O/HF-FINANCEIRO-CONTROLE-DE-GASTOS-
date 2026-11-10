const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas Públicas (Auth)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Rotas Protegidas (JWT Middleware)
router.get('/transactions', authMiddleware, transactionController.getTransactions);
router.post('/transactions', authMiddleware, transactionController.createTransaction);
router.delete('/transactions/:id', authMiddleware, transactionController.deleteTransaction);

module.exports = router;