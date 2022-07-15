// IMPORTS
// ===============================================================================
const express = require("express");
const router = express.Router();
const joi =  require("joi");
const moment = require("moment");
const moment_tz = require('moment-timezone');
const  pool  = require("../../utilities/db").pool;

// FUNCTION
// ===============================================================================
const getTaskbyID = require('./function').getTaskbyID
const getTask = require('./function').getTask
const countTask = require('./function').countTask
const getObjectiveByID = require('./function').getObjectiveByID
const addTask = require('./function').addTask
const addObjective = require('./function').addObjective
const updateTask = require('./function').updateTask
const addNewObjective = require('./function').addNewObjective
const updateObjective = require('./function').updateObjective
const deleteObjective = require('./function').deleteObjective
const deleteTask = require('./function').deleteTask
const PaginatePages = require('../../utilities/pagination').PaginatePages

let head_route_name = "/task";

//GET ALL TASK 
router.get('/get',async (req,res)=>{
    
    //BASIC INFO
    //=============================================================
    let request_namepath = req.path
    let time_requested = moment(Date.now())

    // PARAM
    //=============================================================
    const req_query = req.query

    // JOI VALIDATION
    //=============================================================
    let joi_template_query = joi.object({
        "Page": joi.number().min(1).required(),
        "Limit": joi.number().default(20).invalid(0),
        "Title": joi.string().default(null),
        "Action_Time_Start": joi.date().timestamp().default(null),
        "Action_Time_End": joi.date().timestamp().default(null),
        "Is_Finished": joi.boolean().default(null),
        
    }).required();
    

    let joi_query_validation = joi_template_query.validate(req_query);
    if(joi_query_validation.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_query_validation.error.stack,
            "error_data": joi_query_validation.error.details
        };
        res.status(200).json(message);
        return; //END

    }  
    
    // PARAM
    //=============================================================
    const page = joi_query_validation.value["Page"]
    const limit = joi_query_validation.value["Limit"]
    const title = joi_query_validation.value["Title"]
    const time_start = joi_query_validation.value["Action_Time_Start"]
    const time_end = joi_query_validation.value["Action_Time_End"]
    const finish = joi_query_validation.value["Is_Finished"]
    let format = []

    if(time_start!=null && time_end!=null){

        if(time_end<time_start){
 
            const message = {
                "message"   : "Failed",
                "error_key" : "error_internal_server" ,
                "error_message" : "Action_Time_End Cannot lower than Action_Time_Start",
                "error_data": "ON Check Time"
            };

            res.status(200).json(message);
            return
        }
    }

    // BEGIN CLIENT
    //=============================================================
    const pg_client = await pool.connect();

    // GET TASK
    // =============================================================
    let [db_task_success, db_task_result] = await getTask(
        pg_client,
        page,
        limit,
        title,
        time_start,
        time_end,
        finish
    );

    // QUERY FAILS
    if(!db_task_success){
        console.log(db_task_result);
        pg_client.release();
        const message = {
            "message"   : "Failed",
            "error_key" : "error_internal_server" ,
            "error_message" : db_task_result,
            "error_data": "ON getTask"
        };
        res.status(200).json(message);
    }

    // GET COUNT ALL FOR PAGINATION
    let [db_task_count_success, db_task_count_result] = await countTask(
        pg_client,
        title,
        time_start,
        time_end,
        finish
    );

    // QUERY FAILS
    if (!db_task_count_success) {
        console.log(db_task_count_result);
        pg_client.release();
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": db_task_count_result,
            "error_data": "ON CountTask"
        };
        res.status(200).json(message);
        return; //END
    }

    let paginate = PaginatePages(db_task_result, page, limit, db_task_count_result);

    for (let data of paginate.List_Data) {
        
        // GET List Objective BY Task_ID
        //=============================================================
        let [db_objective_success, db_objective_result] = await getObjectiveByID(
            pg_client, data.Task_ID
        );

        // QUERY FAILS
        if (!db_objective_success) {
            console.log(db_objective_result);
            pg_client.release();
            const message = {
                "message": "Failed",
                "error_key": "error_internal_server",
                "error_message": db_objective_result,
                "error_data": "ON getObjectiveByID"
            };

            res.status(200).json(message);
            return; //END
        }
            
        let temp = {
            "Task_ID": data.Task_ID,
            "Title": data.Title,
            "Action_Time": moment_tz(data.Action_Time).unix(),
            "Created_Time": moment_tz(data.Created_Time).unix(),
            "Updated_Time": moment_tz(data.Updated_Time).unix(),
            "Is_Finished": data.Is_Finished,
            "Objective_List": db_objective_result
        }

        format.push(temp)
        
    }

    // ASSEMBLY RESPONSE
    //=============================================================
    pg_client.release();
    res.status(200).json({
        "message": "Success",
        "data": {
            "List_Data": format,
            "Pagination_Data": paginate.Pagination_Data
        }
    });
    return; //END
})

