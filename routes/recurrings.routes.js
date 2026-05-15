'use strict';

/*
!=======================================================================================
 ! ROUTES/RECURRINGS.ROUTES.JS - Định nghĩa API endpoints cho chi tiêu cố định
!=======================================================================================
*/

const express                  = require('express');
const router                   = express.Router();
const ChiTieuCoDinhController  = require('../controllers/recurrings.controller');

// ? GET  /api/chi-tieu-co-dinh?thang=5&nam=2026
router.get('/',                       ChiTieuCoDinhController.layTheoThang);

// ! POST /api/chi-tieu-co-dinh
router.post('/',                      ChiTieuCoDinhController.them);

// ? PUT  /api/chi-tieu-co-dinh/:id
router.put('/:id',                    ChiTieuCoDinhController.sua);

// ! DEL  /api/chi-tieu-co-dinh/:id
router.delete('/:id',                 ChiTieuCoDinhController.xoa);

// ? PUT  /api/chi-tieu-co-dinh/:id/trang-thai — Toggle đã đóng/chưa đóng
router.put('/:id/trang-thai',         ChiTieuCoDinhController.capNhatTrangThai);

module.exports = router;