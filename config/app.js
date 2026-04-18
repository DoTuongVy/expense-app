'use strict';

/*
!=======================================================================================
 ! CONFIG/APP.JS — Khởi tạo Express và đăng ký middleware + routes
!=======================================================================================
*/

const express    = require('express');
const cors       = require('cors');
const path       = require('path');

/*
!=======================================================================================
 ! Import tất cả routes
!=======================================================================================
*/

const routeGiaoDich  = require('../routes/transactions.routes');
const routeDanhMuc   = require('../routes/categories.routes');
const routeKyThang   = require('../routes/periods.routes');
const routeMucTieu   = require('../routes/goals.routes');
const routeBaoCao    = require('../routes/reports.routes');
const routeNo        = require('../routes/debts.routes');

/*
!======================================================================================================================================
*/

/*
!=======================================================================================
 ! Khởi tạo app Express
!=======================================================================================
*/

const app = express();

/*
!=======================================================================================
 ! Middleware
!=======================================================================================
*/

app.use(cors());                                // ? Cho phép gọi API từ browser
app.use(express.json());                        // ? Parse body JSON
app.use(express.urlencoded({ extended: true }));// ? Parse body form

// ? Phục vụ file tĩnh từ thư mục public (HTML, CSS, JS frontend)
app.use(express.static(path.join(__dirname, '..', 'public')));

/*
!======================================================================================================================================
*/

/*
!=======================================================================================
 ! Đăng ký API routes — tất cả bắt đầu bằng /api
!=======================================================================================
*/

app.use('/api/giao-dich',   routeGiaoDich);
app.use('/api/danh-muc',    routeDanhMuc);
app.use('/api/ky-thang',    routeKyThang);
app.use('/api/muc-tieu',    routeMucTieu);
app.use('/api/bao-cao',     routeBaoCao);
app.use('/api/no',          routeNo);

/*
!======================================================================================================================================
*/

/*
!=======================================================================================
 ! Route catch-all — trả về index.html cho SPA
 ? Mọi request không khớp API đều về frontend
!=======================================================================================
*/

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/*
!=======================================================================================
 ! Middleware xử lý lỗi toàn cục
!=======================================================================================
*/

// ! Phải có 4 tham số để Express nhận ra là error handler
app.use((loi, req, res, next) => {
    console.error('❌ Lỗi server:', loi.message);
    res.status(500).json({
        thanhCong : false,
        thongBao  : 'Lỗi server nội bộ',
        chiTiet   : process.env.NODE_ENV === 'development' ? loi.message : undefined,
    });
});

/*
!======================================================================================================================================
*/

module.exports = app;
