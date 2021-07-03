const fn_query = require("../processor/qure")

let fn_getHistoryInfo = async(ctx) => {
    console.log("mao",ctx.request.body)
    let userName = ctx.request.body.user_name
    let historyInfo = await fn_query(
        `SELECT f.fig_id, f.fig_name\
         FROM Job as j join Figure as f on j.fig_id = f.fig_id\
         WHERE j.U_name = '${userName}';`
      )
    return historyInfo;
}

module.exports = fn_getHistoryInfo;