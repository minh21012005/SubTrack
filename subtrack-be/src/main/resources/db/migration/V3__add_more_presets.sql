-- SubTrack V3: Add more premium services

INSERT INTO service_presets (name, category, default_price, currency, billing_cycle, icon_url, color, website_url, description, is_vn_service) VALUES

-- ==================== GAMING & ENTERTAINMENT ====================
('PlayStation Plus', 'ENTERTAINMENT', 150000, 'VND', 'MONTHLY',
 NULL, '#003087', 'https://playstation.com', 'Chơi game online và game miễn phí mỗi tháng', FALSE),

('Xbox Game Pass', 'ENTERTAINMENT', 120000, 'VND', 'MONTHLY',
 NULL, '#107C10', 'https://xbox.com/gamepass', 'Thư viện game Xbox và PC', TRUE),

('FPT Play', 'ENTERTAINMENT', 66000, 'VND', 'MONTHLY',
 NULL, '#FF6600', 'https://fptplay.vn', 'Xem truyền hình và phim chiếu rạp VN', TRUE),

('VieON', 'ENTERTAINMENT', 59000, 'VND', 'MONTHLY',
 NULL, '#FF0000', 'https://vieon.vn', 'Ứng dụng xem phim và show truyền hình VN', TRUE),

('K+', 'ENTERTAINMENT', 175000, 'VND', 'MONTHLY',
 NULL, '#FF0000', 'https://kplus.vn', 'Truyền hình thể thao đỉnh cao, Ngoại hạng Anh', TRUE),

('Galaxy Play', 'ENTERTAINMENT', 50000, 'VND', 'MONTHLY',
 NULL, '#EE0000', 'https://galaxyplay.vn', 'Xem phim Việt có bản quyền', TRUE),

('Amazon Prime Video', 'ENTERTAINMENT', 149000, 'VND', 'MONTHLY',
 NULL, '#00A8E1', 'https://primevideo.com', 'Dịch vụ xem phim của Amazon', FALSE),

('Apple TV+', 'ENTERTAINMENT', 119000, 'VND', 'MONTHLY',
 NULL, '#000000', 'https://tv.apple.com', 'Nội dung gốc độc quyền từ Apple', TRUE),

('Crunchyroll', 'ENTERTAINMENT', 99000, 'VND', 'MONTHLY',
 NULL, '#F47521', 'https://crunchyroll.com', 'Xem Anime bản quyền', TRUE),

-- ==================== LIFESTYLE & HEALTH ====================
('Strava Premium', 'HEALTH', 120000, 'VND', 'MONTHLY',
 NULL, '#FC4C02', 'https://strava.com', 'Phân tích quá trình chạy bộ, đạp xe', FALSE),

('MyFitnessPal Premium', 'HEALTH', 250000, 'VND', 'MONTHLY',
 NULL, '#0066EE', 'https://myfitnesspal.com', 'Theo dõi calo và ăn kiêng trực tuyến', FALSE),

('Calm', 'HEALTH', 150000, 'VND', 'MONTHLY',
 NULL, '#6B8EAC', 'https://calm.com', 'Ứng dụng thiền và giấc ngủ', FALSE),

('Tinder Gold', 'SOCIAL', 300000, 'VND', 'MONTHLY',
 NULL, '#FE3C72', 'https://tinder.com', 'Ứng dụng hẹn hò bản Gold', TRUE),

('Bumble Boost', 'SOCIAL', 200000, 'VND', 'MONTHLY',
 NULL, '#FFC629', 'https://bumble.com', 'Ứng dụng hẹn hò', FALSE),

('X Premium', 'SOCIAL', 200000, 'VND', 'MONTHLY',
 NULL, '#000000', 'https://x.com', 'Tích xanh mạng xã hội X (Twitter)', TRUE),

('Discord Nitro', 'SOCIAL', 225000, 'VND', 'MONTHLY',
 NULL, '#5865F2', 'https://discord.com', 'Tăng cường chất lượng stream và icon độc quyền', TRUE),

-- ==================== UTILITIES & OTHERS ====================
('ExpressVPN', 'UTILITIES', 300000, 'VND', 'MONTHLY',
 NULL, '#DA0F2E', 'https://expressvpn.com', 'Dịch vụ VPN tốc độ cao', FALSE),

('NordVPN', 'UTILITIES', 300000, 'VND', 'MONTHLY',
 NULL, '#002E7A', 'https://nordvpn.com', 'Mạng riêng ảo an toàn', FALSE),

('1Password', 'UTILITIES', 75000, 'VND', 'MONTHLY',
 NULL, '#0A73F7', 'https://1password.com', 'Quản lý mật khẩu cá nhân', FALSE),

('Bitwarden Premium', 'UTILITIES', 250000, 'VND', 'YEARLY',
 NULL, '#175DDC', 'https://bitwarden.com', 'Trình quản lý mật khẩu nguồn mở', FALSE),

('CapCut Pro', 'DESIGN', 205000, 'VND', 'MONTHLY',
 NULL, '#000000', 'https://capcut.com', 'Chỉnh sửa video chuyên nghiệp', TRUE),

('Perplexity Pro', 'AI_TOOLS', 500000, 'VND', 'MONTHLY',
 NULL, '#000000', 'https://perplexity.ai', 'AI tìm kiếm thông minh', FALSE),
 
('Poe', 'AI_TOOLS', 500000, 'VND', 'MONTHLY',
 NULL, '#55DFBC', 'https://poe.com', 'Chat với đa dạng mô hình AI', FALSE),
 
('Google Workspace', 'PRODUCTIVITY', 150000, 'VND', 'MONTHLY',
 NULL, '#4285F4', 'https://workspace.google.com', 'Gmail theo tên miền và ứng dụng', TRUE);
