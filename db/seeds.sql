-- Insert departments
INSERT INTO department (name)
VALUES 
  ('Engineering'),
  ('Sales'),
  ('Finance'),
  ('Legal');

-- Insert roles
INSERT INTO role (title, salary, department_id)
VALUES 
  ('Software Engineer', 90000, 1),
  ('Senior Software Engineer', 120000, 1),
  ('Sales Representative', 70000, 2),
  ('Accountant', 80000, 3),
  ('Lawyer', 110000, 4);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
  ('Alice', 'Johnson', 1, NULL),
  ('Bob', 'Smith', 2, 1),
  ('Carol', 'Lee', 3, NULL),
  ('David', 'Kim', 4, NULL),
  ('Eve', 'Martinez', 5, NULL);
