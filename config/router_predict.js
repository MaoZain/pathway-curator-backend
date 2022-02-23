const fn_predict = require("../controller/predict_new");
const fn_predict_multiple = require("../controller/predict_multiple")
const fn_createPath = require("../processor/createPath");
const fn_saveImg = require("../processor/saveImg")
const fs = require('fs');
const path = require('path');
const StreamZip = require('node-stream-zip');

module.exports = async function router_predict(router) {
    router.post('/predict', async function (ctx, next) {
        // console.log(ctx.request.files);
        if(ctx.request.body.file_type == "image"){//1
            console.log("type is image")
            let image = ctx.request.files.image; // 获取上传文
            let userName = ctx.request.body.user_name;
            console.log(userName)
            let jobName = ctx.request.body.job_name;
            let filePath = path.join(__dirname, '../static/users/' + userName + '/' + jobName);
            let createPath = await fn_createPath(filePath+ "/img");
            if(createPath == 'ok'){//2
                let saved = await fn_saveImg(image, filePath+ "/img");
                if(saved == 'ok'){//3
                    console.log('start predict')
                    let result = await fn_predict(userName, jobName, image.name);
                    ctx.response.body = result;
                }else{//3
                    let result = {
                        "error":"error"
                    }
                    ctx.response.body = JSON.stringify(result);
                }
            }else{//2
                let result = {
                    "error":"error"
                }
                ctx.response.body = JSON.stringify(result);
            }
        }else{//1
            let file = ctx.request.files.image;
            let userName = ctx.request.body.user_name;
            let jobName = ctx.request.body.job_name;
            let filePath = path.join(__dirname, '../static/users/' + userName + '/' + jobName);
            let createPath = await fn_createPath(filePath);
            if(createPath == 'ok'){
                let saved = await fn_saveImg(file, filePath);
                if(saved == 'ok'){
                    console.log("saved");
                    const zip = new StreamZip.async({ file: filePath + '/test.zip' });
                    zip.on('extract', (entry, file) => {
                        console.log(`Extracted ${entry.name}`);
                    });
                    const count = await zip.extract(null, filePath + '/');
                    console.log(`Extracted ${count} entries`);
                    await zip.close();
                    fs.rename(filePath + '/test', filePath + '/img', function(err) {
                        if (err) {
                          console.log(err)
                        } else {

                          console.log("Successfully renamed the directory.")
                        }
                    });
                    
                    fn_predict_multiple(userName, jobName);
                }
            }
            let result = {
                "error":"error"
            }
            ctx.response.body = JSON.stringify(result);

        }
        
    })
}
