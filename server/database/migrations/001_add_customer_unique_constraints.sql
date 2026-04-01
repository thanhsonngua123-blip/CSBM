USE csbm_db;

ALTER TABLE customers
  MODIFY email VARCHAR(768) NOT NULL,
  MODIFY phone VARCHAR(512) NULL,
  MODIFY id_number VARCHAR(512) NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_email ON customers(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_id_number ON customers(id_number);
