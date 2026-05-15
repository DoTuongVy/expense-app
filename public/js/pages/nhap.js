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
            // Lấy dữ liệu tháng hiện tại
            const ketQua = await ApiGiaoDich.layDanhSach(thang, nam);
            const danhSach = ketQua.duLieu || [];

            // Lấy dữ liệu tháng trước để so sánh
            const thangTruoc = thang === 1 ? 12 : thang - 1;
            const namTruoc = thang === 1 ? nam - 1 : nam;
            const ketQuaTruoc = await ApiGiaoDich.layDanhSach(thangTruoc, namTruoc);
            const danhSachTruoc = ketQuaTruoc.duLieu || [];

            const theoNgay = {};
            danhSach.forEach(gd => {
                const d = new Date(gd.trans_date);
                const ngay = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
                if (!theoNgay[ngay]) theoNgay[ngay] = [];
                theoNgay[ngay].push(gd);
            });

            // Tính tổng chi theo ngày tháng trước
            const chiTheoNgayTruoc = {};
            danhSachTruoc.forEach(gd => {
                const d = new Date(gd.trans_date);
                const soNgay = d.getUTCDate(); // Chỉ lấy số ngày (1-31)
                if (!chiTheoNgayTruoc[soNgay]) chiTheoNgayTruoc[soNgay] = 0;

                // Chỉ tính các giao dịch chi tiêu
                if (['expense', 'debt_give', 'debt_pay', 'saving'].includes(gd.type)) {
                    chiTheoNgayTruoc[soNgay] += Number(gd.amount);
                }
            });

            // Tính tổng chi đến ngày hiện tại
            const ngayHomNay = new Date();
            const soNgayHienTai = ngayHomNay.getDate();

            let tongChiDenNay = 0;
            let tongChiDenNayThangTruoc = 0;

            // Tính tổng chi tháng này đến ngày hiện tại
            danhSach.forEach(gd => {
                const d = new Date(gd.trans_date);
                if (d.getUTCDate() <= soNgayHienTai && ['expense', 'debt_give', 'debt_pay', 'saving'].includes(gd.type)) {
                    tongChiDenNay += Number(gd.amount);
                }
            });

            // Tính tổng chi tháng trước đến cùng ngày
            for (let i = 1; i <= soNgayHienTai; i++) {
                tongChiDenNayThangTruoc += (chiTheoNgayTruoc[i] || 0);
            }

            const cacNgay = Object.keys(theoNgay).sort((a, b) => b.localeCompare(a));

// Tạo HTML bảng so sánh chi tiết
let htmlBangSoSanh = '';
if (tongChiDenNayThangTruoc > 0) {
    htmlBangSoSanh = trangNhap._taoBangSoSanhNgay(danhSach, chiTheoNgayTruoc, soNgayHienTai);
}

