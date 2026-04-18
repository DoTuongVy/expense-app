'use strict';

/*
!=======================================================================================
 ! MODELS/GOAL.MODEL.JS — Query bảng goals (mục tiêu)
!=======================================================================================
*/

const { pool } = require('../config/database');

/*
!======================================================================================================================================
*/

const MucTieuModel = {

    /*
    !=======================================================================================
     ? Lấy mục tiêu theo kỳ tháng — kèm thực tế đã chi để so sánh
    !=======================================================================================
    */
    layTheoKy: async (kyThangId) => {
        const [danhSach] = await pool.query(
            `SELECT
                g.id,
                g.target_amount          AS soTienMucTieu,
                c.id                     AS danhMucId,
                c.name                   AS tenDanhMuc,
                c.icon                   AS iconDanhMuc,
                c.color                  AS mauDanhMuc,
                c.type                   AS nhomDanhMuc,

                -- ? Tổng thực tế đã ghi trong tháng
                COALESCE(SUM(t.amount), 0) AS soTienThucTe,

                -- ! Chênh lệch = mục tiêu - thực tế (âm = vượt mục tiêu)
                g.target_amount - COALESCE(SUM(t.amount), 0) AS chenhLech

             FROM goals g
             JOIN categories c  ON c.id = g.category_id
             LEFT JOIN transactions t
                ON t.category_id = g.category_id
                AND t.period_id  = g.period_id
                AND t.is_adjustment = 0
             WHERE g.period_id = ?
             GROUP BY g.id, g.target_amount, c.id, c.name, c.icon, c.color, c.type`,
            [kyThangId]
        );
        return danhSach;
    },

    /*
    !=======================================================================================
     ! Đặt mục tiêu — nếu đã có thì update, chưa có thì insert (upsert)
    !=======================================================================================
    */
    datMucTieu: async (kyThangId, danhMucId, soTienMucTieu) => {
        await pool.query(
            `INSERT INTO goals (period_id, category_id, target_amount)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE target_amount = ?`,
            [kyThangId, danhMucId, soTienMucTieu, soTienMucTieu]
        );
    },

    /*
    !=======================================================================================
     ? Xoá mục tiêu
    !=======================================================================================
    */
    xoa: async (id) => {
        await pool.query(`DELETE FROM goals WHERE id = ?`, [id]);
    },

};

/*
!======================================================================================================================================
*/

module.exports = MucTieuModel;
