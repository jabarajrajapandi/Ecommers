const mysql = require('mysql')

const db = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    database: "ecommerce",
    password: "Rajapandi@55"
})

db.connect((err) => {
    if (err) {
      console.error("Error connecting to the database: " + err.stack);
      return;
    }
    console.log("Connected to the database!");
  });
  
  module.exports = db;