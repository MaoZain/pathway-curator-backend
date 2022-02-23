const exec = require('child_process').exec;
function doPredict(cmd, workPath){
    //do prediction
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}`);
                reject('failed');
            }else{
                //stdout
                console.log("predict OK!");
                resolve('ok')
            }
        });
    })
    .catch((err)=>{
        return err;
    });
}

module.exports = doPredict;