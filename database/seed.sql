/*
!=======================================================================================
 ! DATABASE/SEED.SQL — Dữ liệu mẫu ban đầu
 ? Chạy SAU schema.sql
 ! Lệnh: mysql -u root -p expense_management < database/seed.sql
!=======================================================================================
*/

USE expense_management;

/*
!=======================================================================================
 ! Danh mục mặc định
!=======================================================================================
*/

-- ? Thu nhập
INSERT INTO categories (name, type, icon, color) VALUES
  ('Lương',           'income',  '💰', '#22c55e'),
  ('Thưởng',          'income',  '🎁', '#16a34a'),
  ('Phụ cấp',         'income',  '📋', '#15803d'),
  ('Thu nhập phụ',    'income',  '💼', '#14532d');

-- ? Chi tiêu
INSERT INTO categories (name, type, icon, color) VALUES
  ('Ăn uống',         'expense', '🍜', '#ef4444'),
  ('Di chuyển',       'expense', '🚗', '#dc2626'),
  ('Tiện ích',        'expense', '💡', '#f97316'),
  ('Mua sắm',         'expense', '🛒', '#fb923c'),
  ('Giải trí',        'expense', '🎮', '#f59e0b'),
  ('Sức khoẻ',        'expense', '🏥', '#e11d48'),
  ('Giáo dục',        'expense', '📚', '#7c3aed'),
  ('Khác',            'expense', '📦', '#6b7280');

-- ? Tiết kiệm
INSERT INTO categories (name, type, icon, color) VALUES
  ('Tiết kiệm chung', 'saving',  '🏦', '#3b82f6'),
  ('Quỹ khẩn cấp',   'saving',  '🛡️', '#1d4ed8'),
  ('Mục tiêu lớn',   'saving',  '🎯', '#0ea5e9');

-- ? Nợ
INSERT INTO categories (name, type, icon, color) VALUES
  ('Vay mượn',        'debt',    '🤝', '#a855f7'),
  ('Cho vay',         'debt',    '📤', '#9333ea');

/*
!======================================================================================================================================
*/

/*
!=======================================================================================
 ! Kỳ tháng mẫu — Tháng 4/2026
!=======================================================================================
*/

INSERT INTO monthly_periods (month, year, opening_balance) VALUES (4, 2026, 3350000);

/*
!=======================================================================================
 ! Giao dịch mẫu — Tháng 4/2026
 ? period_id = 1, các category_id theo thứ tự insert ở trên
!=======================================================================================
*/

-- ? Thu nhập (category_id: 1=Lương, 2=Thưởng)
INSERT INTO transactions (period_id, category_id, type, amount, trans_date, note) VALUES
  (1, 1, 'income',  10000000, '2026-04-01', 'Lương tháng 4'),
  (1, 2, 'income',   2500000, '2026-04-10', 'Thưởng dự án Q1');

-- ? Chi tiêu (category_id: 5=Ăn uống, 6=Di chuyển, 7=Tiện ích, 8=Mua sắm)
INSERT INTO transactions (period_id, category_id, type, amount, trans_date, note) VALUES
  (1, 5, 'expense',  150000, '2026-04-03', 'Ăn trưa'),
  (1, 6, 'expense',  200000, '2026-04-07', 'Xăng xe'),
  (1, 7, 'expense',  650000, '2026-04-15', 'Tiền điện nước'),
  (1, 5, 'expense',  280000, '2026-04-18', 'Đi ăn tối'),
  (1, 8, 'expense',  450000, '2026-04-20', 'Mua đồ dùng');

-- ? Tiết kiệm (category_id: 13=Tiết kiệm chung)
INSERT INTO transactions (period_id, category_id, type, amount, trans_date, note) VALUES
  (1, 13, 'saving', 1000000, '2026-04-05', 'Tiết kiệm tháng 4');

-- ? Nợ — người khác trả lại (category_id: 15=Cho vay)
INSERT INTO transactions (period_id, category_id, type, amount, trans_date, note) VALUES
  (1, 15, 'debt_collect', 500000, '2026-04-12', 'Nam trả nợ');

/*
!=======================================================================================
 ! Mục tiêu tháng 4/2026
!=======================================================================================
*/

INSERT INTO goals (period_id, category_id, target_amount) VALUES
  (1, 5,  3000000),   -- ? Ăn uống: 3tr
  (1, 6,   800000),   -- ? Di chuyển: 800k
  (1, 9,  1000000),   -- ? Giải trí: 1tr
  (1, 13, 2000000),   -- ? Tiết kiệm: 2tr
  (1, 8,  2500000);   -- ? Mua sắm: 2.5tr

/*
!======================================================================================================================================
*/
