const fs = require('fs');;
const path = require('path');

let createPath = function(path){
    return new Promise((resolve, reject) => {
        fs.mkdir(path, {recursive: true}, (err) => {
            if(err){
                reject(err);
            }else{
                reject("ok");
            }
        })
    })
    .catch((err) => {
        return err;
    })
}
module.exports = createPath;
