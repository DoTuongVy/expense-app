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
            const thangTruoc = thang === 1 ? 12 : thang - 1;
const namTruoc   = thang === 1 ? nam - 1 : nam;

const [ketQua, ketQuaTruoc, ketQuaNgay] = await Promise.all([
    ApiBaoCao.baoCaoThang(thang, nam),
    ApiBaoCao.baoCaoThang(thangTruoc, namTruoc),
    ApiBaoCao.chiTheoNgay(thang, nam),
]);
            const { kyThang, tongHop, theoDanhMuc, mucTieu } = ketQua.duLieu;

            // ✅ Lấy system_balance từ kyThang thay vì tính toán
const soDuCuoi = kyThang?.system_balance || 
                 ((tongHop?.opening_balance || 0) + (tongHop?.total_income || 0) - (tongHop?.total_expense || 0));

            const bangMucTieu = {};
            (mucTieu || []).forEach(mt => { bangMucTieu[mt.danhMucId] = mt.soTienMucTieu; });

            // ? Tách nhóm chi / thu
            const dsChi = theoDanhMuc.filter(dm =>
                ['expense','debt_give','debt_pay','saving'].includes(dm.nhom) && dm.tongTien > 0
            ).sort((a, b) => b.tongTien - a.tongTien);

            const dsThu = theoDanhMuc.filter(dm =>
                ['income','debt_take','debt_collect'].includes(dm.nhom) && dm.tongTien > 0
            ).sort((a, b) => b.tongTien - a.tongTien);

            const tongChi   = tongHop?.total_expense || 0;
            const tongThu   = tongHop?.total_income  || 0;
            const tiLeTK    = tongThu > 0 ? Math.round(((tongThu - tongChi) / tongThu) * 100) : 0;

            const tongThuTruoc = ketQuaTruoc.duLieu?.tongHop?.total_income  || 0;
