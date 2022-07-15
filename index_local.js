// IMPORTS
// ===============================================================================
const express = require("express");
const app = express();
const cors = require("cors");

// PORT
// ===============================================================================
const port = 8080;

// SET
// ===============================================================================
app.use(cors())
app.use(express.json());

// ROUTE IMPORT
// ===============================================================================
const Task = require(`./todo-app/routes/task/request`);

// ROUTE IMPLEMENT
// ===============================================================================
app.use('/task',Task);


// RUN SERVER
// ===============================================================================
app.listen(port,()=>{
    console.log(`Server is listening in port ${port}`);
})