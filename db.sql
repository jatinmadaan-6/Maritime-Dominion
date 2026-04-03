-- ============================================
-- MARITIME DOMINION — Database Schema
-- ============================================
-- Run this file on a fresh MySQL instance.
-- Order matters: referenced tables must exist
-- before tables that foreign key into them.
-- ============================================

CREATE DATABASE IF NOT EXISTS maritime;
USE maritime;

-- ─────────────────────────────────────────
-- 1. PORTS
-- Independent entity. No foreign keys.
-- Must exist before voyages and logs.
-- ─────────────────────────────────────────
CREATE TABLE ports (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    country     VARCHAR(50)  NOT NULL
);

-- ─────────────────────────────────────────
-- 2. VESSELS
-- Core entity of the system.
-- flag_state = country of registration.
-- imo_number is globally unique per vessel.
-- ─────────────────────────────────────────
CREATE TABLE vessels (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    imo_number  VARCHAR(20)  NOT NULL UNIQUE,
    flag_state  VARCHAR(50),
    type        VARCHAR(50)
);

-- ─────────────────────────────────────────
-- 3. CAPTAINS
-- Separate entity so we can track history.
-- license_number stored as VARCHAR because
-- it can have leading zeroes or prefixes.
-- ─────────────────────────────────────────
CREATE TABLE captains (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100) NOT NULL,
    license_number  VARCHAR(50)  UNIQUE,
    nationality     VARCHAR(50)
);

-- ─────────────────────────────────────────
-- 4. CAPTAIN ASSIGNMENTS
-- Junction table: who commanded which vessel
-- and for what period.
-- end_date = NULL means currently in command.
-- ─────────────────────────────────────────
CREATE TABLE captain_assignments (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    captain_id  INT  NOT NULL,
    vessel_id   INT  NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NULL,
    FOREIGN KEY (captain_id) REFERENCES captains(id),
    FOREIGN KEY (vessel_id)  REFERENCES vessels(id)
);

-- ─────────────────────────────────────────
-- 5. VOYAGES
-- A vessel travelling from one port to another.
-- end_date = NULL means voyage is ongoing.
-- ─────────────────────────────────────────
CREATE TABLE voyages (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    vessel_id   INT  NOT NULL,
    start_port  INT  NOT NULL,
    end_port    INT  NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NULL,
    FOREIGN KEY (vessel_id)  REFERENCES vessels(id),
    FOREIGN KEY (start_port) REFERENCES ports(id),
    FOREIGN KEY (end_port)   REFERENCES ports(id)
);

-- ─────────────────────────────────────────
-- 6. LOGS
-- Environmental compliance logs per voyage.
-- violation flag set automatically by trigger.
-- port_id and voyage_id are nullable because
-- a log can be recorded outside a formal voyage.
-- ─────────────────────────────────────────
CREATE TABLE logs (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    vessel_id     INT            NOT NULL,
    port_id       INT            NULL,
    voyage_id     INT            NULL,
    sulfur_level  FLOAT          NOT NULL,
    waste_amount  FLOAT          NOT NULL,
    violation     BOOLEAN        DEFAULT 0,
    timestamp     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id)  REFERENCES vessels(id),
    FOREIGN KEY (port_id)    REFERENCES ports(id),
    FOREIGN KEY (voyage_id)  REFERENCES voyages(id)
);

-- ─────────────────────────────────────────
-- TRIGGER: check_violation
-- Automatically flags a log as a violation
-- if sulfur level exceeds IMO 2020 limit (0.5%).
-- Business logic enforced at the DB level.
-- ─────────────────────────────────────────
DELIMITER //
CREATE TRIGGER check_violation
BEFORE INSERT ON logs
FOR EACH ROW
BEGIN
    IF NEW.sulfur_level > 0.5 THEN
        SET NEW.violation = 1;
    END IF;
END;
//
DELIMITER ;


-- ─────────────────────────────────────────
-- SAMPLE DATA
-- Clean, realistic test data only.
-- No duplicate IMO numbers.
-- ─────────────────────────────────────────

INSERT INTO ports (name, country) VALUES
    ('Port of Singapore', 'Singapore'),
    ('Port of Rotterdam', 'Netherlands'),
    ('Port of Mumbai',    'India');

INSERT INTO vessels (name, imo_number, flag_state, type) VALUES
    ('MV Aurora',   'IMO9876543', 'Panama',  'Cargo'),
    ('MV Poseidon', 'IMO1234567', 'India',   'Tanker'),
    ('MV Horizon',  'IMO7654321', 'Liberia', 'Bulk Carrier');

INSERT INTO captains (name, license_number, nationality) VALUES
    ('Capt. Raj Malhotra',  'LIC-001', 'Indian'),
    ('Capt. Sara Chen',     'LIC-002', 'Singaporean'),
    ('Capt. David Okafor',  'LIC-003', 'Nigerian');

INSERT INTO captain_assignments (captain_id, vessel_id, start_date, end_date) VALUES
    (1, 1, '2024-01-01', '2024-06-30'),
    (2, 1, '2024-07-01', NULL),
    (3, 2, '2024-01-01', NULL);

INSERT INTO voyages (vessel_id, start_port, end_port, start_date, end_date) VALUES
    (1, 1, 2, '2024-08-01', '2024-08-15'),
    (2, 3, 1, '2024-09-01', NULL);

INSERT INTO logs (vessel_id, port_id, voyage_id, sulfur_level, waste_amount) VALUES
    (1, 1, 1, 0.3, 40),
    (1, 2, 1, 0.8, 70),
    (2, 3, 2, 0.4, 30);