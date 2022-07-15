//IMPORT
const pool = require('pg').Pool;

db_pool = new pool({
    host: '127.0.0.1',
    port: 5432,
    user:'postgres',
    password:'AndersieMichael',
    database:'ToDoApp_Michael',
    max:20,
    idleTimeoutMillis:10000,
    connectionTimeoutMilles:5000
});

db_pool.on('connect',()=>{
    console.log('CONNECTED TO DB');
})


exports.pool = db_pool
