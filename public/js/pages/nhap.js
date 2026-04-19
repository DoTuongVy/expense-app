'use strict';

/*
!=======================================================================================
 ! JS/PAGES/NHAP.JS
!=======================================================================================
*/

const trangNhap = {

    render: async (thang, nam) => {
        const content = document.getElementById('content');
        content.innerHTML = htmlLoading();

        try {
            const ketQua    = await ApiGiaoDich.layDanhSach(thang, nam);
            const danhSach  = ketQua.duLieu || [];

            const theoNgay = {};
            danhSach.forEach(gd => {
    const d    = new Date(gd.trans_date);
    const ngay = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
    if (!theoNgay[ngay]) theoNgay[ngay] = [];
    theoNgay[ngay].push(gd);
});

            const cacNgay = Object.keys(theoNgay).sort((a, b) => b.localeCompare(a));

            content.innerHTML = `
                <div class="nhap-grid">
                    <div>
                        <div class="date-tabs" id="date-tabs">
                            <button class="date-tab active" data-ngay="all">Tất cả</button>
                            ${cacNgay.map(n => `
                                <button class="date-tab" data-ngay="${n}">${dinhDangNgay(n)}</button>
                            `).join('')}
                        </div>
                        <div id="ds-nhap-ngay"></div>
                    </div>
                    <div class="card" style="align-self:start">
                        <div class="card-hd">
                            <span class="card-title">Tóm tắt tháng ${thang}</span>
                        </div>
                        <div id="tom-tat-nhap"></div>
                    </div>
                </div>
            `;

            trangNhap._renderDanhSach(danhSach, 'all');
            trangNhap._renderTomTat(danhSach);

            document.getElementById('date-tabs').addEventListener('click', (e) => {
                const btn = e.target.closest('.date-tab');
                if (!btn) return;
                document.querySelectorAll('.date-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const ngay = btn.dataset.ngay;
                trangNhap._renderDanhSach(ngay === 'all' ? danhSach : (theoNgay[ngay] || []), ngay);
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

    container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--text2);cursor:pointer">
                <input type="checkbox" id="chk-chon-tat-ca" onchange="trangNhap.chonTatCa(this.checked)">
                Chọn tất cả
            </label>
            <button class="btn-danger" id="btn-xoa-nhieu" style="display:none;padding:6px 12px;font-size:12px"
                onclick="trangNhap.xoaNhieu()">
                🗑️ Xoá đã chọn
            </button>
        </div>
        <div class="trans-list">
            ${[...danhSach]
        .sort((a, b) => new Date(b.trans_date) - new Date(a.trans_date))
        .map(gd => {
                const info = loaiGiaoDich(gd.type);
                const gdId = gd.id || gd._id;
                return `
                <div class="trans-item" data-id="${gdId}">
                    <input type="checkbox" class="chk-gd" value="${gdId}"
                        onchange="trangNhap.capNhatNutXoa()"
                        style="flex-shrink:0;width:15px;height:15px;cursor:pointer">
                    <div class="trans-ico ${info.nhom}">${gd.iconDanhMuc || '💰'}</div>
                    <div class="trans-info">
                        <div class="trans-name">${gd.tenDanhMuc}${gd.note ? ` — <span style="color:var(--text3);font-weight:400">${gd.note}</span>` : ''}${gd.note2 ? `<div style="font-size:11.5px;color:var(--text3);font-weight:400;margin-top:2px">${gd.note2}</div>` : ''}</div>
                        <div class="trans-date">${dinhDangNgay(gd.trans_date)} · ${info.nhan}</div>
                    </div>
                    <div class="trans-amount ${info.nhom}">${info.ky}${dinhDangTien(gd.amount)}</div>
                    <div class="trans-actions">
                        <button class="btn-icon edit" onclick="App.moModalSua('${gdId}')">✏️</button>
                        <button class="btn-icon del" onclick="trangNhap.xoaGiaoDich('${gdId}')">🗑️</button>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
},
    _renderTomTat: (danhSach) => {
        const container = document.getElementById('tom-tat-nhap');
        if (!container) return;

        const tongThu = danhSach
            .filter(gd => ['income','debt_take','debt_collect'].includes(gd.type))
            .reduce((s, gd) => s + Number(gd.amount), 0);
        const tongChi = danhSach
            .filter(gd => ['expense','debt_give','debt_pay','saving'].includes(gd.type))
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
     ! Xoá giao dịch — dùng modal xác nhận thay confirm()
    !=======================================================================================
    */
    xoaGiaoDich: (id) => {
        UI.xacNhan('Xoá giao dịch này?', async () => {
            try {
                await ApiGiaoDich.xoa(id);
                hienToast('Đã xoá giao dịch', 'ok');
                App.taiLaiTrang();
            } catch (loi) {
                hienToast(loi.message, 'err');
            }
        });
    },

    chonTatCa: (checked) => {
    document.querySelectorAll('.chk-gd').forEach(chk => chk.checked = checked);
    trangNhap.capNhatNutXoa();
},

capNhatNutXoa: () => {
    const soChon = document.querySelectorAll('.chk-gd:checked').length;
    const btn    = document.getElementById('btn-xoa-nhieu');
    if (!btn) return;
    btn.style.display   = soChon > 0 ? 'block' : 'none';
    btn.textContent     = `🗑️ Xoá ${soChon} mục đã chọn`;
},

xoaNhieu: () => {
    const cacId = [...document.querySelectorAll('.chk-gd:checked')].map(c => c.value);
    if (!cacId.length) return;

    UI.xacNhan(`Xoá ${cacId.length} giao dịch đã chọn?`, async () => {
        try {
            await Promise.all(cacId.map(id => ApiGiaoDich.xoa(id)));
            hienToast(`Đã xoá ${cacId.length} giao dịch`, 'ok');
            App.taiLaiTrang();
        } catch (loi) {
            hienToast(loi.message, 'err');
        }
    });
},

};