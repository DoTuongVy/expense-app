'use strict';

/*
!=======================================================================================
 ! MODELS/PERIOD.MODEL.JS — Query bảng monthly_periods
 ? Kỳ tháng là trung tâm của toàn bộ app
!=======================================================================================
*/

const { pool } = require('../config/database');

/*
!======================================================================================================================================
*/

const KyThangModel = {

    /*
    !=======================================================================================
     ! Lấy hoặc tạo kỳ tháng theo tháng/năm
     ? Dùng khi user chọn tháng trên UI — nếu chưa có thì tự tạo mới
    !=======================================================================================
    */
    layHoacTaoKy: async (thang, nam) => {
        // ? Tìm kỳ đã có
        const [danhSach] = await pool.query(
            `SELECT * FROM monthly_periods WHERE month = ? AND year = ?`,
            [thang, nam]
        );

        if (danhSach.length > 0) return danhSach[0];

        // ! Chưa có → tạo mới với số dư = 0
        const [ketQua] = await pool.query(
            `INSERT INTO monthly_periods (month, year) VALUES (?, ?)`,
            [thang, nam]
        );

        return { id: ketQua.insertId, month: thang, year: nam, opening_balance: 0 };
    },

    /*
    !=======================================================================================
     ? Lấy kỳ tháng hiện tại (theo ngày hệ thống)
    !=======================================================================================
    */
    layKyHienTai: async () => {
        const homNay   = new Date();
        const thang    = homNay.getMonth() + 1;
        const nam      = homNay.getFullYear();
        return KyThangModel.layHoacTaoKy(thang, nam);
    },

    /*
    !=======================================================================================
     ? Lấy tất cả kỳ đã có — dùng cho dropdown chọn tháng
    !=======================================================================================
    */
    layTatCa: async () => {
        const [danhSach] = await pool.query(
            `SELECT * FROM monthly_periods ORDER BY year DESC, month DESC`
        );
        return danhSach;
    },

    /*
    !=======================================================================================
     ! Cập nhật số dư đầu kỳ khi user chốt tháng cũ
     ? soduThucTe = số tiền user nhập tay (có thể lệch hệ thống)
    !=======================================================================================
    */
    capNhatSoDauKy: async (kyThangId, soduThucTe, ghiChu) => {
        // ? Tính số dư hệ thống từ view
        const [tongHop] = await pool.query(
            `SELECT system_closing_balance FROM v_monthly_summary WHERE period_id = ?`,
            [kyThangId]
        );

        const soduHeThong   = tongHop[0]?.system_closing_balance ?? 0;
        const chenhLech     = soduThucTe - soduHeThong;

        await pool.query(
            `UPDATE monthly_periods
             SET opening_balance  = ?,
                 system_balance   = ?,
                 adjustment       = ?,
                 adjustment_note  = ?
             WHERE id = ?`,
            [soduThucTe, soduHeThong, chenhLech, ghiChu, kyThangId]
        );

        return { soduThucTe, soduHeThong, chenhLech };
    },

    /*
    !=======================================================================================
     ! Chốt tháng — sau khi chốt không cho sửa giao dịch nữa
    !=======================================================================================
    */
    chotThang: async (kyThangId) => {
        await pool.query(
            `UPDATE monthly_periods
             SET is_closed = 1, closed_at = NOW()
             WHERE id = ?`,
            [kyThangId]
        );
    },

};

/*
!======================================================================================================================================
*/

module.exports = KyThangModel;
