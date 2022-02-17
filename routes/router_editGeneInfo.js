const fn_editGeneInfo = require("../controller/edit_geneInfo")

module.exports = function router_editGeneInfo(router) {
    router.put('/edit_geneInfo', async function (ctx, next) {
      console.log("API_edit_geneInfo:",ctx.request.body);
      let result = await fn_editGeneInfo(ctx.request.body.gene_id, ctx.request.body.gene_name);
      ctx.response.body = "ok";
    })
  }