'use strict';

/*
!=======================================================================================
 ! JS/PAGES/DASHBOARD.JS — Trang tổng quan
!=======================================================================================
*/

const trangDashboard = {

    /*
    !=======================================================================================
     ! Render toàn bộ trang dashboard
    !=======================================================================================
    */
    render: async (thang, nam) => {
        const content = document.getElementById('content');
        content.innerHTML = htmlLoading();

        try {
            const [ketQuaBaoCao, ketQuaMucTieu] = await Promise.all([
                ApiBaoCao.baoCaoThang(thang, nam),
                ApiMucTieu.layTheoThang(thang, nam),
            ]);

            const { kyThang, tongHop, theoDanhMuc } = ketQuaBaoCao.duLieu;
            const dsMucTieu = ketQuaMucTieu.duLieu;

            // ? Tính số dư cuối kỳ
            const soDuCuoi = (tongHop?.opening_balance || 0)
                + (tongHop?.total_income   || 0)
                - (tongHop?.total_expense  || 0);

            content.innerHTML = `
                <!--
                !=======================================================================================
                 ! STAT CARDS
                !=======================================================================================
                -->
                <div class="stat-grid">
                    <div class="stat-card green">
                        <div class="sc-label">Thu nhập</div>
                        <div class="sc-value">${dinhDangTien(tongHop?.total_income)}</div>
                        <div class="sc-sub">Tháng ${thang}/${nam}</div>
                    </div>
                    <div class="stat-card red">
                        <div class="sc-label">Chi tiêu</div>
                        <div class="sc-value">${dinhDangTien(tongHop?.total_expense)}</div>
                        <div class="sc-sub">Tháng ${thang}/${nam}</div>
                    </div>
                    <div class="stat-card blue">
                        <div class="sc-label">Tiết kiệm</div>
                        <div class="sc-value">${dinhDangTien(tongHop?.total_saving)}</div>
                        <div class="sc-sub">${tongHop?.total_income ? Math.round((tongHop.total_saving / tongHop.total_income) * 100) : 0}% thu nhập</div>
                    </div>
                    <div class="stat-card purple">
                        <div class="sc-label">Số dư (HT)</div>
                        <div class="sc-value">${dinhDangTien(soDuCuoi)}</div>
                        <div class="sc-sub">Sau thu chi</div>
                    </div>
                </div>

                <!--
                !=======================================================================================
                 ! MIDDLE: biểu đồ + giao dịch gần đây
                !=======================================================================================
                -->
                <div class="mid-grid">
                    <div class="card">
                        <div class="card-hd">
                            <span class="card-title">Thu – Chi 6 tháng</span>
                            <span class="badge green" id="badge-chenh-lech">--</span>
                        </div>
                        <div id="bieu-do-container"></div>
                    </div>

                    <div class="card">
                        <div class="card-hd">
                            <span class="card-title">Giao dịch gần đây</span>
                            <span class="badge blue">Tháng ${thang}</span>
                        </div>
                        <div id="ds-giao-dich-dash"></div>
                    </div>
                </div>

                <!--
                !=======================================================================================
                 ! BOTTOM: mục tiêu + số dư
                !=======================================================================================
                -->
                <div class="bot-grid">
                    <div class="card">
                        <div class="card-hd">
                            <span class="card-title">Tiến độ mục tiêu</span>
                            <span class="badge blue">${dsMucTieu.length} danh mục</span>
                        </div>
                        ${trangDashboard._renderMucTieu(dsMucTieu)}
                    </div>

                    <div class="card">
                        <div class="card-hd">
                            <span class="card-title">Số dư tháng ${thang}</span>
                            <span class="badge ${kyThang?.is_closed ? 'green' : 'amber'}">${kyThang?.is_closed ? 'Đã chốt' : 'Đang mở'}</span>
                        </div>
                        ${trangDashboard._renderSoDu(tongHop, soDuCuoi)}
                    </div>
                </div>
            `;

            // ? Load biểu đồ + giao dịch gần đây async
            trangDashboard._loadBieuDo(thang, nam);
            trangDashboard._loadGiaoDichGanDay(thang, nam);

        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    /*
    !=======================================================================================
     ? Render thanh mục tiêu
    !=======================================================================================
    */
    _renderMucTieu: (dsMucTieu) => {
        if (!dsMucTieu.length) return htmlEmpty('🎯', 'Chưa có mục tiêu nào');

        return `<div class="goal-list">
            ${dsMucTieu.map(mt => {
                const { phanTram, mau } = tinhPhanTramGoal(mt.soTienThucTe, mt.soTienMucTieu);
                return `
                <div class="goal-item">
                    <div class="goal-hd">
                        <span class="goal-name">${mt.iconDanhMuc || ''} ${mt.tenDanhMuc}</span>
                        <span class="goal-nums">${dinhDangTien(mt.soTienThucTe)} / ${dinhDangTien(mt.soTienMucTieu)}</span>
                    </div>
                    <div class="goal-bar">
                        <div class="goal-fill ${mau}" style="width:${phanTram}%"></div>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    },

    /*
    !=======================================================================================
     ? Render bảng số dư
    !=======================================================================================
    */
    _renderSoDu: (tongHop, soDuCuoi) => {
        if (!tongHop) return htmlEmpty('📊', 'Chưa có dữ liệu');

        const chenhLech = soDuCuoi - (tongHop.system_closing_balance || soDuCuoi);

        return `
            <div class="sodu-row">
                <span class="sodu-label">💵 Số dư đầu kỳ</span>
                <span class="sodu-val" style="color:var(--text2)">${dinhDangTien(tongHop.opening_balance)}</span>
            </div>
            <div class="sodu-row">
                <span class="sodu-label">📈 Tổng thu</span>
                <span class="sodu-val" style="color:var(--green)">+${dinhDangTien(tongHop.total_income)}</span>
            </div>
            <div class="sodu-row">
                <span class="sodu-label">📉 Tổng chi</span>
                <span class="sodu-val" style="color:var(--red)">−${dinhDangTien(tongHop.total_expense)}</span>
            </div>
            <div class="sodu-row">
                <span class="sodu-label">🏦 Tiết kiệm</span>
                <span class="sodu-val" style="color:var(--blue)">−${dinhDangTien(tongHop.total_saving)}</span>
            </div>
            <div class="sodu-result">
                <span class="sodu-result-label">Số dư (hệ thống)</span>
                <span class="sodu-result-val">${dinhDangTien(soDuCuoi)}</span>
            </div>
            ${chenhLech !== 0 ? `<div class="warning-box">⚠️ Chênh lệch ${dinhDangTien(Math.abs(chenhLech))} — chưa chốt tháng</div>` : ''}
        `;
    },

    /*
    !=======================================================================================
     ? Load và render biểu đồ 6 tháng
    !=======================================================================================
    */
    _loadBieuDo: async (thangHienTai, namHienTai) => {
        const container = document.getElementById('bieu-do-container');
        if (!container) return;

        // ? Tạo mảng 6 tháng gần nhất
        const ds6Thang = [];
        let t = thangHienTai, n = namHienTai;
        for (let i = 0; i < 6; i++) {
            ds6Thang.unshift({ thang: t, nam: n });
            t--; if (t < 1) { t = 12; n--; }
        }

        // ? Gọi API song song
        const ketQua = await Promise.all(
            ds6Thang.map(({ thang, nam }) => ApiBaoCao.baoCaoThang(thang, nam).catch(() => null))
        );

        const duLieu = ketQua.map((kq, i) => ({
            nhan    : `T${ds6Thang[i].thang}`,
            thu     : kq?.duLieu?.tongHop?.total_income  || 0,
            chi     : kq?.duLieu?.tongHop?.total_expense || 0,
        }));

        const maxGiaTri = Math.max(...duLieu.map(d => Math.max(d.thu, d.chi)), 1);

        const tongChenhLech = duLieu.reduce((tc, d) => tc + d.thu - d.chi, 0);
        const badgeCL = document.getElementById('badge-chenh-lech');
        if (badgeCL) {
            badgeCL.textContent = (tongChenhLech >= 0 ? '+' : '') + dinhDangTien(tongChenhLech);
            badgeCL.className   = `badge ${tongChenhLech >= 0 ? 'green' : 'red'}`;
        }

        container.innerHTML = `
            <div class="bar-wrap">
                ${duLieu.map(d => {
                    const pThu = (d.thu / maxGiaTri) * 100;
                    const pChi = (d.chi / maxGiaTri) * 100;
                    return `
                    <div class="bar-col">
                        <div class="bar-pair" style="height:110px;align-items:flex-end">
                            <div class="bar thu" style="height:${pThu}%"></div>
                            <div class="bar chi" style="height:${pChi}%"></div>
                        </div>
                        <div class="bar-lbl">${d.nhan}</div>
                    </div>`;
                }).join('')}
            </div>
            <div style="display:flex;gap:14px;margin-top:10px">
                <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text3)">
                    <div style="width:8px;height:8px;border-radius:2px;background:var(--green)"></div> Thu
                </div>
                <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text3)">
                    <div style="width:8px;height:8px;border-radius:2px;background:var(--red)"></div> Chi
                </div>
            </div>
        `;
    },

    /*
    !=======================================================================================
     ? Load giao dịch gần đây (10 cái mới nhất)
    !=======================================================================================
    */
    _loadGiaoDichGanDay: async (thang, nam) => {
        const container = document.getElementById('ds-giao-dich-dash');
        if (!container) return;

        const ketQua    = await ApiGiaoDich.layDanhSach(thang, nam).catch(() => null);
        const danhSach  = (ketQua?.duLieu || []).slice(0, 10);

        if (!danhSach.length) {
            container.innerHTML = htmlEmpty('📋', 'Chưa có giao dịch');
            return;
        }

        container.innerHTML = `<div class="trans-list">
            ${danhSach.map(gd => {
                const info = loaiGiaoDich(gd.type);
                return `
                <div class="trans-item">
                    <div class="trans-ico ${info.nhom}">${gd.iconDanhMuc || '💰'}</div>
                    <div class="trans-info">
                        <div class="trans-name">${gd.tenDanhMuc}</div>
                        <div class="trans-date">${dinhDangNgay(gd.trans_date)}</div>
                    </div>
                    <div class="trans-amount ${info.nhom}">
                        ${info.ky}${dinhDangTien(gd.amount)}
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    },
};