//GET TASK BY ID 
router.get('/get/:id',async (req,res)=>{
    
    //BASIC INFO
    //=============================================================
    let request_namepath = req.path
    let time_requested = moment(Date.now())

    // PARAM
    //=============================================================
    const req_param = req.params

    // JOI VALIDATION
    //=============================================================
    let joi_id_params = joi.number().required();
    
    let joi_param_validation = joi_id_params.validate(req_param.id);
    if(joi_param_validation.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_param_validation.error.stack,
            "error_data": joi_param_validation.error.details
        };
        res.status(200).json(message);
        return; //END

    }  
    
    // PARAM
    //=============================================================
    const id = req_param.id

    // BEGIN CLIENT
    //=============================================================
    const pg_client = await pool.connect();

    // GET TASK
    // =============================================================
    let [db_task_success, db_task_result] = await getTaskbyID(
        pg_client,
        id
    );

    // QUERY FAILS
    if(!db_task_success){
        console.log(db_task_result);
        pg_client.release();
        const message = {
            "message"   : "Failed",
            "error_key" : "error_internal_server" ,
            "error_message" : db_task_result,
            "error_data": "ON getTaskbyID"
        };
        res.status(200).json(message);
    }

    //ID NOT FOUND
    // =============================================================
    if(db_task_result.length===0){
        pg_client.release();
        const message = {
            "message"   : "Failed",
            "error_key" : "error_id_not_found" ,
            "error_message" : "ID NOT FOUND",
            "error_data": "ON getTaskbyID"
        };
        res.status(200).json(message);
        return;
    }

    // GET List Objective BY Task_ID
    //=============================================================
    let [db_objective_success, db_objective_result] = await getObjectiveByID(
        pg_client, id
    );
        
    // QUERY FAILS
    if (!db_objective_success) {
        console.log(db_objective_result);
        pg_client.release();
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": db_objective_result,
            "error_data": "ON getObjectiveByID"
        };

        res.status(200).json(message);
        return; //END
    }

    let temp = {
        "Task_ID": db_task_result[0]["Task_ID"],
        "Title": db_task_result[0]["Title"],
        "Action_Time": moment_tz(db_task_result[0]["Action_Time"]).unix(),
        "Created_Time": moment_tz(db_task_result[0]["Created_Time"]).unix(),
        "Updated_Time": moment_tz(db_task_result[0]["Updated_Time"]).unix(),
        "Is_Finished": db_task_result[0]["IS_Finishied"],
        "Objective_List": db_objective_result
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    pg_client.release();
    res.status(200).json({
        "message": "Success",
        "data": temp
    });
    return; //END
})

