const testcontroller = require("../controller/test")

module.exports =  (router) => {
  router.get('/back/testcontroller', async function (ctx, next) {
    console.log("in test")
    let result = testcontroller()
    ctx.response.body = result
  })
}