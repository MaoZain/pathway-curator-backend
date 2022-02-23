const fn_query = require("../processor/qure")
const fs = require('fs')
const path = require('path')
const { resolve } = require("path")
const { rejects } = require("assert")

let readElements = function(figurePath){
    let index = figurePath.lastIndexOf('.')
    let path = figurePath.substring(0, index) + "_elements.json"
    console.log("aa", path);
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

let readRelations = function(figurePath){
    let index = figurePath.lastIndexOf('.')
    let path = figurePath.substring(0, index) + "_relation.json"
    console.log("aa", path);
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

let fn_getResult2 = async(figId) => {
    let figurePath = await fn_query(
        `SELECT fig_path
        From Figure
        WHERE fig_id = ${figId};`
    )
    figurePath = figurePath[0].fig_path;

    let elements = await readElements(figurePath); //gene_name coordinates
    //get relation output
    let relations_pre = await readRelations(figurePath);
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

    //****** get figure's base64 *//
    let get_base64_img = new Promise((resolve, reject) => {
        fs.readFile(figurePath, 'binary' , (err, data) => {
            if (err) {
                console.error("get_base64_img_err",err)
                reject(err)
            }
            const buffer = Buffer.from(data, 'binary');
            let img = 'data: image/'+ getImageType(figurePath) +';base64,' + buffer.toString('base64');
            // console.log(img)
            resolve(img)
        })
    })

    base64_img = await get_base64_img;

    function getImageType(str){
        var reg = /\.(png|jpg|gif|jpeg|webp)$/;
        return str.match(reg)[1];
    }

    let  result = {
        "figure": [figureInfo, base64_img],
        "gene":elements,
        "relation":relations,
    }
    result = JSON.stringify(result)
    return result;
}

module.exports = fn_getResult2;
