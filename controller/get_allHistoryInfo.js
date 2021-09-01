const fn_query = require("../processor/qure")

let fn_getAllHistoryInfo = async(ctx) => {
    console.log("mao",ctx.request.body)
    let userName = ctx.request.query.user_name
    let historyInfo = await fn_query(
        `SELECT j.job_name, f.fig_name, f.fig_id, j.job_id\
         FROM Job as j join Figure as f on j.fig_id = f.fig_id\
         WHERE j.U_name = '${userName}';`
    )
    historyInfo = JSON.stringify(historyInfo);
    return historyInfo;
    
}

module.exports = fn_getAllHistoryInfo;