//ADD TASK 
router.post('/add',async(req,res)=>{

    //BASIC INFO
    //=============================================================
    let request_namepath = req.path
    let time_requested = moment(Date.now())

    // PARAM
    //=============================================================
    const req_body = req.body

    // JOI VALIDATION
    //=============================================================
    let joi_template_body = joi.object({
        "Title": joi.string().required(),
        "Action_Time": joi.date().timestamp().required(),
        "Objective_List": joi.array().items(
            joi.string()
        ).min(1).required(),
    }).required();
    

    let joi_body_validation = joi_template_body.validate(req_body);
    if(joi_body_validation.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_body_validation.error.stack,
            "error_data": joi_body_validation.error.details
        };
        res.status(200).json(message);
        return; //END

    }  
    
    // PARAM
    //=============================================================
    const title = joi_body_validation.value["Title"]
    const time = joi_body_validation.value["Action_Time"]
    const list = req_body.Objective_List

    // BEGIN CLIENT
    //=============================================================
    const pg_client = await pool.connect();
    await pg_client.query("begin");

    // ADD TASK
    // =============================================================
    let [db_task_success, db_task_result] = await addTask(
        pg_client,
        title,
        time
    );

    // QUERY FAILS
    if(!db_task_success){
        console.log(db_task_result);
        await pg_client.query("rollback");
        pg_client.release();
        const message = {
            "message"   : "Failed",
            "error_key" : "error_internal_server" ,
            "error_message" : db_task_result,
            "error_data": "ON addTask"
        };
        res.status(200).json(message);
    }

    // INSERT OBJECTIVE
    //=============================================================

    for (let data of list){
        let [db_object_success, db_object_result] = await addObjective(
            pg_client,
            db_task_result[0]["Task_ID"],
            data
        );
    
        // QUERY FAILS
        if(!db_object_success){
            console.log(db_object_result);
            await pg_client.query("rollback");
            pg_client.release();
            const message = {
                "message"   : "Failed",
                "error_key" : "error_internal_server" ,
                "error_message" : db_object_result,
                "error_data": "ON addObjective"
            };
            res.status(200).json(message);
            break;
        }
    
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    await pg_client.query("commit");
    pg_client.release();
    res.status(200).json({
        "message":"Success"
    })
    return; //END
})

//UPDATE TASK
router.put('/update/:id',async (req,res)=>{
    
    //BASIC INFO
    //=============================================================
    let request_namepath = req.path
    let time_requested = moment(Date.now())

    // PARAM
    //=============================================================
    const req_param = req.params
    const req_body = req.body

    // JOI VALIDATION
    //=============================================================

    //BODY JOI

    let joi_template_body = joi.object({
        "Title": joi.string().required(),
        "Objective_List": joi.array().items(joi.object({
            "Objective_Name": joi.string(),
            "Is_Finished": joi.boolean(),
        })).min(1).required(),
    }).required();

    let joi_body_validation = joi_template_body.validate(req_body);
    if(joi_body_validation.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_body_validation.error.stack,
            "error_data": joi_body_validation.error.details
        };
        res.status(200).json(message);
        return; //END

    }  
    
    //PARAMS JOI

    let joi_id_params = joi.number().required();

    let joi_param_validation = joi_id_params.validate(req_param.id);
    if(joi_param_validation.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_param_validation.error.stack,
            "error_data": joi_param_validation.error.details
        };
        res.status(200).json(message);
        return; //END

    }  
    
    // PARAM
    //=============================================================
    const id = req_param.id
    const title = joi_body_validation.value["Title"]
    const list = req_body.Objective_List
    let check = 0;
    let finish = false;

    // BEGIN CLIENT
    //=============================================================
    const pg_client = await pool.connect();
    await pg_client.query("begin");

    // GET TASK
    // =============================================================
    let [db_task_success, db_task_result] = await getTaskbyID(
        pg_client,
        id
    );

    // QUERY FAILS
    if(!db_task_success){
        console.log(db_task_result);
        pg_client.release();
        const message = {
            "message"   : "Failed",
            "error_key" : "error_internal_server" ,
            "error_message" : db_task_result,
            "error_data": "ON getTaskbyID"
        };
        res.status(200).json(message);
    }

    //ID NOT FOUND
    // =============================================================
    if(db_task_result.length===0){
        pg_client.release();
        const message = {
            "message"   : "Failed",
            "error_key" : "error_id_not_found" ,
            "error_message" : "ID NOT FOUND",
            "error_data": "ON getTaskbyID"
        };
        res.status(200).json(message);
        return;
    }

    //TASK ALREADY FINISHED
    // =============================================================    
    if(db_task_result[0]["Is_Finished"]){
        pg_client.release();
        const message = {
            "message"   : "Failed",
            "error_key" : "error_internal_server" ,
            "error_message" : "TASK ALREADY FINISHED",
            "error_data": "ON Check TASK FINISHED"
        };
        res.status(200).json(message);
        return;
    }

    // DELETE OBJECTIVE
    //=============================================================
    let [db_objective_success, db_objective_result] = await deleteObjective(
        pg_client, 
        id
    );

    // QUERY FAILS
    if (!db_objective_success) {
        console.log(db_objective_result);
        await pg_client.query("rollback");
        pg_client.release();
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": db_objective_result,
            "error_data": "ON deleteObjective"
        };

        res.status(200).json(message);
        return; //END
    }    

    for (let data of list) {
        
        // UPDATE NEW OBJECTIVE
        //=============================================================
        let [db_objective_success, db_objective_result] = await addNewObjective(
            pg_client, 
            id,
            data.Objective_Name,
            data.Is_Finished
        );

        // QUERY FAILS
        if (!db_objective_success) {
            console.log(db_objective_result);
            await pg_client.query("rollback");
            pg_client.release();
            const message = {
                "message": "Failed",
                "error_key": "error_internal_server",
                "error_message": db_objective_result,
                "error_data": "ON addNewObjective"
            };

            res.status(200).json(message);
            return; //END
        }

        if(data.Is_Finished==true){
            check++
        }
        
        
    }

    if(check==list.length){
        finish=true;
    }

    // UPDATE Task
    //=============================================================
    let [db_task_update_success, db_task_update_result] = await updateTask(
        pg_client, 
        id,
        title,
        finish
    );

    // QUERY FAILS
    if (!db_task_update_success) {
        console.log(db_task_update_result);
        await pg_client.query("rollback");
        pg_client.release();
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": db_task_update_result,
            "error_data": "ON updateTask"
        };

        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    await pg_client.query("commit");
    pg_client.release();
    res.status(200).json({
        "message": "Success",

    });
    return; //END
})

