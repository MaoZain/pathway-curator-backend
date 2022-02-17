const fn_predict = require("../controller/predict_new");
const fn_predict_multiple = require("../controller/predict_multiple")
const fn_createPath = require("../processor/createPath");
const fn_saveImg = require("../processor/saveImg");
const fn_insertMetaData = require("../processor/insertMetaData")
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
                let saved = await fn_saveImg(image, filePath+ "/img", image.name);
                if(saved == 'ok'){//3
                    console.log('start predict');
                    let result = await fn_predict(userName, jobName, image.name, ctx.request.body);
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
            let file_name_withoutEnd = file.name.split(".zip")[0];
            console.log("get file")
            let filePath = path.join(__dirname, '../static/users/' + userName + '/' + jobName);
            let createPath = await fn_createPath(filePath);
            if(createPath == 'ok'){
                let saved = await fn_saveImg(file, filePath, file.name);
                if(saved == 'ok'){
                    console.log("saved");
                    const zip = new StreamZip.async({ file: filePath + `/${file.name}` }); //gaimingzi
                    zip.on('extract', (entry, file) => {
                        console.log(`Extracted ${entry.name}`);
                    });
                    const count = await zip.extract(null, filePath + '/');
                    console.log(`Extracted ${count} entries`);
                    await zip.close();
                    let fn_rename = new Promise((resolve, rejects) => {
                        fs.rename(filePath + `/${file_name_withoutEnd}`, filePath + '/img', function(err) {
                            if (err) {
                              console.log(err);
                              resolve("err")
                            } else {
                              resolve("ok")
                              console.log("Successfully renamed the directory.")
                            }
                        });
                    })
                    
                    let rename = await fn_rename;
                    fn_predict_multiple(userName, jobName,ctx.request.body);
                }
            }
            let result = {
                "error":"error"
            }
            ctx.response.body = JSON.stringify(result);
        }
    })
}
