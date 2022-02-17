const fn_query = require("../processor/qure")

let fn_edit_geneInfo = async(gene_id, gene_name) => {
    console.log(gene_id);
    let action = await fn_query(
        `UPDATE Gene SET gene_name = '${gene_name}' WHERE gene_id = ${gene_id}`
    )    
}

module.exports = fn_edit_geneInfo;