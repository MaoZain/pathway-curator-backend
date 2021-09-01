const fn_predict = require("../controller/predict");
const fn_createPath = require("../processor/createPath");
const fn_saveImg = require("../processor/saveImg")
const fs = require('fs');
const path = require('path');

module.exports = async function router_predict(router) {
    router.post('/predict', async function (ctx, next) {
        // console.log(ctx.request.files);
        let image = ctx.request.files.image; // 获取上传文
        console.log(image.name)
        let userName = ctx.request.body.user_name;
        let jobName = ctx.request.body.job_name;
        let filePath = path.join(__dirname, '../static/users/' + userName + '/' + jobName);
        let createPath = await fn_createPath(filePath+ "/img");
        if(createPath == 'ok'){
            let saved = await fn_saveImg(image, filePath);
            if(saved == 'ok'){
                console.log('start predict')
                let result = await fn_predict(userName, jobName, image.name);
                ctx.response.body = result;
            }else{
                ctx.response.body = 'failed';
            }
        }else{
          ctx.response.body = 'failed';
        }
    })
}
