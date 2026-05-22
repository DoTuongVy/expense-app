'use strict';

/*
!=======================================================================================
 ! ROUTES/PERIODS.ROUTES.JS - Định nghĩa API endpoints cho chốt tháng
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
// ? PUT /api/ky-thang/:id/huy-chot — huỷ chốt tháng
router.put('/:id/huy-chot', KyThangController.huyChot);

// ? PUT /api/ky-thang/:id/cap-nhat-sodu — cập nhật số dư không chốt tháng
router.put('/:id/cap-nhat-sodu', KyThangController.capNhatSoDu);

module.exports = router;
