USE reportaya;

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
