USE csbm_db;

ALTER TABLE customers
  MODIFY email VARCHAR(100) NOT NULL,
  MODIFY id_number VARCHAR(255) NOT NULL;

ALTER TABLE customers
  ADD CONSTRAINT uq_customers_email UNIQUE (email);

ALTER TABLE customers
  ADD CONSTRAINT uq_customers_id_number UNIQUE (id_number);
