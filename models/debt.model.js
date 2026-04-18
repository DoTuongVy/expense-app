'use strict';

/*
!=======================================================================================
 ! MODELS/DEBT.MODEL.JS — Query bảng debt_tracking
!=======================================================================================
*/

const { pool } = require('../config/database');

/*
!======================================================================================================================================
*/

const NoModel = {

    /*
    !=======================================================================================
     ? Lấy tất cả khoản nợ — có thể lọc theo trạng thái
    !=======================================================================================
    */
    layTatCa: async (trangThai = null) => {
        let cauQuery = `
            SELECT *,
                (original_amount - paid_amount) AS conLai
            FROM debt_tracking
        `;
        const thamSo = [];

        if (trangThai) {
            cauQuery += ` WHERE status = ?`;
            thamSo.push(trangThai);
        }

        cauQuery += ` ORDER BY status ASC, created_at DESC`;
        const [danhSach] = await pool.query(cauQuery, thamSo);
        return danhSach;
    },

    /*
    !=======================================================================================
     ! Thêm khoản nợ mới
    !=======================================================================================
    */
    them: async ({ chieuNo, tenNguoi, soTienGoc, hanTra, ghiChu }) => {
        const [ketQua] = await pool.query(
            `INSERT INTO debt_tracking
                (direction, person_name, original_amount, due_date, note)
             VALUES (?, ?, ?, ?, ?)`,
            [chieuNo, tenNguoi, soTienGoc, hanTra || null, ghiChu || null]
        );
        return ketQua.insertId;
    },

    /*
    !=======================================================================================
     ? Cập nhật số đã trả/thu
     ! Nếu paid_amount >= original_amount thì tự động chuyển status = 'settled'
    !=======================================================================================
    */
    capNhatDaTra: async (id, soTienThemVao) => {
        await pool.query(
            `UPDATE debt_tracking
             SET paid_amount = paid_amount + ?,
                 status = CASE
                    WHEN (paid_amount + ?) >= original_amount THEN 'settled'
                    ELSE 'active'
                 END
             WHERE id = ?`,
            [soTienThemVao, soTienThemVao, id]
        );
    },

    /*
    !=======================================================================================
     ? Xoá khoản nợ
    !=======================================================================================
    */
    xoa: async (id) => {
        await pool.query(`DELETE FROM debt_tracking WHERE id = ?`, [id]);
    },

};

/*
!======================================================================================================================================
*/

module.exports = NoModel;
