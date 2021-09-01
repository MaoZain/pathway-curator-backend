const fn_query = require("../processor/qure")
const fs = require('fs')
const path = require('path')
const { resolve } = require("path")
const { rejects } = require("assert")

let fn_getResult = async(figId) => {
    // console.log(ctx.request.body)
    // let userName = ctx.request.body.user_name
    // let figId = ctx.request.query.figId
    let base64_img = null
    let figureInfo = await fn_query(
        `SELECT fig_id, fig_name, fig_path, height, width
        From Figure
        WHERE fig_id = ${figId};`
    )
    console.log("figinfo", figureInfo)
    // let geneInfo = await fn_query(
    //     `SELECT G.gene_id, G.dict_id, G.gene_BBox, D.gene_name
    //     From Gene_Dictionary AS D
    //     JOIN Gene AS G ON (G.dict_id = D.dict_id AND G.fig_id = ${figId});`
    // )
    let geneInfo = await fn_query(
        `SELECT gene_name, gene_BBox
        From Gene
        where fig_id = ${figId};`
    )
    console.log("geneInfo", geneInfo)

    let relationInfo = await fn_query(
        `SELECT R.relation_id, R.activator, R.receptor, R.relation_Bbox, R.relation_type
        FROM Relation as R
        WHERE R.fig_id = ${figId}
        AND (SELECT G.dict_id  from Gene as G where G.gene_id = R.activator) IS NOT NULL
        AND (SELECT G2.dict_id  from Gene as G2 where G2.gene_id = R.receptor) IS NOT NULL;`
    )

    // get activator's and receptor's name
    // relationInfo.forEach(async(element, index) => {
    //     let name_activator = await fn_query(
    //         `SELECT gene_name
    //         FROM Gene_Dictionary
    //         WHERE dict_id = (SELECT dict_id FROM Gene WHERE gene_id = ${element.activator})`
    //     )
    //     let name_receptor = await fn_query(
    //         `SELECT gene_name
    //         FROM Gene_Dictionary
    //         WHERE dict_id = (SELECT dict_id FROM Gene WHERE gene_id = ${element.receptor})`
    //     )
    //     element.activator = name_activator[0].gene_name
    //     element.receptor = name_receptor[0].gene_name
    // });
    let relationInfo_2 = await new Promise((resolve, reject) => {
        if(relationInfo.length>0){
            relationInfo.forEach(async(element, index) => {
                let name_activator = await fn_query(
                    `SELECT gene_name
                    FROM Gene_Dictionary
                    WHERE dict_id = (SELECT dict_id FROM Gene WHERE gene_id = ${element.activator})`
                )
                let name_receptor = await fn_query(
                    `SELECT gene_name
                    FROM Gene_Dictionary
                    WHERE dict_id = (SELECT dict_id FROM Gene WHERE gene_id = ${element.receptor})`
                )
                element.activator_name = name_activator[0].gene_name
                element.receptor_name = name_receptor[0].gene_name
                console.log(relationInfo)
                if(index == relationInfo.length - 1) resolve(relationInfo)
            });
        }else{
            resolve(relationInfo)
        }

    })

    //get figure's base64
    let get_base64_img = new Promise((resolve, reject) => {
        fs.readFile(figureInfo[figureInfo.length-1].fig_path, 'binary' , (err, data) => {
            if (err) {
              console.error("get_base64_img_err",err)
              reject(err)
            }
            const buffer = Buffer.from(data, 'binary');
            let img = 'data: image/'+ getImageType(figureInfo[figureInfo.length-1].fig_path) +';base64,' + buffer.toString('base64');
            // console.log(img)
            resolve(img)
        })
    })

    base64_img = await get_base64_img;

    function getImageType(str){
        var reg = /\.(png|jpg|gif|jpeg|webp)$/;
        return str.match(reg)[1];
    }
    let result = {
        "figure": [figureInfo, base64_img],
        "gene":geneInfo,
        "relation":relationInfo_2,
    }
    result = JSON.stringify(result)
    return result;
}

module.exports = fn_getResult;
