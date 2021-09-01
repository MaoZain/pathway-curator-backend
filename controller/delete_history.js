const fn_query = require("../processor/qure")

let fn_deleteHistory = async(jobid, figid) => {
    let deletejobid = await fn_query(
        `delete from Job where job_id = ${jobid};`
    )
    let deletefigid = await fn_query(
        `delete from Figure where fig_id = ${figid};`
    )
    return "ok";
    
}

module.exports = fn_deleteHistory;