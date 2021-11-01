const fn_query = require("../processor/qure");
const path = require('path');
const fs = require('fs');
const doPredict =require("../processor/doPredict");
const readElements= require ("../processor/readElement");
const readRelations =require ("../processor/readRelation");
const fn_getResult = require("../controller/get_result");
const { async } = require("node-stream-zip");

let fn_predict_multiple = async(userName, jobName) => {
    console.log("here is predict multiple")
    let workPath = "static/users/" + userName + '/' + jobName + '/';
    var images_name = fs.readdirSync(workPath+"img/");
    console.log(images_name);
    //import job and figure into database
    for(let element of images_name){
        let img_path = workPath + "img/" + element
        let figureToDatabase = await fn_query(
            `INSERT INTO Figure 
            (fig_name, fig_path) 
            values
            ("${element}", "${img_path}" );`
        );
        let fig_id = await fn_query(
            `SELECT max(fig_id) as id from Figure;`
        );
        console.log(fig_id[0].id)

        let jobToDatabase = await fn_query(
            `INSERT INTO Job
            (U_name, fig_id, job_name)
            values
            ( '${userName}', ${fig_id[0].id}, '${jobName}' );`
        );
    }

    
    let cmd = "python3 pathway_module/body_interface.py --dataset " + workPath;
    // doPredict(cmd, workPath);
}

module.exports = fn_predict_multiple;