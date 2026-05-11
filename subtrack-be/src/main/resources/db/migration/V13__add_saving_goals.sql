CREATE TABLE saving_goals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(19, 2) NOT NULL,
    current_saved DECIMAL(19, 2),
    achieved BOOLEAN NOT NULL DEFAULT FALSE
);
