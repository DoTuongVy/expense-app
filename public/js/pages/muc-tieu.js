'use strict';

/*
!=======================================================================================
 ! JS/PAGES/MUC-TIEU.JS
!=======================================================================================
*/

const trangMucTieu = {

    _thang: null,
    _nam  : null,

    render: async (thang, nam) => {
        trangMucTieu._thang = thang;
        trangMucTieu._nam   = nam;

        const content = document.getElementById('content');
        content.innerHTML = htmlLoading();

        try {
            const ketQuaMT  = await ApiMucTieu.layTheoThang(thang, nam);
            const dsMucTieu = ketQuaMT.duLieu || [];

            content.innerHTML = `
                <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
                    <button class="btn-add" onclick="trangMucTieu.moModalThem()">+ Đặt mục tiêu</button>
                </div>
                <div class="card">
                    <div class="card-hd">
                        <span class="card-title">Mục tiêu tháng ${thang}/${nam}</span>
                        <span class="badge blue">${dsMucTieu.length} mục tiêu</span>
                    </div>
                    ${!dsMucTieu.length
                        ? htmlEmpty('🎯', 'Chưa có mục tiêu — bấm "+ Đặt mục tiêu" để bắt đầu')
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
                                    const cl    = mt.soTienMucTieu - mt.soTienThucTe;
                                    const mtId  = mt.id || mt._id;
                                    return `<tr>
                                        <td>${mt.iconDanhMuc || ''} ${mt.tenDanhMuc}</td>
                                        <td class="num">${dinhDangTien(mt.soTienMucTieu)}</td>
                                        <td class="num ${mt.soTienThucTe > 0 ? 'neg' : ''}">${dinhDangTien(mt.soTienThucTe)}</td>
                                        <td class="num ${cl >= 0 ? 'pos' : 'neg'}">${cl >= 0 ? '+' : ''}${dinhDangTien(cl)}</td>
                                        <td class="num">
                                            <span style="color:var(--${mau === 'ok' ? 'green' : mau === 'warn' ? 'amber' : 'red'})">${Math.round(phanTram)}%</span>
                                        </td>
                                        <td>
                                            <button class="btn-icon del" onclick="trangMucTieu.xoa('${mtId}', '${mt.tenDanhMuc}')">🗑️</button>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>`
                    }
                </div>
            `;

            trangMucTieu._dangKySuKien();

        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    _dangKySuKien: () => {
        const btnLuu = document.getElementById('btn-luu-muctieu');
        if (!btnLuu) return;
        const btnMoi = btnLuu.cloneNode(true);
        btnLuu.replaceWith(btnMoi);
        btnMoi.addEventListener('click', trangMucTieu._luuMucTieu);
    },

    moModalThem: async () => await UI.moModalMucTieu(),

    _luuMucTieu: async () => {
        const danhMucId     = document.getElementById('fi-mt-danhmuc').value;
        const soTienMucTieu = parseTien(document.getElementById('fi-mt-sotien').value);

        if (!soTienMucTieu || soTienMucTieu <= 0) { hienToast('Nhập số tiền mục tiêu!', 'err'); return; }

        try {
            await ApiMucTieu.datMucTieu({
                thang       : trangMucTieu._thang,
                nam         : trangMucTieu._nam,
                danhMucId,
                soTienMucTieu,
            });
            hienToast('Đã lưu mục tiêu', 'ok');
            UI.dongModal('modal-muctieu');
            trangMucTieu.render(trangMucTieu._thang, trangMucTieu._nam);
        } catch (loi) { hienToast(loi.message, 'err'); }
    },

    xoa: (id, ten) => {
        UI.xacNhan(`Xoá mục tiêu "${ten}"?`, async () => {
            try {
                await ApiMucTieu.xoa(id);
                hienToast('Đã xoá mục tiêu', 'ok');
                trangMucTieu.render(trangMucTieu._thang, trangMucTieu._nam);
            } catch (loi) { hienToast(loi.message, 'err'); }
        }, '🎯');
    },
};