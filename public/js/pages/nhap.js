'use strict';

/*
!=======================================================================================
 ! JS/PAGES/NHAP.JS — Trang nhập dữ liệu hàng ngày
!=======================================================================================
*/

const trangNhap = {

    _ngayDangChon: homNayISO(),

    render: async (thang, nam) => {
        const content = document.getElementById('content');
        content.innerHTML = htmlLoading();

        try {
            const ketQua    = await ApiGiaoDich.layDanhSach(thang, nam);
            const danhSach  = ketQua.duLieu || [];

            // ? Nhóm giao dịch theo ngày
            const theoNgay  = {};
            danhSach.forEach(gd => {
                const ngay = gd.trans_date?.split('T')[0] || gd.trans_date;
                if (!theoNgay[ngay]) theoNgay[ngay] = [];
                theoNgay[ngay].push(gd);
            });

            const cacNgay = Object.keys(theoNgay).sort((a, b) => b.localeCompare(a));

            content.innerHTML = `
                <div class="nhap-grid">
                    <!-- ? Cột trái: danh sách theo ngày -->
                    <div>
                        <div class="date-tabs" id="date-tabs">
                            <button class="date-tab active" data-ngay="all">Tất cả</button>
                            ${cacNgay.map(n => `
                                <button class="date-tab" data-ngay="${n}">${dinhDangNgay(n)}</button>
                            `).join('')}
                        </div>
                        <div id="ds-nhap-ngay"></div>
                    </div>

                    <!-- ? Cột phải: tóm tắt ngày -->
                    <div class="card" style="align-self:start">
                        <div class="card-hd">
                            <span class="card-title">Tóm tắt tháng ${thang}</span>
                        </div>
                        <div id="tom-tat-nhap"></div>
                    </div>
                </div>
            `;

            // ? Render danh sách mặc định: tất cả
            trangNhap._renderDanhSach(danhSach, 'all');
            trangNhap._renderTomTat(danhSach);

            // ? Xử lý click tab ngày
            document.getElementById('date-tabs').addEventListener('click', (e) => {
                const btn = e.target.closest('.date-tab');
                if (!btn) return;
                document.querySelectorAll('.date-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const ngay = btn.dataset.ngay;
                if (ngay === 'all') {
                    trangNhap._renderDanhSach(danhSach, 'all');
                } else {
                    trangNhap._renderDanhSach(theoNgay[ngay] || [], ngay);
                }
            });

        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    _renderDanhSach: (danhSach, ngayLoc) => {
        const container = document.getElementById('ds-nhap-ngay');
        if (!container) return;

        if (!danhSach.length) {
            container.innerHTML = htmlEmpty('📋', ngayLoc === 'all' ? 'Tháng này chưa có giao dịch' : 'Ngày này chưa có giao dịch');
            return;
        }

        container.innerHTML = `<div class="trans-list">
            ${danhSach.map(gd => {
                const info = loaiGiaoDich(gd.type);
                return `
                <div class="trans-item" data-id="${gd.id}">
                    <div class="trans-ico ${info.nhom}">${gd.iconDanhMuc || '💰'}</div>
                    <div class="trans-info">
                        <div class="trans-name">${gd.tenDanhMuc}${gd.note ? ` — <span style="color:var(--text3);font-weight:400">${gd.note}</span>` : ''}</div>
                        <div class="trans-date">${dinhDangNgay(gd.trans_date)} · ${info.nhan}</div>
                    </div>
                    <div class="trans-amount ${info.nhom}">${info.ky}${dinhDangTien(gd.amount)}</div>
                    <div class="trans-actions">
                        <button class="btn-icon edit" onclick="App.moModalSua(${gd.id})">✏️</button>
                        <button class="btn-icon del"  onclick="trangNhap.xoaGiaoDich(${gd.id})">🗑️</button>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    },

    _renderTomTat: (danhSach) => {
        const container = document.getElementById('tom-tat-nhap');
        if (!container) return;

        const tongThu = danhSach.filter(gd => ['income','debt_take','debt_collect'].includes(gd.type))
                                .reduce((s, gd) => s + Number(gd.amount), 0);
        const tongChi = danhSach.filter(gd => ['expense','debt_give','debt_pay','saving'].includes(gd.type))
                                .reduce((s, gd) => s + Number(gd.amount), 0);

        container.innerHTML = `
            <div class="sodu-row">
                <span class="sodu-label">📈 Tổng thu</span>
                <span class="sodu-val" style="color:var(--green)">+${dinhDangTien(tongThu)}</span>
            </div>
            <div class="sodu-row">
                <span class="sodu-label">📉 Tổng chi</span>
                <span class="sodu-val" style="color:var(--red)">−${dinhDangTien(tongChi)}</span>
            </div>
            <div class="sodu-result">
                <span class="sodu-result-label">Còn lại</span>
                <span class="sodu-result-val">${dinhDangTien(tongThu - tongChi)}</span>
            </div>
            <div style="margin-top:12px;font-size:11.5px;color:var(--text3);text-align:center">
                ${danhSach.length} giao dịch trong tháng
            </div>
        `;
    },

    /*
    !=======================================================================================
     ! Xoá giao dịch
    !=======================================================================================
    */
    xoaGiaoDich: async (id) => {
        if (!confirm('Xoá giao dịch này?')) return;
        try {
            await ApiGiaoDich.xoa(id);
            hienToast('Đã xoá giao dịch', 'ok');
            App.taiLaiTrang();
        } catch (loi) {
            hienToast(loi.message, 'err');
        }
    },
};
