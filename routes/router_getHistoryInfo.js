const fn_getHistoryInfo = require("../controller/get_historyInfo")

module.exports = function history_router(router) {
    router.post('/back/get_history_info', async function (ctx, next) {
      // console.log(ctx.request.body)
      // ctx.state = {
      //   title: 'here is history'
      // };
      let historyInfo = await fn_getHistoryInfo(ctx)
      var result = JSON.stringify({"id":1,"ratio_training_dataset":0.6,"ratio_validation_dataset":0.4});

      ctx.response.body = historyInfo;
    })
  }


// 80
// servername yuming

// proxypass /back/ http://yuming:3000/back