'use strict';

/*
!=======================================================================================
 ! ROUTES/DEBTS.ROUTES.JS
!=======================================================================================
*/

const express      = require('express');
const router       = express.Router();
const NoController = require('../controllers/debts.controller');

// ? GET  /api/no?trangThai=active
router.get('/',           NoController.layTatCa);
// ! POST /api/no
router.post('/',          NoController.them);
// ? PUT  /api/no/:id/tra — cập nhật số đã trả/thu
router.put('/:id/tra',    NoController.capNhatDaTra);
// ! DEL  /api/no/:id
router.delete('/:id',     NoController.xoa);

module.exports = router;
