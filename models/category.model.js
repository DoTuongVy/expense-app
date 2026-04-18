'use strict';

/*
!=======================================================================================
 ! MODELS/CATEGORY.MODEL.JS — Query bảng categories
!=======================================================================================
*/

const { pool } = require('../config/database');

/*
!======================================================================================================================================
*/

const DanhMucModel = {

    /*
    !=======================================================================================
     ? Lấy tất cả danh mục — có thể lọc theo nhóm (income/expense/saving/debt)
    !=======================================================================================
    */
    layTatCa: async (nhom = null) => {
        let cauQuery = `SELECT * FROM categories WHERE is_active = 1`;
        const thamSo = [];

        if (nhom) {
            cauQuery += ` AND type = ?`;
            thamSo.push(nhom);
        }

        cauQuery += ` ORDER BY type, name`;
        const [danhSach] = await pool.query(cauQuery, thamSo);
        return danhSach;
    },

    /*
    !=======================================================================================
     ? Lấy theo ID
    !=======================================================================================
    */
    layTheoId: async (id) => {
        const [danhSach] = await pool.query(
            `SELECT * FROM categories WHERE id = ?`, [id]
        );
        return danhSach[0] || null;
    },

    /*
    !=======================================================================================
     ! Thêm danh mục mới
    !=======================================================================================
    */
    them: async ({ tenDanhMuc, nhom, icon, mau }) => {
        const [ketQua] = await pool.query(
            `INSERT INTO categories (name, type, icon, color)
             VALUES (?, ?, ?, ?)`,
            [tenDanhMuc, nhom, icon || null, mau || '#888888']
        );
        return ketQua.insertId;
    },

    /*
    !=======================================================================================
     ? Sửa danh mục
    !=======================================================================================
    */
    sua: async (id, { tenDanhMuc, icon, mau }) => {
        await pool.query(
            `UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?`,
            [tenDanhMuc, icon || null, mau || '#888888', id]
        );
    },

    /*
    !=======================================================================================
     ! Ẩn danh mục thay vì xoá cứng — tránh mất dữ liệu lịch sử
    !=======================================================================================
    */
    an: async (id) => {
        await pool.query(
            `UPDATE categories SET is_active = 0 WHERE id = ?`, [id]
        );
    },

};

/*
!======================================================================================================================================
*/

module.exports = DanhMucModel;
