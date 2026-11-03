CREATE DATABASE IF NOT EXISTS reportaya
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE reportaya;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  control_number VARCHAR(30) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_control_number (control_number),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(40) NOT NULL,
  location VARCHAR(200) NOT NULL,
  description VARCHAR(500) NOT NULL,
  status ENUM('Pendiente', 'En atención', 'Solucionado') NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_reports_user_created (user_id, created_at),
  CONSTRAINT fk_reports_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
