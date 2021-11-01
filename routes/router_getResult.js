const fn_getResult = require("../controller/get_result")

module.exports = function router_getResult(router) {
    router.get('/get_result', async function (ctx, next) {
      // console.log(ctx.request.body)
      // ctx.state = {
      //   title: 'here is history'
      // };
      let historyInfo = await fn_getResult(ctx.request.query.figId)
      ctx.response.body = historyInfo;
    })
  }