const fn_query = require("../processor/qure");
const fn_checkJobProcessing = require("../processor/checkJobProcessing");
const readElements= require ("../processor/readElement");
const readRelations =require ("../processor/readRelation");

let fn_getAllHistoryInfo = async(ctx) => {
    let user_name = ctx.request.query.user_name;
    //检索用户所有未完成的figure 如果已经完成则插入数据库
    let unfinished_figs = await fn_checkJobProcessing(user_name); //fig_path, fig_id
    for(let fig of unfinished_figs){
        let index = fig.fig_path.lastIndexOf('.')
        let elements = await readElements(fig.fig_path.substring(0, index) + "_elements.json");
        let relations = await readRelations(fig.fig_path.substring(0, index) + "_relation.json");
        if(elements!="err" && relations!="err"){
            console.log(elements, relations)
            console.log("start import")
            let figureW = elements[0].image_size[1];
            let figureH = elements[0].image_size[0];
            let figureToDatabase = await fn_query(
                `update Figure
                set width = ${figureW}, height=${figureH}, predict_status=true
                where fig_id = ${fig.fig_id};`
            );
            elements.splice(0, 1);
            for(let e of elements){
                e.gene_BBox = e.coordinates.toString();
                // console.log(e.gene_BBox)
            }
            for(let e of elements){
                gene_Bbox = e.coordinates.toString();
                let gene_name = "";
                if(e.gene_name!=null){
                    gene_name = e.gene_name.replace("'","")
                }
                let new_fig_id = await fn_query(
                    `INSERT INTO Gene
                    (fig_id, gene_BBox, gene_name)
                    values
                    (${fig.fig_id}, '${e.gene_BBox}', '${gene_name}');`
                );
            }
            for(let key in relations){
                let e = relations[key]
                relation_Bbox = e.bbox.toString();
                let starter = "";
                let receptor = "";
                if(e.startor != null){
                    starter = e.startor.replace("'","");
                }
                if(e.receptor != null){
                    receptor = e.receptor.replace("'","");
                }
                var relationToDatabase = await fn_query(
                    `INSERT INTO Relation
                    (fig_id, activator, receptor, relation_type, relation_Bbox )
                    values
                    (${fig.fig_id}, '${starter}', '${receptor}', '${e.relation_category}', '${relation_Bbox}')`
                );
            }
        }
    }
    //计算processing
    let job_names = await fn_query(
        `select job_name
        from Job
        where U_name = "${user_name}" and processing <> 100;`
    );
    let job_names_array = []
    for(let name of job_names){
        if(!job_names_array.includes(name.job_name)){
            job_names_array.push(name.job_name)
        }
    }
    for(let name of job_names_array){
        let figs = await fn_query(
            `select fig_id
            from Job
            where job_name = '${name}'`
        )
        let sum = figs.length;
        console.log(sum);
        let predicted_fig = []
        for(let fig of figs){
            let fig_id = fig.fig_id;
            let predicted = await fn_query(
                `select predict_status
                from Figure
                where fig_id = ${fig_id}`
            )
            if(predicted.length>0){
                if(predicted[0].predict_status){
                    predicted_fig.push(fig_id)
                }
            }
        }
        console.log(predicted_fig.length)
        let processing = parseInt( predicted_fig.length*100 / sum );
        let update_processing = await fn_query(
            `update Job
            set processing = ${processing}
            where job_name = '${name}'`
        )
    }
    let historyInfo = await fn_query(
        `SELECT j.job_name,j.processing,f.predict_status, f.fig_name, f.fig_id, j.job_id\
         FROM Job as j join Figure as f on j.fig_id = f.fig_id\
         WHERE j.U_name = '${user_name}';`
    )
    let result = {info:{}};
    if(job_names.length===0){
        result.unfinished_figs=0
    }
    let temp = []
    for(let e of historyInfo){
        if(temp.includes(e.job_name)){
            result['info'][e.job_name].push(e)
        }else{
            let name = e.job_name;
            temp.push(name)
            result['info'][name]=[e]
        }
    }
    // historyInfo = JSON.stringify(historyInfo);
    
    return result;
    
}

module.exports = fn_getAllHistoryInfo;