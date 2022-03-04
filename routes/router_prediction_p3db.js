const fn_predict = require("../controller/predict_p3db");
const fn_predict_multiple = require("../controller/predict_multiple")
const fn_createPath = require("../processor/createPath");
const fn_saveImg = require("../processor/saveImg");
const fn_insertMetaData = require("../processor/insertMetaData")
const fs = require('fs');
const path = require('path');
const StreamZip = require('node-stream-zip');

module.exports = async function router_predict_p3db(router) {
  router.post('/predict_p3db', async function (ctx, next) {
    // console.log(ctx.request.files);
    let image = ctx.request.files.image; // 获取上传文
    let userName = ctx.request.body.user_name;
    let jobName = ctx.request.body.job_name;

    let filePath = path.join(__dirname, '../static/users/' + userName + '/' + jobName);
    let createPath = await fn_createPath(filePath + "/img");
    if (createPath == 'ok') { //2
      let saved = await fn_saveImg(image, filePath + "/img", image.name);
      if (saved == 'ok') { //3
        console.log('start predict');
        let result = await fn_predict(userName, jobName, image.name, ctx.request.body);
        ctx.response.body = result;
      } else { //3
        let result = {
          "error": "error"
        }
        ctx.response.body = JSON.stringify(result);
      }
    }
  })
}
