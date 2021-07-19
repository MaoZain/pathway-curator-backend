module.exports = function test_router(router) {
  router.get('/testrouter', async function (ctx, next) {
    ctx.state = {
      title: 'here is router'
    };
    ctx.response.body = ctx.state.title
  })
}


