const mysql=require('mysql2')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'freshexpenses'
})

connection.connect((err)=>{
    if (err) {
        console.error('Database connection failed:', err);
        return;
      }
      console.log('Connected to MySQL sucessfully');
})


module.exports = connection;