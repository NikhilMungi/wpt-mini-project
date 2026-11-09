-- =====================================================================
-- 🎬 CineBook Database Schema & Initial Seed Data
-- Database Name: cinebook
-- Normalized to 3rd Normal Form (3NF)
-- =====================================================================

-- Step 1: Create and switch to the cinebook database
CREATE DATABASE IF NOT EXISTS cinebook;
USE cinebook;

-- Disable foreign key checks while dropping tables (safe reset)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS booking_seats;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS shows;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;


-- =====================================================================
-- 1. USERS TABLE
-- Stores credentials and user profiles for both regular users and admins.
-- Role-Based Access Control (RBAC): 'USER' or 'ADMIN'
-- =====================================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,       -- Ensures no duplicate emails
    phone VARCHAR(15) NOT NULL UNIQUE,        -- Ensures 10-digit mobile uniqueness
    password VARCHAR(255) NOT NULL,           -- Stores bcrypt hashed passwords (never plaintext)
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',-- Used by auth middleware for access control
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 2. MOVIES TABLE
-- Stores metadata about all available movies in the platform.
-- =====================================================================
CREATE TABLE movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    genre VARCHAR(100) NOT NULL,              -- e.g. 'Action / Sci-Fi'
    language VARCHAR(50) NOT NULL,             -- e.g. 'English', 'Hindi'
    duration INT NOT NULL,                     -- Duration in minutes (e.g. 148)
    rating DECIMAL(2, 1) DEFAULT 0.0,          -- e.g. 8.8 (out of 10)
    poster_url VARCHAR(500),                   -- Web image link to movie poster
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE', -- For soft-deletion
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 3. EVENTS TABLE
-- Stores concerts, comedy gigs, and cultural events.
-- =====================================================================
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,           -- e.g. 'Music Concert', 'Standup Comedy'
    venue VARCHAR(150) NOT NULL,               -- Physical location / auditorium
    event_date DATETIME NOT NULL,              -- Scheduled date and time
    ticket_price DECIMAL(10, 2) NOT NULL,      -- Base ticket price
    poster_url VARCHAR(500),
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 4. SHOWS TABLE
-- Represents a specific screening of a movie at a specific date and time.
-- 1 Movie can have MANY Shows (1-to-Many Relationship).
-- =====================================================================
CREATE TABLE shows (
    show_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    screen_name VARCHAR(50) DEFAULT 'Audi 1',   -- Screen / Theater Hall name
    show_datetime DATETIME NOT NULL,            -- Date & time of the show
    ticket_price DECIMAL(10, 2) NOT NULL,       -- Ticket price for this showtime
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shows_movie FOREIGN KEY (movie_id) 
        REFERENCES movies (movie_id) ON DELETE CASCADE
);


-- =====================================================================
-- 5. SEATS TABLE
-- Stores individual seats for each show (e.g. Row A, Seat 1).
-- Status tracks whether a seat is currently 'AVAILABLE' or 'BOOKED'.
-- =====================================================================
CREATE TABLE seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    show_id INT NULL,
    event_id INT NULL,
    row_name CHAR(1) NOT NULL,                 -- e.g. 'A', 'B', 'C', 'D'
    seat_number INT NOT NULL,                  -- e.g. 1, 2, 3, 4, 5
    seat_label VARCHAR(10) NOT NULL,           -- e.g. 'A1', 'A2', 'B3'
    status ENUM('AVAILABLE', 'BOOKED') DEFAULT 'AVAILABLE',
    CONSTRAINT fk_seats_show FOREIGN KEY (show_id) 
        REFERENCES shows (show_id) ON DELETE CASCADE,
    CONSTRAINT fk_seats_event FOREIGN KEY (event_id) 
        REFERENCES events (event_id) ON DELETE CASCADE
);


