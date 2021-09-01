const fn_getResult2 = require("../controller/get_result2")

module.exports = function router_getResult(router) {
    router.get('/get_result', async function (ctx, next) {
      // console.log(ctx.request.body)
      // ctx.state = {
      //   title: 'here is history'
      // };
      let historyInfo = await fn_getResult2(ctx.request.query.figId)
      ctx.response.body = historyInfo;
    })
  }