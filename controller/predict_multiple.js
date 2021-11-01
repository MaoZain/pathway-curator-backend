const fn_query = require("../processor/qure");
const path = require('path');
const fs = require('fs');
const doPredict =require("../processor/doPredict");
const readElements= require ("../processor/readElement");
const readRelations =require ("../processor/readRelation");
const fn_getResult = require("../controller/get_result");
const { async } = require("node-stream-zip");

let fn_predict_multiple = async(userName, jobName, metadata) => {
    console.log("here is predict multiple")
    let workPath = "static/users/" + userName + '/' + jobName + '/';
    var images_name = fs.readdirSync(workPath+"img/");
    console.log(images_name);
    //import job and figure into database
    for(let element of images_name){
        if(element!=".DS_Store"){
            let img_path = workPath + "img/" + element;
            let insert_paper = await fn_query(
                `insert into Article
                (title, paper_link, pmc_id, pm_id, author, year, journal, key_words, description)
                values
                ("${metadata.paper_title}","${metadata.paper_source}","${metadata.pmc_id}","${metadata.pm_id}","${metadata.first_author}",${metadata.publication_year},"${metadata.journal}","${metadata.keywords}","${metadata.paper_description}")`
            )
            let paper_id = await fn_query(
                `SELECT max(paper_id) as id from Article;`
            );
            let figureToDatabase = await fn_query(
                `INSERT INTO Figure 
                (fig_name, fig_path, fig_link, fig_title, fig_caption, paper_id) 
                values
                ("${element}", "${img_path}","${metadata.figure_link}", "${metadata.figure_title}", "${metadata.figure_description}", ${paper_id[0].id} );`
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
        
    }
    let cmd = "python3 pathway_module/body_interface.py --dataset " + workPath;
    doPredict(cmd, workPath);
}

module.exports = fn_predict_multiple;