DROP TABLE IF EXISTS schedules; -- Drop this first because it points to restaurants
DROP TABLE IF EXISTS restaurants;

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255), -- Must be "address"
    label VARCHAR(100),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    lunch_date DATE NOT NULL,
    restaurant_id INTEGER REFERENCES restaurants(id),
    label VARCHAR(255)
);