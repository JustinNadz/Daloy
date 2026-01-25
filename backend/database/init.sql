-- Daloy Database Setup Script (MySQL/MariaDB)
-- Enterprise-ready configuration
-- Run this script to create the database before running migrations

-- Create database with proper charset for unicode support
CREATE DATABASE IF NOT EXISTS `daloy_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `daloy_db`;

-- Set default storage engine to InnoDB for ACID compliance
SET default_storage_engine = InnoDB;

-- Create a dedicated application user (recommended for production)
-- Uncomment and modify these lines for production use:
-- CREATE USER IF NOT EXISTS 'daloy_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES, LOCK TABLES ON `daloy_db`.* TO 'daloy_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Verify the database was created
SELECT 'Database daloy_db created successfully!' AS status;
SHOW VARIABLES LIKE 'character_set_database';
SHOW VARIABLES LIKE 'collation_database';
