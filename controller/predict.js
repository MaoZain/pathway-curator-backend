const fn_query = require("../processor/qure");
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const fn_getResult = require("../controller/get_result")
// static/users/debug/test/img/input_elements.json
function doPredict(cmd, workPath){
    //do prediction
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}`);
                reject('failed');
            }else{
                //stdout
                console.log("predict OK!");
                resolve('ok')
            }
        });
    })
    .catch((err)=>{
        return err;
    });
}

function getImageType(str){
    var reg = /\.(png|jpg|gif|jpeg|webp)$/;
    return str.match(reg)[1];
}

 let readElements = function(workPath, imgName){
    let path = workPath + "img/" + imgName.split(".")[0] + "_elements.json"
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if(err){
                console.log(err);
                reject(err);
            }
            let elements = JSON.parse(data);
            resolve(elements);
        });
    })
 }

 let readRelations = function(workPath, imgName){
    let path = workPath + "img/" + imgName.split(".")[0] + "_relation.json"
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if(err){
                console.log(err);
                reject(err);
            }
            let relations = JSON.parse(data);
            resolve(relations);
        });
    })
}

let fn_predict = async(userName, jobName, imgName) => {
    let result = {};
    let workPath = "static/users/" + userName + '/' + jobName + '/';
    let imgPath = workPath + "img/" + imgName;
    let cmd = "python3 pathway_module/body_interface.py --dataset " + workPath;
    let predictStatus = await doPredict(cmd, workPath);
    // let predictStatus = "ok";
    if(predictStatus == 'ok'){
        let elements = await readElements(workPath, imgName); //gene_name coordinates
        //get relation output
        let relations_pre = await readRelations(workPath, imgName);
        console.log(relations_pre)
        let relations = []
        for(let key in relations_pre){
            relations.push(
                {
                    // "activator": relations_pre[key].startor,
                    "activator_name": relations_pre[key].startor,
                    // "receptor": relations_pre[key].receptor,
                    "receptor_name": relations_pre[key].receptor,
                    "relation_Bbox": relations_pre[key].bbox.toString(),
                    "relation_type": relations_pre[key].relation_category,
                }
            )
        }
        console.log(elements)
        let figureW = elements[0].image_size[1];
        let figureH = elements[0].image_size[0];
        elements.splice(0, 1);
        for(let e of elements){
            e.gene_BBox = e.coordinates.toString();
        }
        let figureInfo = {
            "width":figureW,
            "heigth":figureH,
        }
        let get_base64_img = new Promise((resolve, reject) => {
            fs.readFile(imgPath, 'binary' , (err, data) => {
                if (err) {
                  console.error("get_base64_img_err",err)
                  reject(err)
                }
                const buffer = Buffer.from(data, 'binary');
                let img = 'data: image/'+ getImageType(imgPath) +';base64,' + buffer.toString('base64');
                // console.log(img)
                resolve(img)
            })
        })
    
        base64_img = await get_base64_img;
        result = {
            "figure": [figureInfo, base64_img],
            "gene":elements,
            "relation":relations,
        }
        //insert fig info and get max figid
        let figureToDatabase = await fn_query(
            `INSERT INTO Figure 
            (fig_name, height, width, fig_path) 
            values
            ("${imgName}", ${figureW}, ${figureH}, "${imgPath}" );`
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

        // let gene_Bbox;
        // for(let e of elements){
        //     gene_Bbox = e.coordinates.toString();
        //     let new_fig_id = await fn_query(
        //         `INSERT INTO Gene
        //         (fig_id, gene_Bbox, gene_name)
        //         values
        //         (${fig_id[0].id}, '${gene_Bbox}', '${e.gene_name}');`
        //     );
        // }
        // for(let key in relations){
        //     let e = relations[key]
        //     relation_Bbox = e.bbox.toString();
        //     var relationToDatabase = await fn_query(
        //         `INSERT INTO Relation
        //         (fig_id, activator, receptor, relation_type, relation_Bbox )
        //         values
        //         (${fig_id[0].id}, '${e.startor}', '${e.receptor}', '${e.relation_category}', '${relation_Bbox}')`
        //     );
        // }
        // let result = await fn_getResult(fig_id[0].id);
        // console.log(result)
        return result;
    }else{
      return predictStatus;
    }

}



module.exports = fn_predict;
