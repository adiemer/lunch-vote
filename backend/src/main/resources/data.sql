-- This ensures we don't get 'duplicate key' errors if the data already exists
INSERT INTO restaurants (id, name, address, label) 
VALUES (1, 'The Mac Grill', '123 Pasta Lane', 'Italian')
ON CONFLICT (id) DO NOTHING;

INSERT INTO restaurants (id, name, address, label) 
VALUES (2, 'Pizza Planet', '456 Space Port', 'Pizza')
ON CONFLICT (id) DO NOTHING;

-- This resets the 'counter' so new restaurants start at ID 3
SELECT setval(pg_get_serial_sequence('restaurants', 'id'), coalesce(max(id), 1)) FROM restaurants;