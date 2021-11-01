const fn_query = require("../processor/qure");
const path = require('path');
const fs = require('fs');
const doPredict =require("../processor/doPredict");
const readElements= require ("../processor/readElement");
const readRelations =require ("../processor/readRelation");
const fn_getResult = require("../controller/get_result")

let fn_predict_new = async(userName, jobName, imgName, metadata) => {
    console.log("here is predict new")
    let workPath = "static/users/" + userName + '/' + jobName + '/';
    let imgPath = workPath + "img/" + imgName;
    let cmd = "python3 pathway_module/body_interface.py --dataset " + workPath;
    let predictStatus = await doPredict(cmd, workPath);
    if(predictStatus == 'ok'){
        console.log("import data to database")
        let elements = await readElements(workPath + "img/" + imgName.split(".")[0] + "_elements.json");
        let relations = await readRelations(workPath + "img/" + imgName.split(".")[0] + "_relation.json");
        console.log("elements",elements);
        console.log("relation",relations)
        let figureW = elements[0].image_size[1];
        let figureH = elements[0].image_size[0];
        //insert fig info and get max figid
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
        (fig_name, width, height,  fig_path, predict_status, fig_link, fig_title, fig_caption, paper_id) 
        values
        ("${imgName}", ${figureW}, ${figureH}, "${imgPath}", true, "${metadata.figure_link}", "${metadata.figure_title}", "${metadata.figure_description}", ${paper_id[0].id} );`
        );
        let fig_id = await fn_query(
            `SELECT max(fig_id) as id from Figure;`
        );
       
        console.log(fig_id[0].id)

        let jobToDatabase = await fn_query(
            `INSERT INTO Job
            (U_name, fig_id, job_name, processing)
            values
            ( '${userName}', ${fig_id[0].id}, '${jobName}',100 );`
        );
        elements.splice(0, 1);
        for(let e of elements){
            e.gene_BBox = e.coordinates.toString();
            console.log(e.gene_BBox)
        }
        let figureInfo = {
            "width":figureW,
            "heigth":figureH,
        }
        for(let e of elements){
            gene_Bbox = e.coordinates.toString();
            let new_fig_id = await fn_query(
                `INSERT INTO Gene
                (fig_id, gene_BBox, gene_name)
                values
                (${fig_id[0].id}, '${e.gene_BBox}', '${e.gene_name}');`
            );
        }
        for(let key in relations){
            let e = relations[key]
            relation_Bbox = e.bbox.toString();
            var relationToDatabase = await fn_query(
                `INSERT INTO Relation
                (fig_id, activator, receptor, relation_type, relation_Bbox )
                values
                (${fig_id[0].id}, '${e.startor}', '${e.receptor}', '${e.relation_category}', '${relation_Bbox}')`
            );
        }
        let result = await fn_getResult(fig_id[0].id);
        console.log(result);
        return result;
    }
    
}

module.exports = fn_predict_new;