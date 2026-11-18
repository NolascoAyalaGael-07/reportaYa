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
  role ENUM('alumno', 'mantenimiento', 'administrador') NOT NULL DEFAULT 'alumno',
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
  photo_path VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_reports_user_created (user_id, created_at),
  CONSTRAINT fk_reports_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS report_status_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id BIGINT UNSIGNED NOT NULL,
  from_status ENUM('Pendiente', 'En atención', 'Solucionado') NULL,
  to_status ENUM('Pendiente', 'En atención', 'Solucionado') NOT NULL,
  changed_by BIGINT UNSIGNED NOT NULL,
  comment VARCHAR(300) NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_report_status_history_report_date (report_id, changed_at),
  CONSTRAINT fk_report_status_history_report
    FOREIGN KEY (report_id) REFERENCES reports (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_report_status_history_user
    FOREIGN KEY (changed_by) REFERENCES users (id)
) ENGINE=InnoDB;