//DELETE TASK
router.delete('/delete/:id',async (req,res)=>{
    
    //BASIC INFO
    //=============================================================
    let request_namepath = req.path
    let time_requested = moment(Date.now())

    // PARAM
    //=============================================================
    const req_param = req.params

    // JOI VALIDATION
    //=============================================================

    let joi_id_params = joi.number().required();

    let joi_param_validation = joi_id_params.validate(req_param.id);
    if(joi_param_validation.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_param_validation.error.stack,
            "error_data": joi_param_validation.error.details
        };
        res.status(200).json(message);
        return; //END

    }  
    
    // PARAM
    //=============================================================
    const id = req_param.id
 
    // BEGIN CLIENT
    //=============================================================
    const pg_client = await pool.connect();
    await pg_client.query("begin");

    // GET TASK
    // =============================================================
    let [db_task_success, db_task_result] = await getTaskbyID(
        pg_client,
        id
    );

    // QUERY FAILS
    if(!db_task_success){
        console.log(db_task_result);
        pg_client.release();
        const message = {
            "message"   : "Failed",
            "error_key" : "error_internal_server" ,
            "error_message" : db_task_result,
            "error_data": "ON getTaskbyID"
        };
        res.status(200).json(message);
    }

    //ID NOT FOUND
    // =============================================================
    if(db_task_result.length===0){
        pg_client.release();
        const message = {
            "message"   : "Failed",
            "error_key" : "error_id_not_found" ,
            "error_message" : "ID NOT FOUND",
            "error_data": "ON getTaskbyID"
        };
        res.status(200).json(message);
        return;
    }
        
    // DELETE OBJECTIVE
    //=============================================================
    let [db_objective_success, db_objective_result] = await deleteObjective(
        pg_client, 
        id
    );

    // QUERY FAILS
    if (!db_objective_success) {
        console.log(db_objective_result);
        await pg_client.query("rollback");
        pg_client.release();
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": db_objective_result,
            "error_data": "ON deleteObjective"
        };

        res.status(200).json(message);
        return; //END
    }
        
    // DELETE Task
    //=============================================================
    let [db_task_delete_success, db_task_delete_result] = await deleteTask(
        pg_client, 
        id
    );

    // QUERY FAILS
    if (!db_task_delete_success) {
        console.log(db_task_delete_result);
        await pg_client.query("rollback");
        pg_client.release();
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": db_task_delete_result,
            "error_data": "ON deleteTask"
        };

        res.status(200).json(message);
        return; //END
    }
    


    // ASSEMBLY RESPONSE
    //=============================================================
    await pg_client.query("commit");
    pg_client.release();
    res.status(200).json({
        "message": "Success",

    });
    return; //END
})




// EXPORTS
// ===============================================================================
module.exports = router