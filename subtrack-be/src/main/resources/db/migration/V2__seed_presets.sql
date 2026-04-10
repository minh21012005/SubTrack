-- SubTrack V2: Seed Service Presets
-- ~30 popular services (VN-first)

INSERT INTO service_presets (name, category, default_price, currency, billing_cycle, icon_url, color, website_url, description, is_vn_service) VALUES

-- ==================== ENTERTAINMENT ====================
('Netflix', 'ENTERTAINMENT', 180000, 'VND', 'MONTHLY',
 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netflix/netflix-original.svg',
 '#E50914', 'https://netflix.com', 'Dịch vụ xem phim, series trực tuyến', TRUE),

('YouTube Premium', 'ENTERTAINMENT', 79000, 'VND', 'MONTHLY',
 NULL, '#FF0000', 'https://youtube.com/premium', 'YouTube không quảng cáo + YouTube Music', TRUE),

('Disney+', 'ENTERTAINMENT', 59000, 'VND', 'MONTHLY',
 NULL, '#113CCF', 'https://disneyplus.com', 'Phim Disney, Marvel, Star Wars, Pixar', TRUE),

('HBO Max', 'ENTERTAINMENT', 89000, 'VND', 'MONTHLY',
 NULL, '#6300B2', 'https://hbomax.com', 'Phim HBO, DC, Warner Bros', FALSE),

-- ==================== MUSIC ====================
('Spotify', 'MUSIC', 59000, 'VND', 'MONTHLY',
 NULL, '#1DB954', 'https://spotify.com', 'Nghe nhạc trực tuyến', TRUE),

('Apple Music', 'MUSIC', 59000, 'VND', 'MONTHLY',
 NULL, '#FC3C44', 'https://music.apple.com', 'Streaming nhạc của Apple', TRUE),

('Tidal', 'MUSIC', 95000, 'VND', 'MONTHLY',
 NULL, '#000000', 'https://tidal.com', 'Âm nhạc chất lượng cao HiFi', FALSE),

-- ==================== AI_TOOLS ====================
('ChatGPT Plus', 'AI_TOOLS', 500000, 'VND', 'MONTHLY',
 NULL, '#10A37F', 'https://chat.openai.com', 'AI chatbot GPT-4 của OpenAI', FALSE),

('Claude Pro', 'AI_TOOLS', 500000, 'VND', 'MONTHLY',
 NULL, '#CC785C', 'https://claude.ai', 'AI chatbot của Anthropic', FALSE),

('Midjourney', 'AI_TOOLS', 300000, 'VND', 'MONTHLY',
 NULL, '#7B61FF', 'https://midjourney.com', 'Tạo ảnh bằng AI', FALSE),

('GitHub Copilot', 'AI_TOOLS', 250000, 'VND', 'MONTHLY',
 NULL, '#24292E', 'https://github.com/features/copilot', 'AI pair programmer', FALSE),

-- ==================== DESIGN ====================
('Canva Pro', 'DESIGN', 179000, 'VND', 'MONTHLY',
 NULL, '#00C4CC', 'https://canva.com', 'Thiết kế đồ họa, presentation', TRUE),

('Adobe Creative Cloud', 'DESIGN', 665000, 'VND', 'MONTHLY',
 NULL, '#FF0000', 'https://adobe.com/creativecloud', 'Bộ phần mềm thiết kế Adobe', FALSE),

('Figma', 'DESIGN', 300000, 'VND', 'MONTHLY',
 NULL, '#F24E1E', 'https://figma.com', 'UI/UX design tool', FALSE),

-- ==================== PRODUCTIVITY ====================
('Notion', 'PRODUCTIVITY', 96000, 'VND', 'MONTHLY',
 NULL, '#000000', 'https://notion.so', 'All-in-one workspace, note taking', FALSE),

('Microsoft 365', 'PRODUCTIVITY', 90000, 'VND', 'MONTHLY',
 NULL, '#D83B01', 'https://microsoft.com/microsoft-365', 'Word, Excel, PowerPoint và OneDrive', TRUE),

('Obsidian Sync', 'PRODUCTIVITY', 200000, 'VND', 'MONTHLY',
 NULL, '#7C3AED', 'https://obsidian.md', 'Đồng bộ Obsidian notes', FALSE),

('LinkedIn Premium', 'PRODUCTIVITY', 800000, 'VND', 'MONTHLY',
 NULL, '#0077B5', 'https://linkedin.com/premium', 'Career insights + InMail', FALSE),

-- ==================== EDUCATION ====================
('Duolingo Plus', 'EDUCATION', 79000, 'VND', 'MONTHLY',
 NULL, '#77C543', 'https://duolingo.com', 'Học ngoại ngữ không quảng cáo', TRUE),

('Coursera Plus', 'EDUCATION', 1250000, 'VND', 'MONTHLY',
 NULL, '#0056D2', 'https://coursera.org', 'Khóa học từ các trường đại học hàng đầu', FALSE),

('Udemy Business', 'EDUCATION', 500000, 'VND', 'MONTHLY',
 NULL, '#A435F0', 'https://udemy.com', 'Video khóa học kỹ năng nghề nghiệp', FALSE),

-- ==================== DEV_TOOLS ====================
('GitHub Pro', 'DEV_TOOLS', 50000, 'VND', 'MONTHLY',
 NULL, '#24292E', 'https://github.com', 'Private repos + GitHub Actions', FALSE),

('JetBrains All Products', 'DEV_TOOLS', 700000, 'VND', 'MONTHLY',
 NULL, '#FE315D', 'https://jetbrains.com', 'IDE cho Java, Python, JS...', FALSE),

('Vercel Pro', 'DEV_TOOLS', 500000, 'VND', 'MONTHLY',
 NULL, '#000000', 'https://vercel.com', 'Deploy Next.js và frontend apps', FALSE),

('Postman', 'DEV_TOOLS', 300000, 'VND', 'MONTHLY',
 NULL, '#FF6C37', 'https://postman.com', 'API testing và documentation', FALSE),

('Linear', 'DEV_TOOLS', 400000, 'VND', 'MONTHLY',
 NULL, '#5E6AD2', 'https://linear.app', 'Issue tracking cho dev team', FALSE),

-- ==================== CLOUD ====================
('Google One (100GB)', 'CLOUD', 49000, 'VND', 'MONTHLY',
 NULL, '#4285F4', 'https://one.google.com', 'Lưu trữ đám mây Google', TRUE),

('iCloud+ (50GB)', 'CLOUD', 49000, 'VND', 'MONTHLY',
 NULL, '#3478F6', 'https://icloud.com', 'Lưu trữ đám mây Apple', TRUE),

('Dropbox Plus', 'CLOUD', 350000, 'VND', 'MONTHLY',
 NULL, '#0061FF', 'https://dropbox.com', 'Lưu trữ và chia sẻ file', FALSE),

-- ==================== COMMUNICATION ====================
('Zoom Pro', 'COMMUNICATION', 375000, 'VND', 'MONTHLY',
 NULL, '#2D8CFF', 'https://zoom.us', 'Video meeting không giới hạn thời gian', FALSE),

('Slack Pro', 'COMMUNICATION', 375000, 'VND', 'MONTHLY',
 NULL, '#4A154B', 'https://slack.com', 'Team messaging & collaboration', FALSE);