-- =====================================================================
-- 6. BOOKINGS TABLE
-- Stores ticket reservations made by users for either a movie show OR an event.
-- 1 User can make MANY Bookings (1-to-Many).
-- =====================================================================
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    show_id INT NULL,                          -- Set for Movie bookings
    event_id INT NULL,                         -- Set for Event bookings
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) 
        REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_show FOREIGN KEY (show_id) 
        REFERENCES shows (show_id) ON DELETE SET NULL,
    CONSTRAINT fk_bookings_event FOREIGN KEY (event_id) 
        REFERENCES events (event_id) ON DELETE SET NULL
);


-- =====================================================================
-- 7. BOOKING_SEATS TABLE (Junction Table)
-- Resolves Many-to-Many relationship between a Booking and reserved Seats.
-- (1 Booking can include multiple seats, e.g. A1, A2, A3).
-- =====================================================================
CREATE TABLE booking_seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    seat_id INT NOT NULL,
    CONSTRAINT fk_bs_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings (booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_bs_seat FOREIGN KEY (seat_id) 
        REFERENCES seats (seat_id) ON DELETE CASCADE
);


-- =====================================================================
-- 🌟 SEED DATA (INITIAL SAMPLE DATA FOR TESTING)
-- =====================================================================

-- 1. Insert Default Users (Passwords are hashed with bcrypt, cost 10)
-- Admin User: admin@cinebook.com / Password: Admin@123
-- Regular User: user@cinebook.com / Password: User@123
INSERT INTO users (full_name, email, phone, password, role) VALUES
('Admin Nikhil', 'admin@cinebook.com', '9876543210', '$2b$10$fNiY7DaQs29bEmyag0bv8e//y38mka6cXu2AW.f7lHCeDDjH0ZMre', 'ADMIN'),
('Rahul Sharma', 'user@cinebook.com', '9876543211', '$2b$10$3E0JYjzfawjKAKy25NgcUOXsbLMVgofEfpEdvFS.ivx9.ACgY2cR6', 'USER');

-- 2. Insert Sample Movies
INSERT INTO movies (title, description, genre, language, duration, rating, poster_url, status) VALUES
('Avengers: Endgame', 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.', 'Action / Sci-Fi', 'English', 181, 8.4, 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', 'ACTIVE'),
('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'Sci-Fi / Thriller', 'English', 148, 8.8, 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', 'ACTIVE'),
('Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival as Earth faces extinction.', 'Sci-Fi / Drama', 'English', 169, 8.7, 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'ACTIVE'),
('The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.', 'Action / Crime', 'English', 152, 9.0, 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'ACTIVE');

