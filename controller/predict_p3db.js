const fn_query = require("../processor/qure");
const path = require('path');
const fs = require('fs');
const doPredict =require("../processor/doPredict");
const readElements= require ("../processor/readElement");
const readRelations =require ("../processor/readRelation");
const fn_getResult = require("../controller/get_result")

let fn_predict_p3db = async(userName, jobName, imgName, metadata) => {
    console.log("here is predict np3db")
    let workPath = "static/users/" + userName + '/' + jobName + '/';
    let imgPath = workPath + "img/" + imgName;
    let cmd = "python3 pathway_module/body_interface.py --dataset " + workPath;
    let predictStatus = await doPredict(cmd, workPath);
    if(predictStatus == 'ok'){
        let elements = await readElements(workPath + "img/" + imgName.split(".")[0] + "_elements.json");
        let relations = await readRelations(workPath + "img/" + imgName.split(".")[0] + "_relation.json");
        console.log("======================")
        console.log(elements);
        console.log(relations);
        console.log("======================")
        let result = {
            genes: elements,
            relations: relations,
        }
        return JSON.stringify(result);
    }
    
}

module.exports = fn_predict_p3db;