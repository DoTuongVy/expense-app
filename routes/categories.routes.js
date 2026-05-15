'use strict';

/*
!=======================================================================================
 ! ROUTES/CATEGORIES.ROUTES.JS - Định nghĩa API endpoints cho danh mục
!=======================================================================================
*/

const express          = require('express');
const router           = express.Router();
const DanhMucController = require('../controllers/categories.controller');

// ? GET  /api/danh-muc?nhom=expense
router.get('/',       DanhMucController.layTatCa);
// ! POST /api/danh-muc
router.post('/',      DanhMucController.them);
// ? PUT  /api/danh-muc/:id
router.put('/:id',    DanhMucController.sua);
// ! DEL  /api/danh-muc/:id  — ẩn, không xoá cứng
router.delete('/:id', DanhMucController.an);

module.exports = router;
