CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_refresh_token
      FOREIGN KEY (user_id) 
      REFERENCES users(id) 
      ON DELETE CASCADE
);

CREATE INDEX idx_refresh_token ON refresh_tokens(token);
