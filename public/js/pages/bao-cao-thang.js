'use strict';

/*
!=======================================================================================
 ! JS/PAGES/BAO-CAO-THANG.JS
!=======================================================================================
*/

const trangBaoCaoThang = {

    render: async (thang, nam) => {
        const content = document.getElementById('content');
        content.innerHTML = htmlLoading();

        try {
            const ketQua        = await ApiBaoCao.baoCaoThang(thang, nam);
            const { kyThang, tongHop, theoDanhMuc, mucTieu } = ketQua.duLieu;

            const soDuCuoi  = (tongHop?.opening_balance || 0)
                            + (tongHop?.total_income    || 0)
                            - (tongHop?.total_expense   || 0);

            // ? Map mục tiêu theo danhMucId để lookup nhanh
            const bangMucTieu = {};
            (mucTieu || []).forEach(mt => { bangMucTieu[mt.danhMucId] = mt.soTienMucTieu; });

            content.innerHTML = `
                <!--
                 ? Stat row
                -->
                <div class="bc-grid">
                    <div class="card">
                        <div class="sc-label">Tổng thu</div>
                        <div class="sc-value" style="color:var(--green);font-size:22px;font-family:var(--mono);font-weight:700;margin-top:6px">${dinhDangTien(tongHop?.total_income)}</div>
                    </div>
                    <div class="card">
                        <div class="sc-label">Tổng chi</div>
                        <div class="sc-value" style="color:var(--red);font-size:22px;font-family:var(--mono);font-weight:700;margin-top:6px">${dinhDangTien(tongHop?.total_expense)}</div>
                    </div>
                    <div class="card">
                        <div class="sc-label">Số dư cuối kỳ</div>
                        <div class="sc-value" style="color:var(--blue);font-size:22px;font-family:var(--mono);font-weight:700;margin-top:6px">${dinhDangTien(soDuCuoi)}</div>
                    </div>
                </div>

                <!--
                 ? Bảng chi tiết theo danh mục — có cột mục tiêu
                -->
                <div class="card" style="margin-bottom:14px">
                    <div class="card-hd">
                        <span class="card-title">Chi tiết theo danh mục</span>
                        <span class="badge blue">Tháng ${thang}/${nam}</span>
                    </div>
                    <table class="bc-table">
                        <thead>
                            <tr>
                                <th>Danh mục</th>
                                <th>Nhóm</th>
                                <th style="text-align:right">Thực tế</th>
                                <th style="text-align:right">Mục tiêu</th>
                                <th style="text-align:right">Chênh lệch</th>
                                <th style="text-align:right">GD</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${theoDanhMuc.filter(dm => dm.tongTien > 0).map(dm => {
                                const mt        = bangMucTieu[dm.danhMucId];
                                const cl        = mt ? mt - dm.tongTien : null;
                                const laThu     = ['income','debt_take','debt_collect'].includes(dm.nhom);
                                return `<tr>
                                    <td>${dm.iconDanhMuc || ''} ${dm.tenDanhMuc}</td>
                                    <td><span class="dm-type ${dm.nhom}">${dm.nhom}</span></td>
                                    <td class="num ${laThu ? 'pos' : 'neg'}">${laThu ? '+' : '-'}${dinhDangTien(dm.tongTien)}</td>
                                    <td class="num" style="color:var(--text3)">${mt ? dinhDangTien(mt) : '—'}</td>
                                    <td class="num ${cl === null ? '' : cl >= 0 ? 'pos' : 'neg'}">
                                        ${cl === null ? '—' : (cl >= 0 ? '+' : '') + dinhDangTien(cl)}
                                    </td>
                                    <td class="num" style="color:var(--text3)">${dm.soGiaoDich}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!--
                 ! Chốt tháng
                -->
                ${!kyThang?.is_closed ? `
                <div class="card">
                    <div class="card-hd">
                        <span class="card-title">Chốt tháng ${thang}/${nam}</span>
                        <span class="badge amber">Chưa chốt</span>
                    </div>
                    <div style="font-size:12.5px;color:var(--text2);margin-bottom:14px">
                        Số dư hệ thống tính được: <strong style="color:var(--green);font-family:var(--mono)">${dinhDangTien(soDuCuoi)}</strong>
                        <br>Nhập số tiền thực tế bạn đang có để chốt tháng.
                    </div>
                    <div class="form-row" style="max-width:400px">
                        <div class="fg">
                            <label class="fl">Số dư thực tế</label>
                            <input class="fi fi-money" id="fi-sodu-thucte" type="text" placeholder="0đ" oninput="formatInputTien(this)">
                        </div>
                        <div class="fg">
                            <label class="fl">Ghi chú</label>
                            <input class="fi" id="fi-ghichu-chot" type="text" placeholder="(tuỳ chọn)">
                        </div>
                    </div>
                    <button class="btn-secondary" style="margin-top:12px" onclick="trangBaoCaoThang.chotThang(${kyThang?.id})">
                        Chốt tháng
                    </button>
                </div>` : `
                <div class="warning-box" style="justify-content:center">
                    ✅ Tháng ${thang}/${nam} đã được chốt vào ${dinhDangNgay(kyThang.closed_at)}
                </div>`}
            `;
        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    chotThang: async (kyThangId) => {
        const soduThucTe    = parseTien(document.getElementById('fi-sodu-thucte')?.value);
        const ghiChu        = document.getElementById('fi-ghichu-chot')?.value;

        if (!soduThucTe) { hienToast('Nhập số dư thực tế trước!', 'err'); return; }

        try {
            await ApiKyThang.chotThang(kyThangId, { soduThucTe, ghiChu });
            hienToast('Đã chốt tháng thành công!', 'ok');
            App.taiLaiTrang();
        } catch (loi) { hienToast(loi.message, 'err'); }
    },
};
