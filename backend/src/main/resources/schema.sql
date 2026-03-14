-- Drop the table if it exists to ensure a fresh start
DROP TABLE IF EXISTS restaurants;

CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    label VARCHAR(100)
);