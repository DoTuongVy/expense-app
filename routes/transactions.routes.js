'use strict';

/*
!=======================================================================================
 ! ROUTES/TRANSACTIONS.ROUTES.JS - Định nghĩa API endpoints cho giao dịch
!=======================================================================================
*/

const express           = require('express');
const router            = express.Router();
const GiaoDichController = require('../controllers/transactions.controller');

// ? GET  /api/giao-dich?thang=4&nam=2026
router.get('/',      GiaoDichController.layDanhSach);
// ! POST /api/giao-dich
router.post('/',     GiaoDichController.them);
// ? PUT  /api/giao-dich/:id
router.put('/:id',   GiaoDichController.sua);
// ! DEL  /api/giao-dich/:id
router.delete('/:id', GiaoDichController.xoa);

module.exports = router;
