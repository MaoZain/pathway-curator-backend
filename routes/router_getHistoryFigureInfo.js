const fn_getHistoryFigureInfo = require("../controller/get_historyFigureInfo")

module.exports = function history_router(router) {
    router.post('/back/get_historyFigure_info', async function (ctx, next) {
      // console.log(ctx.request.body)
      // ctx.state = {
      //   title: 'here is history'
      // };
      let historyInfo = await fn_getHistoryFigureInfo(ctx)
      ctx.response.body = historyInfo;
    })
  }