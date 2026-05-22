'use strict';

/*
!=======================================================================================
 ! JS/APP.JS — Bộ điều phối SPA chính
 ? Quản lý: routing, tháng/năm hiện tại, modal giao dịch
!=======================================================================================
*/

const App = {

    /*
    !=======================================================================================
     ! Trạng thái toàn cục
    !=======================================================================================
    */
    _trangHienTai  : 'dashboard',
    _thangHienTai  : new Date().getMonth() + 1,
    _namHienTai    : new Date().getFullYear(),
    _loaiTabActive : 'income',
    _idDangSua     : null,

    /*
    !=======================================================================================
     ! Khởi động app
    !=======================================================================================
    */
    init: async () => {
        App._capNhatBadgeThang();
        App._capNhatSoDuSidebar();

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                App.chuyenTrang(item.dataset.page);
            });
        });

        document.getElementById('btn-prev').addEventListener('click', () => App._doiThang(-1));
        document.getElementById('btn-next').addEventListener('click', () => App._doiThang(1));
        document.getElementById('btn-them-gd').addEventListener('click', () => App.moModalThem());

        document.getElementById('modal-gd-close').addEventListener('click', App.dongModal);
        document.getElementById('modal-gd').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-gd')) App.dongModal();
        });

        // ? Type tabs
        document.getElementById('type-tabs').addEventListener('click', (e) => {
            const btn = e.target.closest('.ttab');
            if (!btn) return;
            document.querySelectorAll('.ttab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            App._loaiTabActive = btn.dataset.loai;
            App._capNhatDanhMucModal(App._loaiTabActive);
        });

        document.getElementById('fi-sotien').addEventListener('input', function() {
            formatInputTien(this);
        });

        document.getElementById('btn-luu-gd').addEventListener('click', App._luuGiaoDich);

        document.getElementById('menu-btn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // ? Sidebar accordion
        document.querySelectorAll('.nav-acc-header').forEach(hdr => {
            hdr.addEventListener('click', () => {
                const key  = hdr.dataset.acc;
                const body = document.getElementById(`acc-body-${key}`);
                const arr  = hdr.querySelector('.nav-acc-arrow');
                const open = body.classList.toggle('open');
                arr.classList.toggle('open', open);
            });
        });

        App.chuyenTrang('dashboard');
        App._kiemTraSapDenHan();
    },

    /*
    !=======================================================================================
     ! Chuyển trang
    !=======================================================================================
    */
    chuyenTrang: (tenTrang) => {
        App._trangHienTai = tenTrang;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === tenTrang);
        });

        const bangTen = {
            'dashboard'         : 'Tổng quan',
            'nhap'              : 'Nhập dữ liệu',
            'danh-muc'          : 'Danh mục',
            'muc-tieu'          : 'Mục tiêu',
            'chi-tieu-co-dinh'  : 'Chi tiêu cố định',   // ! MỚI
            'bao-cao-thang'     : 'Báo cáo tháng',
            'bao-cao-nam'       : 'Báo cáo năm',
            'no'                : 'Theo dõi nợ',
            'mat-khau'          : 'Quản lý mật khẩu',
        };
        document.getElementById('topbar-title').textContent = bangTen[tenTrang] || tenTrang;
        document.getElementById('sidebar').classList.remove('open');

        // ? Ẩn month-nav và btn-them-gd khi ở trang mật khẩu
        const anTopbarExtra = tenTrang === 'mat-khau';
        document.querySelector('.month-nav').style.display   = anTopbarExtra ? 'none' : '';
        document.getElementById('btn-them-gd').style.display = anTopbarExtra ? 'none' : '';

        App._renderTrang(tenTrang);
    },

    _renderTrang: (tenTrang) => {
        const t = App._thangHienTai;
        const n = App._namHienTai;
        switch (tenTrang) {
            case 'dashboard'         : trangDashboard.render(t, n);       break;
            case 'nhap'              : trangNhap.render(t, n);            break;
            case 'danh-muc'          : trangDanhMuc.render();              break;
            case 'muc-tieu'          : trangMucTieu.render(t, n);         break;
            case 'chi-tieu-co-dinh'  : trangChiTieuCoDinh.render(t, n);  break;  // ! MỚI
            case 'bao-cao-thang'     : trangBaoCaoThang.render(t, n);     break;
            case 'bao-cao-nam'       : trangBaoCaoNam.render(t, n);       break;
            case 'no'                : trangNo.render();                   break;
            case 'mat-khau'          : trangMatKhau.render();              break;
        }
    },

    taiLaiTrang: () => {
        App._renderTrang(App._trangHienTai);
        App._capNhatSoDuSidebar();
    },
    


    /*
!=======================================================================================
 ? Kiểm tra khoản cố định sắp đến hạn khi khởi động
!=======================================================================================
*/
_kiemTraSapDenHan: async () => {
    try {
        const t      = App._thangHienTai;
        const n      = App._namHienTai;
        const ketQua = await ApiChiTieuCoDinh.layTheoThang(t, n);
        const ds     = ketQua.duLieu || [];

        const homNay      = new Date();
        const ngayHienTai = homNay.getDate();

        const sapHan = ds.filter(k =>
            !k.daDong &&
            k.ngayDenHan >= ngayHienTai &&
            k.ngayDenHan <= ngayHienTai + 5
        );
        const quaHan = ds.filter(k =>
            !k.daDong && k.ngayDenHan < ngayHienTai
        );

        const tatCa = [...quaHan, ...sapHan];
        if (!tatCa.length) return;

        // ? Tạo modal nếu chưa có
        if (!document.getElementById('modal-noti-han')) {
            const el = document.createElement('div');
            el.className  = 'modal-overlay';
            el.id         = 'modal-noti-han';
            el.innerHTML  = `
                <div class="modal" style="max-width:420px">
                    <div class="modal-hd">
                        <span class="modal-title">🔔 Nhắc nhở thanh toán</span>
                        <button class="modal-close" onclick="UI.dongModal('modal-noti-han')">✕</button>
                    </div>
                    <div id="modal-noti-han-body" style="padding:0 20px 20px"></div>
                    <div style="padding:0 20px 20px">
                        <button class="btn-submit" onclick="UI.dongModal('modal-noti-han')">Đã hiểu</button>
                    </div>
                </div>
            `;
            document.body.appendChild(el);

            // ? Đóng khi bấm nền
            el.addEventListener('click', (e) => {
                if (e.target === el) UI.dongModal('modal-noti-han');
            });
        }

        // ? Render nội dung
        const body = document.getElementById('modal-noti-han-body');
        body.innerHTML = `
            ${quaHan.length ? `
            <div style="margin-bottom:14px">
                <div style="font-size:11px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">
                    🔴 Đã quá hạn (${quaHan.length})
                </div>
                ${quaHan.map(k => _renderDongNoti(k, 'overdue')).join('')}
            </div>` : ''}

            ${sapHan.length ? `
            <div>
                <div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">
                    🟡 Sắp đến hạn — trong 5 ngày tới (${sapHan.length})
                </div>
                ${sapHan.map(k => _renderDongNoti(k, 'soon')).join('')}
            </div>` : ''}
        `;

        UI.moModal('modal-noti-han');
    } catch (_) {}
},


    /*
    !=======================================================================================
     ? Cập nhật badge tháng trên sidebar
    !=======================================================================================
    */
    _capNhatBadgeThang: () => {
        document.getElementById('badge-text').textContent =
            `Tháng ${App._thangHienTai} / ${App._namHienTai}`;
        document.getElementById('mn-text').textContent =
            `Tháng ${App._thangHienTai} / ${App._namHienTai}`;
    },

    /*
    !=======================================================================================
     ? Đổi tháng ±1
    !=======================================================================================
    */
    _doiThang: (delta) => {
        let t = App._thangHienTai + delta;
        let n = App._namHienTai;
        if (t < 1)  { t = 12; n--; }
        if (t > 12) { t = 1;  n++; }
        App._thangHienTai = t;
        App._namHienTai   = n;
        App._capNhatBadgeThang();
        App.taiLaiTrang();
    },

    /*
    !=======================================================================================
     ? Số dư sidebar
    !=======================================================================================
    */
    _capNhatSoDuSidebar: async () => {
    try {
        const t = App._thangHienTai;
        const n = App._namHienTai;
        const ketQua   = await ApiBaoCao.baoCaoThang(t, n);
        const kyThang  = ketQua.duLieu?.kyThang;
        const tongHop  = ketQua.duLieu?.tongHop;
        
        // ✅ Ưu tiên system_balance từ kyThang
        const soDu = kyThang?.system_balance || 
                     ((tongHop?.opening_balance || 0) + (tongHop?.total_income || 0) - (tongHop?.total_expense || 0));
        
        document.getElementById('sidebar-sodu').textContent = dinhDangTien(soDu);
    } catch (_) {
        document.getElementById('sidebar-sodu').textContent = '--';
    }
},

    /*
    !=======================================================================================
     ! Modal thêm / sửa giao dịch
    !=======================================================================================
    */
    moModalThem: async () => {
        App._idDangSua = null;
        document.getElementById('fi-id-edit').value  = '';
        document.getElementById('fi-sotien').value   = '';
        document.getElementById('fi-ghichu').value   = '';
        document.getElementById('fi-ghichu2').value  = '';
        document.getElementById('fi-ngay').value     = homNayISO();
        document.getElementById('modal-gd-title').textContent = 'Thêm giao dịch';

        // ? Reset về tab Thu nhập
        document.querySelectorAll('.ttab').forEach(b => b.classList.remove('active'));
        document.querySelector('.ttab[data-loai="income"]').classList.add('active');
        App._loaiTabActive = 'income';

        await App._capNhatDanhMucModal('income');

        // ? Mở modal trước
        document.getElementById('modal-gd').classList.add('open');
        setTimeout(() => document.getElementById('fi-sotien').focus(), 100);
    },

    moModalSua: async (id) => {
        try {
            App._idDangSua = id;
            document.getElementById('fi-id-edit').value = id;
            document.getElementById('modal-gd-title').textContent = 'Sửa giao dịch';

            const ketQua  = await ApiGiaoDich.layDanhSach(App._thangHienTai, App._namHienTai);
            const giaoDich = (ketQua.duLieu || []).find(gd => (gd.id || gd._id) === id);
            if (!giaoDich) { hienToast('Không tìm thấy giao dịch', 'err'); return; }

            document.getElementById('fi-sotien').value  = giaoDich.amount.toLocaleString('vi-VN');
            document.getElementById('fi-ghichu').value  = giaoDich.note  || '';
            document.getElementById('fi-ghichu2').value = giaoDich.note2 || '';

            const ngayISO = new Date(giaoDich.trans_date).toISOString().split('T')[0];
            document.getElementById('fi-ngay').value = ngayISO;

            // ? Set đúng tab loại
            document.querySelectorAll('.ttab').forEach(b => {
                b.classList.toggle('active', b.dataset.loai === giaoDich.type);
            });
            App._loaiTabActive = giaoDich.type;

            // ? Mở modal trước
            document.getElementById('modal-gd').classList.add('open');

            // ? Load danh mục rồi chọn đúng cái
            await App._capNhatDanhMucModal(giaoDich.type);
            document.getElementById('fi-danhmuc').value = giaoDich.category_id;
        } catch (loi) { hienToast(loi.message, 'err'); }
    },

    dongModal: () => {
        document.getElementById('modal-gd').classList.remove('open');
        App._idDangSua = null;
    },

    /*
    !=======================================================================================
     ? Load danh mục theo loại tab + cập nhật gợi ý ghi chú
    !=======================================================================================
    */
    _capNhatDanhMucModal: async (loai) => {
        const nhomTheoLoai = {
            income       : 'income',
            expense      : 'expense',
            saving       : 'saving',
            debt_give    : 'debt',
            debt_take    : 'debt',
            debt_collect : 'debt',
            debt_pay     : 'debt',
        };

        const nhom   = nhomTheoLoai[loai] || 'expense';
        const ketQua = await ApiDanhMuc.layTatCa(nhom).catch(() => ({ duLieu: [] }));
        const selEl  = document.getElementById('fi-danhmuc');

        selEl.innerHTML = ketQua.duLieu.map(dm =>
            `<option value="${dm._id || dm.id}">${dm.icon || ''} ${dm.name}</option>`
        ).join('');

        // ? Cập nhật gợi ý ghi chú theo loại
        App._capNhatGoiYGhiChu(loai);
    },

    /*
    !=======================================================================================
     ? Gợi ý ghi chú từ dữ liệu đã nhập trước — dùng datalist HTML5
    !=======================================================================================
    */
    _capNhatGoiYGhiChu: async (loai) => {
        try {
            const ketQua    = await ApiGiaoDich.layDanhSach(App._thangHienTai, App._namHienTai);
            const danhSach  = ketQua.duLieu || [];

            // ? Lọc ghi chú theo loại, bỏ trùng, lấy tối đa 10
            const cacGoiY = [...new Set(
                danhSach
                    .filter(gd => gd.type === loai && gd.note?.trim())
                    .map(gd => gd.note.trim())
            )].slice(0, 10);

            // ? Tạo datalist nếu chưa có
            let dl = document.getElementById('dl-ghichu');
            if (!dl) {
                dl = document.createElement('datalist');
                dl.id = 'dl-ghichu';
                document.body.appendChild(dl);
                document.getElementById('fi-ghichu').setAttribute('list', 'dl-ghichu');
            }

            dl.innerHTML = cacGoiY.map(g => `<option value="${g}">`).join('');
        } catch (_) {}
    },

    /*
    !=======================================================================================
     ! Lưu giao dịch (thêm hoặc sửa)
    !=======================================================================================
    */
    _luuGiaoDich: async () => {
        const soTien    = parseTien(document.getElementById('fi-sotien').value);
        const danhMucId = document.getElementById('fi-danhmuc').value;
        const ngay      = document.getElementById('fi-ngay').value;
        const ghiChu    = document.getElementById('fi-ghichu').value;
        const ghiChu2   = document.getElementById('fi-ghichu2').value;
        const loai      = App._loaiTabActive;
        const idSua     = App._idDangSua;

        if (!soTien || soTien <= 0) { hienToast('Nhập số tiền trước!', 'err'); return; }
        if (!danhMucId || danhMucId === 'undefined' || danhMucId === '') {
            hienToast('Chọn danh mục!', 'err'); return;
        }

        const payload = {
            thang     : App._thangHienTai,
            nam       : App._namHienTai,
            danhMucId,
            loai,
            soTien,
            ngay,
            ghiChu,
            ghiChu2,
        };

        try {
            if (idSua) {
                await ApiGiaoDich.sua(idSua, payload);
                hienToast('Đã cập nhật giao dịch', 'ok');
                // ! Khi sửa thì đóng modal như cũ
                App.dongModal();
            } else {
                await ApiGiaoDich.them(payload);
                hienToast('✅ Đã lưu — nhập tiếp đi!', 'ok');

                // ? Giữ modal mở, chỉ reset số tiền và ghi chú
                // ! Giữ nguyên: tab loại, danh mục, ngày
                document.getElementById('fi-sotien').value  = '';
                document.getElementById('fi-ghichu').value  = '';
                document.getElementById('fi-ghichu2').value = '';
                App._idDangSua = null;
                document.getElementById('fi-id-edit').value = '';

                // ? Focus lại ô số tiền để nhập tiếp
                setTimeout(() => document.getElementById('fi-sotien').focus(), 80);
            }

            App.taiLaiTrang();
        } catch (loi) {
            hienToast(loi.message, 'err');
        }
    },
};




const _renderDongNoti = (k, loai) => {
    const mauNen  = loai === 'overdue' ? 'rgba(239,68,68,.07)'  : 'rgba(245,158,11,.07)';
    const mauVien = loai === 'overdue' ? 'var(--red)'           : 'var(--amber)';
    return `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 12px;
                    background:${mauNen};border-left:3px solid ${mauVien};
                    border-radius:0 6px 6px 0;margin-bottom:6px">
            <span style="font-size:18px">${k.iconDanhMuc || '💸'}</span>
            <div style="flex:1">
                <div style="font-size:13px;font-weight:600">${k.ten}</div>
                <div style="font-size:11px;color:var(--text3)">
                    ${k.tenDanhMuc} · Ngày ${k.ngayDenHan}
                </div>
            </div>
            <div style="font-family:var(--mono);font-weight:700;font-size:13px;color:${mauVien}">
                ${dinhDangTien(k.soTien)}
            </div>
        </div>
    `;
};



/*
!=======================================================================================
 ! Khởi động khi DOM sẵn sàng
!=======================================================================================
*/

document.addEventListener('DOMContentLoaded', () => App.init());