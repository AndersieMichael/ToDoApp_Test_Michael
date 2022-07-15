// IMPORTS
// ===============================================================================
const moment_tz = require('moment-timezone');

async function getTaskbyID(
    pg_client,
    id
    ){
    let query
    let values
    let success
    let result

    try {
        query=`select * from "task" 
        where "Task_ID" = $1`
        
        values=[
            id
        ];



        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

async function getTask(
    pg_client,
    page,
    limit,
    title,
    time_start,
    time_end,
    finish
){
    let query
    let values
    let success
    let result

    try {
        query=`select * from "task" `
        
        values=[];

        // APPLY SEARCH - time_start :: UNIX
        if (time_start != null){

            if (values.length == 0){
                query += " where "
            } else {
                query += " and "
            }

            let value_idx = "$" + (values.length + 1).toString();
            query += ` "Action_Time" >= ${value_idx} `;
            values.push(moment_tz.unix(time_start).toISOString());
        }

        // APPLY SEARCH - time_end :: UNIX
        if (time_end != null){

            if (values.length == 0){
                query += " where "
            } else {
                query += " and "
            }

            let value_idx = "$" + (values.length + 1).toString();
            query += ` "Action_Time" <= ${value_idx} `;
            values.push(moment_tz.unix(time_end).toISOString());
        }
        
        // APPLY SEARCH - title :: STRING
        if (title != null){

            if (values.length == 0){
                query += " where "
            } else {
                query += " and "
            }

            let value_idx = "$" + (values.length + 1).toString();
            query += ` LOWER("Title") like ${value_idx} `;
            values.push('%'+title.toString().toLowerCase()+'%');
        }   
        
        // APPLY SEARCH - finish :: Bool
        if (finish != null){

            if (values.length == 0){
                query += " where "
            } else {
                query += " and "
            }

            let value_idx = "$" + (values.length + 1).toString();
            query += ` "Is_Finished" = ${value_idx} `;
            values.push(finish);
        } 

        // LIMIT 
        if(limit){
            query += ` LIMIT ${limit} `;
        }
        
        // OFFSET 
        let offset = limit * Math.max(((page || 0) - 1), 0);
        query += ` OFFSET ${offset} `;

        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

async function countTask(
    pg_client,
    title,
    time_start,
    time_end,
    finish
){
    let query
    let values
    let success
    let result

    try {
        query=`select 
            --// COUNT ONLY
            COUNT(*) as "Total"  
            from "task" `
        
        values=[]

        // APPLY SEARCH - time_start :: UNIX
        if (time_start != null){

            if (values.length == 0){
                query += " where "
            } else {
                query += " and "
            }

            let value_idx = "$" + (values.length + 1).toString();
            query += ` "Action_Time" >= ${value_idx} `;
            values.push(moment_tz.unix(time_start).toISOString());
        }

        // APPLY SEARCH - time_end :: UNIX
        if (time_end != null){

            if (values.length == 0){
                query += " where "
            } else {
                query += " and "
            }

            let value_idx = "$" + (values.length + 1).toString();
            query += ` "Action_Time" <= ${value_idx} `;
            values.push(moment_tz.unix(time_end).toISOString());
        }
        
        // APPLY SEARCH - title :: STRING
        if (title != null){

            if (values.length == 0){
                query += " where "
            } else {
                query += " and "
            }

            let value_idx = "$" + (values.length + 1).toString();
            query += ` LOWER("Title") like ${value_idx} `;
            values.push('%'+title.toString().toLowerCase()+'%');
        }   
        
        // APPLY SEARCH - finish :: Bool
        if (finish != null){

            if (values.length == 0){
                query += " where "
            } else {
                query += " and "
            }

            let value_idx = "$" + (values.length + 1).toString();
            query += ` "Is_Finished" = ${value_idx} `;
            values.push(finish);
        }        

        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            result = Number(result[0]["Total"]);
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

async function getObjectiveByID(pg_client,id){
    let query
    let values
    let success
    let result

    try {
        query=`select "Objective_Name", "Is_Finished" 
            from "objective"
            where "Task_ID" = $1`
        
        values=[
            id
        ]

        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

async function addTask(pg_client,title,time){
    let query
    let values
    let success
    let result

    try {
        query=`insert into "task" ("Title","Action_Time")
            values ($1,$2)
            returning "Task_ID"`
        
        values=[
            title,
            moment_tz.unix(time)
        ]

        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

async function addObjective(pg_client,id,object){
    let query
    let values
    let success
    let result

    try {
        query=`insert into "objective"("Task_ID", "Objective_Name" )
            values($1,$2) `
        
        values=[
            id,
            object
        ]

        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

async function addNewObjective(pg_client,id,object,finish){
    let query
    let values
    let success
    let result

    try {
        query=`insert into "objective"("Task_ID", "Objective_Name","Is_Finished")
            values($1,$2,$3) `
        
        values=[
            id,
            object,
            finish
        ]

        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

async function updateObjective(
    pg_client,
    id,
    title,
    bool
    ){
    let query
    let values
    let success
    let result

    try {
        query=` update "objective"
                set "Is_Finished" = $3
                where LOWER("Objective_Name")= lower($2) 
                and "Task_ID" = $1`
        
        values=[
            id,
            title,
            bool
        ]

        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

async function updateTask(
    pg_client,
    id,
    title,
    finish
){
    let query
    let values
    let success
    let result

    try {
        query=` update "task"
                set "Title" = $2, 
                "Is_Finished" = $3
                where "Task_ID" = $1`
        
        values=[
            id,
            title,
            finish
        ]

        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

async function deleteTask(
    pg_client,
    id
){
    let query
    let values
    let success
    let result

    try {
        query=`delete from "task"
            where "Task_ID" = $1`
        
        values=[
            id
        ]

        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

async function deleteObjective(
    pg_client,
    id
){
    let query
    let values
    let success
    let result

    try {
        query=`delete from "objective"
            where "Task_ID" = $1`
        
        values=[
            id
        ]

        const temp = await pg_client.query(query,values)
        if(temp==null || temp==undefined){
            throw new Error(`query Resulted on: ${temp}`)
        }else{
            result = temp.rows
            success = true
        }

    } catch (error) {
        console.log(error.message);
        success=false;
        result = error.message
    }

    // RETURN
    return [success, result];  
}

// EXPORTS
// ===============================================================================
exports.getTaskbyID = getTaskbyID
exports.getTask = getTask
exports.countTask = countTask
exports.getObjectiveByID = getObjectiveByID
exports.addTask = addTask
exports.addObjective = addObjective
exports.updateObjective = updateObjective
exports.updateTask = updateTask
exports.deleteObjective = deleteObjective
exports.deleteTask = deleteTask
exports.addNewObjective = addNewObjective
