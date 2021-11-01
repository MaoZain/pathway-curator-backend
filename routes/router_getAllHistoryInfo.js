const fn_getAllHistoryInfo = require("../controller/get_allHistoryInfo");

module.exports = function router_getAllHistoryInfo(router) {
  router.get("/get_all_history_info", async function (ctx, next) {
    console.log(ctx.request.body);
    let historyInfo = await fn_getAllHistoryInfo(ctx);
    ctx.response.body = historyInfo;
  });
};

// 80
// servername yuming

// proxypass /back/ http://yuming:3000/back
