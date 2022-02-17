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
        // console.log("elements",elements);
        // console.log("relation",relations)
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

        // console.log(fig_id[0].id)

        let jobToDatabase = await fn_query(
            `INSERT INTO Job
            (U_name, fig_id, job_name, processing)
            values
            ( '${userName}', ${fig_id[0].id}, '${jobName}',100 );`
        );
        elements.splice(0, 1);
        for(let e of elements){
            e.gene_BBox = e.coordinates.toString();
            // console.log(e.gene_BBox)
        }
        let figureInfo = {
            "width":figureW,
            "heigth":figureH,
        }
        let filter_geneName = [];
        let filter_geneId = [];
        for(let e of elements){
            gene_Bbox = e.coordinates.toString();
            if(e.gene_name){
                e.gene_name = e.gene_name.replace("'","")
            }
            let dict_gene = await fn_query(
                `SELECT dict_id, gene_name\
                FROM Gene_Dictionary\
                WHERE gene_name = '${e.gene_name}' OR alias like '%,${e.gene_name},%' OR alias like '${e.gene_name},%' OR alias like '%,${e.gene_name}' ;`
            );
            // console.log('+ ' + 'predict_new:70=>' + dict_gene +' +');
            
            
            if(dict_gene.length == 0){
                let insert = await fn_query(
                    `INSERT INTO Gene\
                    (fig_id, dict_id ,gene_BBox, is_match, gene_name)\
                    VALUE\
                    (${fig_id[0].id}, null, '${e.gene_BBox}', 0, '${e.gene_name}');`
                );
            }else if(dict_gene.length == 1){
                let insert = await fn_query(
                    `INSERT INTO Gene\
                    (fig_id, dict_id ,gene_BBox, is_match, gene_name)\
                    VALUE\
                    (${fig_id[0].id}, ${dict_gene[0].dict_id}, '${e.gene_BBox}', 1, '${e.gene_name}');`
                );
                let gene_id = await fn_query('select LAST_INSERT_ID() as id;')
                filter_geneName.push(e.gene_name);
                filter_geneId.push(gene_id[0].id);
            }else{
                let insert = await fn_query(
                    `INSERT INTO Gene\
                    (fig_id, dict_id ,gene_BBox, is_match, gene_name)\
                    VALUE\
                    (${fig_id[0].id}, ${dict_gene[0].dict_id}, '${e.gene_BBox}', 1, '${e.gene_name}');`
                );
                let gene_id = await fn_query('select LAST_INSERT_ID() as id;')
                filter_geneName.push(e.gene_name);
                filter_geneId.push(gene_id[0].id);
            }
            // let new_fig_id = await fn_query(
            //     `INSERT INTO Gene
            //     (fig_id, gene_BBox, gene_name)
            //     values
            //     (${fig_id[0].id}, '${e.gene_BBox}', '${e.gene_name}');`
            // );
        }
        for(let key in relations){
            let e = relations[key];
            // console.log("relation e:"+e)
            if(e.startor && e.receptor && filter_geneName.includes(e.startor) && filter_geneName.includes(e.receptor)){
                e.startor = e.startor.replace("'","");
                e.receptor = e.receptor.replace("'","");
                relation_Bbox = e.bbox.toString();
                let starter_geneId = filter_geneId[filter_geneName.indexOf(e.startor)];
                let receptor_geneId = filter_geneId[filter_geneName.indexOf(e.receptor)];
                console.log("starer_geneid:"+starter_geneId);
                console.log("index:"+filter_geneName.indexOf(e.startor))
                var relationToDatabase = await fn_query(
                    `INSERT INTO Relation
                    (fig_id, activator, receptor, relation_type, relation_Bbox )
                    values
                    (${fig_id[0].id}, '${starter_geneId}', '${receptor_geneId}', '${e.relation_category}', '${relation_Bbox}')`
                );
            }
            
            
        }
        let result = await fn_getResult(fig_id[0].id);
        // console.log(result);
        return result;
    }
    
}

module.exports = fn_predict_new;