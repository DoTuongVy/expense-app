'use strict';

/*
!=======================================================================================
 ! ROUTES/PERIODS.ROUTES.JS
!=======================================================================================
*/

const express          = require('express');
const router           = express.Router();
const KyThangController = require('../controllers/periods.controller');

// ? GET /api/ky-thang — danh sách tất cả kỳ
router.get('/',              KyThangController.layTatCa);
// ? GET /api/ky-thang/hien-tai — kỳ tháng hiện tại
router.get('/hien-tai',      KyThangController.layHienTai);
// ! POST /api/ky-thang/:id/chot — chốt tháng
router.post('/:id/chot',     KyThangController.chotThang);

module.exports = router;
