import inquirer from 'inquirer';
import { pool, connectToDb } from './connection.js';

const menuChoices = [
  'View Departments',
  'View Roles',
  'View Employees',
  'Add Department',
  'Add Role',
  'Add Employee',
  'Update Employee Role',
  'Exit',
];

const mainMenu = async () => {
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'Choose an action:',
    choices: menuChoices,
  });

  switch (action) {
    case 'View Departments':
      return runQuery('SELECT * FROM department');
    case 'View Roles':
      return runQuery(`
        SELECT role.id, role.title, department.name AS department, role.salary
        FROM role JOIN department ON role.department_id = department.id
      `);
    case 'View Employees':
      return runQuery(`
        SELECT e.id, e.first_name, e.last_name, r.title AS role, d.name AS department
        FROM employee e
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
      `);
    case 'Add Department':
      return addDepartment();
    case 'Add Role':
      return addRole();
    case 'Add Employee':
      return addEmployee();
    case 'Update Employee Role':
      return updateRole();
    case 'Exit':
      console.log('Goodbye!');
      process.exit();
  }

  mainMenu(); // Repeat menu after action
};

const runQuery = async (sql: string) => {
  const res = await pool.query(sql);
  console.table(res.rows);
  mainMenu();
};

const addDepartment = async () => {
  const { name } = await inquirer.prompt({ name: 'name', message: 'Department name:' });
  await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
  console.log(`Added department: ${name}`);
  mainMenu();
};

const addRole = async () => {
  const { rows: depts } = await pool.query('SELECT * FROM department');
  const { title, salary, deptId } = await inquirer.prompt([
    { name: 'title', message: 'Role title:' },
    { name: 'salary', message: 'Salary:' },
    {
      type: 'list',
      name: 'deptId',
      message: 'Select department:',
      choices: depts.map((d: { name: string; id: number }) => ({ name: d.name, value: d.id })),
    },
  ]);
  await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, deptId]);
  console.log(`Added role: ${title}`);
  mainMenu();
};

const addEmployee = async () => {
  const { rows: roles } = await pool.query('SELECT * FROM role');
  const { rows: emps } = await pool.query('SELECT * FROM employee');
  const { first, last, roleId, managerId } = await inquirer.prompt([
    { name: 'first', message: 'First name:' },
    { name: 'last', message: 'Last name:' },
    {
      type: 'list',
      name: 'roleId',
      message: 'Role:',
      choices: roles.map((r: { title: string; id: number }) => ({ name: r.title, value: r.id })),
    },
    {
      type: 'list',
      name: 'managerId',
      message: 'Manager:',
      choices: [{ name: 'None', value: null } as { name: string; value: number | null }].concat(
        emps.map((e: { first_name: string; last_name: string; id: number }) => ({
          name: `${e.first_name} ${e.last_name}`,
          value: e.id,
        }))
      ),
    },
  ]);
  await pool.query(
    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
    [first, last, roleId, managerId]
  );
  console.log(`Added employee: ${first} ${last}`);
  mainMenu();
};

const updateRole = async () => {
  const { rows: emps } = await pool.query('SELECT * FROM employee');
  const { rows: roles } = await pool.query('SELECT * FROM role');
  const { empId, newRole } = await inquirer.prompt([
    {
      type: 'list',
      name: 'empId',
      message: 'Choose employee:',
      choices: emps.map((e: { first_name: string; last_name: string; id: number }) => ({
        name: `${e.first_name} ${e.last_name}`,
        value: e.id,
      })),
    },
    {
      type: 'list',
      name: 'newRole',
      message: 'New role:',
      choices: roles.map((r: { title: string; id: number }) => ({ name: r.title, value: r.id })),
    },
  ]);
  await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [newRole, empId]);
  console.log('Employee role updated.');
  mainMenu();
};

const main = async () => {
  await connectToDb();
  console.log('Application started.');
  mainMenu();
};

main();
