'use strict';

/*
!=======================================================================================
 ! ROUTES/REPORTS.ROUTES.JS
!=======================================================================================
*/

const express          = require('express');
const router           = express.Router();
const BaoCaoController  = require('../controllers/reports.controller');

// ? GET /api/bao-cao/thang?thang=4&nam=2026
router.get('/thang', BaoCaoController.baoCaoThang);
// ! GET /api/bao-cao/nam?nam=2026
router.get('/nam',   BaoCaoController.baoCaoNam);

module.exports = router;
