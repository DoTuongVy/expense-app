'use strict';

/*
!=======================================================================================
 ! MODELS/CATEGORY.MODEL.JS —  - Schema MongoDB cho danh mục
!=======================================================================================
*/

const mongoose = require('mongoose');

/*
!=======================================================================================
 ! Schema
!=======================================================================================
*/

const SchemaDanhMuc = new mongoose.Schema({
    name      : { type: String, required: true },
    type      : { type: String, enum: ['income','expense','saving','debt'], required: true },
    icon      : { type: String, default: '📁' },
    color     : { type: String, default: '#888888' },
    is_active : { type: Boolean, default: true },
}, { timestamps: true });

const DanhMuc = mongoose.model('Category', SchemaDanhMuc);

/*
!======================================================================================================================================
*/

const DanhMucModel = {

    layTatCa: async (nhom = null) => {
        const boLoc = { is_active: true };
        if (nhom) boLoc.type = nhom;
        return DanhMuc.find(boLoc).sort({ type: 1, name: 1 });
    },

    layTheoId: async (id) => DanhMuc.findById(id),

    them: async ({ tenDanhMuc, nhom, icon, mau }) => {
        const dm = new DanhMuc({ name: tenDanhMuc, type: nhom, icon, color: mau });
        return dm.save();
    },

    sua: async (id, { tenDanhMuc, icon, mau }) => {
        return DanhMuc.findByIdAndUpdate(id, { name: tenDanhMuc, icon, color: mau });
    },

    // ! Ẩn thay vì xoá cứng
    an: async (id) => DanhMuc.findByIdAndUpdate(id, { is_active: false }),
};

module.exports = { DanhMucModel, DanhMuc };
