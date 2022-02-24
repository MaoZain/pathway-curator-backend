const verify_user_id = require("../controller/verify_user_id")

module.exports =  (router) => {
  router.post('/verify_user_id', async function (ctx, next) {
    console.log("in verify");
    let result = await verify_user_id(ctx.request.body.user_id);
    ctx.response.body = result;
  })
}