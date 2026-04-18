'use strict';

/*
!=======================================================================================
 ! MODELS/REPORT.MODEL.JS — Query báo cáo (Mongoose)
!=======================================================================================
*/

const mongoose = require('mongoose');

const BaoCaoModel = {

    tongHopThang: async (kyThangId, openingBalance) => {
        const { GiaoDichModel } = require('./transaction.model');
        const tongHop = await GiaoDichModel.tinhTongHop(kyThangId);
        return {
            ...tongHop,
            opening_balance         : openingBalance,
            system_closing_balance  : openingBalance + tongHop.total_income - tongHop.total_expense,
        };
    },

    chiTietTheoDanhMuc: async (kyThangId) => {
        const { GiaoDichModel } = require('./transaction.model');
        return GiaoDichModel.tinhTheoCategory(kyThangId);
    },

    // ! Báo cáo năm — tổng hợp từng tháng
    tongHopNam: async (nam) => {
        const { KyThang }   = require('./period.model');
        const { GiaoDich }  = require('./transaction.model');

        const cacKy = await KyThang.find({ year: nam }).sort({ month: 1 });

        const ketQua = await Promise.all(cacKy.map(async (ky) => {
            const tongHop = await GiaoDich.aggregate([
                { $match: { period_id: ky._id, is_adjustment: false } },
                { $group: {
                    _id         : null,
                    tongThu     : { $sum: { $cond: [{ $in: ['$type', ['income','debt_take','debt_collect']] }, '$amount', 0] } },
                    tongChi     : { $sum: { $cond: [{ $in: ['$type', ['expense','debt_give','debt_pay','saving']] }, '$amount', 0] } },
                    tietKiem    : { $sum: { $cond: [{ $eq: ['$type', 'saving'] }, '$amount', 0] } },
                }},
            ]);

            return {
                thang   : ky.month,
                nam     : ky.year,
                soDauKy : ky.opening_balance,
                tongThu : tongHop[0]?.tongThu  || 0,
                tongChi : tongHop[0]?.tongChi  || 0,
                tietKiem: tongHop[0]?.tietKiem || 0,
            };
        }));

        return ketQua;
    },

    layDanhSachNam: async () => {
        const { KyThang } = require('./period.model');
        const cacNam = await KyThang.distinct('year');
        return cacNam.sort((a, b) => b - a);
    },
};

module.exports = { BaoCaoModel };
