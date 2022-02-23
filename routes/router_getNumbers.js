const fn_getNumbers = require("../controller/get_numbers");

module.exports = function router_getAllHistoryInfo(router) {
  router.get("/get_numbers", async function (ctx, next) {
    console.log(ctx.request.body);
    let historyInfo = await fn_getNumbers(ctx);
    ctx.response.body = historyInfo;
  });
};