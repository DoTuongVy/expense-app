'use strict';

/*
!=======================================================================================
 ! SERVER.JS — Entry point, khởi động ứng dụng
 ? Chạy: node server.js  hoặc  npm run dev
!=======================================================================================
*/

require('dotenv').config();

const app                       = require('./config/app');
const { kiemTraKetNoi }         = require('./config/database');

const cong = process.env.PORT || 3000;

/*
!=======================================================================================
 ! Khởi động server
!=======================================================================================
*/

const khoidong = async () => {
    // ! Kiểm tra DB trước, nếu lỗi sẽ tự thoát trong kiemTraKetNoi()
    await kiemTraKetNoi();

    app.listen(cong, () => {
        console.log('');
        console.log('🚀 Server đang chạy tại: http://localhost:' + cong);
        console.log('📦 Database           : ' + process.env.DB_NAME);
        console.log('🌿 Môi trường         : ' + (process.env.NODE_ENV || 'development'));
        console.log('');
    });
};

khoidong();
