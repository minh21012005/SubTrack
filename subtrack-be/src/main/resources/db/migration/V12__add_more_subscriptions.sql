-- SubTrack V12: Add highly popular everyday services in Vietnam

INSERT INTO service_presets (name, category, default_price, currency, billing_cycle, icon_url, color, website_url, description, is_vn_service) VALUES

-- ==================== TELECOM & INTERNET (Gói cước tháng) ====================
('Viettel Data', 'UTILITIES', 120000, 'VND', 'MONTHLY',
 NULL, '#EE0033', 'https://vietteltelecom.vn', 'Gói cước 4G/5G Viettel hàng tháng (VD: ST120K)', TRUE),

('MobiFone Data', 'UTILITIES', 120000, 'VND', 'MONTHLY',
 NULL, '#0055A5', 'https://mobifone.vn', 'Gói cước 4G/5G MobiFone hàng tháng (VD: C120)', TRUE),

('VinaPhone Data', 'UTILITIES', 120000, 'VND', 'MONTHLY',
 NULL, '#00A8E6', 'https://vinaphone.com.vn', 'Gói cước 4G/5G VinaPhone hàng tháng', TRUE),

('FPT Internet', 'UTILITIES', 250000, 'VND', 'MONTHLY',
 NULL, '#FF6600', 'https://fpt.vn', 'Cước phí Internet cáp quang FPT Telecom', TRUE),

-- ==================== ENTERTAINMENT & TV (Phổ biến tại VN) ====================
('TV360', 'ENTERTAINMENT', 50000, 'VND', 'MONTHLY',
 NULL, '#EE0033', 'https://tv360.vn', 'Truyền hình di động và bóng đá của Viettel', TRUE),

('VTVcab ON', 'ENTERTAINMENT', 66000, 'VND', 'MONTHLY',
 NULL, '#FF0000', 'https://vtvcab.vn', 'Ứng dụng xem truyền hình trực tuyến VTV', TRUE),

('MyTV', 'ENTERTAINMENT', 55000, 'VND', 'MONTHLY',
 NULL, '#00A1E4', 'https://mytv.com.vn', 'Truyền hình theo yêu cầu của VNPT', TRUE),

('WeTV VIP', 'ENTERTAINMENT', 49000, 'VND', 'MONTHLY',
 NULL, '#00C324', 'https://wetv.vip', 'Phim bộ, show thực tế Châu Á cực thịnh hành', TRUE),

('iQIYI VIP', 'ENTERTAINMENT', 49000, 'VND', 'MONTHLY',
 NULL, '#00CC00', 'https://iq.com', 'Nền tảng xem phim chiếu rạp và phim bộ hot', TRUE),

-- ==================== MUSIC (Top tại VN) ====================
('Zing MP3 VIP', 'MUSIC', 49000, 'VND', 'MONTHLY',
 NULL, '#8444A0', 'https://zingmp3.vn', 'Nghe và tải nhạc bản quyền không giới hạn', TRUE),

('NhacCuaTui VIP', 'MUSIC', 49000, 'VND', 'MONTHLY',
 NULL, '#1F8EEA', 'https://nhaccuatui.com', 'Dịch vụ nghe nhạc trực tuyến chất lượng cao', TRUE),

-- ==================== COMMERCE & EVERYDAY ====================
('GrabUnlimited', 'SERVICES', 49000, 'VND', 'MONTHLY',
 NULL, '#00B14F', 'https://grab.com', 'Gói đặc quyền miễn phí giao hàng GrabFood', TRUE),

('Zalo Cloud', 'CLOUD', 19000, 'VND', 'MONTHLY',
 NULL, '#0068FF', 'https://zbox.zalo.me', 'Gói mở rộng dung lượng zCloud an toàn trên Zalo', TRUE),

('Fonos Premium', 'ENTERTAINMENT', 99000, 'VND', 'MONTHLY',
 NULL, '#ED3B5C', 'https://fonos.vn', 'Sách nói bản quyền nổi bật nhất Việt Nam', TRUE),

('California Fitness', 'HEALTH', 800000, 'VND', 'MONTHLY',
 NULL, '#D32128', 'https://cali.vn', 'Thẻ hội viên Gym/Yoga hàng tháng', TRUE);
