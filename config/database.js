/*
=========================================
 ! Đỏ    = QUAN TRỌNG / CẢNH BÁO
 ? Xanh  = GHI CHÚ / GIẢI THÍCH
 todo    = CẦN LÀM SAU
=========================================
*/

'use strict';

/*
!=======================================================================================
 ! CONFIG/DATABASE.JS — Tạo MySQL connection pool
 ? Dùng pool thay vì single connection để tránh mất kết nối khi idle
!=======================================================================================
*/

const mysql      = require('mysql2/promise');
require('dotenv').config();

/*
!======================================================================================================================================
*/

/*
!=======================================================================================
 ! Tạo pool kết nối
!=======================================================================================
*/

const pool = mysql.createPool({
    host              : process.env.DB_HOST     || 'localhost',
    port              : process.env.DB_PORT     || 3306,
    user              : process.env.DB_USER     || 'root',
    password          : process.env.DB_PASS     || '',
    database          : process.env.DB_NAME     || 'expense_management',
    waitForConnections: true,
    connectionLimit   : 10,                     // ? Tối đa 10 kết nối đồng thời
    queueLimit        : 0,
    charset           : 'utf8mb4',
});

/*
!======================================================================================================================================
*/

/*
!=======================================================================================
 ! Kiểm tra kết nối khi khởi động
!=======================================================================================
*/

const kiemTraKetNoi = async () => {
    try {
        const ketNoi = await pool.getConnection();
        console.log('✅ Kết nối MySQL thành công!');
        ketNoi.release();                       // ? Trả kết nối về pool sau khi test
    } catch (loi) {
        // ! Nếu lỗi thì dừng app luôn, không chạy thiếu DB
        console.error('❌ Kết nối MySQL thất bại:', loi.message);
        process.exit(1);
    }
};

/*
!======================================================================================================================================
*/

module.exports = { pool, kiemTraKetNoi };
