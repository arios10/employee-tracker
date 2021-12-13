/* seed all tables in db */

INSERT INTO department(department_name)
VALUES("Engineering"), ("Design"), ("Production"), ("Media"), ("Marketing");

INSERT INTO role(title, salary, department_id)
VALUES("Designer", 80000, 2), ("Senior Designer", 120000, 2), ("President", 220000, 1), ("Intern", 30000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('Stephen', 'Curry', 1, 2), ('Devin', 'Booker', 1, null), ('Johnny', 'Bravo', 1, 2), ('Bill', 'Gates', 2, 2), ('Tiger', 'Woods', 4, null);