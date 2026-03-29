USE csbm_db;

ALTER TABLE customers
  MODIFY email VARCHAR(768) NOT NULL,
  MODIFY phone VARCHAR(512) NULL,
  MODIFY id_number VARCHAR(512) NOT NULL;

ALTER TABLE customers
  ADD CONSTRAINT uq_customers_email UNIQUE (email);

ALTER TABLE customers
  ADD CONSTRAINT uq_customers_id_number UNIQUE (id_number);
