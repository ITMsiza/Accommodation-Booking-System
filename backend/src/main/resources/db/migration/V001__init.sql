-- V001__init.sql
-- StayEase initial schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles
CREATE TABLE roles (
    id   SMALLINT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO roles (id, name) VALUES
    (1, 'GUEST'),
    (2, 'USER'),
    (3, 'ADMIN');

-- Users
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    phone         VARCHAR(20),
    role_id       SMALLINT NOT NULL DEFAULT 2 REFERENCES roles(id),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    notify_email  BOOLEAN NOT NULL DEFAULT TRUE,
    notify_push   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Refresh tokens
CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Amenities
CREATE TABLE amenities (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL UNIQUE,
    icon_key VARCHAR(50)
);

INSERT INTO amenities (name, icon_key) VALUES
    ('WiFi', 'wifi'),
    ('Air Conditioning', 'air-conditioning'),
    ('Pool Access', 'pool'),
    ('Pet Friendly', 'pet'),
    ('Parking', 'parking'),
    ('Breakfast Included', 'breakfast'),
    ('Gym Access', 'gym'),
    ('Spa Access', 'spa'),
    ('Room Service', 'room-service'),
    ('Balcony', 'balcony'),
    ('Ocean View', 'ocean-view'),
    ('Mini Bar', 'mini-bar'),
    ('Smart TV', 'tv'),
    ('Bathtub', 'bathtub'),
    ('Work Desk', 'desk');

-- Rooms
CREATE TYPE room_type AS ENUM ('SINGLE', 'DOUBLE', 'SUITE', 'DELUXE');

CREATE TABLE rooms (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number        VARCHAR(20) NOT NULL UNIQUE,
    name               VARCHAR(255) NOT NULL,
    type               room_type NOT NULL,
    floor              SMALLINT NOT NULL,
    capacity_adults    SMALLINT NOT NULL DEFAULT 2,
    capacity_children  SMALLINT NOT NULL DEFAULT 0,
    price_per_night    NUMERIC(10, 2) NOT NULL,
    description        TEXT,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    version            BIGINT NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Room amenities (many-to-many)
CREATE TABLE room_amenities (
    room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    amenity_id INT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, amenity_id)
);

-- Room photos
CREATE TABLE room_photos (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    url           VARCHAR(2048) NOT NULL,
    display_order SMALLINT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reservations
CREATE TYPE reservation_status AS ENUM (
    'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'
);

CREATE TABLE reservations (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id),
    room_id           UUID NOT NULL REFERENCES rooms(id),
    check_in_date     DATE NOT NULL,
    check_out_date    DATE NOT NULL,
    num_adults        SMALLINT NOT NULL DEFAULT 1,
    num_children      SMALLINT NOT NULL DEFAULT 0,
    status            reservation_status NOT NULL DEFAULT 'PENDING',
    total_price       NUMERIC(12, 2) NOT NULL,
    cancellation_fee  NUMERIC(12, 2),
    special_requests  TEXT,
    version           BIGINT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_dates CHECK (check_out_date > check_in_date)
);

CREATE INDEX idx_reservations_room_dates ON reservations(room_id, check_in_date, check_out_date);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_check_in ON reservations(check_in_date);

-- Reservation audit log
CREATE TABLE reservation_audit_log (
    id                  BIGSERIAL PRIMARY KEY,
    reservation_id      UUID NOT NULL REFERENCES reservations(id),
    changed_by_user_id  UUID REFERENCES users(id),
    old_status          reservation_status,
    new_status          reservation_status NOT NULL,
    note                TEXT,
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews
CREATE TYPE review_status AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');

CREATE TABLE reviews (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id      UUID NOT NULL UNIQUE REFERENCES reservations(id),
    user_id             UUID NOT NULL REFERENCES users(id),
    room_id             UUID NOT NULL REFERENCES rooms(id),
    rating_overall      SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
    rating_cleanliness  SMALLINT CHECK (rating_cleanliness BETWEEN 1 AND 5),
    rating_comfort      SMALLINT CHECK (rating_comfort BETWEEN 1 AND 5),
    rating_location     SMALLINT CHECK (rating_location BETWEEN 1 AND 5),
    rating_staff        SMALLINT CHECK (rating_staff BETWEEN 1 AND 5),
    comment             TEXT,
    is_anonymous        BOOLEAN NOT NULL DEFAULT FALSE,
    status              review_status NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_room_status ON reviews(room_id, status);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Notifications
CREATE TABLE notifications (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type           VARCHAR(50) NOT NULL,
    title          VARCHAR(255) NOT NULL,
    body           TEXT NOT NULL,
    is_read        BOOLEAN NOT NULL DEFAULT FALSE,
    reservation_id UUID REFERENCES reservations(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Insert sample rooms
INSERT INTO rooms (room_number, name, type, floor, capacity_adults, capacity_children, price_per_night, description) VALUES
    ('101', 'Ocean Breeze Single', 'SINGLE', 1, 1, 0, 89.00, 'A cozy single room with modern amenities and partial ocean view. Perfect for solo travelers.'),
    ('201', 'Garden View Double', 'DOUBLE', 2, 2, 1, 149.00, 'Spacious double room overlooking our lush garden. Features a king bed and sitting area.'),
    ('202', 'City View Double', 'DOUBLE', 2, 2, 2, 169.00, 'Modern double room with panoramic city views. Features two queen beds.'),
    ('301', 'Executive Suite', 'SUITE', 3, 2, 2, 299.00, 'Luxurious suite with separate living area, jacuzzi tub, and stunning ocean views.'),
    ('401', 'Presidential Deluxe', 'DELUXE', 4, 4, 2, 499.00, 'Our finest accommodation. Two-bedroom deluxe suite with private terrace, butler service, and premium amenities.'),
    ('102', 'Cozy Single', 'SINGLE', 1, 1, 0, 79.00, 'Compact and efficient single room. Everything you need for a comfortable stay.'),
    ('203', 'Family Double', 'DOUBLE', 2, 2, 3, 189.00, 'Perfect for families with extra space and child-friendly amenities.'),
    ('302', 'Honeymoon Suite', 'SUITE', 3, 2, 0, 349.00, 'Romantic suite designed for couples. Features a four-poster bed and champagne service.');

-- Assign amenities to rooms
INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id FROM rooms r, amenities a
WHERE r.room_number = '101' AND a.name IN ('WiFi', 'Air Conditioning', 'Smart TV');

INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id FROM rooms r, amenities a
WHERE r.room_number = '201' AND a.name IN ('WiFi', 'Air Conditioning', 'Smart TV', 'Breakfast Included', 'Work Desk');

INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id FROM rooms r, amenities a
WHERE r.room_number = '202' AND a.name IN ('WiFi', 'Air Conditioning', 'Smart TV', 'Work Desk');

INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id FROM rooms r, amenities a
WHERE r.room_number = '301' AND a.name IN ('WiFi', 'Air Conditioning', 'Smart TV', 'Breakfast Included', 'Bathtub', 'Mini Bar', 'Balcony', 'Ocean View', 'Room Service');

INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id FROM rooms r, amenities a
WHERE r.room_number = '401' AND a.name IN ('WiFi', 'Air Conditioning', 'Smart TV', 'Breakfast Included', 'Bathtub', 'Mini Bar', 'Balcony', 'Ocean View', 'Room Service', 'Spa Access', 'Gym Access', 'Pool Access', 'Parking');

INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id FROM rooms r, amenities a
WHERE r.room_number = '102' AND a.name IN ('WiFi', 'Air Conditioning');

INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id FROM rooms r, amenities a
WHERE r.room_number = '203' AND a.name IN ('WiFi', 'Air Conditioning', 'Smart TV', 'Breakfast Included', 'Pool Access', 'Pet Friendly');

INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id FROM rooms r, amenities a
WHERE r.room_number = '302' AND a.name IN ('WiFi', 'Air Conditioning', 'Smart TV', 'Bathtub', 'Mini Bar', 'Balcony', 'Ocean View', 'Room Service', 'Breakfast Included');

-- Insert sample photos
INSERT INTO room_photos (room_id, url, display_order)
SELECT r.id, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 0
FROM rooms r WHERE r.room_number = '101';

INSERT INTO room_photos (room_id, url, display_order)
SELECT r.id, 'https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=800', 0
FROM rooms r WHERE r.room_number = '201';

INSERT INTO room_photos (room_id, url, display_order)
SELECT r.id, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 0
FROM rooms r WHERE r.room_number = '301';

INSERT INTO room_photos (room_id, url, display_order)
SELECT r.id, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 0
FROM rooms r WHERE r.room_number = '401';

INSERT INTO room_photos (room_id, url, display_order)
SELECT r.id, 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800', 0
FROM rooms r WHERE r.room_number = '302';

-- Create admin user (password: Admin@123)
INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id) VALUES
    ('admin@stayease.com', '$2a$10$asE81/suZ4LRfdDum3yX9ONV1oHnq0wtHf1VCBjiwEz6/dnNOxuAm', 'Admin', 'StayEase', '+1234567890', 3);
