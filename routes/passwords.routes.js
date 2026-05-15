'use strict';

/*
!=======================================================================================
 ! ROUTES/PASSWORDS.ROUTES.JS - Định nghĩa API endpoints cho mật khẩu cá nhân
!=======================================================================================
*/

const express            = require('express');
const router             = express.Router();
const MatKhauController  = require('../controllers/passwords.controller');

// ? GET  /api/mat-khau
router.get('/',                             MatKhauController.layTatCa);
// ? GET  /api/mat-khau/nhom
router.get('/nhom',                         MatKhauController.layNhomUnique);
// ? GET  /api/mat-khau/:id
router.get('/:id',                          MatKhauController.layTheoId);
// ! POST /api/mat-khau
router.post('/',                            MatKhauController.them);
// ? PUT  /api/mat-khau/:id
router.put('/:id',                          MatKhauController.sua);
// ! DEL  /api/mat-khau/:id/lich-su/:lichSuId
router.delete('/:id/lich-su/:lichSuId',    MatKhauController.xoaLichSu);
// ! DEL  /api/mat-khau/:id
router.delete('/:id',                       MatKhauController.an);

module.exports = router;