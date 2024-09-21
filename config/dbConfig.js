
const mysql = require('mysql2');

const Connection = mysql.createConnection({
    database: "sql7732664",
    host: "sql7.freemysqlhosting.net",
    user: "sql7732664",
    password: "DwKAAN5q6Y",
  });

Connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

module.exports = { Connection };