const tongChiTruoc = ketQuaTruoc.duLieu?.tongHop?.total_expense || 0;
const pctThu = tongThuTruoc > 0 ? Math.round((tongThu - tongThuTruoc) / tongThuTruoc * 100) : null;
const pctChi = tongChiTruoc > 0 ? Math.round((tongChi - tongChiTruoc) / tongChiTruoc * 100) : null;

            // ? Màu cho donut chart
            const MAUS = ['#00a854','#2176e8','#7c4dcc','#d97b00','#e8294a','#00bcd4','#ff7043','#8bc34a'];

            content.innerHTML = `

                <!-- ? STAT ROW -->
                <div class="bc-grid" style="grid-template-columns:repeat(4,1fr)">
                    <div class="card">
                        <div class="sc-label">Số dư đầu kỳ</div>
                        <div style="color:var(--text2);font-size:18px;font-family:var(--mono);font-weight:700;margin-top:6px">${dinhDangTien(tongHop?.opening_balance)}</div>
                    </div>
                    <div class="card">
                        <div class="sc-label">Tổng thu</div>
                        <div style="color:var(--green);font-size:18px;font-family:var(--mono);font-weight:700;margin-top:6px">+${dinhDangTien(tongThu)}</div>
                    </div>
                    <div class="card">
                        <div class="sc-label">Tổng chi</div>
                        <div style="color:var(--red);font-size:18px;font-family:var(--mono);font-weight:700;margin-top:6px">−${dinhDangTien(tongChi)}</div>
                    </div>
                    <div class="card">
                        <div class="sc-label">Số dư cuối kỳ</div>
                        <div style="color:var(--blue);font-size:18px;font-family:var(--mono);font-weight:700;margin-top:6px">${dinhDangTien(soDuCuoi)}</div>
                    </div>
                </div>

                <!-- ? HÀNG SO SÁNH + BIỂU ĐỒ THEO NGÀY -->
<div style="display:grid;grid-template-columns:1fr 2fr;gap:14px;margin-bottom:14px">

    <!-- So sánh tháng trước -->
    <div class="card">
        <div class="card-hd">
            <span class="card-title">So với tháng ${thangTruoc}/${namTruoc}</span>
            <span class="badge blue">Tháng trước</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
            <div style="padding:10px;background:var(--surface2);border-radius:var(--r-sm)">
                <div style="font-size:11px;color:var(--text3);margin-bottom:4px">📈 Thu nhập</div>
                <div style="display:flex;align-items:baseline;gap:8px">
                    <span style="font-family:var(--mono);font-weight:700;font-size:15px;color:var(--green)">${dinhDangTien(tongThu)}</span>
                    ${pctThu !== null ? `<span style="font-size:11px;font-weight:700;color:${pctThu >= 0 ? 'var(--green)' : 'var(--red)'}">${pctThu >= 0 ? '▲' : '▼'} ${Math.abs(pctThu)}%</span>` : ''}
                </div>
                <div style="font-size:11px;color:var(--text3);margin-top:2px">Tháng trước: ${dinhDangTien(tongThuTruoc)}</div>
            </div>
            <div style="padding:10px;background:var(--surface2);border-radius:var(--r-sm)">
                <div style="font-size:11px;color:var(--text3);margin-bottom:4px">📉 Chi tiêu</div>
                <div style="display:flex;align-items:baseline;gap:8px">
                    <span style="font-family:var(--mono);font-weight:700;font-size:15px;color:var(--red)">${dinhDangTien(tongChi)}</span>
                    ${pctChi !== null ? `<span style="font-size:11px;font-weight:700;color:${pctChi <= 0 ? 'var(--green)' : 'var(--red)'}">${pctChi >= 0 ? '▲' : '▼'} ${Math.abs(pctChi)}%</span>` : ''}
                </div>
                <div style="font-size:11px;color:var(--text3);margin-top:2px">Tháng trước: ${dinhDangTien(tongChiTruoc)}</div>
            </div>
        </div>
    </div>

    <!-- Biểu đồ chi tiêu theo ngày -->
    <div class="card">
        <div class="card-hd">
            <span class="card-title">Thu – Chi theo ngày</span>
            <span class="badge green">Tháng ${thang}/${nam}</span>
        </div>
        ${trangBaoCaoThang._veBarTheoNgay(ketQuaNgay.duLieu || [])}
    </div>
</div>

                <!-- ? HÀNG 2: Donut chart + Tỉ lệ tiết kiệm + Top chi -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px">

                    <!-- ? Donut chart chi tiêu -->
                    <div class="card">
                        <div class="card-hd">
                            <span class="card-title">Cơ cấu chi tiêu</span>
                            <span class="badge red">${dsChi.length} danh mục</span>
                        </div>
                        ${dsChi.length ? `
                        <div style="display:flex;align-items:center;gap:16px">
                            <svg width="110" height="110" viewBox="0 0 110 110" style="flex-shrink:0">
                                ${trangBaoCaoThang._veDonut(dsChi, tongChi, MAUS)}
                            </svg>
                            <div style="flex:1;display:flex;flex-direction:column;gap:5px">
                                ${dsChi.slice(0, 5).map((dm, i) => `
                                <div style="display:flex;align-items:center;gap:6px">
                                    <div style="width:8px;height:8px;border-radius:50%;background:${MAUS[i % MAUS.length]};flex-shrink:0"></div>
                                    <span style="font-size:11px;color:var(--text2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${dm.iconDanhMuc || ''} ${dm.tenDanhMuc}</span>
                                    <span style="font-size:11px;font-family:var(--mono);font-weight:700;color:var(--text)">${Math.round(dm.tongTien / tongChi * 100)}%</span>
                                </div>`).join('')}
                            </div>
                        </div>` : `<div style="text-align:center;padding:20px;color:var(--text3);font-size:12px">Chưa có chi tiêu</div>`}
                    </div>

                    <!-- ? Tỉ lệ thu/chi/tiết kiệm -->
                    <div class="card">
                        <div class="card-hd">
                            <span class="card-title">Tỉ lệ tài chính</span>
                            <span class="badge ${tiLeTK >= 20 ? 'green' : tiLeTK >= 0 ? 'amber' : 'red'}">${tiLeTK}% tiết kiệm</span>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:10px">
                            <!-- Thu -->
                            <div>
                                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                                    <span style="font-size:11.5px;color:var(--text2)">📈 Thu nhập</span>
                                    <span style="font-size:11.5px;font-family:var(--mono);font-weight:700;color:var(--green)">${dinhDangTien(tongThu)}</span>
                                </div>
                                <div style="height:6px;background:var(--surface3);border-radius:10px">
                                    <div style="height:100%;width:100%;background:var(--green);border-radius:10px"></div>
                                </div>
                            </div>
                            <!-- Chi -->
                            <div>
                                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                                    <span style="font-size:11.5px;color:var(--text2)">📉 Chi tiêu</span>
                                    <span style="font-size:11.5px;font-family:var(--mono);font-weight:700;color:var(--red)">${dinhDangTien(tongChi)}</span>
                                </div>
                                <div style="height:6px;background:var(--surface3);border-radius:10px">
                                    <div style="height:100%;width:${tongThu > 0 ? Math.min(Math.round(tongChi/tongThu*100),100) : 0}%;background:var(--red);border-radius:10px"></div>
                                </div>
                            </div>
                            <!-- Tiết kiệm -->
                            <div>
                                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                                    <span style="font-size:11.5px;color:var(--text2)">🏦 Tiết kiệm</span>
                                    <span style="font-size:11.5px;font-family:var(--mono);font-weight:700;color:var(--blue)">${dinhDangTien(tongHop?.total_saving)}</span>
                                </div>
                                <div style="height:6px;background:var(--surface3);border-radius:10px">
                                    <div style="height:100%;width:${tongThu > 0 ? Math.min(Math.round((tongHop?.total_saving||0)/tongThu*100),100) : 0}%;background:var(--blue);border-radius:10px"></div>
                                </div>
                            </div>
                            <!-- Còn lại -->
                            <div style="margin-top:4px;padding:10px;background:var(--surface2);border-radius:var(--r-sm);display:flex;justify-content:space-between;align-items:center">
                                <span style="font-size:12px;font-weight:600">Còn lại</span>
                                <span style="font-family:var(--mono);font-weight:700;font-size:14px;color:${soDuCuoi >= 0 ? 'var(--green)' : 'var(--red)'}">${dinhDangTien(soDuCuoi)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- ? Top 3 chi nhiều nhất -->
                    <div class="card">
                        <div class="card-hd">
                            <span class="card-title">Top chi tiêu</span>
                            <span class="badge red">Nhiều nhất</span>
                        </div>
                        ${dsChi.length ? `
                        <div style="display:flex;flex-direction:column;gap:8px">
                            ${dsChi.slice(0, 5).map((dm, i) => {
                                const pct = tongChi > 0 ? Math.round(dm.tongTien / tongChi * 100) : 0;
                                const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
                                return `
                                <div>
                                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
                                        <span style="font-size:12px;font-weight:600">${medals[i]} ${dm.iconDanhMuc || ''} ${dm.tenDanhMuc}</span>
                                        <span style="font-size:11px;font-family:var(--mono);color:var(--red);font-weight:700">${dinhDangTien(dm.tongTien)}</span>
                                    </div>
                                    <div style="height:4px;background:var(--surface3);border-radius:10px">
                                        <div style="height:100%;width:${pct}%;background:var(--red);opacity:${1 - i * 0.15};border-radius:10px"></div>
                                    </div>
                                </div>`;
                            }).join('')}
                        </div>` : `<div style="text-align:center;padding:20px;color:var(--text3);font-size:12px">Chưa có chi tiêu</div>`}
                    </div>
                </div>

                <!-- ? Thanh tiến độ ngân sách -->
                ${Object.keys(bangMucTieu).length ? `
                <div class="card" style="margin-bottom:14px">
                    <div class="card-hd">
                        <span class="card-title">Tiến độ ngân sách</span>
                        <span class="badge blue">${Object.keys(bangMucTieu).length} danh mục có mục tiêu</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:10px">
                        ${theoDanhMuc.filter(dm => bangMucTieu[dm.danhMucId]).map(dm => {
                            const mt    = bangMucTieu[dm.danhMucId];
                            const pct   = Math.min(Math.round(dm.tongTien / mt * 100), 100);
                            const mau   = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : 'var(--green)';
                            const vuot  = dm.tongTien > mt;
                            return `
                            <div>
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                                    <span style="font-size:12.5px;font-weight:600">${dm.iconDanhMuc || ''} ${dm.tenDanhMuc}</span>
                                    <span style="font-size:11.5px;font-family:var(--mono)">
                                        <span style="color:${mau};font-weight:700">${dinhDangTien(dm.tongTien)}</span>
                                        <span style="color:var(--text3)"> / ${dinhDangTien(mt)}</span>
                                        ${vuot ? `<span style="color:var(--red);font-weight:700;margin-left:4px">▲ Vượt ${dinhDangTien(dm.tongTien - mt)}</span>` : ''}
                                    </span>
                                </div>
                                <div style="height:6px;background:var(--surface3);border-radius:10px;overflow:hidden">
                                    <div style="height:100%;width:${pct}%;background:${mau};border-radius:10px;transition:width .4s"></div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>` : ''}

                <!-- ? Bảng chi tiết theo danh mục -->
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
                                const mt    = bangMucTieu[dm.danhMucId];
                                const cl    = mt ? mt - dm.tongTien : null;
                                const laThu = ['income','debt_take','debt_collect'].includes(dm.nhom);
                                return `<tr>
                                    <td>${dm.iconDanhMuc || ''} ${dm.tenDanhMuc}</td>
                                    <td><span class="dm-type ${dm.nhom}">${dm.nhom}</span></td>
                                    <td class="num ${laThu ? 'pos' : 'neg'}">${laThu ? '+' : '−'}${dinhDangTien(dm.tongTien)}</td>
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

                <!-- ! Cập nhật số dư & Chốt tháng -->
${!kyThang?.is_closed ? `
<div class="card">
    <div class="card-hd">
        <span class="card-title">Quản lý số dư tháng ${thang}/${nam}</span>
        <span class="badge amber">Chưa chốt</span>
    </div>
    <div style="font-size:12.5px;color:var(--text2);margin-bottom:14px">
        Số dư hệ thống tính được: <strong style="color:var(--green);font-family:var(--mono)">${dinhDangTien(soDuCuoi)}</strong>
    </div>
    
    <!-- Form nhập -->
    <div class="form-row" style="max-width:400px;margin-bottom:14px">
        <div class="fg">
            <label class="fl">Số dư thực tế</label>
            <input class="fi fi-money" id="fi-sodu-thucte" type="text" placeholder="0đ" oninput="formatInputTien(this)">
        </div>
        <div class="fg">
            <label class="fl">Ghi chú</label>
            <input class="fi" id="fi-ghichu-chot" type="text" placeholder="(tuỳ chọn)">
        </div>
    </div>
    
    <!-- 2 nút riêng biệt -->
    <div style="display:flex;gap:10px">
        <button class="btn-secondary" style="flex:1" onclick="trangBaoCaoThang.capNhatSoDu('${kyThang?._id || kyThang?.id}')">
            💾 Cập nhật số dư
        </button>
        <button class="btn-submit" style="flex:1;margin:0" onclick="trangBaoCaoThang.chotThang('${kyThang?._id || kyThang?.id}')">
            🔒 Chốt tháng
        </button>
    </div>
    
    <div style="font-size:11px;color:var(--text3);margin-top:10px;padding:8px;background:var(--surface2);border-radius:6px">
        💡 <strong>Cập nhật số dư:</strong> Chỉnh số liệu cho chính xác, không khóa tháng.<br>
        💡 <strong>Chốt tháng:</strong> Khóa tháng này và lưu làm số dư đầu kỳ cho tháng sau.
    </div>
</div>` : `
<div class="warning-box" style="justify-content:center">
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
        <span>✅ Tháng ${thang}/${nam} đã được chốt vào ${dinhDangNgay(kyThang.closed_at)}</span>
        <button class="btn-secondary" onclick="trangBaoCaoThang.huyChot('${kyThang?._id || kyThang?.id}')">Huỷ chốt</button>
    </div>
</div>`}
            `;

        } catch (loi) {
            content.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${loi.message}</div></div>`;
        }
    },

    /*
    !=======================================================================================
     ? Vẽ donut chart bằng SVG thuần
    !=======================================================================================
    */
    _veDonut: (danhSach, tongSo, maus) => {
        if (!tongSo) return '';
        const cx = 55, cy = 55, r = 40, stroke = 14;
        const circumference = 2 * Math.PI * r;
        let offset = 0;
        const slices = danhSach.slice(0, 6).map((dm, i) => {
            const pct   = dm.tongTien / tongSo;
            const dash  = pct * circumference;
            const gap   = circumference - dash;
            const rotDeg = offset * 360 - 90;
            offset += pct;
            return `<circle
                cx="${cx}" cy="${cy}" r="${r}"
                fill="none"
                stroke="${maus[i % maus.length]}"
                stroke-width="${stroke}"
                stroke-dasharray="${dash} ${gap}"
                stroke-dashoffset="0"
                transform="rotate(${rotDeg} ${cx} ${cy})"
                style="transition:stroke-dasharray .4s"
            />`;
        }).join('');
        return `${slices}
            <circle cx="${cx}" cy="${cy}" r="${r - stroke/2 - 1}" fill="var(--surface)"/>
            <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text)" font-family="var(--mono)">${danhSach.length}</text>
            <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="9" fill="var(--text3)">danh mục</text>`;
    },

    _veBarTheoNgay: (danhSach) => {
    if (!danhSach.length) return `<div style="text-align:center;padding:20px;color:var(--text3);font-size:12px">Chưa có dữ liệu</div>`;

    const maxVal = Math.max(...danhSach.map(d => Math.max(d.tongThu, d.tongChi)), 1);

    return `
    <div style="display:flex;align-items:flex-end;gap:3px;height:90px;overflow-x:auto;padding-bottom:18px;position:relative">
        ${danhSach.map(d => {
            const hThu  = Math.round((d.tongThu / maxVal) * 80);
            const hChi  = Math.round((d.tongChi / maxVal) * 80);
            const ngay  = d._id.split('-')[2];
            return `
            <div style="display:flex;flex-direction:column;align-items:center;gap:1px;flex:1;min-width:18px;position:relative"
                title="${d._id}&#10;Thu: ${parseInt(d.tongThu).toLocaleString('vi-VN')}đ&#10;Chi: ${parseInt(d.tongChi).toLocaleString('vi-VN')}đ">
                <div style="display:flex;align-items:flex-end;gap:1px;height:80px">
                    ${d.tongThu > 0 ? `<div style="width:5px;height:${hThu}px;background:var(--green);border-radius:2px 2px 0 0;opacity:.85"></div>` : '<div style="width:5px"></div>'}
                    ${d.tongChi > 0 ? `<div style="width:5px;height:${hChi}px;background:var(--red);border-radius:2px 2px 0 0;opacity:.85"></div>` : '<div style="width:5px"></div>'}
                </div>
                <span style="font-size:8px;color:var(--text3);font-family:var(--mono);position:absolute;bottom:-14px">${ngay}</span>
            </div>`;
        }).join('')}
    </div>
    <div style="display:flex;gap:12px;margin-top:6px">
        <div style="display:flex;align-items:center;gap:4px">
            <div style="width:8px;height:8px;background:var(--green);border-radius:2px"></div>
            <span style="font-size:11px;color:var(--text3)">Thu</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
            <div style="width:8px;height:8px;background:var(--red);border-radius:2px"></div>
            <span style="font-size:11px;color:var(--text3)">Chi</span>
        </div>
    </div>`;
},

    chotThang: async (kyThangId) => {
    const soduThucTe = parseTien(document.getElementById('fi-sodu-thucte')?.value);
    const ghiChu     = document.getElementById('fi-ghichu-chot')?.value;
    if (!soduThucTe) { hienToast('Nhập số dư thực tế trước!', 'err'); return; }
    try {
        await ApiKyThang.chotThang(kyThangId, { soduThucTe, ghiChu });
        hienToast('Đã chốt tháng thành công!', 'ok');
        App.taiLaiTrang();
    } catch (loi) { hienToast(loi.message, 'err'); }
},

capNhatSoDu: async (kyThangId) => {
    const soduThucTe = parseTien(document.getElementById('fi-sodu-thucte')?.value);
    const ghiChu     = document.getElementById('fi-ghichu-chot')?.value;
    if (!soduThucTe) { hienToast('Nhập số dư thực tế trước!', 'err'); return; }
    
    try {
        await ApiKyThang.capNhatSoDu(kyThangId, { 
            soduThucTe, 
            ghiChu
        });
        
        hienToast('✅ Đã cập nhật số dư!', 'ok');
        App.taiLaiTrang();
    } catch (loi) { 
        hienToast(loi.message, 'err'); 
    }
},

    

    huyChot: (kyThangId) => {
        UI.xacNhan('Huỷ chốt tháng này?', async () => {
            try {
                await ApiKyThang.huyChot(kyThangId);
                hienToast('Đã huỷ chốt tháng', 'ok');
                App.taiLaiTrang();
            } catch (loi) { hienToast(loi.message, 'err'); }
        }, '🔓');
    },
};