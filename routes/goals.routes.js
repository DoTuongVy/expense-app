'use strict';

/*
!=======================================================================================
 ! ROUTES/GOALS.ROUTES.JS - Định nghĩa API endpoints cho mục tiêu
!=======================================================================================
*/

const express          = require('express');
const router           = express.Router();
const MucTieuController = require('../controllers/goals.controller');

// ? GET  /api/muc-tieu?thang=4&nam=2026
router.get('/',       MucTieuController.layTheoThang);
// ! POST /api/muc-tieu — đặt hoặc cập nhật mục tiêu (upsert)
router.post('/',      MucTieuController.datMucTieu);
// ? DEL  /api/muc-tieu/:id
router.delete('/:id', MucTieuController.xoa);

module.exports = router;
