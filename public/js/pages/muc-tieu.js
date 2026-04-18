'use strict';

/*
!=======================================================================================
 ! JS/PAGES/MUC-TIEU.JS
!=======================================================================================
*/

const trangMucTieu = {

    render: async (thang, nam) => {
        const content = document.getElementById('content');
        content.innerHTML = htmlLoading();

        try {
            const [ketQuaMT, ketQuaDM] = await Promise.all([
                ApiMucTieu.layTheoThang(thang, nam),
                ApiDanhMuc.layTatCa(),
            ]);

            const dsMucTieu = ketQuaMT.duLieu || [];
            const dsDanhMuc = ketQuaDM.duLieu || [];

            content.innerHTML = `
                <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
                    <button class="btn-add" onclick="trangMucTieu.moModalThem(${thang},${nam})">+ Đặt mục tiêu</button>
                </div>

                <div class="card">
                    <div class="card-hd">
                        <span class="card-title">Mục tiêu tháng ${thang}/${nam}</span>
                        <span class="badge blue">${dsMucTieu.length} mục tiêu</span>
                    </div>

                    ${!dsMucTieu.length
                        ? htmlEmpty('🎯', 'Chưa có mục tiêu nào — bấm "+ Đặt mục tiêu" để bắt đầu')
                        : `<table class="bc-table">
                            <thead>
                                <tr>
                                    <th>Danh mục</th>
                                    <th style="text-align:right">Mục tiêu</th>
                                    <th style="text-align:right">Thực tế</th>
                                    <th style="text-align:right">Chênh lệch</th>
                                    <th style="text-align:right">%</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${dsMucTieu.map(mt => {
                                    const { phanTram, mau } = tinhPhanTramGoal(mt.soTienThucTe, mt.soTienMucTieu);
                                    const cl = mt.soTienMucTieu - mt.soTienThucTe;
                                    return `<tr>
                                        <td>${mt.iconDanhMuc || ''} ${mt.tenDanhMuc}</td>
                                        <td class="num">${dinhDangTien(mt.soTienMucTieu)}</td>
                                        <td class="num ${mt.soTienThucTe > 0 ? 'neg' : ''}">${dinhDangTien(mt.soTienThucTe)}</td>
                                        <td class="num ${cl >= 0 ? 'pos' : 'neg'}">${cl >= 0 ? '+' : ''}${dinhDangTien(cl)}</td>
                                        <td class="num">
                                            <span style="color:var(--${mau === 'ok' ? 'green' : mau === 'warn' ? 'amber' : 'red'})">${Math.round(phanTram)}%</span>
                                        </td>
                                        <td>
                                            <button class="btn-icon del" onclick="trangMucTieu.xoa(${mt.id})">🗑️</button>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>`
                    }
                </div>
            `;
        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    moModalThem: async (thang, nam) => {
        const ketQuaDM  = await ApiDanhMuc.layTatCa();
        const dsDanhMuc = ketQuaDM.duLieu || [];
        const dsDM      = dsDanhMuc.map(dm => `${dm.id}: ${dm.icon || ''} ${dm.name}`).join('\n');
        const danhMucId = prompt(`Chọn danh mục (nhập ID):\n${dsDM}`);
        if (!danhMucId) return;
        const soTien    = prompt('Số tiền mục tiêu (VD: 3000000):');
        if (!soTien)    return;

        ApiMucTieu.datMucTieu({ thang, nam, danhMucId: parseInt(danhMucId), soTienMucTieu: parseInt(soTien) })
            .then(() => { hienToast('Đã lưu mục tiêu', 'ok'); trangMucTieu.render(thang, nam); })
            .catch(loi => hienToast(loi.message, 'err'));
    },

    xoa: async (id) => {
        if (!confirm('Xoá mục tiêu này?')) return;
        try {
            await ApiMucTieu.xoa(id);
            hienToast('Đã xoá mục tiêu', 'ok');
            App.taiLaiTrang();
        } catch (loi) { hienToast(loi.message, 'err'); }
    },
};
