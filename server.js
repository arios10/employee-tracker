//dependencies
const connection = require('./config/connection.js');
const inquirer = require('inquirer');
const cTable = require('console.table');

connection.connect(function (err) {
    if (err) throw err;
    console.log("Now connected to Employee Tracker, welcome!");
    firstPrompt();
});

// function which prompts the user for what action they should take
function firstPrompt() {

  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "What would you like to do?",
      choices: [
        "View all Departments",
        "View all Roles",
        "View all Employees",
        "Add Department",
        "Add Role",
        "Add Employee",
        "Update Employee Role",
        "End"]
    })
    .then(function ({ task }) {
        switch (task) {
            case "View all Departments":
                viewDepartments();
                break;

            case "View all Roles":
                viewRoles();
                break;
        
            case "View all Employees":
                viewEmployees();
                break;

            case "Add Department":
                addDepartment();
                break;

            case "Add Role":
                addRole();
                break;

            case "Add Employee":
                addEmployee();
                break;

            case "Update Employee Role":
                updateRole();
                break;

            case "End":
            connection.end();
            break;
        }
    });
}

//view all departments
function viewDepartments() {
    //db query
    const sql = `SELECT department.id AS ID, department_name AS Department FROM department`;

    connection.query(sql, function (err, res) {
        if (!err)
            console.table('Departments: \n', res);
        else
            console.log('Error retrieving data...');
        // prompt user
        firstPrompt();
    });
}

//view all employees
function viewEmployees() {
    //db query
    const sql = `SELECT employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title, 
    department.department_name AS 'department', 
    role.salary
    FROM employee, role, department 
    WHERE department.id = role.department_id 
    AND role.id = employee.role_id
    ORDER BY employee.id ASC`;

    connection.query(sql, function (err, res) {
        if (!err)
            console.table('Employees: \n', res);
        else
            console.log('Error retrieving data...');
        // prompt user
        firstPrompt();
    });
}

//view all roles
function viewRoles() {
    //db query
    const sql = `SELECT role.id, role.title, department.department_name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id`;

    connection.query(sql, function (err, res) {
        if (!err)
            console.table('Employees: \n', res);
        else
            console.log('Error retrieving data...');
        // prompt user
        firstPrompt();
    });
}

function addDepartment() {
    //inquirer prompt to add new dept
    inquirer.prompt([
        {
            type: "input",
            name: "department_name",
            message: "What is the name of the new department you want to add?",
        },
    ]).then(function (answer) {
        // insert into db using prompt
        connection.query(
            "INSERT INTO department SET ?",
            {
                department_name: answer.department_name.trim(),
            },
            // display updated dept table
            function viewUpdatedDepartments() {
                var sql = "SELECT department.id AS ID, department_name AS Department FROM department";
                connection.query(sql, function (err, rows) {
                    if (!err)
                        console.table(`${answer.department_name} has been added. See here: \n`, rows);
                    else
                        console.log('Error retrieving data...');
                    // prompt user
                    firstPrompt();
                });
            }
        );
    });
}

function addEmployee() {
  prompt([
    {
      type: "input",
      name: "firstName",
      message: "What is the employee's first name?",
    },
    {
      type: "input",
      name: "lastName",
      message: "What is the employee's last name?",
    },
  ]).then((answer) => {
    const name = [answer.firstName, answer.lastName];
    const roleSql = `SELECT role.id, role.title FROM role`;
    connection.query(roleSql, (error, data) => {
      if (error) throw error;
      const roles = data.map(({ id, title }) => ({ name: title, value: id }));
      prompt([
        {
          type: "list",
          name: "role",
          message: "What is the employee's role?",
          choices: roles,
        },
      ]).then((roleChoice) => {
        const role = roleChoice.role;
        name.push(role);
        const managerSql = `SELECT * FROM employee`;
        connection.query(managerSql, (error, data) => {
          if (error) throw error;
          const managers = data.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id,
          }));
          prompt([
            {
              type: "list",
              name: "manager",
              message: "Who is the employee's manager?",
              choices: managers,
            },
          ]).then((managerChoice) => {
            const manager = managerChoice.manager;
            name.push(manager);
            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                  VALUES (?, ?, ?, ?)`;
            connection.query(sql, crit, (error) => {
              if (error) throw error;
              console.log(
                "------------------------------------------------------------------"
              );
              console.log("Employee added!");
              viewEmployees();
            });
          });
        });
      });
    });
  });
};

const addRole = () => {
  const sql = "SELECT * FROM department";
  connection.query(sql, (error, response) => {
    if (error) throw error;
    // Logic to add new dept for the new role...
    let deptNamesArray = [];
    response.forEach((department) => {
      deptNamesArray.push(department.department_name);
    });
    deptNamesArray.push("Create Department");
    prompt([
      {
        name: "departmentName",
        type: "list",
        message: "Which department will you add this role to?",
        choices: deptNamesArray,
      },
    ]).then((answer) => {
      if (answer.departmentName === "Create Department") {
        this.addDepartment();
      } else {
        addRoleResume(answer);
      }
    });

    const addRoleResume = (departmentData) => {
      prompt([
        {
          name: "newRole",
          type: "input",
          message: "What is the name of your new role?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary of this new role?",
        },
      ]).then((answer) => {
        let createdRole = answer.newRole;
        let departmentId;

        response.forEach((department) => {
          if (departmentData.departmentName === department.department_name) {
            departmentId = department.id;
          }
        });

        let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
        let crit = [createdRole, answer.salary, departmentId];

        connection.query(sql, crit, (error) => {
          if (error) throw error;
          console.log(
            "------------------------------------------------------------------"
          );
          console.log("Role created!");
          viewRoles();
        });
      });
    };
  });
};

function updateEmployeeRole() {

  let employeesArray = []

  connection.query(
      `SELECT first_name, last_name FROM employee`,
      (err, res) => {
          if (err) throw err;
          prompt([
              {
                  type: "list",
                  name: "employee",
                  message: "Which employee has a new role?",
                  choices() {
                      res.forEach(employee => {
                          employeesArray.push(`${employee.first_name} ${employee.last_name}`);
                      });
                      return employeesArray;
                  }
              },
              {
                  type: "input",
                  name: "role",
                  message: `Enter the new role ID from the choices below.${Chalk.greenBright('\nDesigner: 1\nSenior Designer: 2\nPresident: 3\nIntern: 4\nConsultant: 5\nPress: 6\nTemp: 7\n' + Chalk.cyan('Your Answer: '))}`
              }
          ]).then( (answers) => {

              const updateEmployeeRole = answers.employee.split(' ');
              const updateEmployeeRoleFirstName = JSON.stringify(updateEmployeeRole[0]);
              const updateEmployeeRoleLastName = JSON.stringify(updateEmployeeRole[1]);

              connection.query(
                  `UPDATE employee
                  SET role_id = ${answers.role}
                  WHERE first_name = ${updateEmployeeRoleFirstName}
                  AND last_name = ${updateEmployeeRoleLastName}`,

                  (err, res) => {
                      if (err) throw err;
                      console.log(
                        "------------------------------------------------------------------"
                      );
                      console.log("Employee role updated!");
                      viewEmployees();
                  }
              );
          });
      }
  );  
};