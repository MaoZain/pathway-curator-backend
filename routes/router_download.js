const send = require('koa-send');
module.exports = function router_download(router) {
    router.get('/download', async function (ctx, next) {
        console.log("here is download!",ctx.request.query.file);
        const path = `public/` + ctx.request.query.file;
        ctx.attachment(path);
        await send(ctx, path);
    })
  }
