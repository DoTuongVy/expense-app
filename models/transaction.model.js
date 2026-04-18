'use strict';

/*
!=======================================================================================
 ! MODELS/TRANSACTION.MODEL.JS — Query bảng transactions
!=======================================================================================
*/

const { pool } = require('../config/database');

/*
!======================================================================================================================================
*/

const GiaoDichModel = {

    /*
    !=======================================================================================
     ? Lấy danh sách giao dịch theo kỳ tháng — có thể lọc theo loại
    !=======================================================================================
    */
    layTheoKy: async (kyThangId, loai = null) => {
        let cauQuery = `
            SELECT
                t.*,
                c.name  AS tenDanhMuc,
                c.icon  AS iconDanhMuc,
                c.color AS mauDanhMuc
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.period_id = ?
        `;
        const thamSo = [kyThangId];

        // ? Lọc theo loại nếu có truyền vào
        if (loai) {
            cauQuery += ` AND t.type = ?`;
            thamSo.push(loai);
        }

        cauQuery += ` ORDER BY t.trans_date DESC, t.created_at DESC`;

        const [danhSach] = await pool.query(cauQuery, thamSo);
        return danhSach;
    },

    /*
    !=======================================================================================
     ? Lấy giao dịch theo ngày cụ thể
    !=======================================================================================
    */
    layTheoNgay: async (kyThangId, ngay) => {
        const [danhSach] = await pool.query(
            `SELECT
                t.*,
                c.name  AS tenDanhMuc,
                c.icon  AS iconDanhMuc,
                c.color AS mauDanhMuc
             FROM transactions t
             JOIN categories c ON c.id = t.category_id
             WHERE t.period_id = ? AND t.trans_date = ?
             ORDER BY t.created_at DESC`,
            [kyThangId, ngay]
        );
        return danhSach;
    },

    /*
    !=======================================================================================
     ! Thêm giao dịch mới
    !=======================================================================================
    */
    them: async ({ kyThangId, danhMucId, loai, soTien, ngay, ghiChu }) => {
        const [ketQua] = await pool.query(
            `INSERT INTO transactions
                (period_id, category_id, type, amount, trans_date, note)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [kyThangId, danhMucId, loai, soTien, ngay, ghiChu || null]
        );
        return ketQua.insertId;
    },

    /*
    !=======================================================================================
     ? Sửa giao dịch
     ! Không cho sửa nếu kỳ đã chốt — kiểm tra ở controller
    !=======================================================================================
    */
    sua: async (id, { danhMucId, loai, soTien, ngay, ghiChu }) => {
        await pool.query(
            `UPDATE transactions
             SET category_id = ?,
                 type        = ?,
                 amount      = ?,
                 trans_date  = ?,
                 note        = ?
             WHERE id = ?`,
            [danhMucId, loai, soTien, ngay, ghiChu || null, id]
        );
    },

    /*
    !=======================================================================================
     ! Xoá giao dịch
     ! Không cho xoá nếu kỳ đã chốt — kiểm tra ở controller
    !=======================================================================================
    */
    xoa: async (id) => {
        await pool.query(`DELETE FROM transactions WHERE id = ?`, [id]);
    },

    /*
    !=======================================================================================
     ? Lấy 1 giao dịch theo ID — dùng khi sửa/xoá để kiểm tra quyền
    !=======================================================================================
    */
    layTheoId: async (id) => {
        const [danhSach] = await pool.query(
            `SELECT t.*, c.name AS tenDanhMuc
             FROM transactions t
             JOIN categories c ON c.id = t.category_id
             WHERE t.id = ?`,
            [id]
        );
        return danhSach[0] || null;
    },

    /*
    !=======================================================================================
     ! Thêm dòng điều chỉnh chênh lệch khi chốt tháng
     ? Tự động tạo khi soduThucTe != soduHeThong
    !=======================================================================================
    */
    themDieuChinh: async (kyThangId, soTienChenhLech, danhMucId) => {
        const loai = soTienChenhLech >= 0 ? 'income' : 'expense';
        await pool.query(
            `INSERT INTO transactions
                (period_id, category_id, type, amount, trans_date, note, is_adjustment)
             VALUES (?, ?, ?, ?, CURDATE(), 'Điều chỉnh chênh lệch cuối tháng', 1)`,
            [kyThangId, danhMucId, loai, Math.abs(soTienChenhLech)]
        );
    },

};

/*
!======================================================================================================================================
*/

module.exports = GiaoDichModel;
