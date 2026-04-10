-- SubTrack V4: Add Role and seed Admin

-- 1. Add Role column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- 2. Insert or Update default Admin user. (password: admin)
INSERT INTO users (id, email, name, password_hash, plan_type, role)
VALUES (
    uuid_generate_v4(),
    'admin@subtrack.com',
    'System Admin',
    '$2a$10$W2iXEKwZ1E81uM.g.I5OReT2R0H2A9YvE/XbY6xR7BqLzKjBv6Oim',
    'PREMIUM',
    'ADMIN'
) ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';