-- 3. Insert Sample Events
INSERT INTO events (title, description, category, venue, event_date, ticket_price, poster_url, status) VALUES
('Sunburn Music Festival 2026', 'Experience the biggest electronic dance music festival featuring top international and Indian DJs.', 'Music Concert', 'DY Patil Stadium, Mumbai', '2026-12-15 17:00:00', 1499.00, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500', 'ACTIVE'),
('Standup Comedy Night with Zakir', 'An evening filled with laughter, storytelling, and relatable punchlines with Zakir Khan.', 'Comedy', 'Bal Gandharva Rang Mandir, Pune', '2026-11-25 19:30:00', 799.00, 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=500', 'ACTIVE'),
('Global Tech Developers Summit', 'Join 2,000+ software developers and architects discussing AI, Web3, and Full-Stack Engineering.', 'Conference', 'BIEC, Bengaluru', '2026-11-30 09:00:00', 499.00, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500', 'ACTIVE');

-- 4. Shows for All Movies
INSERT INTO shows (movie_id, screen_name, show_datetime, ticket_price) VALUES
(1, 'Audi 1 - IMAX', '2026-11-10 18:30:00', 350.00),
(1, 'Audi 2', '2026-11-10 21:30:00', 250.00),
(2, 'Audi 1 - IMAX', '2026-11-11 19:00:00', 300.00),
(3, 'Audi 3', '2026-11-12 17:00:00', 280.00),
(4, 'Audi 2 - Dolby', '2026-11-12 20:00:00', 320.00);

-- 5. Insert Seats for Show 1 (Avengers Audi 1)
INSERT INTO seats (show_id, row_name, seat_number, seat_label, status) VALUES
(1, 'A', 1, 'A1', 'AVAILABLE'), (1, 'A', 2, 'A2', 'AVAILABLE'), (1, 'A', 3, 'A3', 'AVAILABLE'), (1, 'A', 4, 'A4', 'AVAILABLE'), (1, 'A', 5, 'A5', 'AVAILABLE'),
(1, 'B', 1, 'B1', 'AVAILABLE'), (1, 'B', 2, 'B2', 'AVAILABLE'), (1, 'B', 3, 'B3', 'AVAILABLE'), (1, 'B', 4, 'B4', 'AVAILABLE'), (1, 'B', 5, 'B5', 'AVAILABLE'),
(1, 'C', 1, 'C1', 'AVAILABLE'), (1, 'C', 2, 'C2', 'AVAILABLE'), (1, 'C', 3, 'C3', 'BOOKED'),    (1, 'C', 4, 'C4', 'BOOKED'),    (1, 'C', 5, 'C5', 'AVAILABLE'),
(1, 'D', 1, 'D1', 'AVAILABLE'), (1, 'D', 2, 'D2', 'AVAILABLE'), (1, 'D', 3, 'D3', 'AVAILABLE'), (1, 'D', 4, 'D4', 'AVAILABLE'), (1, 'D', 5, 'D5', 'AVAILABLE');

-- Insert Seats for Show 2 (Avengers Audi 2)
INSERT INTO seats (show_id, row_name, seat_number, seat_label, status) VALUES
(2, 'A', 1, 'A1', 'AVAILABLE'), (2, 'A', 2, 'A2', 'AVAILABLE'), (2, 'A', 3, 'A3', 'AVAILABLE'), (2, 'A', 4, 'A4', 'AVAILABLE'), (2, 'A', 5, 'A5', 'AVAILABLE'),
(2, 'B', 1, 'B1', 'AVAILABLE'), (2, 'B', 2, 'B2', 'AVAILABLE'), (2, 'B', 3, 'B3', 'AVAILABLE'), (2, 'B', 4, 'B4', 'AVAILABLE'), (2, 'B', 5, 'B5', 'AVAILABLE'),
(2, 'C', 1, 'C1', 'AVAILABLE'), (2, 'C', 2, 'C2', 'AVAILABLE'), (2, 'C', 3, 'C3', 'AVAILABLE'), (2, 'C', 4, 'C4', 'AVAILABLE'), (2, 'C', 5, 'C5', 'AVAILABLE'),
(2, 'D', 1, 'D1', 'AVAILABLE'), (2, 'D', 2, 'D2', 'AVAILABLE'), (2, 'D', 3, 'D3', 'AVAILABLE'), (2, 'D', 4, 'D4', 'AVAILABLE'), (2, 'D', 5, 'D5', 'AVAILABLE');

-- Insert Seats for Show 3 (Inception)
INSERT INTO seats (show_id, row_name, seat_number, seat_label, status) VALUES
(3, 'A', 1, 'A1', 'AVAILABLE'), (3, 'A', 2, 'A2', 'AVAILABLE'), (3, 'A', 3, 'A3', 'AVAILABLE'), (3, 'A', 4, 'A4', 'AVAILABLE'), (3, 'A', 5, 'A5', 'AVAILABLE'),
(3, 'B', 1, 'B1', 'AVAILABLE'), (3, 'B', 2, 'B2', 'AVAILABLE'), (3, 'B', 3, 'B3', 'AVAILABLE'), (3, 'B', 4, 'B4', 'AVAILABLE'), (3, 'B', 5, 'B5', 'AVAILABLE'),
(3, 'C', 1, 'C1', 'AVAILABLE'), (3, 'C', 2, 'C2', 'AVAILABLE'), (3, 'C', 3, 'C3', 'AVAILABLE'), (3, 'C', 4, 'C4', 'AVAILABLE'), (3, 'C', 5, 'C5', 'AVAILABLE'),
(3, 'D', 1, 'D1', 'AVAILABLE'), (3, 'D', 2, 'D2', 'AVAILABLE'), (3, 'D', 3, 'D3', 'AVAILABLE'), (3, 'D', 4, 'D4', 'AVAILABLE'), (3, 'D', 5, 'D5', 'AVAILABLE');

-- Insert Seats for Show 4 (Interstellar)
INSERT INTO seats (show_id, row_name, seat_number, seat_label, status) VALUES
(4, 'A', 1, 'A1', 'AVAILABLE'), (4, 'A', 2, 'A2', 'AVAILABLE'), (4, 'A', 3, 'A3', 'AVAILABLE'), (4, 'A', 4, 'A4', 'AVAILABLE'), (4, 'A', 5, 'A5', 'AVAILABLE'),
(4, 'B', 1, 'B1', 'AVAILABLE'), (4, 'B', 2, 'B2', 'AVAILABLE'), (4, 'B', 3, 'B3', 'AVAILABLE'), (4, 'B', 4, 'B4', 'AVAILABLE'), (4, 'B', 5, 'B5', 'AVAILABLE'),
(4, 'C', 1, 'C1', 'AVAILABLE'), (4, 'C', 2, 'C2', 'AVAILABLE'), (4, 'C', 3, 'C3', 'AVAILABLE'), (4, 'C', 4, 'C4', 'AVAILABLE'), (4, 'C', 5, 'C5', 'AVAILABLE'),
(4, 'D', 1, 'D1', 'AVAILABLE'), (4, 'D', 2, 'D2', 'AVAILABLE'), (4, 'D', 3, 'D3', 'AVAILABLE'), (4, 'D', 4, 'D4', 'AVAILABLE'), (4, 'D', 5, 'D5', 'AVAILABLE');

-- Insert Seats for Show 5 (The Dark Knight)
INSERT INTO seats (show_id, row_name, seat_number, seat_label, status) VALUES
(5, 'A', 1, 'A1', 'AVAILABLE'), (5, 'A', 2, 'A2', 'AVAILABLE'), (5, 'A', 3, 'A3', 'AVAILABLE'), (5, 'A', 4, 'A4', 'AVAILABLE'), (5, 'A', 5, 'A5', 'AVAILABLE'),
(5, 'B', 1, 'B1', 'AVAILABLE'), (5, 'B', 2, 'B2', 'AVAILABLE'), (5, 'B', 3, 'B3', 'AVAILABLE'), (5, 'B', 4, 'B4', 'AVAILABLE'), (5, 'B', 5, 'B5', 'AVAILABLE'),
(5, 'C', 1, 'C1', 'AVAILABLE'), (5, 'C', 2, 'C2', 'AVAILABLE'), (5, 'C', 3, 'C3', 'AVAILABLE'), (5, 'C', 4, 'C4', 'AVAILABLE'), (5, 'C', 5, 'C5', 'AVAILABLE'),
(5, 'D', 1, 'D1', 'AVAILABLE'), (5, 'D', 2, 'D2', 'AVAILABLE'), (5, 'D', 3, 'D3', 'AVAILABLE'), (5, 'D', 4, 'D4', 'AVAILABLE'), (5, 'D', 5, 'D5', 'AVAILABLE');


-- 6. Insert Sample Booking for Rahul (user_id = 2) for Seats C3 & C4 (Total ₹700)
INSERT INTO bookings (user_id, show_id, total_amount, status) VALUES
(2, 1, 700.00, 'CONFIRMED');

-- Link the booking with seats C3 (id 13) and C4 (id 14)
INSERT INTO booking_seats (booking_id, seat_id) VALUES
(1, 13),
(1, 14);