content.innerHTML = `
    <div class="nhap-grid">
        <div>
            <!-- THÊM CARD SO SÁNH -->
            ${tongChiDenNayThangTruoc > 0 ? `
            <div class="card" style="margin-bottom:12px;background:${tongChiDenNay > tongChiDenNayThangTruoc ? 'rgba(232, 41, 74, 0.05)' : 'rgba(0, 168, 84, 0.05)'};border-left:3px solid ${tongChiDenNay > tongChiDenNayThangTruoc ? 'var(--red)' : 'var(--green)'}">
                <div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="trangNhap.moChiTietSoSanh()">
                    <div>
                        <div style="font-size:11px;color:var(--text3);margin-bottom:4px">
                            📊 So sánh đến ngày ${soNgayHienTai}
                        </div>
                        <div style="font-size:13px;font-weight:600;color:var(--text)">
                            Chi ${dinhDangTien(tongChiDenNay)} 
                            <span style="color:var(--text3);font-size:11px">/ Tháng trước: ${dinhDangTien(tongChiDenNayThangTruoc)}</span>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div style="font-size:15px;font-weight:700;color:${tongChiDenNay > tongChiDenNayThangTruoc ? 'var(--red)' : 'var(--green)'}">
                            ${tongChiDenNay > tongChiDenNayThangTruoc ? '▲' : '▼'} ${Math.abs(Math.round((tongChiDenNay - tongChiDenNayThangTruoc) / tongChiDenNayThangTruoc * 100))}%
                        </div>
                        <svg id="arrow-chi-tiet" style="width:16px;height:16px;transition:transform 0.2s;color:var(--text3)" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                </div>
                
                <!-- Phần chi tiết ẩn/hiện -->
                <div id="chi-tiet-so-sanh" style="display:none">
                    ${htmlBangSoSanh}
                </div>
            </div>
            ` : ''}
            
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

            trangNhap._renderDanhSach(danhSach, 'all', null);
trangNhap._renderTomTat(danhSach);

document.getElementById('date-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.date-tab');
    if (!btn) return;
    document.querySelectorAll('.date-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const ngay = btn.dataset.ngay;
    
    // Lấy dữ liệu ngày hiện tại
    const danhSachNgay = ngay === 'all' ? danhSach : (theoNgay[ngay] || []);
    
    // Tính tổng chi ngày được chọn (tháng trước)
    let tongChiNgayTruoc = null;
    if (ngay !== 'all') {
        const soNgay = parseInt(ngay.split('-')[2]);
        tongChiNgayTruoc = chiTheoNgayTruoc[soNgay] || 0;
    }
    
    trangNhap._renderDanhSach(danhSachNgay, ngay, tongChiNgayTruoc);
});

        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    _renderDanhSach: (danhSach, ngayLoc, tongChiNgayTruoc) => {
        const container = document.getElementById('ds-nhap-ngay');
        if (!container) return;
    
        if (!danhSach.length) {
            container.innerHTML = htmlEmpty('📋', ngayLoc === 'all' ? 'Tháng này chưa có giao dịch' : 'Ngày này chưa có giao dịch');
            return;
        }
    
        // Tính tổng chi ngày hiện tại
        const tongChiNgayNay = danhSach
            .filter(gd => ['expense','debt_give','debt_pay','saving'].includes(gd.type))
            .reduce((s, gd) => s + Number(gd.amount), 0);
    
        container.innerHTML = `
            <!-- Card so sánh theo ngày -->
            ${ngayLoc !== 'all' && tongChiNgayTruoc !== null && tongChiNgayNay > 0 ? `
            <div class="card" style="margin-bottom:12px;padding:10px;background:${tongChiNgayNay > tongChiNgayTruoc ? 'rgba(232, 41, 74, 0.05)' : 'rgba(0, 168, 84, 0.05)'};border-left:3px solid ${tongChiNgayNay > tongChiNgayTruoc ? 'var(--red)' : 'var(--green)'}">
                <div style="display:flex;align-items:center;justify-content:space-between">
                    <div>
                        <div style="font-size:11px;color:var(--text3);margin-bottom:3px">
                            📊 So sánh ${dinhDangNgay(ngayLoc)}
                        </div>
                        <div style="font-size:13px;font-weight:600;color:var(--text)">
                            Chi <span style="color:${tongChiNgayNay > tongChiNgayTruoc ? 'var(--red)' : 'var(--green)'}; font-family:var(--mono)">${dinhDangTien(tongChiNgayNay)}</span>
                            <span style="color:var(--text3);font-size:11px;font-weight:400">/ Tháng trước: ${dinhDangTien(tongChiNgayTruoc)}</span>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px">
                        ${tongChiNgayTruoc > 0 ? `
                        <span style="font-size:15px;font-weight:700;color:${tongChiNgayNay > tongChiNgayTruoc ? 'var(--red)' : 'var(--green)'}">
                            ${tongChiNgayNay > tongChiNgayTruoc ? '▲' : '▼'} ${Math.abs(Math.round((tongChiNgayNay - tongChiNgayTruoc) / tongChiNgayTruoc * 100))}%
                        </span>
                        ` : ''}
                        <span style="font-size:11px;color:var(--text3)">
                            ${tongChiNgayNay > tongChiNgayTruoc ? 'Chi nhiều hơn' : 'Chi ít hơn'}
                        </span>
                    </div>
                </div>
            </div>
            ` : ''}
            
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
            .filter(gd => ['income', 'debt_take', 'debt_collect'].includes(gd.type))
            .reduce((s, gd) => s + Number(gd.amount), 0);
        const tongChi = danhSach
            .filter(gd => ['expense', 'debt_give', 'debt_pay', 'saving'].includes(gd.type))
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
        const btn = document.getElementById('btn-xoa-nhieu');
        if (!btn) return;
        btn.style.display = soChon > 0 ? 'block' : 'none';
        btn.textContent = `🗑️ Xoá ${soChon} mục đã chọn`;
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



