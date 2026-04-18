'use strict';

/*
!=======================================================================================
 ! CONFIG/DATABASE.JS — Kết nối MongoDB Atlas qua Mongoose
!=======================================================================================
*/

const mongoose = require('mongoose');
require('dotenv').config();

/*
!======================================================================================================================================
*/

const kiemTraKetNoi = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'expense_management',
        });
        console.log('✅ Kết nối MongoDB Atlas thành công!');
    } catch (loi) {
        console.error('❌ Kết nối MongoDB thất bại:', loi.message);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB bị ngắt kết nối');
});

module.exports = { kiemTraKetNoi };
