-- Drop the table if it exists to ensure a fresh start
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS schedules;

CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    label VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    lunch_date DATE NOT NULL,
    restaurant_id INTEGER REFERENCES restaurants(id),
    label VARCHAR(255)
);