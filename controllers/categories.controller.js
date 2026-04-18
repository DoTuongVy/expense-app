'use strict';

/*
!=======================================================================================
 ! CONTROLLERS/CATEGORIES.CONTROLLER.JS — Xử lý danh mục
!=======================================================================================
*/

const DanhMucModel = require('../models/category.model');

/*
!======================================================================================================================================
*/

const DanhMucController = {

    /*
    !=======================================================================================
     ? GET /api/danh-muc?nhom=expense
    !=======================================================================================
    */
    layTatCa: async (req, res, next) => {
        try {
            const { nhom }  = req.query;
            const danhSach  = await DanhMucModel.layTatCa(nhom || null);
            res.json({ thanhCong: true, duLieu: danhSach });
        } catch (loi) { next(loi); }
    },

    /*
    !=======================================================================================
     ! POST /api/danh-muc
    !=======================================================================================
    */
    them: async (req, res, next) => {
        try {
            const { tenDanhMuc, nhom, icon, mau } = req.body;
            if (!tenDanhMuc) return res.status(400).json({ thanhCong: false, thongBao: 'Chưa nhập tên danh mục' });
            if (!nhom)       return res.status(400).json({ thanhCong: false, thongBao: 'Chưa chọn nhóm' });

            const idMoi = await DanhMucModel.them({ tenDanhMuc, nhom, icon, mau });
            res.status(201).json({ thanhCong: true, thongBao: 'Đã thêm danh mục', id: idMoi });
        } catch (loi) { next(loi); }
    },

    /*
    !=======================================================================================
     ? PUT /api/danh-muc/:id
    !=======================================================================================
    */
    sua: async (req, res, next) => {
        try {
            const { id }                    = req.params;
            const { tenDanhMuc, icon, mau } = req.body;
            await DanhMucModel.sua(id, { tenDanhMuc, icon, mau });
            res.json({ thanhCong: true, thongBao: 'Đã cập nhật danh mục' });
        } catch (loi) { next(loi); }
    },

    /*
    !=======================================================================================
     ! DELETE /api/danh-muc/:id — ẩn, không xoá cứng
    !=======================================================================================
    */
    an: async (req, res, next) => {
        try {
            await DanhMucModel.an(req.params.id);
            res.json({ thanhCong: true, thongBao: 'Đã ẩn danh mục' });
        } catch (loi) { next(loi); }
    },

};

/*
!======================================================================================================================================
*/

module.exports = DanhMucController;
