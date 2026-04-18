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
        // ? Cập nhật badge tháng sidebar
        App._capNhatBadgeThang();

        // ? Lấy kỳ tháng hiện tại để hiển thị số dư sidebar
        App._capNhatSoDuSidebar();

        // ? Đăng ký sự kiện nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const trang = item.dataset.page;
                App.chuyenTrang(trang);
            });
        });

        // ? Điều hướng tháng
        document.getElementById('btn-prev').addEventListener('click', () => App._doiThang(-1));
        document.getElementById('btn-next').addEventListener('click', () => App._doiThang(1));

        // ? Nút thêm giao dịch
        document.getElementById('btn-them-gd').addEventListener('click', () => App.moModalThem());

        // ? Modal giao dịch
        document.getElementById('modal-gd-close').addEventListener('click', App.dongModal);
        document.getElementById('modal-gd').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-gd')) App.dongModal();
        });

        // ? Type tabs trong modal
        document.getElementById('type-tabs').addEventListener('click', (e) => {
            const btn = e.target.closest('.ttab');
            if (!btn) return;
            document.querySelectorAll('.ttab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            App._loaiTabActive = btn.dataset.loai;
            App._capNhatDanhMucModal(App._loaiTabActive);
        });

        // ? Format số tiền khi nhập
        document.getElementById('fi-sotien').addEventListener('input', function() {
            formatInputTien(this);
        });

        // ? Lưu giao dịch
        document.getElementById('btn-luu-gd').addEventListener('click', App._luuGiaoDich);

        // ? Mobile menu
        document.getElementById('menu-btn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // ? Render trang dashboard mặc định
        App.chuyenTrang('dashboard');
    },

    /*
    !=======================================================================================
     ! Chuyển trang
    !=======================================================================================
    */
    chuyenTrang: (tenTrang) => {
        App._trangHienTai = tenTrang;

        // ? Cập nhật nav active
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === tenTrang);
        });

        // ? Cập nhật title topbar
        const bangTen = {
            'dashboard'     : 'Tổng quan',
            'nhap'          : 'Nhập dữ liệu',
            'danh-muc'      : 'Danh mục',
            'muc-tieu'      : 'Mục tiêu',
            'bao-cao-thang' : 'Báo cáo tháng',
            'bao-cao-nam'   : 'Báo cáo năm',
            'no'            : 'Theo dõi nợ',
        };
        document.getElementById('topbar-title').textContent = bangTen[tenTrang] || tenTrang;

        // ? Đóng sidebar mobile khi chọn trang
        document.getElementById('sidebar').classList.remove('open');

        // ? Render trang tương ứng
        App._renderTrang(tenTrang);
    },

    _renderTrang: (tenTrang) => {
        const t = App._thangHienTai;
        const n = App._namHienTai;

        switch (tenTrang) {
            case 'dashboard'     : trangDashboard.render(t, n);    break;
            case 'nhap'          : trangNhap.render(t, n);         break;
            case 'danh-muc'      : trangDanhMuc.render();           break;
            case 'muc-tieu'      : trangMucTieu.render(t, n);      break;
            case 'bao-cao-thang' : trangBaoCaoThang.render(t, n);  break;
            case 'bao-cao-nam'   : trangBaoCaoNam.render(t, n);    break;
            case 'no'            : trangNo.render();                break;
        }
    },

    /*
    !=======================================================================================
     ! Tải lại trang hiện tại (sau khi thêm/sửa/xoá)
    !=======================================================================================
    */
    taiLaiTrang: () => {
        App._renderTrang(App._trangHienTai);
        App._capNhatSoDuSidebar();
    },

    /*
    !=======================================================================================
     ? Đổi tháng ± 1
    !=======================================================================================
    */
    _doiThang: (delta) => {
        App._thangHienTai += delta;
        if (App._thangHienTai > 12) { App._thangHienTai = 1;  App._namHienTai++; }
        if (App._thangHienTai < 1)  { App._thangHienTai = 12; App._namHienTai--; }
        App._capNhatBadgeThang();
        App.taiLaiTrang();
    },

    _capNhatBadgeThang: () => {
        const chuoi = `Tháng ${String(App._thangHienTai).padStart(2,'0')} / ${App._namHienTai}`;
        document.getElementById('badge-text').textContent = chuoi;
        document.getElementById('mn-text').textContent    = `Tháng ${App._thangHienTai} / ${App._namHienTai}`;
    },

    _capNhatSoDuSidebar: async () => {
        try {
            const ketQua = await ApiBaoCao.baoCaoThang(App._thangHienTai, App._namHienTai);
            const th     = ketQua.duLieu?.tongHop;
            if (!th) return;
            const soDu = (th.opening_balance || 0) + (th.total_income || 0) - (th.total_expense || 0);
            document.getElementById('sidebar-sodu').textContent = dinhDangTien(soDu);
        } catch (_) {}
    },

    /*
    !=======================================================================================
     ! Modal giao dịch — Mở để THÊM
    !=======================================================================================
    */
    moModalThem: () => {
        App._idDangSua = null;
        document.getElementById('modal-gd-title').textContent = 'Thêm giao dịch';
        document.getElementById('fi-sotien').value   = '';
        document.getElementById('fi-ghichu').value   = '';
        document.getElementById('fi-ngay').value     = homNayISO();
        document.getElementById('fi-id-edit').value  = '';

        // ? Reset tab về thu nhập
        document.querySelectorAll('.ttab').forEach(b => b.classList.remove('active'));
        document.querySelector('.ttab[data-loai="income"]').classList.add('active');
        App._loaiTabActive = 'income';
        App._capNhatDanhMucModal('income');

        document.getElementById('modal-gd').classList.add('open');
        setTimeout(() => document.getElementById('fi-sotien').focus(), 100);
    },

    /*
    !=======================================================================================
     ? Modal giao dịch — Mở để SỬA
    !=======================================================================================
    */
    moModalSua: async (id) => {
        try {
            // ? Lấy danh sách để tìm giao dịch theo ID
            const ketQua   = await ApiGiaoDich.layDanhSach(App._thangHienTai, App._namHienTai);
            const giaoDich = ketQua.duLieu.find(gd => gd.id === id);
            if (!giaoDich) { hienToast('Không tìm thấy giao dịch', 'err'); return; }

            App._idDangSua = id;
            document.getElementById('modal-gd-title').textContent = 'Sửa giao dịch';
            document.getElementById('fi-id-edit').value  = id;
            document.getElementById('fi-sotien').value   = dinhDangTien(giaoDich.amount);
            document.getElementById('fi-ghichu').value   = giaoDich.note || '';
            document.getElementById('fi-ngay').value     = giaoDich.trans_date?.split('T')[0] || homNayISO();

            // ? Set đúng tab
            document.querySelectorAll('.ttab').forEach(b => b.classList.remove('active'));
            const tabBtn = document.querySelector(`.ttab[data-loai="${giaoDich.type}"]`);
            if (tabBtn) { tabBtn.classList.add('active'); App._loaiTabActive = giaoDich.type; }
            else { document.querySelector('.ttab[data-loai="income"]').classList.add('active'); App._loaiTabActive = 'income'; }

            await App._capNhatDanhMucModal(giaoDich.type);

            // ? Chọn đúng danh mục
            document.getElementById('fi-danhmuc').value = giaoDich.category_id;
            document.getElementById('modal-gd').classList.add('open');
        } catch (loi) { hienToast(loi.message, 'err'); }
    },

    dongModal: () => {
        document.getElementById('modal-gd').classList.remove('open');
        App._idDangSua = null;
    },

    /*
    !=======================================================================================
     ? Cập nhật danh sách danh mục trong modal theo loại tab
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

        const nhom      = nhomTheoLoai[loai] || 'expense';
        const ketQua    = await ApiDanhMuc.layTatCa(nhom).catch(() => ({ duLieu: [] }));
        const selEl     = document.getElementById('fi-danhmuc');

        selEl.innerHTML = ketQua.duLieu.map(dm =>
            `<option value="${dm.id}">${dm.icon || ''} ${dm.name}</option>`
        ).join('');
    },

    /*
    !=======================================================================================
     ! Lưu giao dịch (thêm hoặc sửa)
    !=======================================================================================
    */
    _luuGiaoDich: async () => {
        const soTien    = parseTien(document.getElementById('fi-sotien').value);
        const danhMucId = parseInt(document.getElementById('fi-danhmuc').value);
        const ngay      = document.getElementById('fi-ngay').value;
        const ghiChu    = document.getElementById('fi-ghichu').value;
        const loai      = App._loaiTabActive;
        const idSua     = App._idDangSua;

        if (!soTien || soTien <= 0) { hienToast('Nhập số tiền trước!', 'err'); return; }
        if (!danhMucId)             { hienToast('Chọn danh mục!', 'err'); return; }

        const payload = {
            thang     : App._thangHienTai,
            nam       : App._namHienTai,
            danhMucId,
            loai,
            soTien,
            ngay,
            ghiChu,
        };

        try {
            if (idSua) {
                await ApiGiaoDich.sua(idSua, payload);
                hienToast('Đã cập nhật giao dịch', 'ok');
            } else {
                await ApiGiaoDich.them(payload);
                hienToast('Đã thêm giao dịch', 'ok');
            }
            App.dongModal();
            App.taiLaiTrang();
        } catch (loi) {
            hienToast(loi.message, 'err');
        }
    },
};

/*
!=======================================================================================
 ! Khởi động khi DOM sẵn sàng
!=======================================================================================
*/

document.addEventListener('DOMContentLoaded', () => App.init());
