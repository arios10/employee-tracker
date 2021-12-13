const mysql2 = require('mysql2');

const connection = mysql2.createConnection({
  host: 'localhost',
  port: 3301,
  user: 'root',
  password: 'root',
  database: 'employees'
});

module.exports = connection;