/**
 * Tạo bảng so sánh chi tiết từng ngày
 */
_taoBangSoSanhNgay: (danhSach, chiTheoNgayTruoc, soNgayHienTai) => {
    // Tính chi theo từng ngày của tháng hiện tại + chi tiết danh mục
    const chiTheoNgay = {};
    const danhMucTheoNgay = {}; // Lưu chi tiết danh mục của từng ngày
    
    danhSach.forEach(gd => {
        const d = new Date(gd.trans_date);
        const soNgay = d.getUTCDate();
        
        // Tính tổng chi
        if (!chiTheoNgay[soNgay]) chiTheoNgay[soNgay] = 0;
        if (['expense','debt_give','debt_pay','saving'].includes(gd.type)) {
            chiTheoNgay[soNgay] += Number(gd.amount);
            
            // Lưu chi tiết danh mục
            if (!danhMucTheoNgay[soNgay]) danhMucTheoNgay[soNgay] = {};
            if (!danhMucTheoNgay[soNgay][gd.tenDanhMuc]) {
                danhMucTheoNgay[soNgay][gd.tenDanhMuc] = {
                    tong: 0,
                    icon: gd.iconDanhMuc || '💰',
                    soGiaoDich: 0
                };
            }
            danhMucTheoNgay[soNgay][gd.tenDanhMuc].tong += Number(gd.amount);
            danhMucTheoNgay[soNgay][gd.tenDanhMuc].soGiaoDich += 1;
        }
    });

    // Tạo mảng từ ngày 1 đến ngày hiện tại
    const cacNgay = [];
    for (let i = 1; i <= soNgayHienTai; i++) {
        const chiNay = chiTheoNgay[i] || 0;
        const chiTruoc = chiTheoNgayTruoc[i] || 0;
        const chenhLech = chiNay - chiTruoc;
        const phanTram = chiTruoc > 0 ? Math.round((chenhLech / chiTruoc) * 100) : (chiNay > 0 ? 100 : 0);
        
        // Sắp xếp danh mục theo tổng tiền giảm dần
        let danhMucHtml = '';
        if (danhMucTheoNgay[i]) {
            const cacDanhMuc = Object.entries(danhMucTheoNgay[i])
                .sort((a, b) => b[1].tong - a[1].tong);
            
            danhMucHtml = `
    <div style="padding:8px;background:var(--surface2);border-radius:4px">
                        ${cacDanhMuc.map(([ten, data]) => `
                            <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-light)">
                                <div style="display:flex;align-items:center;gap:6px">
                                    <span style="font-size:14px">${data.icon}</span>
                                    <span style="font-size:11px;color:var(--text2)">${ten}</span>
                                    <span style="font-size:10px;color:var(--text3)">(${data.soGiaoDich} GD)</span>
                                </div>
                                <span style="font-family:var(--mono);font-size:11px;font-weight:600;color:var(--red)">${dinhDangTien(data.tong)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        cacNgay.push({
            ngay: i,
            chiNay,
            chiTruoc,
            chenhLech,
            phanTram,
            danhMucHtml
        });
    }

    // Sắp xếp theo % tăng giảm (những ngày chi nhiều nhất lên đầu)
    cacNgay.sort((a, b) => b.chenhLech - a.chenhLech);

    return `
        <div style="max-height:400px;overflow-y:auto;margin-top:10px">
            <table style="width:100%;font-size:12px;border-collapse:collapse">
                <thead style="position:sticky;top:0;background:var(--surface);z-index:1;border-bottom:1px solid var(--border)">
                    <tr>
                        <th style="padding:8px;text-align:left;font-weight:600;color:var(--text3)">Ngày</th>
                        <th style="padding:8px;text-align:right;font-weight:600;color:var(--text3)">Tháng này</th>
                        <th style="padding:8px;text-align:right;font-weight:600;color:var(--text3)">Tháng trước</th>
                        <th style="padding:8px;text-align:right;font-weight:600;color:var(--text3)">Chênh lệch</th>
                        <th style="padding:8px;text-align:center;font-weight:600;color:var(--text3)">%</th>
                    </tr>
                </thead>
                <tbody>
                    ${cacNgay.map(n => `
                        <tr style="border-bottom:1px solid var(--border-light);cursor:${n.chiNay > 0 ? 'pointer' : 'default'};transition:background 0.2s"
    ${n.chiNay > 0 ? `onclick="trangNhap.moChiTietNgay(${n.ngay})" 
    onmouseenter="this.style.background='var(--surface2)'" 
    onmouseleave="this.style.background='transparent'"` : ''}>
    
    <!-- Cột 1: Ngày -->
    <td style="padding:8px;font-weight:600;color:var(--text)">
        <div style="display:flex;align-items:center;gap:4px">
            ${n.chiNay > 0 ? `
                <svg id="arrow-ngay-${n.ngay}" style="width:12px;height:12px;transition:transform 0.2s;color:var(--text3);flex-shrink:0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
            ` : ''}
            Ngày ${n.ngay}
        </div>
    </td>
    
    <!-- Cột 2: Tháng này -->
    <td style="padding:8px;text-align:right;font-family:var(--mono);color:${n.chiNay > 0 ? 'var(--red)' : 'var(--text3)'}">
        ${n.chiNay > 0 ? dinhDangTien(n.chiNay) : '—'}
    </td>
    
    <!-- Cột 3: Tháng trước -->
    <td style="padding:8px;text-align:right;font-family:var(--mono);color:var(--text3)">
        ${n.chiTruoc > 0 ? dinhDangTien(n.chiTruoc) : '—'}
    </td>
    
    <!-- Cột 4: Chênh lệch -->
    <td style="padding:8px;text-align:right;font-family:var(--mono);font-weight:600;color:${n.chenhLech > 0 ? 'var(--red)' : n.chenhLech < 0 ? 'var(--green)' : 'var(--text3)'}">
        ${n.chenhLech === 0 ? '—' : (n.chenhLech > 0 ? '+' : '') + dinhDangTien(n.chenhLech)}
    </td>
    
    <!-- Cột 5: % -->
    <td style="padding:8px;text-align:center">
        ${n.chiTruoc === 0 && n.chiNay === 0 ? '—' : `
            <span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;
                background:${n.chenhLech > 0 ? 'rgba(232, 41, 74, 0.1)' : n.chenhLech < 0 ? 'rgba(0, 168, 84, 0.1)' : 'transparent'};
                color:${n.chenhLech > 0 ? 'var(--red)' : n.chenhLech < 0 ? 'var(--green)' : 'var(--text3)'}">
                ${n.chenhLech > 0 ? '▲' : n.chenhLech < 0 ? '▼' : '='} ${Math.abs(n.phanTram)}%
            </span>
        `}
    </td>
</tr>

<!-- Dòng chi tiết danh mục (colspan 5 ở đây là OK) -->
${n.danhMucHtml ? `
<tr class="chi-tiet-row" id="chi-tiet-row-${n.ngay}" style="display:none">
    <td colspan="5" style="padding:0 8px 8px 8px">
        ${n.danhMucHtml}
    </td>
</tr>
` : ''}
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
},



/**
 * Mở/đóng chi tiết so sánh từng ngày
 */
moChiTietSoSanh: () => {
    const container = document.getElementById('chi-tiet-so-sanh');
    const arrow = document.getElementById('arrow-chi-tiet');
    
    if (!container || !arrow) return;
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    } else {
        container.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
},

/**
 * Mở/đóng chi tiết danh mục theo ngày
 */
moChiTietNgay: (soNgay) => {
    const row = document.getElementById(`chi-tiet-row-${soNgay}`);
    const arrow = document.getElementById(`arrow-ngay-${soNgay}`);
    
    if (!row) return;
    
    if (row.style.display === 'none') {
        row.style.display = 'table-row';
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
        row.style.display = 'none';
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
},


};