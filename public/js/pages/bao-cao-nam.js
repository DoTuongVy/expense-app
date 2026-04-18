'use strict';

/*
!=======================================================================================
 ! JS/PAGES/BAO-CAO-NAM.JS
!=======================================================================================
*/

const trangBaoCaoNam = {

    render: async (thang, nam) => {
        const content = document.getElementById('content');
        content.innerHTML = htmlLoading();

        try {
            const ketQua            = await ApiBaoCao.baoCaoNam(nam);
            const { theoThang, tongCaNam, danhSachNam } = ketQua.duLieu;

            const maxThu = Math.max(...theoThang.map(t => Number(t.tongThu)), 1);

            content.innerHTML = `
                <!--
                 ? Tổng năm
                -->
                <div class="bc-grid" style="margin-bottom:16px">
                    <div class="card">
                        <div class="sc-label">Tổng thu năm ${nam}</div>
                        <div style="color:var(--green);font-size:22px;font-family:var(--mono);font-weight:700;margin-top:6px">${dinhDangTien(tongCaNam.tongThu)}</div>
                    </div>
                    <div class="card">
                        <div class="sc-label">Tổng chi năm ${nam}</div>
                        <div style="color:var(--red);font-size:22px;font-family:var(--mono);font-weight:700;margin-top:6px">${dinhDangTien(tongCaNam.tongChi)}</div>
                    </div>
                    <div class="card">
                        <div class="sc-label">Tổng tiết kiệm năm ${nam}</div>
                        <div style="color:var(--blue);font-size:22px;font-family:var(--mono);font-weight:700;margin-top:6px">${dinhDangTien(tongCaNam.tietKiem)}</div>
                    </div>
                </div>

                <!--
                 ? Biểu đồ 12 tháng
                -->
                <div class="card" style="margin-bottom:14px">
                    <div class="card-hd">
                        <span class="card-title">Thu – Chi theo tháng năm ${nam}</span>
                    </div>
                    <div class="bar-wrap" style="height:150px">
                        ${theoThang.map(t => {
                            const pThu = (Number(t.tongThu) / maxThu) * 100;
                            const pChi = (Number(t.tongChi) / maxThu) * 100;
                            return `
                            <div class="bar-col">
                                <div class="bar-pair" style="height:130px;align-items:flex-end">
                                    <div class="bar thu" style="height:${pThu}%"></div>
                                    <div class="bar chi" style="height:${pChi}%"></div>
                                </div>
                                <div class="bar-lbl">T${t.thang}</div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <!--
                 ? Bảng 12 tháng
                -->
                <div class="card">
                    <div class="card-hd">
                        <span class="card-title">Chi tiết từng tháng</span>
                    </div>
                    <table class="bc-table">
                        <thead>
                            <tr>
                                <th>Tháng</th>
                                <th style="text-align:right">Số dư đầu kỳ</th>
                                <th style="text-align:right">Thu nhập</th>
                                <th style="text-align:right">Chi tiêu</th>
                                <th style="text-align:right">Tiết kiệm</th>
                                <th style="text-align:right">Còn lại</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${theoThang.map(t => {
                                const conLai = Number(t.soDauKy) + Number(t.tongThu) - Number(t.tongChi);
                                return `<tr>
                                    <td style="font-weight:600">Tháng ${t.thang}</td>
                                    <td class="num" style="color:var(--text3)">${dinhDangTien(t.soDauKy)}</td>
                                    <td class="num pos">+${dinhDangTien(t.tongThu)}</td>
                                    <td class="num neg">-${dinhDangTien(t.tongChi)}</td>
                                    <td class="num" style="color:var(--blue)">${dinhDangTien(t.tietKiem)}</td>
                                    <td class="num ${conLai >= 0 ? 'pos' : 'neg'}">${dinhDangTien(conLai)}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },
};
