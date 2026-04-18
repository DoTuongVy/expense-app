'use strict';

/*
!=======================================================================================
 ! DATABASE/SEED.JS — Tạo dữ liệu mẫu cho MongoDB
 ! Chạy: node database/seed.js
!=======================================================================================
*/

require('dotenv').config();
const mongoose          = require('mongoose');
const { DanhMuc }       = require('../models/category.model');
const { KyThang }       = require('../models/period.model');
const { GiaoDich }      = require('../models/transaction.model');
const { MucTieu }       = require('../models/goal.model');

const chaySeeed = async () => {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'expense_management' });
    console.log('✅ Kết nối MongoDB thành công');

    // ! Xoá dữ liệu cũ
    await Promise.all([
        DanhMuc.deleteMany({}),
        KyThang.deleteMany({}),
        GiaoDich.deleteMany({}),
        MucTieu.deleteMany({}),
    ]);
    console.log('🗑️  Đã xoá dữ liệu cũ');

    /*
    !=======================================================================================
     ! Danh mục mặc định
    !=======================================================================================
    */
    const cacDM = await DanhMuc.insertMany([
        { name: 'Lương',           type: 'income',  icon: '💰', color: '#22c55e' },
        { name: 'Thưởng',          type: 'income',  icon: '🎁', color: '#16a34a' },
        { name: 'Phụ cấp',         type: 'income',  icon: '📋', color: '#15803d' },
        { name: 'Thu nhập phụ',    type: 'income',  icon: '💼', color: '#14532d' },
        { name: 'Ăn uống',         type: 'expense', icon: '🍜', color: '#ef4444' },
        { name: 'Di chuyển',       type: 'expense', icon: '🚗', color: '#dc2626' },
        { name: 'Tiện ích',        type: 'expense', icon: '💡', color: '#f97316' },
        { name: 'Mua sắm',         type: 'expense', icon: '🛒', color: '#fb923c' },
        { name: 'Giải trí',        type: 'expense', icon: '🎮', color: '#f59e0b' },
        { name: 'Sức khoẻ',        type: 'expense', icon: '🏥', color: '#e11d48' },
        { name: 'Giáo dục',        type: 'expense', icon: '📚', color: '#7c3aed' },
        { name: 'Khác',            type: 'expense', icon: '📦', color: '#6b7280' },
        { name: 'Tiết kiệm chung', type: 'saving',  icon: '🏦', color: '#3b82f6' },
        { name: 'Quỹ khẩn cấp',   type: 'saving',  icon: '🛡️', color: '#1d4ed8' },
        { name: 'Mục tiêu lớn',   type: 'saving',  icon: '🎯', color: '#0ea5e9' },
        { name: 'Vay mượn',        type: 'debt',    icon: '🤝', color: '#a855f7' },
        { name: 'Cho vay',         type: 'debt',    icon: '📤', color: '#9333ea' },
    ]);
    console.log(`✅ Đã tạo ${cacDM.length} danh mục`);

    // ? Map tên → id cho dễ dùng
    const dm = {};
    cacDM.forEach(d => { dm[d.name] = d._id; });

    /*
    !=======================================================================================
     ! Kỳ tháng mẫu
    !=======================================================================================
    */
    const ky = await KyThang.create({ month: 4, year: 2026, opening_balance: 3350000 });
    console.log('✅ Đã tạo kỳ tháng 4/2026');

    /*
    !=======================================================================================
     ! Giao dịch mẫu
    !=======================================================================================
    */
    await GiaoDich.insertMany([
        { period_id: ky._id, category_id: dm['Lương'],           type: 'income',  amount: 10000000, trans_date: new Date('2026-04-01'), note: 'Lương tháng 4' },
        { period_id: ky._id, category_id: dm['Thưởng'],          type: 'income',  amount: 2500000,  trans_date: new Date('2026-04-10'), note: 'Thưởng dự án Q1' },
        { period_id: ky._id, category_id: dm['Ăn uống'],         type: 'expense', amount: 150000,   trans_date: new Date('2026-04-03'), note: 'Ăn trưa' },
        { period_id: ky._id, category_id: dm['Di chuyển'],       type: 'expense', amount: 200000,   trans_date: new Date('2026-04-07'), note: 'Xăng xe' },
        { period_id: ky._id, category_id: dm['Tiện ích'],        type: 'expense', amount: 650000,   trans_date: new Date('2026-04-15'), note: 'Tiền điện nước' },
        { period_id: ky._id, category_id: dm['Ăn uống'],         type: 'expense', amount: 280000,   trans_date: new Date('2026-04-18'), note: 'Đi ăn tối' },
        { period_id: ky._id, category_id: dm['Tiết kiệm chung'], type: 'saving',  amount: 1000000,  trans_date: new Date('2026-04-05'), note: 'Tiết kiệm tháng 4' },
        { period_id: ky._id, category_id: dm['Cho vay'],         type: 'debt_collect', amount: 500000, trans_date: new Date('2026-04-12'), note: 'Nam trả nợ' },
    ]);
    console.log('✅ Đã tạo giao dịch mẫu');

    /*
    !=======================================================================================
     ! Mục tiêu mẫu
    !=======================================================================================
    */
    await MucTieu.insertMany([
        { period_id: ky._id, category_id: dm['Ăn uống'],         target_amount: 3000000 },
        { period_id: ky._id, category_id: dm['Di chuyển'],       target_amount: 800000  },
        { period_id: ky._id, category_id: dm['Giải trí'],        target_amount: 1000000 },
        { period_id: ky._id, category_id: dm['Tiết kiệm chung'], target_amount: 2000000 },
        { period_id: ky._id, category_id: dm['Mua sắm'],         target_amount: 2500000 },
    ]);
    console.log('✅ Đã tạo mục tiêu mẫu');

    console.log('\n🎉 Seed xong! Mở app để kiểm tra.');
    process.exit(0);
};

chaySeeed().catch(loi => {
    console.error('❌ Lỗi seed:', loi.message);
    process.exit(1);
});
