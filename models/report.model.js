'use strict';

/*
!=======================================================================================
 ! MODELS/REPORT.MODEL.JS — Query báo cáo tháng & năm
!=======================================================================================
*/

const { pool } = require('../config/database');

/*
!======================================================================================================================================
*/

const BaoCaoModel = {

    /*
    !=======================================================================================
     ? Báo cáo tổng hợp 1 tháng — dùng view v_monthly_summary
    !=======================================================================================
    */
    tongHopThang: async (kyThangId) => {
        const [ketQua] = await pool.query(
            `SELECT * FROM v_monthly_summary WHERE period_id = ?`,
            [kyThangId]
        );
        return ketQua[0] || null;
    },

    /*
    !=======================================================================================
     ? Báo cáo chi tiết theo danh mục trong 1 tháng
    !=======================================================================================
    */
    chiTietTheoDanhMuc: async (kyThangId) => {
        const [danhSach] = await pool.query(
            `SELECT
                c.id                       AS danhMucId,
                c.name                     AS tenDanhMuc,
                c.icon                     AS iconDanhMuc,
                c.color                    AS mauDanhMuc,
                c.type                     AS nhom,
                COUNT(t.id)                AS soGiaoDich,
                COALESCE(SUM(t.amount), 0) AS tongTien
             FROM categories c
             LEFT JOIN transactions t
                ON t.category_id    = c.id
                AND t.period_id     = ?
                AND t.is_adjustment = 0
             WHERE c.is_active = 1
             GROUP BY c.id, c.name, c.icon, c.color, c.type
             ORDER BY nhom, tongTien DESC`,
            [kyThangId]
        );
        return danhSach;
    },

    /*
    !=======================================================================================
     ! Báo cáo năm — tổng hợp từng tháng trong 1 năm
    !=======================================================================================
    */
    tongHopNam: async (nam) => {
        const [danhSach] = await pool.query(
            `SELECT
                mp.month                                            AS thang,
                mp.year                                             AS nam,
                mp.opening_balance                                  AS soDauKy,
                COALESCE(SUM(CASE
                    WHEN t.type IN ('income','debt_take','debt_collect')
                    THEN t.amount ELSE 0 END), 0)                   AS tongThu,
                COALESCE(SUM(CASE
                    WHEN t.type IN ('expense','debt_give','debt_pay','saving')
                    THEN t.amount ELSE 0 END), 0)                   AS tongChi,
                COALESCE(SUM(CASE
                    WHEN t.type = 'saving'
                    THEN t.amount ELSE 0 END), 0)                   AS tietKiem
             FROM monthly_periods mp
             LEFT JOIN transactions t
                ON t.period_id      = mp.id
                AND t.is_adjustment = 0
             WHERE mp.year = ?
             GROUP BY mp.id, mp.month, mp.year, mp.opening_balance
             ORDER BY mp.month ASC`,
            [nam]
        );
        return danhSach;
    },

    /*
    !=======================================================================================
     ? Lấy danh sách các năm đã có dữ liệu — dùng cho dropdown chọn năm
    !=======================================================================================
    */
    layDanhSachNam: async () => {
        const [danhSach] = await pool.query(
            `SELECT DISTINCT year AS nam
             FROM monthly_periods
             ORDER BY year DESC`
        );
        return danhSach.map(d => d.nam);
    },

};

/*
!======================================================================================================================================
*/

module.exports = BaoCaoModel;
