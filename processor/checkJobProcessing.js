const fs = require('fs');const { async } = require('node-stream-zip');
const path = require('path');
const fn_query = require("./qure");

let fn_checkJobProcessing = async function(user_name){
    console.log(user_name);
    let unfinished_fig_ids =await fn_query(
        `select fig_id
        from Job as J
        where J.U_name = "${user_name}" and J.processing <> 100;`
    );
    // console.log("job_names",unfinished_fig_ids);
    let id_list = []
    for(let element of unfinished_fig_ids){
        id_list.push(element.fig_id)
    }
    let fig_path = []
    if(id_list.length>0){
        fig_path = await fn_query(
            `select fig_path, fig_id
            from Figure
            where fig_id in (${id_list}) and predict_status = false`
        )
    }
    console.log("unfinished",fig_path)
    console.log("+++++++++++++++++++++++++++")
    return fig_path;

}
module.exports = fn_checkJobProcessing;
