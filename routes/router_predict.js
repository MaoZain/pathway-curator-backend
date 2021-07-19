const fn_predict = require("../controller/predict")

module.exports = function router_predict(router) {
    router.post('/predict', async function (ctx, next) {
      // console.log(ctx.request.body)
      // ctx.state = {
      //   title: 'here is history'
      // };
      let historyInfo = await fn_predict(ctx)
      ctx.response.body = historyInfo;
    })
  }