const fn_deleteHistory = require("../controller/delete_history")

module.exports = function router_deleteHistory(router) {
    router.post('/delete_history', async function (ctx, next) {
      console.log("mao",ctx.request.body)
      let historyInfo = await fn_deleteHistory(ctx.request.body.job_id, ctx.request.body.fig_id)
      ctx.response.body = historyInfo;
    })
  }


// 80
// servername yuming

// proxypass /back/ http://yuming:3000/back